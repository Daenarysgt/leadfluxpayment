import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Check, Star, Clock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
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

  // Renderização para o estilo horizontal (estilo moderno)
  const renderHorizontalPrice = () => {
    return (
      <div className={`flex flex-col ${alignmentClass} gap-4 w-full max-w-3xl mx-auto`}>
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={cn(
              "rounded-xl overflow-hidden flex flex-col w-full transition-all duration-300",
              "shadow-lg hover:shadow-xl border border-opacity-10",
              plan.isHighlighted ? "ring-2 ring-violet-500" : ""
            )}
            style={{ 
              borderRadius: `${plan.style?.borderRadius || 10}px`,
              border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : undefined,
              boxShadow: boxShadow === "lg" ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "md" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "none" ? "none" : undefined,
            }}
          >
            {/* Cabeçalho - Título e descrição */}
            <div 
              className="px-5 py-4 w-full flex flex-col space-y-1"
              style={{ 
                backgroundColor: plan.style?.backgroundColor || backgroundColor,
              }}
            >
              <div className="flex justify-between items-center w-full">
                <h3 
                  className="text-lg sm:text-xl font-bold" 
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  {plan.title}
                </h3>
                
                {plan.isHighlighted && (
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-violet-700 text-white text-xs font-medium py-1 px-2.5 rounded-full flex items-center gap-1"
                    style={{ boxShadow: "0 2px 4px rgba(139, 92, 246, 0.25)" }}
                  >
                    <Sparkles className="h-3 w-3" /> Recomendado
                  </div>
                )}
              </div>
              
              <p 
                className="text-sm opacity-80 max-w-[95%]"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.description}
              </p>
            </div>
            
            {/* Corpo - Preço e features */}
            <div className="px-5 py-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-opacity-98 relative" 
              style={{ 
                backgroundColor: plan.style?.backgroundColor || backgroundColor,
                background: `linear-gradient(180deg, ${plan.style?.backgroundColor || backgroundColor} 0%, rgba(${parseInt(plan.style?.backgroundColor?.slice(1, 3) || "0", 16)}, ${parseInt(plan.style?.backgroundColor?.slice(3, 5) || "0", 16)}, ${parseInt(plan.style?.backgroundColor?.slice(5, 7) || "0", 16)}, 0.95) 100%)`,
              }}
            >
              {/* Preço */}
              <div className="flex flex-col items-center sm:items-start sm:min-w-[180px] sm:mr-auto">
                <div className="flex items-center gap-2">
                  {plan.discount && (
                    <span 
                      className="text-xs font-semibold py-0.5 px-2 rounded-md"
                      style={{ 
                        backgroundColor: `${plan.style?.buttonColor}33` || "#8B5CF633",
                        color: plan.style?.buttonColor || "#8B5CF6" 
                      }}
                    >
                      {plan.discount}
                    </span>
                  )}
                  
                  {plan.oldPrice && (
                    <span 
                      className="line-through text-xs opacity-70"
                      style={{ color: plan.style?.textColor || "#ffffff" }}
                    >
                      R${plan.oldPrice}
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline mt-1">
                  <span 
                    className="text-sm opacity-70"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    R$
                  </span>
                  <span 
                    className="text-3xl sm:text-4xl font-extrabold mx-1" 
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    {plan.price}
                  </span>
                  <span 
                    className="text-sm opacity-70"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    à vista
                  </span>
                </div>
              </div>
              
              {/* Recursos - Visíveis em telas maiores */}
              <div className="hidden sm:flex flex-col space-y-2.5 flex-1 max-w-[300px]">
                {plan.features.slice(0, 3).map((feature) => (
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
                {plan.features.length > 3 && (
                  <span 
                    className="text-xs opacity-70 mt-1"
                    style={{ color: plan.style?.featureColor || "#ffffff" }}
                  >
                    +{plan.features.length - 3} recursos incluídos
                  </span>
                )}
              </div>
              
              {/* Botão */}
              <button 
                className="w-full sm:w-auto py-3 px-5 sm:min-w-[150px] rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-98 whitespace-nowrap flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                  color: plan.style?.buttonTextColor || "#ffffff",
                  borderRadius: `${plan.style?.borderRadius || 8}px`,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
              >
                {plan.buttonText || "Comprar Agora"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Rodapé - Informações adicionais */}
            <div 
              className="px-5 py-3 flex justify-center items-center gap-2 border-t border-opacity-10 bg-opacity-80"
              style={{ 
                backgroundColor: plan.style?.backgroundColor || backgroundColor,
                borderColor: plan.style?.borderColor || "#333333" 
              }}
            >
              <ShieldCheck 
                className="h-4 w-4 opacity-60"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              />
              <span 
                className="text-xs opacity-70"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                7 dias de garantia incondicional
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderização para o estilo de cards (estilo moderno)
  const renderCardsPrice = () => {
    return (
      <div className={`flex flex-wrap ${alignmentClass} gap-4 w-full`}>
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={cn(
              "rounded-xl flex flex-col transition-all duration-300",
              "w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]",
              plan.isHighlighted ? "relative" : "",
              "hover:translate-y-[-5px] shadow-lg hover:shadow-xl border border-opacity-10"
            )}
            style={{ 
              backgroundColor: plan.style?.backgroundColor || "#000000",
              borderRadius: `${plan.style?.borderRadius || 12}px`,
              border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : undefined,
              boxShadow: boxShadow === "lg" ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "md" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                        boxShadow === "none" ? "none" : undefined,
              minWidth: "250px",
              maxWidth: "100%",
              overflow: "hidden"
            }}
          >
            {/* Tag de destaque */}
            {plan.isHighlighted && (
              <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white text-xs font-bold py-1.5 text-center">
                Mais Vantajoso
              </div>
            )}

            {/* Cabeçalho do card */}
            <div className={`${plan.isHighlighted ? 'pt-8' : 'pt-4'} px-5 pb-3 text-center`}>
              <h3 
                className="text-xl font-bold" 
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.title}
              </h3>
              <p 
                className="text-sm opacity-80 mt-1 px-3"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                {plan.description}
              </p>
            </div>

            {/* Preço */}
            <div className="flex flex-col items-center px-5 py-4 border-t border-b border-opacity-10"
              style={{ borderColor: plan.style?.borderColor || "#333333" }}
            >
              <div className="flex items-center gap-2 mb-2">
                {plan.discount && (
                  <span 
                    className="text-xs font-semibold py-0.5 px-2 rounded-full" 
                    style={{ 
                      backgroundColor: `${plan.style?.buttonColor}33` || "#8B5CF633",
                      color: plan.style?.buttonColor || "#8B5CF6",
                    }}
                  >
                    {plan.discount}
                  </span>
                )}
                {plan.oldPrice && (
                  <span 
                    className="line-through text-sm opacity-70"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    R${plan.oldPrice}
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline justify-center">
                <span 
                  className="text-sm opacity-70 mr-1"
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  R$
                </span>
                <span 
                  className="text-4xl font-extrabold" 
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  {plan.price}
                </span>
                <span 
                  className="text-sm opacity-70 ml-1"
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  à vista
                </span>
              </div>
              
              {/* Informação de parcelamento */}
              <span 
                className="text-xs opacity-70 mt-1"
                style={{ color: plan.style?.textColor || "#ffffff" }}
              >
                ou 12x de R${(parseFloat(plan.price.replace(',', '.')) / 12).toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Recursos */}
            <div className="flex flex-col space-y-3 px-5 py-5 flex-grow">
              {plan.features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-2">
                  <div 
                    className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" 
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

            {/* Contador (opcional) */}
            {plan.isHighlighted && (
              <div 
                className="flex items-center justify-center gap-2 py-2 px-4 bg-opacity-20 text-center"
                style={{ 
                  backgroundColor: `${plan.style?.buttonColor}20` || "#8B5CF620",
                  color: plan.style?.textColor || "#ffffff" 
                }}
              >
                <Clock className="h-3.5 w-3.5 opacity-80" />
                <span className="text-xs font-medium">Oferta por tempo limitado</span>
              </div>
            )}

            {/* Botão */}
            <div className="px-5 pb-5 pt-2">
              <button 
                className="w-full py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:brightness-110 active:scale-98 shadow-md"
                style={{ 
                  backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                  color: plan.style?.buttonTextColor || "#ffffff",
                  borderRadius: `${plan.style?.borderRadius || 8}px`,
                }}
              >
                {plan.buttonText || "GARANTIR MINHA VAGA AGORA"}
              </button>
              
              {/* Garantia */}
              <div className="flex justify-center items-center gap-1.5 mt-3">
                <ShieldCheck className="h-3.5 w-3.5 opacity-60" style={{ color: plan.style?.textColor || "#ffffff" }} />
                <span className="text-xs opacity-70" style={{ color: plan.style?.textColor || "#ffffff" }}>
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