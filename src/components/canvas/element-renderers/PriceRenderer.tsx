import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Check, ArrowRight } from "lucide-react";
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
      showButton: true,
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

  // Função para renderizar o botão
  const renderButton = (plan, isHorizontal = false) => {
    if (!plan.showButton) return null;
    
    return (
      <a
        href={plan.buttonUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          ${isHorizontal ? 'w-auto text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3 whitespace-nowrap' : 'w-full text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 mt-2 sm:mt-3'}
          rounded-md font-medium transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center
        `}
        style={{ 
          backgroundColor: plan.style?.buttonColor || "#8B5CF6",
          color: plan.style?.buttonTextColor || "#ffffff",
          borderRadius: `${plan.style?.borderRadius || 8}px`,
        }}
        onClick={e => {
          e.preventDefault();
          if (plan.buttonUrl) window.open(plan.buttonUrl, "_blank");
        }}
      >
        {isHorizontal ? (plan.buttonText || "Comprar") : (plan.buttonText || "Comprar Agora")}
        <ArrowRight className={`${isHorizontal ? 'ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3' : 'ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4'}`} />
      </a>
    );
  };

  // Renderização para o estilo horizontal (estilo consistente desktop/mobile)
  const renderHorizontalPrice = () => {
    return (
      <div className={`flex flex-wrap ${alignmentClass} gap-4 w-full`}>
        {plans.map((plan, index) => (
          <div key={plan.id} className="flex flex-col w-full">
            <div 
              className="w-full rounded-xl overflow-hidden"
              style={{ 
                borderRadius: `${plan.style?.borderRadius || 10}px`,
                border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : `1px solid rgba(255, 255, 255, 0.1)`,
                boxShadow: boxShadow === "lg" ? "0 4px 12px rgba(0, 0, 0, 0.15)" : 
                          boxShadow === "md" ? "0 2px 6px rgba(0, 0, 0, 0.1)" : 
                          boxShadow === "none" ? "none" : undefined,
                maxWidth: "100%",
                backgroundColor: "#000000",
              }}
            >
              <div className="flex flex-row" style={{ height: "80px" }}>
                {/* Lado esquerdo - Informações e recursos */}
                <div className="p-2 sm:p-4 flex-1 flex flex-col justify-center mr-auto overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h3 
                      className="text-sm sm:text-lg font-bold truncate max-w-[30%] flex-shrink-0" 
                      style={{ color: plan.style?.textColor || "#ffffff" }}
                    >
                      {plan.title}
                    </h3>
                    <p 
                      className="text-[10px] sm:text-sm opacity-80 truncate max-w-[30%] flex-shrink-0"
                      style={{ color: plan.style?.textColor || "#ffffff" }}
                    >
                      {plan.description}
                    </p>
                    
                    {/* Somente o primeiro recurso visível + contador */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div 
                        className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex items-center justify-center flex-shrink-0" 
                        style={{ backgroundColor: plan.style?.circleColor || "#32CD32" }}
                      >
                        <Check className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                      </div>
                      <span 
                        className="text-[9px] sm:text-xs truncate"
                        style={{ color: plan.style?.featureColor || "#ffffff" }}
                      >
                        {plan.features[0]?.text}
                      </span>
                      
                      {plan.features.length > 1 && (
                        <span 
                          className="text-[8px] sm:text-[10px] ml-1 px-1 py-0.5 rounded bg-opacity-20 hidden sm:inline-block"
                          style={{ 
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: plan.style?.textColor || "#ffffff" 
                          }}
                        >
                          +{plan.features.length - 1}
                        </span>
                      )}
                    </div>
                    
                    {/* Tag de Recomendado - Versão menor para mobile */}
                    {plan.isHighlighted && (
                      <div className="text-[7px] sm:text-[9px] font-medium py-0.5 px-1.5 rounded-sm flex-shrink-0 sm:ml-1"
                        style={{ 
                          backgroundColor: "#8B5CF6",
                          color: "#ffffff"
                        }}
                      >
                        Recomendado
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Lado direito - Apenas o preço (sem botão) */}
                <div className="p-2 sm:p-4 w-[80px] sm:w-[120px] flex flex-col justify-center items-center border-l border-opacity-20 flex-shrink-0" 
                  style={{ 
                    borderColor: plan.style?.borderColor || "#333333",
                    backgroundColor: "rgba(255, 255, 255, 0.03)"
                  }}
                >
                  <div className="flex items-baseline">
                    <span className="text-sm sm:text-xl font-bold" style={{ color: plan.style?.textColor || "#ffffff" }}>
                      <span className="text-[10px] sm:text-sm">R$</span>
                      {plan.price}
                    </span>
                  </div>
                  
                  {plan.discount && (
                    <span 
                      className="mt-0.5 text-[8px] sm:text-[10px] font-semibold py-px px-1 rounded-sm"
                      style={{ 
                        backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                        color: "#ffffff"
                      }}
                    >
                      {plan.discount}
                    </span>
                  )}
                </div>
                
                {/* Botão incorporado no layout horizontal */}
                {plan.showButton && (
                  <div className="p-1 sm:p-2 flex items-center justify-center flex-shrink-0">
                    {renderButton(plan, true)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderização para o estilo de cards
  const renderCardsPrice = () => {
    return (
      <div className={`flex flex-wrap ${alignmentClass} gap-4 w-full`}>
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={cn(
              "rounded-xl overflow-hidden flex flex-col",
              "w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]",
              "shadow-lg relative"
            )}
            style={{ 
              backgroundColor: "#000000",
              borderRadius: `${plan.style?.borderRadius || 12}px`,
              border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : undefined,
              boxShadow: boxShadow === "lg" ? "0 4px 12px rgba(0, 0, 0, 0.15)" : 
                        boxShadow === "md" ? "0 2px 6px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "none" ? "none" : undefined,
              minWidth: "200px",
              maxWidth: "100%"
            }}
          >
            {/* Tag de destaque */}
            {plan.isHighlighted && (
              <div className="absolute top-0 right-0 bg-violet-600 text-white text-[9px] sm:text-xs font-medium py-0.5 px-2 rounded-bl-lg z-10">
                Recomendado
              </div>
            )}

            {/* Cabeçalho do card */}
            <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 text-center">
              <h3 
                className="text-lg sm:text-xl font-bold truncate" 
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.title}
              </h3>
              <p 
                className="text-xs sm:text-sm opacity-80 mt-0.5 sm:mt-1 truncate"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.description}
              </p>
            </div>

            {/* Preço */}
            <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-b border-gray-800 text-center"
              style={{ 
                background: "linear-gradient(180deg, #000000 0%, #111111 100%)" 
              }}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                {plan.discount && (
                  <span 
                    className="text-[9px] sm:text-xs font-semibold py-0.5 px-1.5 rounded-sm" 
                    style={{ 
                      backgroundColor: "#8B5CF6",
                      color: "#ffffff"
                    }}
                  >
                    {plan.discount}
                  </span>
                )}
                {plan.oldPrice && (
                  <span 
                    className="line-through text-xs sm:text-sm opacity-70"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    R${plan.oldPrice}
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline justify-center">
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: plan.style?.textColor || "#ffffff" }}>
                  <span className="text-sm sm:text-lg mr-1">R$</span>
                  {plan.price}
                </span>
                <span 
                  className="text-xs sm:text-sm opacity-70 ml-1 sm:ml-2"
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  à vista
                </span>
              </div>
            </div>

            {/* Recursos */}
            <div className="flex flex-col space-y-2 sm:space-y-3 px-3 sm:px-5 py-3 sm:py-5 flex-grow"
              style={{ 
                background: "linear-gradient(180deg, #111111 0%, #000000 100%)" 
              }}
            >
              {plan.features.slice(0, 5).map((feature) => (
                <div key={feature.id} className="flex items-center gap-1.5 sm:gap-2">
                  <div 
                    className="h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center flex-shrink-0" 
                    style={{ 
                      backgroundColor: plan.style?.circleColor || "#32CD32",
                    }}
                  >
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </div>
                  <span 
                    className="text-xs sm:text-sm"
                    style={{ color: plan.style?.featureColor || "#ffffff" }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
              
              {plan.features.length > 5 && (
                <div className="flex items-center justify-center mt-1">
                  <span 
                    className="text-[9px] sm:text-xs opacity-70"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    +{plan.features.length - 5} recursos
                  </span>
                </div>
              )}
            </div>

            {/* Garantia e Botão */}
            <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-1 sm:pt-2 text-center"
              style={{ 
                background: "linear-gradient(180deg, #000000 0%, #000000 100%)" 
              }}
            >
              {plan.showButton && renderButton(plan)}
              
              <div className="flex justify-center items-center gap-1.5 mt-2 sm:mt-3">
                <span className="text-[9px] sm:text-xs opacity-70 text-white">
                  7 dias de garantia
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-3 w-full overflow-hidden">
        {/* Título global */}
        {title && (
          <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
        )}
        
        {/* Renderizar com base no estilo escolhido */}
        {displayStyle === "horizontal" ? renderHorizontalPrice() : renderCardsPrice()}
      </div>
    </BaseElementRenderer>
  );
};

export default PriceRenderer; 