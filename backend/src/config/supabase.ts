import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDebugMode = process.env.DEBUG_MODE === 'true';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada. Algumas operações de servidor podem falhar devido a políticas de segurança.');
}

// Opções de configuração com melhores práticas
const supabaseOptions = {
  auth: {
    persistSession: false, // não persistir sessão para operações de servidor
    autoRefreshToken: false
  },
  global: {
    headers: {
      // Adicionar cabeçalho para indicar que é uma requisição de servidor
      'X-Client-Info': 'server'
    }
  },
  db: {
    schema: 'public'
  },
  // Aumentar o tempo limite das solicitações para prevenir falhas em operações grandes
  realtime: {
    timeout: 60000 // 60 segundos
  }
};

// Logs adicionais para modo de debug
if (isDebugMode) {
  console.log('🔄 Inicializando cliente Supabase em modo DEBUG');
  console.log(`📝 URL: ${supabaseUrl}`);
  console.log(`🔑 Usando ${supabaseServiceKey ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'} para autenticação`);
}

// Criar um cliente do Supabase com permissões de administrador para operações de servidor
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Usar service role key se disponível, senão usar anon key
  supabaseOptions
);

// Exportar cliente com contexto administrativo para operações que precisam de privilégios elevados
export const adminSupabase = supabase.auth.admin;

// Função auxiliar para extrair mensagens de erro mais legíveis
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  
  try {
    return JSON.stringify(error);
  } catch {
    return 'Erro desconhecido';
  }
}

// Função auxiliar para logs detalhados das operações com Supabase
export function logSupabaseOperation(operation: string, result: any) {
  if (!isDebugMode) return;
  
  const { error, data, status, statusText } = result;
  
  if (error) {
    console.error(`❌ Erro em operação Supabase [${operation}]:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  } else {
    console.log(`✅ Supabase [${operation}] bem-sucedido:`, {
      status,
      statusText,
      data: data ? (Array.isArray(data) ? `Array[${data.length}]` : typeof data) : null
    });
  }
} 