-- Script para adicionar colunas necessárias para o suporte ao Netlify
-- Execute este script no editor SQL do Supabase

-- Adicionar coluna para armazenar o ID do site no Netlify
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS netlify_site_id TEXT;

-- Adicionar coluna para armazenar a URL do site no Netlify
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS netlify_url TEXT;

-- Criar índice para facilitar a busca por ID de site do Netlify
CREATE INDEX IF NOT EXISTS funnels_netlify_site_id_idx ON funnels(netlify_site_id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN funnels.netlify_site_id IS 'ID do site no Netlify associado a este funil';
COMMENT ON COLUMN funnels.netlify_url IS 'URL do site no Netlify (sem o domínio personalizado)';
COMMENT ON COLUMN funnels.custom_domain IS 'Domínio personalizado configurado para o funil'; 