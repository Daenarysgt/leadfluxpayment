import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      // Se não houver email, redirecione para a página de registro
      navigate('/register');
    }
  }, [email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Pegar apenas o último caractere inserido
      value = value.charAt(value.length - 1);
    }

    // Atualizar o valor apenas se for um número
    if (/^\d*$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Mover para o próximo input se um dígito foi inserido
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Se pressionar backspace com campo vazio, voltar para o anterior
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Por favor, preencha todos os 6 dígitos.');
      setIsVerifying(false);
      return;
    }

    try {
      const result = await verifyOtp(email, otpString);
      if (result.success) {
        // Redireciona para a página de preços após verificação bem-sucedida
        navigate('/pricing', {
          state: {
            message: 'Email verificado com sucesso! Escolha um plano para começar.'
          }
        });
      } else {
        setError('Código de verificação inválido. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao verificar o código. Por favor, tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Verificar se o conteúdo colado contém apenas números
    if (/^\d+$/.test(pastedData)) {
      // Preencher os inputs com os dígitos colados
      const digits = pastedData.slice(0, 6).split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Foco no último input preenchido ou no próximo vazio
      const lastIndex = Math.min(digits.length, 6) - 1;
      if (lastIndex >= 0) {
        inputRefs.current[lastIndex]?.focus();
      }
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
            Verificação
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            Insira o código de 6 dígitos enviado para {email || "seu email"}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg shadow-lg p-8 border border-border/50 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold bg-white border-2 border-gray-300 shadow-sm focus:border-blue-500 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus={index === 0}
                />
              ))}
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

            <Button 
              type="submit" 
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isVerifying ? 'Verificando...' : 'Verificar código'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não recebeu o código?{' '}
              <button 
                type="button"
                onClick={() => verifyOtp(email, '', true)}
                className="text-blue-600 hover:text-purple-600 transition-colors font-medium"
              >
                Reenviar código
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage; 