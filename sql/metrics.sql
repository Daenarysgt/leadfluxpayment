-- Função para calcular métricas de interação por etapa do funil
CREATE OR REPLACE FUNCTION get_funnel_step_metrics(p_funnel_id UUID)
RETURNS TABLE (
    step_number INTEGER,
    total_interactions BIGINT,
    interaction_rate DECIMAL,
    button_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH step_data AS (
        SELECT COUNT(DISTINCT session_id) as total_sessions
        FROM funnel_access_logs
        WHERE funnel_id = p_funnel_id
    ),
    step_interactions AS (
        SELECT 
            s.step_number,
            COUNT(DISTINCT fal.session_id) as interactions
        FROM (
            SELECT generate_series(1, MAX(step_reached)) as step_number
            FROM funnel_access_logs
            WHERE funnel_id = p_funnel_id
        ) s
        LEFT JOIN funnel_access_logs fal 
        ON fal.funnel_id = p_funnel_id 
        AND fal.step_reached >= s.step_number
        GROUP BY s.step_number
    ),
    funnel_steps AS (
        SELECT 
            (row_number() OVER (ORDER BY order_index))::INTEGER as step_number,
            id as step_id,
            COALESCE(
                ("canvasElements"->0->>'buttonId'),
                'btn-' || id::text
            ) as button_id
        FROM steps
        WHERE funnel_id = p_funnel_id
        ORDER BY order_index
    )
    SELECT 
        fs.step_number,
        COALESCE(si.interactions, 0) as total_interactions,
        CASE 
            WHEN sd.total_sessions > 0 THEN 
                ROUND((COALESCE(si.interactions, 0)::DECIMAL / sd.total_sessions * 100), 1)
            ELSE 0 
        END as interaction_rate,
        fs.button_id
    FROM funnel_steps fs
    CROSS JOIN step_data sd
    LEFT JOIN step_interactions si ON fs.step_number = si.step_number
    ORDER BY fs.step_number;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_funnel_step_metrics TO authenticated;

-- Função para buscar leads do funil com suas interações
CREATE OR REPLACE FUNCTION get_funnel_leads(
    p_funnel_id UUID,
    p_period TEXT DEFAULT 'all'
)
RETURNS TABLE (
    session_id UUID,
    first_interaction TIMESTAMP WITH TIME ZONE,
    interactions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    period_start TIMESTAMP WITH TIME ZONE;
BEGIN
    period_start := CASE p_period
        WHEN 'today' THEN CURRENT_DATE
        WHEN '7days' THEN CURRENT_DATE - INTERVAL '7 days'
        WHEN '30days' THEN CURRENT_DATE - INTERVAL '30 days'
        ELSE NULL
    END;

    RETURN QUERY
    WITH lead_sessions AS (
        SELECT 
            fal.session_id,
            MIN(fal.created_at) as first_interaction,
            MAX(fal.step_reached) as max_step_reached
        FROM funnel_access_logs fal
        WHERE 
            fal.funnel_id = p_funnel_id
            AND (period_start IS NULL OR fal.created_at >= period_start)
        GROUP BY fal.session_id
    ),
    step_interactions AS (
        SELECT 
            ls.session_id,
            s.step_number,
            ls.first_interaction
        FROM lead_sessions ls
        CROSS JOIN LATERAL (
            SELECT generate_series(1, ls.max_step_reached) as step_number
        ) s
    )
    SELECT 
        ls.session_id,
        ls.first_interaction,
        jsonb_object_agg(
            si.step_number::text,
            jsonb_build_object(
                'status', 'clicked',
                'timestamp', ls.first_interaction
            )
        ) as interactions
    FROM lead_sessions ls
    JOIN step_interactions si ON si.session_id = ls.session_id
    GROUP BY ls.session_id, ls.first_interaction
    ORDER BY ls.first_interaction DESC;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_funnel_leads TO authenticated;

-- Função para atualizar o progresso do funil
CREATE OR REPLACE FUNCTION update_funnel_progress(
    p_funnel_id UUID,
    p_session_id UUID,
    p_current_step INTEGER,
    p_is_complete BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE funnel_access_logs
    SET 
        step_reached = p_current_step,
        is_conversion = p_is_complete,
        updated_at = NOW()
    WHERE 
        funnel_id = p_funnel_id AND
        session_id = p_session_id;

    IF NOT FOUND THEN
        INSERT INTO funnel_access_logs (
            funnel_id,
            session_id,
            step_reached,
            is_conversion,
            is_first_access
        )
        VALUES (
            p_funnel_id,
            p_session_id,
            p_current_step,
            p_is_complete,
            NOT EXISTS (
                SELECT 1 FROM funnel_access_logs 
                WHERE funnel_id = p_funnel_id
            )
        );
    END IF;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION update_funnel_progress TO authenticated;

-- Criar tabela para armazenar histórico de interações
CREATE TABLE IF NOT EXISTS funnel_step_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID NOT NULL REFERENCES funnels(id),
    session_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    interaction_type TEXT NOT NULL, -- 'click', 'choice', etc
    interaction_value TEXT, -- valor selecionado em caso de multiple choice
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (funnel_id, session_id) REFERENCES funnel_access_logs(funnel_id, session_id)
);

-- Função para registrar uma interação em uma etapa
CREATE OR REPLACE FUNCTION register_step_interaction(
    p_funnel_id UUID,
    p_session_id UUID,
    p_step_number INTEGER,
    p_interaction_type TEXT,
    p_interaction_value TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Registrar a interação
    INSERT INTO funnel_step_interactions (
        funnel_id,
        session_id,
        step_number,
        interaction_type,
        interaction_value
    )
    VALUES (
        p_funnel_id,
        p_session_id,
        p_step_number,
        p_interaction_type,
        p_interaction_value
    );

    -- Atualizar o progresso no funnel_access_logs
    UPDATE funnel_access_logs
    SET 
        step_reached = GREATEST(step_reached, p_step_number),
        updated_at = NOW()
    WHERE 
        funnel_id = p_funnel_id AND
        session_id = p_session_id;

    IF NOT FOUND THEN
        INSERT INTO funnel_access_logs (
            funnel_id,
            session_id,
            step_reached,
            is_conversion,
            is_first_access
        )
        VALUES (
            p_funnel_id,
            p_session_id,
            p_step_number,
            false,
            NOT EXISTS (
                SELECT 1 FROM funnel_access_logs 
                WHERE funnel_id = p_funnel_id
            )
        );
    END IF;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION register_step_interaction TO authenticated;

-- Modificar a função get_funnel_leads_with_interactions para incluir todas as interações
CREATE OR REPLACE FUNCTION get_funnel_leads_with_interactions(
    p_funnel_id UUID,
    p_period TEXT DEFAULT 'all'
)
RETURNS TABLE (
    session_id UUID,
    first_interaction TIMESTAMP WITH TIME ZONE,
    interactions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    period_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Determinar o período de início baseado no parâmetro
    period_start := CASE p_period
        WHEN 'today' THEN CURRENT_DATE
        WHEN '7days' THEN CURRENT_DATE - INTERVAL '7 days'
        WHEN '30days' THEN CURRENT_DATE - INTERVAL '30 days'
        ELSE NULL
    END;

    RETURN QUERY
    WITH lead_sessions AS (
        SELECT DISTINCT ON (fal.session_id)
            fal.session_id,
            MIN(fal.created_at) as first_interaction,
            jsonb_object_agg(
                fsi.step_number::text,
                jsonb_build_object(
                    'status', CASE 
                        WHEN fsi.interaction_type = 'choice' THEN fsi.interaction_value
                        ELSE 'clicked'
                    END,
                    'type', fsi.interaction_type,
                    'value', fsi.interaction_value,
                    'timestamp', fsi.created_at
                )
            ) as interactions
        FROM funnel_access_logs fal
        LEFT JOIN funnel_step_interactions fsi ON 
            fal.funnel_id = fsi.funnel_id AND 
            fal.session_id = fsi.session_id
        WHERE 
            fal.funnel_id = p_funnel_id AND
            (period_start IS NULL OR fal.created_at >= period_start)
        GROUP BY fal.session_id, fal.created_at
        ORDER BY fal.session_id, fal.created_at DESC
    )
    SELECT 
        ls.session_id,
        ls.first_interaction,
        ls.interactions
    FROM lead_sessions ls
    ORDER BY ls.first_interaction DESC;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_funnel_leads_with_interactions TO authenticated;