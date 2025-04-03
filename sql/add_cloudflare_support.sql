-- Script para adicionar colunas relacionadas ao Cloudflare Pages à tabela funnels
-- Execute no editor SQL do Supabase

-- Adicionar campos para Cloudflare Pages
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS cloudflare_project_id TEXT;
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS cloudflare_url TEXT;

-- Criar índice para facilitar a busca por projeto do Cloudflare
CREATE INDEX IF NOT EXISTS funnels_cloudflare_project_idx ON funnels(cloudflare_project_id);

-- Atualizar a função existente para buscar funis por domínio
-- para incluir também busca por URL do Cloudflare
CREATE OR REPLACE FUNCTION public.get_funnel_by_domain(domain text)
RETURNS SETOF funnels
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM funnels 
  WHERE (custom_domain = domain OR cloudflare_url LIKE 'https://' || domain || '%') 
  AND status = 'active';
$$;

-- Conceder acesso à função para usuários anônimos
GRANT EXECUTE ON FUNCTION public.get_funnel_by_domain TO anon; 