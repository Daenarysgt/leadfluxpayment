import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configure the client with storage persistence options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'leadflux-auth-storage',
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Adicionar monitoramento de erros
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_OUT') {
    console.log('Usuário desconectado, limpando cache local');
    clearCache();
  }
});

/**
 * Limpa o cache local de dados do Supabase para forçar novas requisições 
 * e garantir dados atualizados
 */
export const clearCache = () => {
  try {
    // Limpar cache de armazenamento local
    localStorage.removeItem('supabase.auth.token');
    
    // Inserir indicação que o cache foi limpo para debug
    localStorage.setItem('leadflux.cache_cleared', new Date().toISOString());
    
    console.log('Cache local do Supabase limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar cache do Supabase:', error);
  }
};

// Tipos úteis para autenticação
export type AuthError = {
  message: string;
};

// Hook para gerenciar estado de loading
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as AuthError).message;
  }
  return 'An unexpected error occurred';
}; 