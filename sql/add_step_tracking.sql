-- Adicionar coluna para rastrear a última etapa alcançada
ALTER TABLE funnel_access_logs 
ADD COLUMN IF NOT EXISTS step_reached INTEGER DEFAULT 1;

-- Adicionar coluna para rastrear o tempo gasto em cada etapa (em segundos)
ALTER TABLE funnel_access_logs
ADD COLUMN IF NOT EXISTS time_per_step JSONB DEFAULT '{}';

-- Adicionar coluna para o ID do usuário (para facilitar queries)
ALTER TABLE funnel_access_logs
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Criar índice para melhorar performance das queries
CREATE INDEX IF NOT EXISTS funnel_access_logs_user_id_idx ON funnel_access_logs(user_id);
CREATE INDEX IF NOT EXISTS funnel_access_logs_step_reached_idx ON funnel_access_logs(step_reached);

-- Atualizar a função que calcula métricas diárias para incluir step_reached
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualizar user_id para registros existentes
    UPDATE funnel_access_logs l
    SET user_id = f.user_id
    FROM funnels f
    WHERE l.funnel_id = f.id
    AND l.user_id IS NULL;

    -- Resto da função permanece igual
    -- ... existing code ...
END;
$$; 