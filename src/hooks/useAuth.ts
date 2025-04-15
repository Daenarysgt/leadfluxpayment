import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getErrorMessage } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
    try {
      setError(null);
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        } 
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        // Redirecionar para a página de verificação em vez do dashboard
        navigate('/verify-otp', { state: { email } });
      }
    } catch (error) {
      setError(getErrorMessage(error));
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

  const verifyOtp = async (email: string, token: string, resend = false) => {
    try {
      setError(null);
      setLoading(true);
      
      if (resend) {
        // Reenviar o código OTP
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        
        if (error) throw error;
        
        return { success: true, message: 'Código reenviado com sucesso' };
      } else {
        // Verificar o código OTP
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          setSession(data.session);
        }
        
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