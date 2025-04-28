import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan } = location.state as LocationState || {};
  
  // Processar parâmetros da URL para o plano
  const searchParams = new URLSearchParams(location.search);
  const urlPlanId = searchParams.get('plan_id');
  const urlInterval = searchParams.get('interval') as 'month' | 'year' | null;
  const urlPlanName = searchParams.get('plan_name') ? decodeURIComponent(searchParams.get('plan_name') || '') : null;
  const urlTimestamp = searchParams.get('timestamp');

  useEffect(() => {
    console.log('📋 Verificando fontes de dados do plano:');
    
    // 1. Verificar parâmetros de URL
    if (urlPlanId && urlInterval) {
      console.log('🔗 Plano encontrado na URL:', {
        planId: urlPlanId,
        interval: urlInterval,
        planName: urlPlanName,
        timestamp: urlTimestamp
      });
    }
    
    // 2. Verificar state da navegação
    if (selectedPlan) {
      console.log('🔄 Plano recebido via navegação (state):', selectedPlan);
    }
    
    // 3. Verificar localStorage e sessionStorage
    try {
      const storedPlanInfoStr = localStorage.getItem('selectedPlanInfo');
      let storageSource = 'localStorage';
      let storedPlanInfo = null;
      
      // Se não encontrou no localStorage, tenta no sessionStorage
      if (!storedPlanInfoStr) {
        const sessionStoredPlanInfoStr = sessionStorage.getItem('selectedPlanInfo_backup');
        if (sessionStoredPlanInfoStr) {
          storedPlanInfo = JSON.parse(sessionStoredPlanInfoStr);
          storageSource = 'sessionStorage';
          console.log('📋 Plano do sessionStorage disponível na página de registro:', storedPlanInfo);
        }
      } else {
        storedPlanInfo = JSON.parse(storedPlanInfoStr);
        console.log('📋 Plano do localStorage disponível na página de registro:', storedPlanInfo);
      }
      
      if (!storedPlanInfo && !selectedPlan && !urlPlanId) {
        console.log('ℹ️ Nenhum plano encontrado em nenhuma fonte (URL, state, localStorage, sessionStorage)');
      }
    } catch (e) {
      console.error('❌ Erro ao verificar storages na página de registro:', e);
    }
  }, [selectedPlan, urlPlanId, urlInterval, urlPlanName, urlTimestamp]);

  // Adicionar efeito para monitorar a concordância com os termos
  useEffect(() => {
    // Verificar se o botão deve estar habilitado
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = !agreedToTerms;
      
      // Adicionar uma classe visual clara para destacar a necessidade de aceitar os termos
      if (!agreedToTerms) {
        submitButton.classList.add('opacity-50');
      } else {
        submitButton.classList.remove('opacity-50');
      }
    }
    
    // Atualizar a aparência da caixa de seleção de termos
    const termsCheckbox = document.getElementById('terms')?.parentElement;
    if (termsCheckbox) {
      if (!agreedToTerms) {
        termsCheckbox.classList.add('animate-pulse');
      } else {
        termsCheckbox.classList.remove('animate-pulse');
      }
    }
  }, [agreedToTerms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Verificação explícita dos Termos e Condições
    if (!agreedToTerms) {
      setPasswordError('Você precisa concordar com os Termos e Condições para continuar.');
      // Destacar visualmente o checkbox
      document.getElementById('terms')?.parentElement?.classList.add('ring-2', 'ring-red-500');
      // Rolar até o checkbox para garantir que seja visível
      document.getElementById('terms')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    try {
      console.log('👤 Tentando registrar usuário:', email);
      
      // Determinar o plano a ser usado com prioridade clara
      // 1. Primeiro tentar parâmetros da URL (mais confiável)
      let finalPlan = undefined;
      let planSource = '';
      
      if (urlPlanId && urlInterval) {
        finalPlan = {
          id: urlPlanId,
          interval: urlInterval
        };
        planSource = 'url-params';
      } 
      // 2. Depois verificar o state da navegação
      else if (selectedPlan) {
        finalPlan = selectedPlan;
        planSource = 'navigation-state';
      }
      // 3. Por último, verificar localStorage/sessionStorage
      else {
        let planFromStorage = null;
        
        // Verificar primeiro no localStorage
        try {
          const storedPlanInfoStr = localStorage.getItem('selectedPlanInfo');
          if (storedPlanInfoStr) {
            planFromStorage = JSON.parse(storedPlanInfoStr);
            planSource = 'localStorage';
            console.log('💾 Usando plano do localStorage para registro:', planFromStorage);
          } else {
            // Se não encontrou no localStorage, verificar no sessionStorage
            const sessionStoredPlanInfoStr = sessionStorage.getItem('selectedPlanInfo_backup');
            if (sessionStoredPlanInfoStr) {
              planFromStorage = JSON.parse(sessionStoredPlanInfoStr);
              planSource = 'sessionStorage';
              console.log('💾 Usando plano do sessionStorage para registro:', planFromStorage);
            }
          }
          
          if (planFromStorage) {
            finalPlan = {
              id: planFromStorage.planId,
              interval: planFromStorage.interval
            };
          }
        } catch (e) {
          console.error('❌ Erro ao ler os storages antes do registro:', e);
        }
      }
      
      if (finalPlan) {
        console.log(`✅ Registrando com plano (fonte: ${planSource}):`, finalPlan);
      } else {
        console.log('ℹ️ Registrando sem plano associado');
      }
      
      // Após registro bem-sucedido, garantir que os dados do plano sejam passados ao redirecionar
      const result = await signUp(email, password, finalPlan);
      
      // Se o registro foi bem-sucedido e temos um plano, garantir que ele seja
      // passado para a próxima etapa (verificação de email ou redirecionamento)
      if (result.success && finalPlan) {
        // Salvar o plano no localStorage e sessionStorage para o caso de verificação de email
        const planData = {
          planId: finalPlan.id,
          interval: finalPlan.interval,
          timestamp: Date.now()
        };
        localStorage.setItem('selectedPlanInfo', JSON.stringify(planData));
        sessionStorage.setItem('selectedPlanInfo_backup', JSON.stringify(planData));
      }
      
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

            <div className="flex items-start space-x-3 pt-4 border p-4 rounded-md bg-blue-50/30">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-0.5 h-5 w-5 border-gray-300 data-[state=unchecked]:bg-slate-100 data-[state=checked]:bg-primary"
              />
              <label 
                htmlFor="terms" 
                className="text-sm cursor-pointer"
              >
                Ao se cadastrar você reconhece que leu, entendeu e concorda com os{' '}
                <Link to="/terms" className="text-blue-600 font-medium hover:underline" target="_blank">
                  Termos e Condições de Uso
                </Link>{' '}
                da plataforma.
              </label>
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
              className={`w-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                agreedToTerms 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!agreedToTerms}
            >
              {agreedToTerms ? 'Criar Conta' : 'Aceite os termos para continuar'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-purple-600 transition-colors font-medium"
              >
                Faça login
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 