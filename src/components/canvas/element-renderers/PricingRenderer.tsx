import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const PricingRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content = {} } = element;

  // Estado para controlar o intervalo de preço (mensal/anual)
  const [isAnnual, setIsAnnual] = useState(false);

  // Extrair todas as propriedades com valores padrão
  const title = content.title || "Nossos Planos";
  const subtitle = content.subtitle || "Escolha o plano ideal para você";
  const showAnnualToggle = content.showAnnualToggle ?? true;
  const annualDiscount = content.annualDiscount || 15;
  const plans = content.plans || [];
  const alignment = content.alignment || "center";
  const theme = content.theme || "light";
  const style = content.style || "modern";

  // Calcular o preço com desconto anual
  const calculatePrice = (price: number, isAnnual: boolean) => {
    if (!isAnnual) return price;
    const monthlyPrice = price * 12;
    const discount = (monthlyPrice * annualDiscount) / 100;
    return monthlyPrice - discount;
  };

  // Gerar classes de container com base no alinhamento
  const containerClasses = cn(
    "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    {
      "text-left": alignment === "left",
      "text-center": alignment === "center",
      "text-right": alignment === "right",
    }
  );

  // Gerar classes de tema
  const themeClasses = cn({
    "bg-white text-gray-900": theme === "light",
    "bg-gray-900 text-white": theme === "dark",
  });

  // Gerar classes de estilo para os cards
  const getCardClasses = (plan: any, index: number) => {
    const baseClasses = "relative rounded-2xl p-8 transition-all duration-300";
    
    switch (style) {
      case "modern":
        return cn(baseClasses, {
          "bg-white shadow-xl hover:scale-105": theme === "light",
          "bg-gray-800 shadow-xl hover:scale-105": theme === "dark",
          "ring-2 ring-primary": plan.isPopular,
        });
      case "minimal":
        return cn(baseClasses, {
          "bg-gray-50 hover:bg-white": theme === "light",
          "bg-gray-800 hover:bg-gray-700": theme === "dark",
          "border-2 border-primary": plan.isPopular,
        });
      case "classic":
        return cn(baseClasses, {
          "bg-white border-2": theme === "light",
          "bg-gray-800 border-2": theme === "dark",
          "border-primary": plan.isPopular,
          "border-gray-200": !plan.isPopular && theme === "light",
          "border-gray-700": !plan.isPopular && theme === "dark",
        });
      case "gradient":
        return cn(baseClasses, {
          "bg-gradient-to-br from-primary/50 to-primary": plan.isPopular,
          "bg-gradient-to-br from-gray-50 to-white": !plan.isPopular && theme === "light",
          "bg-gradient-to-br from-gray-900 to-gray-800": !plan.isPopular && theme === "dark",
        });
      default:
        return baseClasses;
    }
  };

  return (
    <BaseElementRenderer {...props}>
      <div className={cn("py-12", themeClasses)}>
        <div className={containerClasses}>
          {/* Cabeçalho */}
          <div className="space-y-4 mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              {subtitle}
            </motion.p>

            {/* Toggle Anual/Mensal */}
            {showAnnualToggle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 mt-8"
              >
                <button
                  onClick={() => setIsAnnual(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all duration-300",
                    !isAnnual
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all duration-300",
                    isAnnual
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  Anual <span className="text-blue-400 ml-1">-{annualDiscount}%</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Grid de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {plans.map((plan: any, index: number) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={getCardClasses(plan, index)}
                >
                  {/* Badge de Popular */}
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Cabeçalho do Plano */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.description}</p>

                    {/* Preço */}
                    <div className="mt-8">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold">
                          R${calculatePrice(plan.price, isAnnual).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          /{isAnnual ? 'ano' : 'mês'}
                        </span>
                      </div>
                    </div>

                    {/* Lista de Recursos */}
                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 text-primary">
                            <Check className="h-5 w-5" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Botão */}
                    <div className="mt-8">
                      <Button
                        className={cn("w-full", {
                          "bg-primary hover:bg-primary/90": plan.isPopular,
                        })}
                        variant={plan.buttonVariant || "default"}
                        style={{
                          backgroundColor: plan.buttonColor,
                          color: plan.buttonVariant === "outline" ? plan.buttonColor : "#ffffff",
                          borderColor: plan.buttonVariant === "outline" ? plan.buttonColor : undefined,
                        }}
                      >
                        {plan.buttonText || "Começar agora"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default PricingRenderer; 