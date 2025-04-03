-- Script para configurar tabela steps corretamente
-- Execute esse script no editor SQL do Supabase

-- Função para executar SQL dinâmico
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Criar extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de steps (se não existir)
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  button_text TEXT DEFAULT 'Continuar',
  back_button_text TEXT DEFAULT 'Voltar',
  show_progress_bar BOOLEAN DEFAULT true,
  canvas_elements JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas necessárias se não existirem
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Continuar';
  EXCEPTION WHEN duplicate_column THEN 
    NULL;
  END;
  
  BEGIN
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS back_button_text TEXT DEFAULT 'Voltar';
  EXCEPTION WHEN duplicate_column THEN 
    NULL;
  END;
  
  BEGIN
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS show_progress_bar BOOLEAN DEFAULT true;
  EXCEPTION WHEN duplicate_column THEN 
    NULL;
  END;
  
  BEGIN
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS canvas_elements JSONB DEFAULT '[]'::jsonb;
  EXCEPTION WHEN duplicate_column THEN 
    NULL;
  END;
END $$; 