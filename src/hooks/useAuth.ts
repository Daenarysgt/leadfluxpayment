import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getErrorMessage } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
      
      // Importante: Não fazemos o redirecionamento automático aqui
      // Deixamos o componente LoginPage fazer isso baseado nos parâmetros da URL
      // Isso evita conflitos entre diferentes fluxos de redirecionamento

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
          selectedPlan
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
    setLoading(true);
    setError(null);
    
    try {
      if (resend) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        
        if (error) throw error;
        
        return { success: true, message: 'Um novo email de verificação foi enviado.' };
      }
      
      console.log('📝 Tentando verificar OTP para email:', email);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      
      if (error) {
        // Se for um erro indicando que o email já foi confirmado
        if (error.message?.includes('Email already confirmed')) {
          console.log('✅ Email já confirmado, tentando login automático');
          
          // Tentar fazer login automático
          try {
            // Primeiro verificamos se o usuário já está logado
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            
            if (currentUser) {
              console.log('✅ Usuário já está logado:', currentUser.id);
              setUser(currentUser);
              
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (currentSession) {
                setSession(currentSession);
              }
            } else {
              // Se não estiver logado, não podemos fazer nada aqui, 
              // pois não temos a senha do usuário
              console.log('⚠️ Usuário não está logado e o email já foi confirmado');
              return { 
                success: false, 
                error: 'Seu email já foi confirmado. Por favor, faça login normalmente.' 
              };
            }
          } catch (loginError) {
            console.error('❌ Erro ao fazer login automático:', loginError);
          }
        } else {
          // Se for qualquer outro erro, lançar exceção
          console.error('❌ Erro ao verificar OTP:', error);
          throw error;
        }
      }
      
      // Se chegou aqui, ou o OTP foi verificado com sucesso, ou conseguimos fazer login
      if (data?.user) {
        console.log('✅ Usuário autenticado após verificação de OTP:', data.user.id);
        setUser(data.user);
        
        if (data.session) {
          setSession(data.session);
        }
        
        // Verificar se há um plano selecionado no localStorage ou sessionStorage
        try {
          // Tentar primeiro no localStorage
          let storedPlanInfo = localStorage.getItem('selectedPlanInfo');
          
          // Se não encontrou no localStorage, tentar no sessionStorage
          if (!storedPlanInfo) {
            storedPlanInfo = sessionStorage.getItem('selectedPlanInfo_backup');
          }
          
          if (storedPlanInfo) {
            const planInfo = JSON.parse(storedPlanInfo);
            // Verificar se é recente (menos de 24h)
            const isRecent = Date.now() - planInfo.timestamp < 24 * 60 * 60 * 1000;
            
            if (isRecent && planInfo.planId) {
              console.log('✅ Plano encontrado no armazenamento após verificação OTP:', planInfo);
              
              // Limpar dos storages após usar
              localStorage.removeItem('selectedPlanInfo');
              sessionStorage.removeItem('selectedPlanInfo_backup');
              
              // Adicionar parâmetros de URL para maior confiabilidade
              const params = new URLSearchParams();
              params.set('plan_id', planInfo.planId);
              params.set('interval', planInfo.interval || 'month');
              params.set('timestamp', Date.now().toString());
              if (planInfo.planName) {
                params.set('plan_name', planInfo.planName);
              }
              
              // Redirecionar para checkout
              navigate(`/checkout?${params.toString()}`, {
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
          console.error('❌ Erro ao processar informações do plano no armazenamento:', parseError);
        }
        
        // Verificar se há um plano selecionado nos metadados do usuário
        const selectedPlan = data.user.user_metadata?.selectedPlan;
        
        if (selectedPlan) {
          console.log('✅ Plano encontrado nos metadados do usuário após verificação OTP:', selectedPlan);
          
          // Adicionar parâmetros de URL para maior confiabilidade
          const params = new URLSearchParams();
          params.set('plan_id', selectedPlan.id);
          params.set('interval', selectedPlan.interval || 'month');
          params.set('timestamp', Date.now().toString());
          if (selectedPlan.planName) {
            params.set('plan_name', selectedPlan.planName);
          }
          
          // Redirecionar para o checkout do Stripe com o plano selecionado
          navigate(`/checkout?${params.toString()}`, { 
            state: { 
              planId: selectedPlan.id,
              interval: selectedPlan.interval
            },
            replace: true
          });
          return { success: true };
        }
        
        // Se não houver plano selecionado, redirecionar para dashboard
        navigate('/dashboard', { replace: true });
        return { success: true };
      } else {
        // Se chegou aqui mas não tem usuário nos dados retornados, 
        // provavelmente o e-mail já foi confirmado
        console.log('⚠️ Verificação concluída, mas não há usuário nos dados retornados');
        // Tentar redirecionar para o dashboard
        navigate('/dashboard', { replace: true });
        return { success: true };
      }
    } catch (error) {
      setError(getErrorMessage(error));
      return { success: false, error: getErrorMessage(error) };
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