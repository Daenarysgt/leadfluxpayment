import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { Plan } from '@/config/plans';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Função para garantir que temos um token válido, renovando se necessário
 */
async function getAuthToken() {
  // Primeira tentativa - obter o token existente
  let { data: sessionData } = await supabase.auth.getSession();
  
  // Se não tem token, forçar refresh
  if (!sessionData.session?.access_token) {
    console.log('🔄 Token não encontrado, tentando refresh...');
    const { data: refreshData } = await supabase.auth.refreshSession();
    sessionData = refreshData;
    
    // Se mesmo após refresh não temos token, usuário não está autenticado
    if (!sessionData.session?.access_token) {
      console.error('❌ Falha ao obter token mesmo após refresh');
      throw new Error('Usuário não autenticado');
    }
  }
  
  return sessionData.session.access_token;
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
    try {
      // Obter token de autenticação
      const token = await getAuthToken();
      
      console.log('✅ Token obtido, fazendo requisição...');
      
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
      
      console.log('✅ Resposta do servidor:', response.data);
      return response.data;
    } catch (error: any) {
      // Registra o erro em detalhes
      if (error.response) {
        console.error('Erro ao obter assinatura - resposta do servidor:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Erro ao obter assinatura - sem resposta:', error.request);
      } else {
        console.error('Erro ao configurar requisição de assinatura:', error.message);
      }
      return null;
    }
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