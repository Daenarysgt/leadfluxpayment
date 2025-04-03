import { useState } from 'react';

const faqs = [
  {
    question: "Como funciona o período gratuito?",
    answer: "Você tem 14 dias para testar todas as funcionalidades do LeadFlux sem compromisso. Não é necessário cartão de crédito para começar."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura quando quiser. Não há contratos de fidelidade ou taxas de cancelamento."
  },
  {
    question: "Quais são os métodos de pagamento?",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, American Express) e PIX. Todas as transações são seguras e criptografadas."
  },
  {
    question: "Oferecem suporte técnico?",
    answer: "Sim, oferecemos suporte técnico por email, chat e WhatsApp. Nossa equipe está disponível em horário comercial para ajudar você."
  },
  {
    question: "Como funciona a integração com outras ferramentas?",
    answer: "O LeadFlux possui integrações nativas com as principais ferramentas do mercado. Também oferecemos uma API robusta para integrações customizadas."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Perguntas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Frequentes
            </span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Tire suas dúvidas sobre o LeadFlux
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-200"
            >
              <button
                className="w-full px-6 py-4 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <span className="ml-6 flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Ainda tem dúvidas?{' '}
            <a 
              href="mailto:suporte@leadflux.com.br"
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-medium hover:from-blue-700 hover:to-purple-700"
            >
              Entre em contato com nosso suporte
            </a>
          </p>
        </div>
      </div>
    </section>
  );
} 