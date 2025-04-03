-- Adicionar coluna is_first_access à tabela funnel_access_logs
ALTER TABLE funnel_access_logs 
ADD COLUMN IF NOT EXISTS is_first_access BOOLEAN DEFAULT false;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS funnel_access_logs_is_first_access_idx ON funnel_access_logs(is_first_access);
CREATE INDEX IF NOT EXISTS funnel_access_logs_is_conversion_idx ON funnel_access_logs(is_conversion);

-- Criar função para buscar IDs únicos de funis
CREATE OR REPLACE FUNCTION get_unique_funnel_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT ARRAY_AGG(DISTINCT funnel_id)
    FROM funnel_access_logs;
$$;

-- Remover função existente antes de recriar
DROP FUNCTION IF EXISTS update_funnel_progress(UUID, UUID, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS get_funnel_metrics(UUID);
DROP FUNCTION IF EXISTS calculate_daily_metrics();

-- Remover tabela se existir para recriar com as constraints corretas
DROP TABLE IF EXISTS funnel_access_logs CASCADE;

-- Criar tabela funnel_access_logs com todas as colunas necessárias
CREATE TABLE funnel_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    step_reached INTEGER DEFAULT 1,
    is_conversion BOOLEAN DEFAULT false,
    is_first_access BOOLEAN DEFAULT false,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id)
);

-- Criar índices para a tabela
CREATE INDEX IF NOT EXISTS funnel_access_logs_funnel_id_idx ON funnel_access_logs(funnel_id);
CREATE INDEX IF NOT EXISTS funnel_access_logs_session_id_idx ON funnel_access_logs(session_id);
CREATE INDEX IF NOT EXISTS funnel_access_logs_created_at_idx ON funnel_access_logs(created_at);
CREATE INDEX IF NOT EXISTS funnel_access_logs_is_first_access_idx ON funnel_access_logs(is_first_access);
CREATE INDEX IF NOT EXISTS funnel_access_logs_is_conversion_idx ON funnel_access_logs(is_conversion);

-- Função para atualizar progresso do funil
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
    -- Atualizar o progresso
    UPDATE funnel_access_logs
    SET 
        step_reached = p_current_step,
        is_conversion = p_is_complete,
        updated_at = NOW()
    WHERE 
        funnel_id = p_funnel_id AND
        session_id = p_session_id;

    -- Se não encontrou registro, criar um novo
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

-- Query para verificar os dados atuais
WITH funnel_stats AS (
    SELECT 
        funnel_id,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT CASE WHEN is_conversion THEN session_id END) as conversions,
        COUNT(DISTINCT CASE WHEN step_reached > 1 THEN session_id END) as progressed_sessions,
        MAX(step_reached) as max_step_reached
    FROM funnel_access_logs
    GROUP BY funnel_id
)
SELECT 
    funnel_id,
    total_sessions,
    conversions,
    ROUND((conversions::DECIMAL / NULLIF(total_sessions, 0) * 100)::DECIMAL, 1) as completion_rate,
    ROUND((progressed_sessions::DECIMAL / NULLIF(total_sessions, 0) * 100)::DECIMAL, 1) as interaction_rate,
    max_step_reached
FROM funnel_stats;

-- Função corrigida para métricas do funil
CREATE OR REPLACE FUNCTION get_funnel_metrics(p_funnel_id UUID)
RETURNS TABLE (
    total_sessions BIGINT,
    completion_rate DECIMAL,
    interaction_rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_steps INTEGER;
BEGIN
    -- Obter o número total de steps do funil
    SELECT COUNT(*) INTO total_steps
    FROM steps 
    WHERE funnel_id = p_funnel_id;

    -- Se não houver steps, retornar zeros
    IF total_steps = 0 THEN
        RETURN QUERY SELECT 
            0::BIGINT as total_sessions,
            0::DECIMAL as completion_rate,
            0::DECIMAL as interaction_rate;
        RETURN;
    END IF;

    RETURN QUERY
    WITH metrics AS (
        SELECT 
            COUNT(DISTINCT fal.session_id) as session_count,
            COUNT(DISTINCT CASE WHEN fal.is_conversion THEN fal.session_id END) as conversions,
            COUNT(DISTINCT CASE WHEN fal.step_reached > 1 THEN fal.session_id END) as progressed_sessions
        FROM funnel_access_logs fal
        WHERE fal.funnel_id = p_funnel_id
    )
    SELECT 
        session_count::BIGINT as total_sessions,
        ROUND((conversions::DECIMAL / NULLIF(session_count, 0) * 100)::DECIMAL, 1) as completion_rate,
        ROUND((progressed_sessions::DECIMAL / NULLIF(session_count, 0) * 100)::DECIMAL, 1) as interaction_rate
    FROM metrics;
END;
$$; 