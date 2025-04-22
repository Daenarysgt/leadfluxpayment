import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Processar parâmetros da URL
  const searchParams = new URLSearchParams(location.search);
  const redirectAfter = searchParams.get('redirect_after');
  const planId = searchParams.get('plan_id');
  const interval = searchParams.get('interval') as 'month' | 'year' | null;
  const redirectCount = searchParams.get('redir_count') ? parseInt(searchParams.get('redir_count') || '0', 10) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Verificar se estamos em um ciclo de redirecionamento
    if (redirectCount > 3) {
      console.error('🔄 Ciclo de redirecionamento detectado no login!');
      setError('Detectamos um problema com o fluxo de login. Por favor, tente novamente mais tarde ou contate o suporte.');
      return;
    }
    
    try {
      console.log('🔑 Tentando fazer login com email:', email);
      const result = await signIn(email, password);
      
      if (!result.success) {
        setError(result.error || 'Email ou senha inválidos');
        return;
      }
      
      console.log('✅ Login bem-sucedido', result);
      
      // Aguardar um momento para garantir que a autenticação foi registrada
      // antes de redirecionar para a próxima página
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verificar se temos parâmetros de redirecionamento na URL
      if (redirectAfter === 'checkout' && planId && interval) {
        console.log('🔄 Redirecionando para checkout com parâmetros da URL:', {
          planId,
          interval
        });
        
        // Criar parâmetros limpos para evitar redirecionamentos em loop
        const cleanParams = new URLSearchParams();
        cleanParams.set('plan_id', planId);
        cleanParams.set('interval', interval);
        
        // Adicionar outros parâmetros se disponíveis
        const planName = searchParams.get('plan_name');
        if (planName) {
          cleanParams.set('plan_name', planName);
        }
        
        const timestamp = searchParams.get('timestamp') || Date.now().toString();
        cleanParams.set('timestamp', timestamp);
        
        // Para diagnóstico, marcar esse redirecionamento com informação sobre usuário
        cleanParams.set('auth_user', result.user?.id || 'unknown');
        
        // Preservar o contador de redirecionamentos
        if (redirectCount > 0) {
          cleanParams.set('redir_count', redirectCount.toString());
        }
        
        // Salvar também no localStorage como backup
        const planData = {
          planId: planId,
          interval: interval,
          timestamp: Number(timestamp),
          planName: planName || undefined
        };
        localStorage.setItem('selectedPlanInfo', JSON.stringify(planData));
        sessionStorage.setItem('selectedPlanInfo_backup', JSON.stringify(planData));
        
        console.log('💾 Também salvando dados do plano no localStorage/sessionStorage antes de redirecionar');
        
        // Redirecionar para checkout com replace:true para impedir loops de navegação
        console.log('🚀 Executando redirecionamento final para checkout');
        navigate(`/checkout?${cleanParams.toString()}`, { 
          replace: true,
          state: {
            planId: planId,
            interval: interval
          }
        });
        return;
      }
      
      // Se não tiver parâmetros na URL, verificar localStorage e sessionStorage
      console.log('🔍 Verificando plano no localStorage e sessionStorage...');
      let storedPlanInfo = localStorage.getItem('selectedPlanInfo');
      let storageSource = 'localStorage';
      
      // Se não encontrou no localStorage, tenta no sessionStorage
      if (!storedPlanInfo) {
        storedPlanInfo = sessionStorage.getItem('selectedPlanInfo_backup');
        storageSource = 'sessionStorage';
      }
      
      console.log(`📦 Dados brutos do ${storageSource}:`, storedPlanInfo);
      
      if (storedPlanInfo) {
        try {
          const planInfo = JSON.parse(storedPlanInfo);
          console.log(`📋 Plano encontrado no ${storageSource}:`, planInfo);
          
          // Verificar se a seleção não está muito antiga (24 horas)
          const isRecent = Date.now() - planInfo.timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent && planInfo.planId) {
            console.log('🔄 Dados válidos, redirecionando para checkout com:', {
              planId: planInfo.planId,
              interval: planInfo.interval
            });
            
            // NÃO remover dos storages antes do redirecionamento para garantir que os dados persistam
            
            // Adicionar parâmetros na URL para maior confiabilidade
            const params = new URLSearchParams();
            params.set('plan_id', planInfo.planId);
            params.set('interval', planInfo.interval || 'month');
            params.set('timestamp', Date.now().toString());
            params.set('auth_user', result.user?.id || 'unknown');
            
            if (planInfo.planName) {
              params.set('plan_name', planInfo.planName);
            }
            
            // Preservar o contador de redirecionamentos
            if (redirectCount > 0) {
              params.set('redir_count', redirectCount.toString());
            }
            
            // Redirecionar para o checkout com as informações do plano
            // usar replace: true para evitar problemas com histórico de navegação
            console.log('🚀 Executando redirecionamento final para checkout (via localStorage)');
            navigate(`/checkout?${params.toString()}`, {
              state: {
                planId: planInfo.planId,
                interval: planInfo.interval || 'month'
              },
              replace: true
            });
            return;
          } else {
            console.log('⚠️ Dados do plano muito antigos ou inválidos:', planInfo);
            localStorage.removeItem('selectedPlanInfo');
            sessionStorage.removeItem('selectedPlanInfo_backup');
          }
        } catch (parseError) {
          console.error('❌ Erro ao processar informações do plano:', parseError);
          // Se houver erro na leitura, apenas limpar
          localStorage.removeItem('selectedPlanInfo');
          sessionStorage.removeItem('selectedPlanInfo_backup');
        }
      } else {
        console.log('ℹ️ Nenhum plano encontrado no localStorage ou sessionStorage');
      }
      
      // Se não tiver plano selecionado ou se houver algum problema, seguir para o dashboard
      console.log('🏠 Redirecionando para dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError('Email ou senha inválidos');
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
            Bem-vindo de volta! Entre com sua conta para continuar.
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

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md"
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Entrar
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-purple-600 transition-colors font-medium"
              >
                Registre-se
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 