import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getErrorMessage } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { checkoutStateService } from '../services/checkoutStateService';

interface SelectedPlan {
  id: string;
  interval: 'month' | 'year';
}

interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        setLoading(true);
        // Get current session and user
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        setSession(session);
        setUser(user);
        
        if (session?.expires_at) {
          // Check if token needs refreshing
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          
          if (expiresAt < now) {
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            setSession(refreshedSession);
            setUser(refreshedSession?.user || null);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    // Inscrever para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    // Initialize by checking current session
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
      
      try {
        // Verificar se tem plano selecionado via serviço de checkout
        const checkoutData = checkoutStateService.getPlanSelection();
        
        if (checkoutData) {
          console.log('🔄 Plano encontrado após login, redirecionando para checkout:', checkoutData);
          
          // Redirecionar para checkout
          navigate('/checkout', {
            state: {
              planId: checkoutData.planId,
              interval: checkoutData.interval,
              checkoutSessionId: checkoutData.checkoutSessionId
            },
            replace: true
          });
          
          return { success: true, redirectedToCheckout: true };
        }
      } catch (err) {
        console.error('❌ Erro ao verificar plano após login:', err);
        // Continuar com o fluxo normal mesmo se houver erro
      }
      
      return { success: true };
    } catch (error) {
      setError(getErrorMessage(error));
      return { success: false, error: getErrorMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, selectedPlan?: SelectedPlan) => {
    setLoading(true);
    setError(null);
    
    try {
      // Se temos selectedPlan nos parâmetros, salvar no serviço de checkout
      if (selectedPlan) {
        try {
          checkoutStateService.savePlanSelection({
            planId: selectedPlan.id,
            interval: selectedPlan.interval
          });
        } catch (err) {
          console.error('❌ Erro ao salvar plano durante registro:', err);
          // Continuar mesmo se houver erro
        }
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            selectedPlan: selectedPlan ? {
              id: selectedPlan.id,
              interval: selectedPlan.interval
            } : null
          },
          // Garantir que um email de verificação seja enviado
          emailRedirectTo: `${window.location.origin}/verify-otp`
        }
      });
      
      if (error) throw error;
      
      // Forçar envio do email OTP
      try {
        await supabase.auth.resend({
          type: 'signup',
          email,
        });
        console.log('✅ Email de verificação enviado para:', email);
      } catch (resendError) {
        console.error('❌ Erro ao reenviar email de verificação:', resendError);
        // Continuar mesmo se o reenvio falhar
      }
      
      // SEMPRE redirecionar para verificação de OTP
      // Isso garante que o fluxo de verificação seja sempre executado
      navigate('/verify-otp', { 
        state: { 
          email,
          message: 'Um email de confirmação foi enviado para o seu endereço. Por favor, verifique.',
          selectedPlan: selectedPlan || checkoutStateService.getPlanSelection()
        }
      });
      
      return { success: true, requiresEmailConfirmation: true };
      
      /* Comentando o código antigo que permitia pular a verificação OTP
      // Para usuários que precisam confirmar email
      if (data.user?.identities?.length === 0 || data.user?.email_confirmed_at === null) {
        navigate('/verify-otp', { 
          state: { 
            email,
            message: 'Um email de confirmação foi enviado para o seu endereço. Por favor, verifique.',
            selectedPlan
          }
        });
        return { success: true, requiresEmailConfirmation: true };
      }
      
      // Para usuários que não precisam confirmar email
      setUser(data.user);
      setSession(data.session);
      
      // Verificar se tem plano selecionado no localStorage primeiro
      try {
        const storedPlanInfo = localStorage.getItem('selectedPlanInfo');
        if (storedPlanInfo) {
          const planInfo = JSON.parse(storedPlanInfo);
          // Verificar se é recente (menos de 24h)
          const isRecent = Date.now() - planInfo.timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent && planInfo.planId) {
            // Limpar do localStorage
            localStorage.removeItem('selectedPlanInfo');
            
            // Redirecionar para checkout
            navigate('/checkout', {
              state: {
                planId: planInfo.planId,
                interval: planInfo.interval || 'month'
              },
              replace: true
            });
            return { success: true };
          }
        }
      } catch (parseError) {
        console.error('Erro ao processar informações do plano no localStorage:', parseError);
        // Se houver erro, continuar com o fluxo normal
      }
      
      // Se tiver plano selecionado nos parâmetros da função
      if (selectedPlan) {
        navigate('/checkout', { 
          state: { 
            planId: selectedPlan.id,
            interval: selectedPlan.interval
          },
          replace: true
        });
        return { success: true };
      }
      
      // Se não tiver plano, ir para dashboard
      navigate('/dashboard', { replace: true });
      return { success: true };
      */
    } catch (error) {
      setError(getErrorMessage(error));
      return { success: false, error: getErrorMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const signInWithGithub = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const verifyOtp = async (email: string, token: string, resend = false): Promise<VerifyOtpResponse> => {
    try {
      setLoading(true);
      
      if (resend) {
        // Reenviar o email de verificação
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        
        if (error) throw error;
        
        return { 
          success: true, 
          message: 'Um novo código de verificação foi enviado para o seu email.'
        };
      }
      
      // Verificar o token OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
      
      try {
        // Verificar se há um plano a seguir usando o serviço de checkout
        const checkoutData = checkoutStateService.getPlanSelection();
        
        if (checkoutData) {
          console.log('✅ Plano encontrado após verificação de email, redirecionando para checkout:', checkoutData);
          
          navigate('/checkout', { 
            state: { 
              planId: checkoutData.planId,
              interval: checkoutData.interval,
              checkoutSessionId: checkoutData.checkoutSessionId
            },
            replace: true
          });
          
          return { success: true };
        }
      } catch (err) {
        console.error('❌ Erro ao verificar plano após verificação de email:', err);
        // Continuar com o fluxo normal mesmo se houver erro
      }
      
      // Se não houver plano, ir para o dashboard
      navigate('/dashboard', { replace: true });
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro na verificação OTP:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithGithub,
    verifyOtp,
  };
}; 