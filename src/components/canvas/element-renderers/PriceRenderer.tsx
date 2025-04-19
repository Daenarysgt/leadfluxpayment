import { useState, useEffect, useCallback } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/utils/store";
import { accessService } from "@/services/accessService";
import { safelyTrackEvent } from "@/utils/pixelUtils";

// Função para ajustar uma cor hex, tornando-a mais clara ou escura
const adjustColor = (color: string, amount: number): string => {
  // Remover o # se presente
  color = color.replace('#', '');
  
  // Converter para números
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Ajustar os valores (positivo = mais claro, negativo = mais escuro)
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  
  // Converter de volta para hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const PriceRenderer = (props: ElementRendererProps) => {
  const { element, isSelected, onSelect, onUpdate } = props;
  const { content = {}, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  
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
      periodText: "Mensal",
      warrantyText: "7 dias de garantia",
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
        borderColor: "#333333",
        dividerColor: "#333333"
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

  // Função para gerenciar a navegação e evento do Facebook Pixel
  const performNavigation = useCallback(async (plan) => {
    if (!plan) return;
    
    const navigation = plan.navigation || { type: "next" };
    const facebookEvent = plan.facebookEvent || "";
    const facebookCustomEventName = plan.facebookCustomEventName || "";
    const facebookEventParams = plan.facebookEventParams || {};
    const facebookEventDebugMode = plan.facebookEventDebugMode || false;
    
    // Rastrear evento do Facebook Pixel se configurado
    if (previewMode && facebookEvent && facebookEvent !== "none") {
      // Determinar qual nome de evento usar
      const eventName = facebookEvent === "custom" 
        ? facebookCustomEventName 
        : facebookEvent;
      
      // Não enviar evento personalizado se o nome estiver vazio
      if (facebookEvent === "custom" && !facebookCustomEventName) {
        if (facebookEventDebugMode) {
          console.warn("Facebook Pixel: Nome de evento personalizado não definido");
        }
        return;
      }
      
      // Adicionar feedback visual/log quando estiver em modo de debug
      if (facebookEventDebugMode) {
        console.group("🔍 Facebook Pixel - Evento Disparado");
        console.log("Evento:", eventName);
        console.log("Parâmetros:", facebookEventParams);
        console.groupEnd();
      }

      safelyTrackEvent(eventName, facebookEventParams);
    }
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      
      switch (navigation.type) {
        case "next":
          if (funnel && funnel.steps.length > 0) {
            const isLastStep = activeStep === funnel.steps.length - 1;
            
            if (isLastStep) {
              // Se for o último step, registrar o clique e marcar como conversão
              try {
                // Registrar o clique do botão
                await accessService.registerStepInteraction(
                  funnel.id,
                  Number(activeStep + 1),
                  null,
                  'click'
                );
                // Marcar como conversão
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
              } catch (error) {
                console.error("Erro ao registrar conversão:", error);
              }
            } else if (activeStep < funnel.steps.length - 1) {
              onStepChange(activeStep + 1);
            }
          }
          break;
        case "step":
          if (navigation.stepId && funnel) {
            const stepIndex = funnel.steps.findIndex(step => step.id === navigation.stepId);
            if (stepIndex !== -1) {
              const isLastStep = stepIndex === funnel.steps.length - 1;
              
              if (isLastStep) {
                // Se for o último step, registrar o clique e marcar como conversão
                try {
                  // Registrar o clique do botão
                  await accessService.registerStepInteraction(
                    funnel.id,
                    Number(stepIndex + 1),
                    null,
                    'click'
                  );
                  // Marcar como conversão
                  await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
                } catch (error) {
                  console.error("Erro ao registrar conversão:", error);
                }
              } else {
                onStepChange(stepIndex);
              }
            }
          }
          break;
        case "url":
          if (navigation.url) {
            if (funnel) {
              // Marcar como conversão antes de redirecionar
              try {
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
              } catch (error) {
                console.error("Erro ao registrar conversão:", error);
              }
            }
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    } else {
      // Handle navigation in canvas mode
      switch (navigation.type) {
        case "next":
          if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          break;
        case "step":
          if (navigation.stepId && currentFunnel) {
            const stepIndex = currentFunnel.steps.findIndex(step => step.id === navigation.stepId);
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex);
            }
          }
          break;
        case "url":
          if (navigation.url) {
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    }
  }, [previewMode, previewProps, currentFunnel, currentStep, setCurrentStep]);

  // Função para renderizar o botão
  const renderButton = (plan) => {
    if (!plan.showButton) return null;
    
    const navigation = plan.navigation || { type: "next" };
    const facebookEvent = plan.facebookEvent || "";
    const facebookCustomEventName = plan.facebookCustomEventName || "";
    
    return (
      <button 
        className="w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center mt-2"
        style={{ 
          backgroundColor: plan.style?.buttonColor || "#8B5CF6",
          color: plan.style?.buttonTextColor || "#ffffff",
          borderRadius: `${plan.style?.borderRadius || 8}px`,
        }}
        onClick={() => performNavigation(plan)}
      >
        {plan.buttonText || "Comprar Agora"}
        {navigation.type === "next" && <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />}
        
        {/* Indicador de Facebook Pixel (apenas visível quando for o modo editor) */}
        {!previewMode && facebookEvent && facebookEvent !== "none" && (
          <span className="ml-1.5 text-xs bg-blue-500 text-white px-1 py-0.5 rounded-sm flex items-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 mr-0.5">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor" />
            </svg>
            {facebookEvent === "custom" ? facebookCustomEventName || "Custom" : facebookEvent}
          </span>
        )}
      </button>
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
                backgroundColor: plan.style?.backgroundColor || "#000000",
              }}
            >
              <div className="flex flex-row" style={{ maxHeight: "180px" }}>
                {/* Lado esquerdo - Informações e recursos */}
                <div className="p-2 sm:p-5 flex-1 flex flex-col justify-center">
                  <h3 
                    className="text-sm sm:text-lg font-bold truncate" 
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    {plan.title}
                  </h3>
                  <p 
                    className="text-[10px] sm:text-sm opacity-80 mt-0.5 sm:mt-1 truncate"
                    style={{ color: plan.style?.descriptionColor || plan.style?.textColor || "#ffffff" }}
                  >
                    {plan.description}
                  </p>
                  
                  {/* Separador "O que está incluído" com texto menor no mobile */}
                  <div className="mt-1 sm:mt-2 flex items-center gap-x-1">
                    <h4 
                      className="text-[10px] sm:text-xs font-semibold whitespace-nowrap"
                      style={{ color: plan.style?.buttonColor || "#8B5CF6" }}
                    >
                      <span className="sm:inline hidden">O que está incluído</span>
                      <span className="sm:hidden">Incluído</span>
                    </h4>
                    <div className="h-px flex-auto opacity-20" style={{ backgroundColor: plan.style?.dividerColor || plan.style?.textColor || "#ffffff" }}></div>
                  </div>
                  
                  {/* Lista de recursos - grid com largura controlada para mobile */}
                  <div className="mt-1 sm:mt-2 grid grid-cols-2 gap-1 sm:gap-1.5 w-[90%] sm:w-full">
                    {plan.features.slice(0, 8).map((feature) => (
                      <div key={feature.id} className="flex items-center gap-1">
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
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Lado direito - Apenas o preço (sem botão) */}
                <div className="p-2 sm:p-5 w-[100px] sm:w-[160px] flex flex-col justify-center items-center border-l border-opacity-20" 
                  style={{ 
                    borderColor: plan.style?.dividerColor || plan.style?.borderColor || "#333333",
                    backgroundColor: "rgba(255, 255, 255, 0.03)"
                  }}
                >
                  <p 
                    className="text-[9px] sm:text-xs font-semibold text-center"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    {plan.periodText || "Mensal"}
                  </p>
                  
                  <div className="mt-0.5 sm:mt-1 mb-1 sm:mb-3 flex flex-col items-center">
                    <div className="flex flex-col items-center">
                      {plan.oldPrice && (
                        <span 
                          className="line-through text-[8px] sm:text-xs opacity-70"
                          style={{ color: plan.style?.textColor || "#ffffff" }}
                        >
                          R${plan.oldPrice}
                        </span>
                      )}
                      
                      <div className="flex items-baseline">
                        <span className="text-base sm:text-2xl font-bold" style={{ color: plan.style?.textColor || "#ffffff" }}>
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
                  </div>
                  
                  <p className="mt-1 sm:mt-1.5 text-[7px] sm:text-[9px] opacity-70 text-center" style={{ color: plan.style?.textColor || "#ffffff" }}>
                    {plan.warrantyText || "7 dias de garantia"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botão externo (abaixo do card) */}
            {plan.showButton && renderButton(plan)}
          </div>
        ))}
      </div>
    );
  };

  // Renderização para o estilo de cards
  const renderCardsPrice = () => {
    return (
      <div className={`flex flex-wrap ${alignmentClass} gap-4 w-full`}>
        {plans.map((plan, index) => {
          const cardContent = (
            <div 
              className={cn(
                "rounded-xl overflow-hidden flex flex-col",
                "w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]",
                "shadow-lg relative"
              )}
              style={{ 
                backgroundColor: plan.style?.backgroundColor || "#000000",
                borderRadius: `${plan.style?.borderRadius || 12}px`,
                border: plan.style?.borderColor ? `1px solid ${plan.style.borderColor}` : undefined,
                boxShadow: boxShadow === "lg" ? "0 4px 12px rgba(0, 0, 0, 0.15)" : 
                          boxShadow === "md" ? "0 2px 6px rgba(0, 0, 0, 0.1)" : 
                          boxShadow === "none" ? "none" : undefined,
                minWidth: "250px",
                maxWidth: "100%"
              }}
            >
              {/* Tag de destaque */}
              {plan.isHighlighted && (
                <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-medium py-1 px-3 rounded-bl-lg z-10">
                  Recomendado
                </div>
              )}

              {/* Cabeçalho do card */}
              <div className="px-5 pt-4 pb-3 text-center">
                <h3 
                  className="text-xl font-bold" 
                  style={{ color: plan.style?.textColor || "#ffffff" }}
                >
                  {plan.title}
                </h3>
                <p 
                  className="text-sm opacity-80 mt-1"
                  style={{ color: plan.style?.descriptionColor || plan.style?.textColor || "#ffffff" }}
                >
                  {plan.description}
                </p>
              </div>

              {/* Preço */}
              <div className="px-5 py-4 border-t border-b text-center"
                style={{ 
                  background: `linear-gradient(180deg, ${plan.style?.backgroundColor || "#000000"}, ${plan.style?.backgroundColor ? adjustColor(plan.style.backgroundColor, -15) : "#111111"})`,
                  borderColor: plan.style?.dividerColor || "#333333"
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p 
                    className="text-xs font-semibold text-center"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    {plan.periodText || "Mensal"}
                  </p>
                  
                  {plan.discount && (
                    <span 
                      className="text-xs font-semibold py-0.5 px-2 rounded-sm" 
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
                      className="line-through text-sm opacity-70"
                      style={{ color: plan.style?.textColor || "#ffffff" }}
                    >
                      R${plan.oldPrice}
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold" style={{ color: plan.style?.textColor || "#ffffff" }}>
                    <span className="text-lg mr-1">R$</span>
                    {plan.price}
                  </span>
                  <span 
                    className="text-sm opacity-70 ml-2"
                    style={{ color: plan.style?.textColor || "#ffffff" }}
                  >
                    à vista
                  </span>
                </div>
              </div>

              {/* Recursos */}
              <div className="flex flex-col space-y-3 px-5 py-5 flex-grow"
                style={{ 
                  background: `linear-gradient(180deg, ${plan.style?.backgroundColor ? adjustColor(plan.style.backgroundColor, -15) : "#111111"}, ${plan.style?.backgroundColor || "#000000"})` 
                }}
              >
                {plan.features.slice(0, 8).map((feature) => (
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

              {/* Garantia ou botão interno */}
              <div className="px-5 pb-5 pt-2 text-center"
                style={{ 
                  background: `linear-gradient(180deg, ${plan.style?.backgroundColor || "#000000"}, ${plan.style?.backgroundColor || "#000000"})` 
                }}
              >
                {plan.showButton ? (
                  // Botão interno do card
                  <button 
                    className="w-full py-2.5 px-3 rounded-md text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center mt-2"
                    style={{ 
                      backgroundColor: plan.style?.buttonColor || "#8B5CF6",
                      color: plan.style?.buttonTextColor || "#ffffff",
                      borderRadius: `${plan.style?.borderRadius || 8}px`,
                    }}
                    onClick={() => performNavigation(plan)}
                  >
                    {plan.buttonText || "Comprar Agora"}
                    {plan.navigation?.type === "next" && <ArrowRight className="ml-2 h-4 w-4" />}
                    
                    {/* Indicador de Facebook Pixel (apenas visível quando for o modo editor) */}
                    {!previewMode && plan.facebookEvent && plan.facebookEvent !== "none" && (
                      <span className="ml-1.5 text-xs bg-blue-500 text-white px-1 py-0.5 rounded-sm flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 mr-0.5">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor" />
                        </svg>
                        {plan.facebookEvent === "custom" ? plan.facebookCustomEventName || "Custom" : plan.facebookEvent}
                      </span>
                    )}
                  </button>
                ) : (
                  // Texto de garantia quando não tem botão
                  <div className="flex justify-center items-center gap-1.5 mt-3">
                    <span className="text-xs opacity-70" style={{ color: plan.style?.textColor || "#ffffff" }}>
                      {plan.warrantyText || "7 dias de garantia incondicional"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
          
          return (
            <div key={plan.id} className="flex justify-center w-full md:w-auto">
              {cardContent}
            </div>
          );
        })}
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