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
            <h2 className="text-xl font-semibold text-gray-800">1. INFORMAÇÕES PRELIMINARES</h2>
            <p className="text-gray-600">
              A plataforma LeadFlux ("PLATAFORMA") é um serviço fornecido por [LINS], inscrita no CNPJ sob o n. [41.811.547/0001-54], com sede em [Rua Teixeira Da Silva], doravante denominada "LeadFlux".
            </p>
            <p className="text-gray-600">
              O acesso e uso da PLATAFORMA, bem como a contratação de quaisquer de seus produtos ou serviços, implica na aceitação plena e irrestrita dos presentes Termos de Uso e da Política de Privacidade. Caso o USUÁRIO discorde, ainda que parcialmente, destes Termos, não deve utilizar a PLATAFORMA.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">2. OBJETO</h2>
            <p className="text-gray-600">
              Estes Termos regulam a cessão de direito de uso da PLATAFORMA, na modalidade SaaS (Software as a Service), disponibilizada online para a criação e gestão de funis interativos de captação de leads.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">3. LICENÇA DE USO</h2>
            <h3 className="text-lg font-medium text-gray-700 mt-4">3.1</h3>
            <p className="text-gray-600">
              O USUÁRIO tem direito de acesso temporário e não exclusivo à PLATAFORMA, pelo prazo e plano contratado. Não há transferência de propriedade.
            </p>
            
            <h3 className="text-lg font-medium text-gray-700 mt-4">3.2</h3>
            <p className="text-gray-600">É vedado ao USUÁRIO:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Compartilhar login e senha;</li>
              <li>Utilizar a plataforma em mais de um dispositivo simultaneamente;</li>
              <li>Realizar engenharia reversa, gravar tela, copiar, baixar ou distribuir qualquer parte da plataforma ou seus elementos visuais;</li>
              <li>Utilizar a PLATAFORMA para fins ilícitos, enganosos, ofensivos ou discriminatórios;</li>
              <li>Ceder ou revender o acesso.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">4. PAGAMENTO E CANCELAMENTO</h2>
            <h3 className="text-lg font-medium text-gray-700 mt-4">4.1</h3>
            <p className="text-gray-600">
              A contratação da PLATAFORMA é feita por meio de gateways de pagamento externos, estando sujeita às políticas dessas empresas.
            </p>
            
            <h3 className="text-lg font-medium text-gray-700 mt-4">4.2</h3>
            <p className="text-gray-600">
              Após a contratação, o USUÁRIO possui o direito de arrependimento por 7 (sete) dias corridos, conforme o art. 49 do CDC.
            </p>
            
            <h3 className="text-lg font-medium text-gray-700 mt-4">4.3</h3>
            <p className="text-gray-600">
              Decorrido o prazo de arrependimento, o valor integral contratado será devido, mesmo que o USUÁRIO opte por não utilizar a PLATAFORMA.
            </p>
            
            <h3 className="text-lg font-medium text-gray-700 mt-4">4.4</h3>
            <p className="text-gray-600">
              Em caso de inadimplência, o acesso do USUÁRIO à PLATAFORMA será suspenso. A LeadFlux poderá tomar medidas legais de cobrança.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">5. FUNCIONALIDADES E LIMITES</h2>
            <h3 className="text-lg font-medium text-gray-700 mt-4">5.1</h3>
            <p className="text-gray-600">Cada plano possui limites de uso definidos, como:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Número de funis ativos</li>
              <li>Quantidade de leads mensais</li>
              <li>Recursos avançados (pixels, domínio, métricas, etc.)</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-700 mt-4">5.2</h3>
            <p className="text-gray-600">
              A LeadFlux se reserva o direito de modificar ou remover funcionalidades, mediante aviso prévio quando aplicável.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">6. RESPONSABILIDADE DO USUÁRIO</h2>
            <h3 className="text-lg font-medium text-gray-700 mt-4">6.1</h3>
            <p className="text-gray-600">O USUÁRIO é o único responsável:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Pelos conteúdos que cria e distribui usando a plataforma;</li>
              <li>Pela legalidade dos produtos ou serviços ofertados em seus funis;</li>
              <li>Pelas informações inseridas e coletadas.</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-700 mt-4">6.2</h3>
            <p className="text-gray-600">
              A LeadFlux não se responsabiliza por promessas feitas pelos USUÁRIOS aos seus clientes, nem por disputas entre terceiros.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">7. LIMITAÇÃO DE RESPONSABILIDADE</h2>
            <p className="text-gray-600">
              A LeadFlux não se responsabiliza por falhas técnicas, indisponibilidade de conexão, quedas de servidores, instabilidades externas ou falhas causadas por terceiros, caso fortuito ou força maior.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">8. PROPRIEDADE INTELECTUAL</h2>
            <p className="text-gray-600">
              Todo o conteúdo da PLATAFORMA é de propriedade da LeadFlux. Qualquer reprodução, plágio ou compartilhamento não autorizado poderá gerar responsabilização civil e criminal.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">9. PRIVACIDADE E DADOS</h2>
            <p className="text-gray-600">
              A LeadFlux realiza o tratamento de dados conforme a LGPD. O USUÁRIO é responsável por manter seus dados atualizados e pela veracidade das informações fornecidas.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">10. RESCISÃO CONTRATUAL</h2>
            <p className="text-gray-600">O contrato pode ser rescindido por:</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Inadimplência</li>
              <li>Violância aos termos</li>
              <li>Uso indevido da plataforma</li>
            </ul>
            <p className="text-gray-600">
              A rescisão não gera direito a reembolso após o prazo de arrependimento.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">11. FORO</h2>
            <p className="text-gray-600">
              Fica eleito o foro da Comarca de [Sao Paulo/ SP], para dirimir quaisquer questões relativas a este contrato, com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
            
            <p className="text-gray-500 text-sm mt-8 text-center font-medium">
              © 2025 LeadFlux. Todos os direitos reservados.
            </p>
            
            <p className="text-gray-500 text-sm mt-4 text-right">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService; 