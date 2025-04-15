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

  useEffect(() => {
    // Check session on route change
    const checkSession = async () => {
      await supabase.auth.getSession();
    };
    checkSession();
  }, []);

  if (loading) {
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
                
                {/* Rota pública para acessar funis pelo slug */}
                <Route path="/f/:slug" element={<PublicFunnel />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/builder/:funnelId"
                  element={
                    <PrivateRoute>
                      <Builder />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/design/:funnelId"
                  element={
                    <PrivateRoute>
                      <Design />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings/:funnelId"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/leads/:funnelId"
                  element={
                    <PrivateRoute>
                      <Leads />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/preview/:funnelId"
                  element={
                    <PrivateRoute>
                      <Preview />
                    </PrivateRoute>
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
