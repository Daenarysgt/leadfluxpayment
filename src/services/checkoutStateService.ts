// Serviço para gerenciar o estado do checkout e garantir persistência entre navegações e login
// Utiliza múltiplas camadas de persistência para maior confiabilidade

export interface CheckoutPlanData {
  planId: string;
  interval: 'month' | 'year';
  timestamp: number;
  planName?: string;
  checkoutSessionId?: string; // ID único para cada fluxo de checkout
}

const STORAGE_KEY = 'leadflux_checkout_data'; // Nome da chave padronizado
const SESSION_KEY = 'leadflux_checkout_session'; // Chave para sessionStorage (persiste apenas durante a sessão)

export const checkoutStateService = {
  /**
   * Salva dados do plano selecionado em múltiplas camadas de persistência
   */
  savePlanSelection(planData: Omit<CheckoutPlanData, 'timestamp' | 'checkoutSessionId'>): void {
    try {
      // Verificar se estamos em um ambiente com window
      if (typeof window === 'undefined') return;

      // Adicionar timestamp e ID de sessão
      const checkoutData: CheckoutPlanData = {
        ...planData,
        timestamp: Date.now(),
        checkoutSessionId: this.generateSessionId(),
      };
      
      // Salvar em localStorage para persistência de longo prazo
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutData));
      
      // Salvar em sessionStorage para persistência durante a sessão atual
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(checkoutData));
      
      console.log('✅ Dados do plano salvos em múltiplas camadas:', checkoutData);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do plano:', error);
    }
  },
  
  /**
   * Recupera dados do plano selecionado de todas as fontes de persistência
   * Tenta recuperar de cada fonte na ordem de prioridade
   */
  getPlanSelection(): CheckoutPlanData | null {
    try {
      // Verificar se estamos em um ambiente com window
      if (typeof window === 'undefined') return null;

      // 1. Tentar sessionStorage primeiro (mais confiável durante navegação)
      const sessionData = window.sessionStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const parsedData = JSON.parse(sessionData) as CheckoutPlanData;
        console.log('📋 Dados do plano encontrados no sessionStorage:', parsedData);
        return parsedData;
      }
      
      // 2. Tentar localStorage como fallback
      const localData = window.localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData) as CheckoutPlanData;
        
        // Verificar se os dados são recentes (menos de 1 hora)
        const isRecent = (Date.now() - parsedData.timestamp) < (60 * 60 * 1000);
        
        if (isRecent) {
          console.log('📋 Dados do plano encontrados no localStorage:', parsedData);
          
          // Sincronizar com sessionStorage para garantir consistência
          window.sessionStorage.setItem(SESSION_KEY, localData);
          
          return parsedData;
        } else {
          console.log('⚠️ Dados do plano no localStorage são muito antigos, ignorando');
          this.clearPlanSelection();
        }
      }
      
      console.log('⚠️ Nenhum dado de plano encontrado em nenhuma fonte de persistência');
      return null;
    } catch (error) {
      console.error('❌ Erro ao recuperar dados do plano:', error);
      this.clearPlanSelection();
      return null;
    }
  },
  
  /**
   * Limpa todos os dados do plano de todas as fontes de persistência
   */
  clearPlanSelection(): void {
    try {
      // Verificar se estamos em um ambiente com window
      if (typeof window === 'undefined') return;

      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
      console.log('🧹 Dados do plano limpos de todas as fontes');
    } catch (error) {
      console.error('❌ Erro ao limpar dados do plano:', error);
    }
  },
  
  /**
   * Verifica se existem dados de plano válidos
   */
  hasPlanSelection(): boolean {
    return this.getPlanSelection() !== null;
  },
  
  /**
   * Gera um ID de sessão único para cada fluxo de checkout
   */
  generateSessionId(): string {
    return 'checkout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  },
  
  /**
   * Codifica os dados do plano para URL (para transferência via redirecionamento)
   */
  encodeDataForUrl(data: CheckoutPlanData): string {
    return encodeURIComponent(btoa(JSON.stringify(data)));
  },
  
  /**
   * Decodifica os dados do plano da URL
   */
  decodeDataFromUrl(encodedData: string): CheckoutPlanData | null {
    try {
      return JSON.parse(atob(decodeURIComponent(encodedData)));
    } catch (error) {
      console.error('❌ Erro ao decodificar dados da URL:', error);
      return null;
    }
  }
}; 