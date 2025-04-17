import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { Plan } from '@/config/plans';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

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
      // Verificação adicional dos parâmetros para evitar erros de validação
      if (!planId || typeof planId !== 'string') {
        throw new Error(`ID do plano inválido: ${planId}`);
      }
      
      if (!interval || (interval !== 'month' && interval !== 'year')) {
        throw new Error(`Intervalo inválido: ${interval}`);
      }
      
      console.log('🔑 Iniciando criação de sessão de checkout, verificando autenticação...');
      
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('✅ Usuário autenticado, enviando requisição com os seguintes dados:', {
        planId: planId.trim(),
        interval,
        successUrl: `${APP_URL}/payment/success`,
        cancelUrl: `${APP_URL}/payment/canceled`,
        tokenPresente: !!session.access_token,
        tokenLength: session.access_token.length,
        api_url: API_URL
      });
      
      // Fazer requisição para API backend com tratamento melhorado de erros
      try {
        const response = await axios.post(
          `${API_URL}/payment/create-checkout-session`,
          { 
            planId: planId.trim(), // Garantir que não há espaços extras
            interval,
            successUrl: `${APP_URL}/payment/success`,
            cancelUrl: `${APP_URL}/payment/canceled`
          },
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
          }
        );
        
        console.log('✅ Resposta recebida do servidor:', {
          status: response.status,
          checkoutUrl: response.data?.url
        });
        
        return response.data;
      } catch (axiosError: any) {
        // Melhorar detalhamento do erro para diagnóstico
        if (axiosError.response) {
          // O servidor retornou uma resposta com código de erro
          console.error('❌ Erro na resposta do servidor:', {
            status: axiosError.response.status,
            data: axiosError.response.data,
            headers: axiosError.response.headers
          });
          
          if (axiosError.response.status === 400) {
            throw new Error(`Dados inválidos: ${JSON.stringify(axiosError.response.data)}`);
          } else if (axiosError.response.status === 401) {
            throw new Error('Token de autenticação inválido ou expirado');
          } else if (axiosError.response.status === 429) {
            throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
          } else {
            throw new Error(`Erro do servidor: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
          }
        } else if (axiosError.request) {
          // A requisição foi feita mas não houve resposta
          console.error('❌ Sem resposta do servidor:', axiosError.request);
          throw new Error('Servidor não respondeu à requisição. Verifique sua conexão com a internet.');
        } else {
          // Erro na configuração da requisição
          console.error('❌ Erro na configuração da requisição:', axiosError.message);
          throw new Error(`Erro ao configurar requisição: ${axiosError.message}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar sessão de checkout:', error);
      
      // Repassar o erro para ser tratado pelo componente
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar status do pagamento
      const response = await axios.get(
        `${API_URL}/payment/verify-session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
      
      // Se o pagamento foi bem-sucedido, salvar nas storages para persistência
      if (response.data.success) {
        localStorage.setItem('subscription_status', 'active');
        localStorage.setItem('subscription_planId', response.data.planId || '');
        sessionStorage.setItem('subscription_status_backup', 'active');
        sessionStorage.setItem('subscription_planId_backup', response.data.planId || '');
        console.log('💾 Status de assinatura salvo localmente após verificação bem-sucedida');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw error;
    }
  },
  
  /**
   * Obtém informações da assinatura atual do usuário
   * Inclui mecanismo de retry para evitar race conditions com o webhook
   */
  async getCurrentSubscription(maxRetries = 3, retryDelay = 2000): Promise<{
    planId: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null> {
    let attempts = 0;
    
    // Verificar se temos dados de assinatura no armazenamento local
    const localStatus = localStorage.getItem('subscription_status');
    const localPlanId = localStorage.getItem('subscription_planId');
    const sessionStatus = sessionStorage.getItem('subscription_status_backup');
    
    console.log('📊 Verificando status local da assinatura:', { 
      localStorage: localStatus, 
      planId: localPlanId,
      sessionStorage: sessionStatus 
    });
    
    while (attempts < maxRetries) {
      try {
        // Obter token de autenticação
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.access_token) {
          console.log('Usuário não autenticado ao verificar assinatura');
          
          // Se não está autenticado mas temos dados locais de assinatura ativa, use como fallback
          if (localStatus === 'active' && localPlanId) {
            console.log('⚠️ Usando dados locais de assinatura devido a problemas de autenticação');
            return {
              planId: localPlanId,
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias como fallback
              cancelAtPeriodEnd: false
            };
          }
          
          return null;
        }
        
        console.log(`📝 Verificando assinatura (tentativa ${attempts + 1}/${maxRetries})...`);
        
        // Obter informações da assinatura
        const response = await axios.get(
          `${API_URL}/payment/subscription`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        );
        
        // Se houver resposta com dados, atualizar storage local e retornar
        if (response.data) {
          console.log('✅ Assinatura encontrada via API:', response.data);
          
          // Atualizar storage local se for uma assinatura ativa
          if (response.data.status === 'active') {
            localStorage.setItem('subscription_status', 'active');
            localStorage.setItem('subscription_planId', response.data.planId);
            sessionStorage.setItem('subscription_status_backup', 'active');
            sessionStorage.setItem('subscription_planId_backup', response.data.planId);
            console.log('💾 Status de assinatura atualizado no storage local');
          }
          
          return response.data;
        }
        
        // Se não houver resposta da API, mas temos dados locais de assinatura ativa, use como fallback
        if (attempts === maxRetries - 1 && (localStatus === 'active' || sessionStatus === 'active') && localPlanId) {
          console.log('⚠️ API não retornou assinatura, usando dados locais como fallback');
          return {
            planId: localPlanId,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias como fallback
            cancelAtPeriodEnd: false
          };
        }
        
        // Se não houver dados e ainda temos tentativas, esperar e tentar novamente
        if (attempts < maxRetries - 1) {
          console.log(`⏳ Assinatura não encontrada, tentando novamente em ${retryDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempts++;
        } else {
          console.log('⚠️ Assinatura não encontrada após todas as tentativas');
          return null;
        }
      } catch (error: any) {
        // Registra o erro em detalhes
        if (error.response) {
          // O servidor respondeu com status fora do intervalo 2xx
          console.error('Erro ao obter assinatura - resposta do servidor:', {
            status: error.response.status,
            data: error.response.data
          });
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          console.error('Erro ao obter assinatura - sem resposta:', error.request);
        } else {
          // Erro durante a configuração da requisição
          console.error('Erro ao configurar requisição de assinatura:', error.message);
        }
        
        // Se ainda temos tentativas, esperar e tentar novamente
        if (attempts < maxRetries - 1) {
          console.log(`⏳ Erro ao verificar assinatura, tentando novamente em ${retryDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempts++;
        } else {
          // Se é a última tentativa e temos dados locais, usar como fallback
          if ((localStatus === 'active' || sessionStatus === 'active') && localPlanId) {
            console.log('⚠️ Erro na API, usando dados locais de assinatura como fallback');
            return {
              planId: localPlanId,
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias como fallback
              cancelAtPeriodEnd: false
            };
          }
          
          // Retorna null em caso de erro para não quebrar a interface
          console.log('⚠️ Erro ao verificar assinatura após todas as tentativas');
          return null;
        }
      }
    }
    
    // Se chegamos aqui sem retornar, verificar dados locais uma última vez
    if ((localStatus === 'active' || sessionStatus === 'active') && localPlanId) {
      console.log('⚠️ Após todas as tentativas, usando dados locais de assinatura como último recurso');
      return {
        planId: localPlanId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias como fallback
        cancelAtPeriodEnd: false
      };
    }
    
    return null;
  },
  
  /**
   * Acessa o portal do cliente do Stripe para gerenciar assinatura
   */
  async createCustomerPortalSession(): Promise<{ url: string }> {
    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Criar sessão do portal do cliente
      const response = await axios.post(
        `${API_URL}/payment/create-customer-portal`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Cancelar assinatura
      const response = await axios.post(
        `${API_URL}/payment/cancel-subscription`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Chamar endpoint de diagnóstico
      const response = await axios.get(
        `${API_URL}/payment/subscription/diagnostic`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
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