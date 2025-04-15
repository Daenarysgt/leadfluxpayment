import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { Plan } from '@/config/plans';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Função para garantir que temos um token válido, renovando se necessário
 */
async function getAuthToken() {
  try {
    // Primeira tentativa - obter o token existente
    let { data: sessionData } = await supabase.auth.getSession();
    
    console.log('🔍 Verificando sessão:', {
      hasSession: !!sessionData.session,
      hasToken: !!sessionData.session?.access_token,
      tokenFirstChars: sessionData.session?.access_token 
        ? sessionData.session.access_token.substring(0, 10) + '...' 
        : 'none'
    });
    
    // Se não tem token, forçar refresh
    if (!sessionData.session?.access_token) {
      console.log('🔄 Token não encontrado, tentando refresh...');
      const { data: refreshData, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Erro no refresh do token:', error.message);
        throw new Error(`Erro ao renovar token: ${error.message}`);
      }
      
      sessionData = refreshData;
      
      console.log('🔍 Sessão após refresh:', {
        hasSession: !!sessionData.session,
        hasToken: !!sessionData.session?.access_token,
        tokenFirstChars: sessionData.session?.access_token 
          ? sessionData.session.access_token.substring(0, 10) + '...' 
          : 'none'
      });
      
      // Se mesmo após refresh não temos token, usuário não está autenticado
      if (!sessionData.session?.access_token) {
        console.error('❌ Falha ao obter token mesmo após refresh');
        
        // Redirecionar para login se não conseguir token
        window.location.href = '/login';
        throw new Error('Usuário não autenticado');
      }
    }
    
    // Verificar se o token realmente funciona
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionData.session.access_token);
    
    if (userError || !user) {
      console.error('❌ Token inválido mesmo após refresh:', userError?.message);
      
      // Limpar a sessão e redirecionar para login
      await supabase.auth.signOut();
      window.location.href = '/login';
      throw new Error('Token inválido');
    }
    
    console.log('✅ Token validado com sucesso:', {
      userId: user.id,
      email: user.email
    });
    
    return sessionData.session.access_token;
  } catch (error) {
    console.error('❌ Erro fatal ao obter token:', error);
    throw error;
  }
}

/**
 * Serviço para gerenciar operações relacionadas a pagamentos
 */
export const paymentService = {
  /**
   * Obtém a sessão do usuário atual
   */
  async getUserSession() {
    return await supabase.auth.getSession();
  },

  /**
   * Cria uma sessão de checkout do Stripe para o plano selecionado
   */
  async createCheckoutSession(planId: string, interval: 'month' | 'year'): Promise<{ url: string }> {
    try {
      // Obter token de autenticação
      const token = await getAuthToken();
      
      // Fazer requisição para API backend
      const response = await axios.post(
        `${API_URL}/payment/create-checkout-session`,
        { 
          planId, 
          interval,
          successUrl: `${APP_URL}/payment/success`,
          cancelUrl: `${APP_URL}/payment/canceled`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw error;
    }
  },
  
  /**
   * Verifica o status de um pagamento após retorno do Stripe
   */
  async verifyPaymentStatus(sessionId: string): Promise<{
    success: boolean;
    planId?: string;
    error?: string;
    subscription?: {
      id: string;
      status: string;
      currentPeriodEnd: Date;
    }
  }> {
    try {
      // Obter token de autenticação
      const token = await getAuthToken();
      
      // Verificar status do pagamento
      const response = await axios.get(
        `${API_URL}/payment/verify-session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw error;
    }
  },
  
  /**
   * Obtém informações da assinatura atual do usuário
   */
  async getCurrentSubscription(): Promise<{
    planId: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null> {
    // Retry é útil para casos de problemas temporários com o token
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} de obter assinatura...`);
        
        // Obter token de autenticação
        const token = await getAuthToken();
        
        console.log(`✅ Token obtido na tentativa ${attempt}, fazendo requisição...`);
        
        // Token disponível, fazer a requisição
        const response = await axios.get(
          `${API_URL}/payment/subscription`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.data) {
          console.log('⚠️ Resposta vazia do servidor');
          return null;
        }
        
        console.log('✅ Resposta do servidor recebida com sucesso');
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Registra o erro em detalhes
        if (error.response) {
          console.error(`❌ Erro na tentativa ${attempt}/${maxRetries} - resposta do servidor:`, {
            status: error.response.status,
            data: error.response.data
          });
          
          // Se for erro de autenticação e não for a última tentativa, tentar novamente
          if (error.response.status === 401 && attempt < maxRetries) {
            console.log(`⏳ Erro de autenticação, aguardando ${attempt * 1000}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
        } else if (error.request) {
          console.error(`❌ Erro na tentativa ${attempt}/${maxRetries} - sem resposta:`, error.request);
        } else {
          console.error(`❌ Erro na tentativa ${attempt}/${maxRetries} - configuração:`, error.message);
        }
        
        // Se não for a última tentativa, esperar um pouco e tentar de novo
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Espera progressiva: 1s, 2s, 3s
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    console.error('❌ Todas as tentativas de obter assinatura falharam');
    
    // Limpar localStorage para começar com um estado limpo
    localStorage.removeItem('selectedPlanInfo');
    
    return null;
  },
  
  /**
   * Acessa o portal do cliente do Stripe para gerenciar assinatura
   */
  async createCustomerPortalSession(): Promise<{ url: string }> {
    try {
      // Obter token de autenticação
      const token = await getAuthToken();
      
      // Criar sessão do portal do cliente
      const response = await axios.post(
        `${API_URL}/payment/create-customer-portal`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao acessar portal do cliente:', error);
      throw error;
    }
  },
  
  /**
   * Cancela a assinatura atual do usuário
   */
  async cancelSubscription(): Promise<{ success: boolean }> {
    try {
      // Obter token de autenticação
      const token = await getAuthToken();
      
      // Cancelar assinatura
      const response = await axios.post(
        `${API_URL}/payment/cancel-subscription`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  },

  /**
   * Realiza um diagnóstico completo da assinatura do usuário
   * Útil para debugar problemas com o fluxo de pagamento
   */
  async diagnosticSubscription(): Promise<any> {
    try {
      // Obter token de autenticação
      const token = await getAuthToken();
      
      // Chamar endpoint de diagnóstico
      const response = await axios.get(
        `${API_URL}/payment/subscription/diagnostic`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao executar diagnóstico de assinatura:', error);
      throw error;
    }
  }
}; 