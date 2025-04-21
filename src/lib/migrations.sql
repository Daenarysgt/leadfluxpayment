-- Função para obter métricas históricas para o gráfico do dashboard
CREATE OR REPLACE FUNCTION get_historical_metrics(
  p_period TEXT,
  p_funnel_id UUID DEFAULT NULL
)
RETURNS TABLE (
  time_period TIMESTAMP,
  total_sessions INTEGER,
  completed_sessions INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_interval TEXT;
  v_truncate TEXT;
  v_days INTEGER;
BEGIN
  -- Obter o ID do usuário atual
  SELECT auth.uid() INTO v_user_id;
  
  -- Definir intervalo com base no período
  IF p_period = 'today' THEN
    v_interval := 'hour';
    v_truncate := 'hour';
    v_days := 0;
  ELSIF p_period = '7days' THEN
    v_interval := 'day';
    v_truncate := 'day';
    v_days := 7;
  ELSE -- 30days
    v_interval := 'day';
    v_truncate := 'day';
    v_days := 30;
  END IF;
  
  -- Retornar resultados de acordo com o período solicitado
  IF p_funnel_id IS NULL THEN
    -- Todos os funis do usuário
    RETURN QUERY
    WITH time_series AS (
      SELECT 
        generate_series(
          date_trunc(v_truncate, now()) - (v_days || ' days')::interval,
          date_trunc(v_truncate, now()),
          ('1 ' || v_interval)::interval
        ) AS time_point
    ),
    user_funnels AS (
      SELECT id 
      FROM funnels 
      WHERE user_id = v_user_id
    ),
    sessions_data AS (
      SELECT 
        date_trunc(v_truncate, fp.created_at) AS time_point,
        COUNT(DISTINCT fp.session_id) AS session_count,
        COUNT(DISTINCT CASE WHEN fp.is_complete THEN fp.session_id END) AS completed_count
      FROM funnel_progress fp
      JOIN user_funnels uf ON fp.funnel_id = uf.id
      WHERE fp.created_at >= date_trunc(v_truncate, now()) - (v_days || ' days')::interval
      GROUP BY date_trunc(v_truncate, fp.created_at)
    )
    SELECT 
      ts.time_point::timestamp,
      COALESCE(sd.session_count, 0)::integer,
      COALESCE(sd.completed_count, 0)::integer
    FROM time_series ts
    LEFT JOIN sessions_data sd ON ts.time_point = sd.time_point
    ORDER BY ts.time_point;
  ELSE
    -- Funil específico
    RETURN QUERY
    WITH time_series AS (
      SELECT 
        generate_series(
          date_trunc(v_truncate, now()) - (v_days || ' days')::interval,
          date_trunc(v_truncate, now()),
          ('1 ' || v_interval)::interval
        ) AS time_point
    ),
    sessions_data AS (
      SELECT 
        date_trunc(v_truncate, fp.created_at) AS time_point,
        COUNT(DISTINCT fp.session_id) AS session_count,
        COUNT(DISTINCT CASE WHEN fp.is_complete THEN fp.session_id END) AS completed_count
      FROM funnel_progress fp
      WHERE fp.funnel_id = p_funnel_id
        AND fp.created_at >= date_trunc(v_truncate, now()) - (v_days || ' days')::interval
      GROUP BY date_trunc(v_truncate, fp.created_at)
    )
    SELECT 
      ts.time_point::timestamp,
      COALESCE(sd.session_count, 0)::integer,
      COALESCE(sd.completed_count, 0)::integer
    FROM time_series ts
    LEFT JOIN sessions_data sd ON ts.time_point = sd.time_point
    ORDER BY ts.time_point;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 