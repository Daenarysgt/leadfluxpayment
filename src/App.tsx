import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';
import Dashboard from '@/pages/Dashboard';
import HomePage from '@/pages/HomePage';
import Index from "./pages/Index";
import Builder from "./pages/Builder";
import Preview from "./pages/Preview";
import Design from "./pages/Design";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
import NotFound from "./pages/NotFound";
import PublicFunnel from "./pages/public/PublicFunnel";
import DomainFunnel from "@/pages/public/DomainFunnel";
import { domainsService } from "@/services/domains";
import LandingPage from '@/landing/LandingPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PaymentSuccess from '@/pages/payment/PaymentSuccess';
import PaymentCanceled from '@/pages/payment/PaymentCanceled';
import { CheckoutPage } from '@/pages/checkout';
import Account from '@/pages/Account';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkoutStateService } from './services/checkoutStateService';

// Configure the query client with caching options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 2,
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check session on route change
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionData = data.session;
        
        // Verificar se o usuário existe mas precisa confirmar email
        if (sessionData?.user && sessionData.user.email && !sessionData.user.email_confirmed_at) {
          console.log('⚠️ Usuário não confirmou email. Redirecionando para verificação OTP...');
          navigate('/verify-otp', { 
            state: { 
              email: sessionData.user.email,
              message: 'Seu email ainda não foi confirmado. Por favor, verifique seu código OTP.'
            }
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setChecking(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  if (loading || checking) {
    return <div>Carregando...</div>;
  }

  if (!user || !session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkDomain = async () => {
      try {
        const currentDomain = window.location.hostname;
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
        
        // Se for localhost, não é um domínio personalizado
        if (isLocalhost) {
          setIsCustomDomain(false);
          setIsLoading(false);
          return;
        }

        // Verificar se é um domínio personalizado
        const domainConfig = await domainsService.getDomainByName(currentDomain);
        setIsCustomDomain(!!domainConfig);
      } catch (error) {
        console.error('Erro ao verificar domínio:', error);
        setIsCustomDomain(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDomain();
  }, []);

  // Efeito para capturar parâmetros de checkout na URL
  useEffect(() => {
    // Verificação de segurança para ambiente
    if (typeof window === 'undefined') return;
    
    try {
      const params = new URLSearchParams(location.search);
      const checkoutData = params.get('checkout');
      
      if (checkoutData) {
        try {
          // Decodificar os dados do plano da URL
          const planData = checkoutStateService.decodeDataFromUrl(checkoutData);
          if (planData) {
            console.log('📝 Dados do plano recuperados da URL:', planData);
            
            // Salvar os dados decodificados no serviço de checkout
            checkoutStateService.savePlanSelection({
              planId: planData.planId,
              interval: planData.interval,
              planName: planData.planName
            });
          }
        } catch (error) {
          console.error('❌ Erro ao processar dados de checkout da URL:', error);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar URL:', error);
    }
  }, [location.search]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {isCustomDomain ? (
              // Se for um domínio personalizado, renderizar o DomainFunnel
              <Route path="*" element={<DomainFunnel />} />
            ) : (
              // Se não for um domínio personalizado, renderizar as rotas normais
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/pricing" element={<LandingPage />} />
                
                {/* Rota pública para acessar funis pelo slug */}
                <Route path="/f/:slug" element={<PublicFunnel />} />
                
                {/* Rotas de Pagamento */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/canceled" element={<PaymentCanceled />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                
                {/* Rotas Protegidas */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/builder/:funnelId"
                  element={
                    <ProtectedRoute>
                      <Builder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/design/:funnelId"
                  element={
                    <ProtectedRoute>
                      <Design />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/:funnelId"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leads/:funnelId"
                  element={
                    <ProtectedRoute>
                      <Leads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preview/:funnelId"
                  element={
                    <ProtectedRoute>
                      <Preview />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
