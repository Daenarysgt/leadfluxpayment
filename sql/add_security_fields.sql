-- Script para adicionar campos de segurança à tabela funnels
-- Execute no editor SQL do Supabase

-- Adicionar campo de senha (protegida com hash)
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Adicionar campo de visibilidade (tipo enum)
-- Opções: 'public', 'private', 'unlisted'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'funnel_visibility') THEN
    CREATE TYPE funnel_visibility AS ENUM ('public', 'private', 'unlisted');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END$$;

ALTER TABLE funnels ADD COLUMN IF NOT EXISTS visibility funnel_visibility NOT NULL DEFAULT 'public';

-- Adicionar campo de limite de visualizações (para planos gratuitos)
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS max_views INTEGER;

-- Criar tabela de logs de acesso
CREATE TABLE IF NOT EXISTS funnel_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_conversion BOOLEAN DEFAULT FALSE
);

-- Criar índice para consultas eficientes
CREATE INDEX IF NOT EXISTS funnel_access_logs_funnel_id_idx ON funnel_access_logs(funnel_id);
CREATE INDEX IF NOT EXISTS funnel_access_logs_viewed_at_idx ON funnel_access_logs(viewed_at);

-- Atualizar todos os funis existentes para public por padrão
UPDATE funnels SET visibility = 'public' WHERE visibility IS NULL;

-- Adicionar política RLS para logs de acesso
CREATE POLICY "Users can view their own funnel logs" ON funnel_access_logs
  FOR SELECT USING (
    funnel_id IN (SELECT id FROM funnels WHERE user_id = auth.uid())
  );

-- Habilitar RLS para a tabela de logs
ALTER TABLE funnel_access_logs ENABLE ROW LEVEL SECURITY; 