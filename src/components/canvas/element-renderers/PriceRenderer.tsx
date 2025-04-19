import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PriceRenderer = (props: ElementRendererProps) => {
  const { element, isSelected, onSelect, onUpdate } = props;
  const { content = {}, previewMode } = element;
  
  // Extraindo os dados do content ou usando valores padrão
  const [title, setTitle] = useState(content?.title || "Planos de Preço");
  const [displayStyle, setDisplayStyle] = useState(content?.displayStyle || "horizontal");
  const [plans, setPlans] = useState(content?.plans || [
    {
      id: crypto.randomUUID(),
      title: "Plano Pro",
      description: "Supercharger sua experiência com recursos avançados",
      price: "197,00",
      oldPrice: "240,00",
      discount: "50% off",
      buttonText: "Comprar Agora!",
      features: [
        { id: crypto.randomUUID(), text: "Novo recurso" },
        { id: crypto.randomUUID(), text: "Novo recurso" },
        { id: crypto.randomUUID(), text: "Novo recurso" }
      ],
      isHighlighted: false,
      style: {
        backgroundColor: "#000000",
        textColor: "#ffffff",
        buttonColor: "#8B5CF6",
        buttonTextColor: "#ffffff",
        featureColor: "#ffffff",
        circleColor: "#32CD32",
        borderRadius: 8,
        borderColor: "#333333"
      }
    }
  ]);
  
  const [alignment, setAlignment] = useState(content?.alignment || "center");
  const [backgroundColor, setBackgroundColor] = useState(content?.backgroundColor || "#151515");
  const [boxShadow, setBoxShadow] = useState(content?.boxShadow || "lg");
  const [selectedPlan, setSelectedPlan] = useState(content?.selectedPlan || null);
  
  // Atualizar o estado local quando o content muda
  useEffect(() => {
    if (content?.title !== undefined) setTitle(content.title);
    if (content?.displayStyle !== undefined) setDisplayStyle(content.displayStyle);
    if (content?.plans !== undefined) setPlans(content.plans);
    if (content?.alignment !== undefined) setAlignment(content.alignment);
    if (content?.backgroundColor !== undefined) setBackgroundColor(content.backgroundColor);
    if (content?.boxShadow !== undefined) setBoxShadow(content.boxShadow);
    if (content?.selectedPlan !== undefined) setSelectedPlan(content.selectedPlan);
  }, [content]);

  // Classes condicionais baseadas no alinhamento
  const alignmentClass = {
    center: "justify-center",
    left: "justify-start",
    right: "justify-end"
  }[alignment] || "justify-center";

  // Renderização para o estilo horizontal
  const renderHorizontalPrice = () => {
    return (
      <div className={`flex flex-wrap ${alignmentClass} gap-4 w-full`}>
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={cn(
              "rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-4xl transition-all duration-300",
              plan.isHighlighted ? "ring-2 ring-violet-500 scale-[1.02]" : "",
              "bg-opacity-90 backdrop-blur-sm"
            )}
            style={{ 
              backgroundColor: plan.style?.backgroundColor || backgroundColor,
              borderRadius: `${plan.style?.borderRadius || 8}px`,
              border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : undefined,
              boxShadow: boxShadow === "lg" ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "md" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "none" ? "none" : undefined
            }}
          >
            {/* Informações do plano */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
              {plan.isHighlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 md:left-6 md:translate-x-0 bg-violet-500 text-white text-xs font-medium py-1 px-3 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Recomendado
                </div>
              )}
              <h3 
                className="text-xl font-bold" 
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.title}
              </h3>
              <p 
                className="text-sm opacity-80"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.description}
              </p>
            </div>

            {/* Preço */}
            <div className="flex flex-col items-center md:items-center">
              <div className="flex items-center">
                <span 
                  className="text-3xl font-bold" 
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  <span className="text-lg mr-1">R$</span>{plan.price}
                </span>
                {plan.oldPrice && (
                  <span 
                    className="ml-2 line-through text-sm opacity-70"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    R${plan.oldPrice}
                  </span>
                )}
              </div>
              {plan.discount && (
                <span 
                  className="mt-1 text-xs font-semibold py-1 px-2 rounded-full" 
                  style={{ 
                    backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                    color: plan.style?.buttonTextColor || "#ffffff" 
                  }}
                >
                  {plan.discount}
                </span>
              )}
            </div>

            {/* Recursos */}
            <div className="flex flex-col items-center md:items-start space-y-2">
              {plan.features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2">
                  <div 
                    className="h-5 w-5 rounded-full flex items-center justify-center" 
                    style={{ 
                      backgroundColor: plan.style?.circleColor || "#32CD32",
                    }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span 
                    className="text-sm"
                    style={{ color: plan.style?.featureColor || "#ffffff" }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão */}
            <button 
              className="mt-4 md:mt-0 py-2 px-6 rounded-lg font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ 
                backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                color: plan.style?.buttonTextColor || "#ffffff",
                borderRadius: `${plan.style?.borderRadius || 8}px`,
              }}
            >
              {plan.buttonText || "Comprar Agora"}
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Renderização para o estilo de cards
  const renderCardsPrice = () => {
    return (
      <div className={`flex flex-wrap ${alignmentClass} gap-6 w-full`}>
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={cn(
              "rounded-xl p-6 flex flex-col gap-4 transition-all duration-300",
              "w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)]",
              plan.isHighlighted ? "ring-2 ring-violet-500 relative" : "",
              "backdrop-blur-sm"
            )}
            style={{ 
              backgroundColor: plan.style?.backgroundColor || "#000000",
              borderRadius: `${plan.style?.borderRadius || 8}px`,
              border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : undefined,
              boxShadow: boxShadow === "lg" ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "md" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "none" ? "none" : undefined
            }}
          >
            {/* Tag de destaque */}
            {plan.isHighlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white text-xs font-medium py-1 px-3 rounded-full flex items-center gap-1">
                <Star className="h-3 w-3" /> Recomendado
              </div>
            )}

            {/* Cabeçalho do card */}
            <div className="text-center mb-2">
              <h3 
                className="text-xl font-bold mb-1" 
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.title}
              </h3>
              <p 
                className="text-sm opacity-80"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.description}
              </p>
            </div>

            {/* Preço */}
            <div className="flex flex-col items-center my-4">
              <div className="flex items-baseline">
                <span 
                  className="text-4xl font-bold" 
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  <span className="text-xl mr-1">R$</span>{plan.price}
                </span>
                <span 
                  className="text-sm ml-1 opacity-80"
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  /mês
                </span>
              </div>
              {plan.oldPrice && (
                <span 
                  className="mt-1 line-through text-sm opacity-70"
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  R${plan.oldPrice}
                </span>
              )}
              {plan.discount && (
                <span 
                  className="mt-2 text-xs font-semibold py-1 px-2 rounded-full" 
                  style={{ 
                    backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                    color: plan.style?.buttonTextColor || "#ffffff" 
                  }}
                >
                  {plan.discount}
                </span>
              )}
            </div>

            {/* Botão */}
            <button 
              className="w-full py-2.5 rounded-lg font-medium transition-all duration-200 text-center hover:opacity-90 active:scale-95 mb-4"
              style={{ 
                backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                color: plan.style?.buttonTextColor || "#ffffff",
                borderRadius: `${plan.style?.borderRadius || 8}px`,
              }}
            >
              {plan.buttonText || "Escolher este plano"}
            </button>

            {/* Recursos */}
            <div className="flex flex-col space-y-3 mt-2">
              {plan.features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2">
                  <div 
                    className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0" 
                    style={{ 
                      backgroundColor: plan.style?.circleColor || "#32CD32",
                    }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span 
                    className="text-sm"
                    style={{ color: plan.style?.featureColor || "#ffffff" }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        {/* Título global */}
        {title && (
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
        )}
        
        {/* Renderizar com base no estilo escolhido */}
        {displayStyle === "horizontal" ? renderHorizontalPrice() : renderCardsPrice()}
      </div>
    </BaseElementRenderer>
  );
};

export default PriceRenderer; 