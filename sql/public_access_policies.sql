-- Política para permitir acesso público a domínios ativos
CREATE POLICY "Allow public access to active domains"
    ON domains FOR SELECT
    TO anon
    USING (status = 'active');

-- Política para permitir acesso público a funis ativos
CREATE POLICY "Allow public access to active funnels"
    ON funnels FOR SELECT
    TO anon
    USING (status = 'active');

-- Política para permitir acesso público aos steps de funis ativos
CREATE POLICY "Allow public access to steps of active funnels"
    ON steps FOR SELECT
    TO anon
    USING (
        funnel_id IN (
            SELECT id FROM funnels 
            WHERE status = 'active'
        )
    );

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY; 