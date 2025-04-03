-- Tabela para armazenar métricas detalhadas dos funis
CREATE TABLE IF NOT EXISTS funnel_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    avg_time_seconds INTEGER,
    bounce_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar métricas por step
CREATE TABLE IF NOT EXISTS step_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
    funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    dropoffs INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    avg_time_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS funnel_metrics_funnel_id_date_idx ON funnel_metrics(funnel_id, date);
CREATE INDEX IF NOT EXISTS step_metrics_funnel_id_date_idx ON step_metrics(funnel_id, date);
CREATE INDEX IF NOT EXISTS step_metrics_step_id_date_idx ON step_metrics(step_id, date);

-- Função para calcular métricas diárias
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calcular métricas do funil
    INSERT INTO funnel_metrics (
        funnel_id,
        date,
        total_views,
        unique_visitors,
        total_conversions,
        conversion_rate,
        avg_time_seconds
    )
    SELECT 
        funnel_id,
        DATE(viewed_at),
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address) as unique_visitors,
        SUM(CASE WHEN is_conversion THEN 1 ELSE 0 END) as total_conversions,
        (SUM(CASE WHEN is_conversion THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL * 100) as conversion_rate,
        AVG(EXTRACT(EPOCH FROM (updated_at - viewed_at)))::INTEGER as avg_time_seconds
    FROM funnel_access_logs
    WHERE DATE(viewed_at) = CURRENT_DATE - INTERVAL '1 day'
    GROUP BY funnel_id, DATE(viewed_at)
    ON CONFLICT (funnel_id, date)
    DO UPDATE SET
        total_views = EXCLUDED.total_views,
        unique_visitors = EXCLUDED.unique_visitors,
        total_conversions = EXCLUDED.total_conversions,
        conversion_rate = EXCLUDED.conversion_rate,
        avg_time_seconds = EXCLUDED.avg_time_seconds,
        updated_at = NOW();
END;
$$;

-- Criar políticas de RLS para as novas tabelas
ALTER TABLE funnel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_metrics ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de métricas apenas pelo dono do funil
CREATE POLICY "Users can view their own funnel metrics"
    ON funnel_metrics FOR SELECT
    USING (
        funnel_id IN (
            SELECT id FROM funnels WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own step metrics"
    ON step_metrics FOR SELECT
    USING (
        funnel_id IN (
            SELECT id FROM funnels WHERE user_id = auth.uid()
        )
    ); 