import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Github, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationState {
  selectedPlan?: {
    id: string;
    interval: 'month' | 'year';
  };
}

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan } = location.state as LocationState || {};

  useEffect(() => {
    try {
      const storedPlanInfoStr = localStorage.getItem('selectedPlanInfo');
      if (storedPlanInfoStr) {
        const storedPlanInfo = JSON.parse(storedPlanInfoStr);
        console.log('📋 Plano do localStorage disponível na página de registro:', storedPlanInfo);
      } else {
        console.log('ℹ️ Nenhum plano encontrado no localStorage na página de registro');
      }
    } catch (e) {
      console.error('❌ Erro ao verificar localStorage na página de registro:', e);
    }
    
    if (selectedPlan) {
      console.log('🔄 Plano recebido via navegação:', selectedPlan);
    } else {
      console.log('ℹ️ Nenhum plano recebido via navegação');
    }
  }, [selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    try {
      console.log('👤 Tentando registrar usuário:', email);
      
      let planFromStorage = null;
      try {
        const storedPlanInfoStr = localStorage.getItem('selectedPlanInfo');
        if (storedPlanInfoStr) {
          planFromStorage = JSON.parse(storedPlanInfoStr);
          console.log('💾 Usando plano do localStorage para registro:', planFromStorage);
        }
      } catch (e) {
        console.error('❌ Erro ao ler localStorage antes do registro:', e);
      }
      
      const finalPlan = selectedPlan || (planFromStorage ? {
        id: planFromStorage.planId,
        interval: planFromStorage.interval
      } : undefined);
      
      if (finalPlan) {
        console.log('✅ Registrando com plano:', finalPlan);
      } else {
        console.log('ℹ️ Registrando sem plano associado');
      }
      
      await signUp(email, password, finalPlan);
      console.log('✅ Registro concluído com sucesso');
    } catch (err) {
      console.error('❌ Erro no registro:', err);
      setPasswordError('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            LeadFlux
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            Crie sua conta e comece a construir funis incríveis.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg shadow-lg p-8 border border-border/50 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            {passwordError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md"
              >
                {passwordError}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Criar Conta
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={signInWithGoogle}
                className="bg-white hover:bg-gray-50 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={signInWithGithub}
                className="bg-gray-900 hover:bg-gray-800 text-white border-gray-800 hover:border-gray-700 transition-all duration-300"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-purple-600 transition-colors font-medium"
              >
                Faça login
              </Link>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                Política de Privacidade
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 