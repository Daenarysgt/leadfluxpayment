import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada. Algumas operações de servidor podem falhar devido a políticas de segurança.');
}

// Criar um cliente do Supabase com permissões de administrador para operações de servidor
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Usar service role key se disponível, senão usar anon key
  {
    auth: {
      persistSession: false, // não persistir sessão para operações de servidor
      autoRefreshToken: false
    },
    global: {
      headers: {
        // Adicionar cabeçalho para indicar que é uma requisição de servidor
        'X-Client-Info': 'server'
      }
    }
  }
);

// Exportar cliente com contexto administrativo para operações que precisam de privilégios elevados
export const adminSupabase = supabase.auth.admin; 