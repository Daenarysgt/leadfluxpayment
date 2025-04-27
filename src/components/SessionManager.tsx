import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Componente que gerencia a renovação automática de sessões do Supabase
 * para evitar expiração durante longos períodos de uso da aplicação
 */
export function SessionManager() {
  useEffect(() => {
    // Função para renovar o token
    const refreshToken = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Erro ao renovar sessão:", error);
        } else {
          console.log("Sessão renovada com sucesso:", new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Exceção ao renovar sessão:", err);
      }
    };

    console.log("SessionManager inicializado - configurando renovação automática");
    
    // Renovar token imediatamente para garantir uma sessão válida desde o início
    refreshToken();
    
    // Configurar renovação periódica a cada 40 minutos
    const refreshInterval = setInterval(refreshToken, 40 * 60 * 1000);
    
    // Adicionar um listener para renovar quando o usuário voltar para a aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Usuário retornou à aplicação, renovando sessão");
        refreshToken();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpeza ao desmontar
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}

export default SessionManager; 