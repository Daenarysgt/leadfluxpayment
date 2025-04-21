import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-md"
        >
          <div className="flex items-center mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Termos e Condições de Uso
            </h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600">
              Este é um conteúdo temporário para a página de Termos e Condições de Uso. 
              O conteúdo real será fornecido posteriormente.
            </p>
            
            <p className="text-gray-600 mt-4">
              Ao utilizar nossa plataforma, você concorda com todos os termos e condições aqui estabelecidos.
            </p>

            <div className="h-12"></div>
            
            <h2 className="text-xl font-semibold text-gray-800">1. Aceitação dos Termos</h2>
            <p className="text-gray-600">
              Ao acessar e usar o LeadFlux, você concorda em ficar vinculado por estes Termos. 
              Se você não concordar com algum aspecto destes Termos, não utilize nossos serviços.
            </p>

            <div className="h-6"></div>
            
            <h2 className="text-xl font-semibold text-gray-800">2. Elegibilidade</h2>
            <p className="text-gray-600">
              Para usar nossos serviços, você deve ter pelo menos 18 anos de idade e capacidade 
              legal para celebrar contratos vinculativos.
            </p>

            <div className="h-12"></div>
            
            <p className="text-gray-500 text-sm mt-8">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService; 