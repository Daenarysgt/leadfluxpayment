import { useCallback } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { PricingContent } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BaseElementRenderer from "./BaseElementRenderer";
import { CheckCircle2, DollarSign, Tag, Check, Star, Shield, Award, ArrowRight } from "lucide-react";
import { accessService } from "@/services/accessService";
import { useStore } from "@/utils/store";

const PricingRenderer = (props: ElementRendererProps) => {
  const { element, onUpdate, isSelected, onSelect, previewMode, previewProps } = props;
  const content = element.content as PricingContent;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();

  const {
    title = "Método Beauty",
    subtitle = "",
    price = 127,
    originalPrice,
    discount = 50,
    currency = "R$",
    discountLabel = "off",
    paymentType = "single",
    paymentPeriod = "onetime",
    paymentLabel = "à vista",
    buttonText = "Comprar Agora!",
    features = [],
    backgroundColor = "#ffffff",
    textColor = "#333333",
    accentColor = "#2563eb",
    buttonColor = "#10b981",
    buttonTextColor = "#ffffff",
    borderRadius = 8,
    boxShadow = true,
    highlightTag = "",
    isHighlighted = false,
    style = "horizontal",
    alignment = "center",
    priceAlignment = "center",
    featuresAlignment = "left",
    useGradient = false,
    useButtonGradient = true,
    gradientStart = "#3B82F6",
    gradientEnd = "#8B5CF6",
    gradientDirection = "to right",
    navigation = { type: "next" }
  } = content || {};

  const handleContentUpdate = useCallback(
    (updates: Partial<PricingContent>) => {
      if (onUpdate) {
        onUpdate({
          ...element,
          content: {
            ...content,
            ...updates,
          },
        });
      }
    },
    [element, content, onUpdate]
  );

  // Função para tratar navegação
  const handleNavigation = async () => {
    console.log("PricingRenderer - handleNavigation called");
    console.log("Navigation config:", JSON.stringify(navigation));
    console.log("PreviewMode:", previewMode);
    
    if (!navigation) {
      console.error("Navigation object is not defined");
      return;
    }
    
    // Verificar o modo de preview
    if (previewMode && previewProps) {
      console.log("Entrando no modo de preview");
      const { activeStep, onStepChange, funnel } = previewProps;
      
      // Verificar se temos todos os dados necessários
      if (typeof activeStep === 'undefined') {
        console.error("activeStep não definido em previewProps");
        return;
      }
      
      if (!onStepChange || typeof onStepChange !== 'function') {
        console.error("onStepChange não é uma função válida em previewProps");
        return;
      }
      
      if (!funnel || !funnel.steps || !Array.isArray(funnel.steps)) {
        console.error("funnel ou funnel.steps inválido em previewProps:", funnel);
        return;
      }
      
      console.log("Preview mode com dados válidos:");
      console.log("- activeStep:", activeStep);
      console.log("- Total steps:", funnel.steps.length);
      console.log("- Etapas disponíveis:", funnel.steps.map(s => ({ id: s.id, title: s.title })));
      
      switch (navigation.type) {
        case "next":
          console.log("Preview mode: Navigate to next step");
          // CORREÇÃO: Chamar onStepChange sem condições adicionais para garantir que sempre navegue
          try {
            console.log("Tentando navegar para a próxima etapa:", activeStep + 1);
            onStepChange(activeStep + 1);
            console.log("Navegação executada com sucesso");
            
            // Somente registrar conversão se for a última etapa
            if (activeStep === funnel.steps.length - 1) {
              console.log("Registrando conversão para o funil:", funnel.id);
              try {
                await accessService.registerStepInteraction(
                  funnel.id,
                  Number(activeStep + 1),
                  null,
                  'click'
                );
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso!");
              } catch (error) {
                console.error("Erro ao registrar conversão:", error);
              }
            }
          } catch (error) {
            console.error("Erro ao navegar para a próxima etapa:", error);
          }
          break;
        case "step":
          if (navigation.stepId && funnel) {
            console.log("Preview mode: Navigate to specific step:", navigation.stepId);
            // Encontre o índice correspondente à etapa (usando findIndex)
            const stepIndex = funnel.steps.findIndex(step => step.id === navigation.stepId);
            
            if (stepIndex !== -1) {
              console.log("Navegando para o stepIndex:", stepIndex);
              // CORREÇÃO: Chamar onStepChange sem condições adicionais
              try {
                onStepChange(stepIndex);
                console.log("Navegação para etapa específica executada com sucesso");
                
                // Somente registrar conversão se for a última etapa
                if (stepIndex === funnel.steps.length - 1) {
                  console.log("Registrando conversão para o funil (specific):", funnel.id);
                  try {
                    await accessService.registerStepInteraction(
                      funnel.id,
                      Number(stepIndex + 1),
                      null,
                      'click'
                    );
                    await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
                    console.log("Conversão registrada com sucesso (specific)!");
                  } catch (error) {
                    console.error("Erro ao registrar conversão (specific):", error);
                  }
                }
              } catch (error) {
                console.error("Erro ao navegar para etapa específica:", error);
              }
            } else {
              console.error("Step ID não encontrado:", navigation.stepId);
            }
          } else {
            console.error("Navigation.stepId não definido ou funnel não disponível");
          }
          break;
        case "url":
          if (navigation.url) {
            console.log("Preview mode: Navigate to URL:", navigation.url);
            if (funnel) {
              // Marcar como conversão antes de redirecionar
              console.log("Registrando conversão antes de redirecionar:", funnel.id);
              try {
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso (URL)!");
              } catch (error) {
                console.error("Erro ao registrar conversão (URL):", error);
              }
            }
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    } else {
      console.log("Usando navegação no modo canvas");
      console.log("CurrentFunnel:", currentFunnel);
      console.log("CurrentStep:", currentStep);
      
      // Handle navigation in canvas mode
      switch (navigation.type) {
        case "next":
          try {
            console.log("Canvas mode: Tentando navegar para a próxima etapa:", currentStep + 1);
            if (currentFunnel && currentFunnel.steps && currentFunnel.steps.length > 0) {
              setCurrentStep(currentStep + 1);
              console.log("Canvas mode: Navegação executada com sucesso");
            } else {
              console.error("Canvas mode: Funil inválido ou sem etapas");
            }
          } catch (error) {
            console.error("Canvas mode: Erro ao navegar para a próxima etapa:", error);
          }
          break;
          
        case "step":
          try {
            console.log("Canvas mode: Tentando navegar para etapa específica:", navigation.stepId);
            if (navigation.stepId && currentFunnel && currentFunnel.steps) {
              const stepIndex = currentFunnel.steps.findIndex(step => step.id === navigation.stepId);
              if (stepIndex !== -1) {
                setCurrentStep(stepIndex);
                console.log("Canvas mode: Navegação para etapa específica executada com sucesso");
              } else {
                console.error("Canvas mode: Step ID não encontrado:", navigation.stepId);
              }
            } else {
              console.error("Canvas mode: Navigation.stepId não definido ou currentFunnel inválido");
            }
          } catch (error) {
            console.error("Canvas mode: Erro ao navegar para etapa específica:", error);
          }
          break;
          
        case "url":
          try {
            if (navigation.url) {
              console.log("Canvas mode: Abrindo URL:", navigation.url);
              window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
            } else {
              console.error("Canvas mode: URL não definida");
            }
          } catch (error) {
            console.error("Canvas mode: Erro ao abrir URL:", error);
          }
          break;
          
        default:
          console.error("Canvas mode: Tipo de navegação desconhecido:", navigation.type);
          break;
      }
    }
  };

  // Função para tratar o valor do preço para exibição
  const formatPrice = (value: number) => {
    return value.toFixed(2).replace(".", ",");
  };

  const renderPrice = (size = "large") => {
    const sizeClasses = {
      small: "text-3xl",
      medium: "text-4xl",
      large: "text-5xl",
    };
    
    const actualAlignment = priceAlignment || alignment;
    
    return (
      <div className={`flex items-end ${actualAlignment === "center" ? "justify-center" : actualAlignment === "right" ? "justify-end" : "justify-start"}`}>
        <span className="text-lg mr-1 font-medium">{currency}</span>
        <span className={`${sizeClasses[size as keyof typeof sizeClasses]} font-bold`}>
          {formatPrice(price)}
        </span>
      </div>
    );
  };

  const renderDiscount = (variant = "default") => {
    if (!originalPrice && !discount) return null;
    
    const variants = {
      default: "bg-red-100 text-red-600",
      modern: "bg-indigo-100 text-indigo-600",
      card: "bg-gradient-to-r from-rose-500 to-red-500 text-white",
      minimal: "bg-gray-100 text-gray-700",
      horizontal: "bg-amber-100 text-amber-700"
    };
    
    return (
      <div className="flex items-center gap-2 my-2 flex-wrap">
        {originalPrice && (
          <span className="text-gray-500 line-through text-sm">
            {currency} {formatPrice(originalPrice)}
          </span>
        )}
        {discount && (
          <span className={`${variant === "featured" || variant === "horizontal" ? "" : variants[variant as keyof typeof variants]} px-2 py-0.5 rounded text-xs font-medium shadow-sm`}
            style={variant === "featured" || variant === "horizontal" ? { backgroundColor: accentColor, color: "#ffffff" } : undefined}>
            {discount}% {discountLabel}
          </span>
        )}
      </div>
    );
  };

  const renderFeatures = (variant = "default") => {
    if (!features.length) return null;

    const variants = {
      default: {
        container: "mt-4 space-y-2",
        item: "flex items-start",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
      },
      modern: {
        container: "mt-6 space-y-3",
        item: "flex items-start",
        icon: <Check className="h-4 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-0.5 mr-2 flex-shrink-0 mt-0.5" />
      },
      card: {
        container: "mt-6 space-y-3 border-t pt-4 border-gray-100",
        item: "flex items-start",
        icon: <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
      },
      minimal: {
        container: "mt-4 space-y-2",
        item: "flex items-start",
        icon: <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
      },
      horizontal: {
        container: "mt-4 space-y-1.5",
        item: "flex items-start",
        icon: <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-1" />
      }
    };
    
    const selectedVariant = variants[variant as keyof typeof variants] || variants.default;
    const actualAlignment = featuresAlignment || (variant === "horizontal" ? "left" : alignment);

    return (
      <ul className={`${selectedVariant.container} ${actualAlignment === "center" ? "text-center" : actualAlignment === "right" ? "text-right" : "text-left"}`}>
        {features.map((feature, index) => (
          <li key={index} className={`${selectedVariant.item} ${actualAlignment === "center" ? "justify-center" : actualAlignment === "right" ? "justify-end" : ""}`}>
            {selectedVariant.icon}
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Estilo minimalista aprimorado
  const renderMinimalStyle = () => {
    // Determinar se deve usar gradiente no fundo
    const bgStyle = useGradient
      ? { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` }
      : { backgroundColor };

    // Determinar o alinhamento do preço
    const priceAlignClass = priceAlignment === "center" 
      ? "justify-center text-center" 
      : priceAlignment === "right" 
        ? "justify-end text-right" 
        : "justify-start text-left";
    
    // Determinar background do botão baseado nas preferências
    const buttonBg = useButtonGradient
      ? useGradient
        ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
        : isHighlighted 
          ? `linear-gradient(90deg, ${buttonColor}, ${accentColor})`
          : buttonColor
      : buttonColor;

    return (
      <div 
        className={cn(
          "rounded-lg p-6 transition-all w-full max-w-md mx-auto", 
          {
            "shadow-sm": boxShadow,
            "border": true,
            "border-gray-200": !isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`,
          ...(isHighlighted && { borderColor: accentColor })
        }}
      >
        <div className="space-y-4">
          <div className={`flex items-center gap-2 ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"}`}>
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {isHighlighted && highlightTag && (
              <span className="px-2 py-1 text-xs rounded-full"
                style={{ backgroundColor: accentColor, color: "#ffffff" }}>
                {highlightTag}
              </span>
            )}
          </div>
          
          <div className={`flex ${priceAlignment === "center" ? "justify-center" : priceAlignment === "right" ? "justify-end" : "justify-start"}`}>
            <div className={`flex flex-col ${priceAlignment === "center" ? "items-center" : priceAlignment === "right" ? "items-end" : "items-start"}`}>
              <div className="flex items-baseline">
                <span className="text-base font-medium mr-1">{currency}</span>
                <span className="text-2xl font-bold">{formatPrice(price)}</span>
                {paymentLabel && (
                  <span className="text-xs text-gray-500 ml-1">/{paymentLabel}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {renderDiscount("minimal")}
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              className="w-full transition-colors"
              style={{ 
                background: buttonBg,
                color: useButtonGradient || !isHighlighted ? buttonTextColor : "#ffffff",
                borderRadius: `${borderRadius}px`,
                border: !useButtonGradient && !isHighlighted ? `1px solid ${buttonColor}` : "none"
              }}
              onClick={(e) => {
                console.log("Botão do pricing clicado (minimalStyle)");
                console.log("Configuração de navegação:", navigation.type, navigation);
                e.stopPropagation();
                handleNavigation();
              }}
            >
              {buttonText}
              {navigation.type === "next" && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          
          {renderFeatures("minimal")}
        </div>
      </div>
    );
  };

  // Estilo destacado aprimorado
  const renderFeaturedStyle = () => {
    // Determinar background do botão baseado nas preferências
    const buttonBg = useButtonGradient
      ? useGradient
        ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
        : isHighlighted 
          ? `linear-gradient(90deg, ${buttonColor}, ${accentColor})`
          : buttonColor
      : buttonColor;
        
    return (
      <div className="relative w-full max-w-md mx-auto transition-all">
        {highlightTag && isHighlighted && (
          <div className="absolute -top-4 left-0 w-full flex justify-center">
            <div
              className="px-4 py-1 rounded-full text-white text-xs font-bold shadow-lg"
              style={{ 
                backgroundColor: accentColor
              }}
            >
              {highlightTag}
            </div>
          </div>
        )}
        
        <div 
          className={cn(
            "rounded-xl overflow-hidden transition-all", 
            {
              "shadow-2xl": boxShadow,
              "border-2": true,
              "border-gray-200": !isHighlighted,
              "border-transparent": isHighlighted,
              "text-left": alignment === "left",
              "text-center": alignment === "center",
              "text-right": alignment === "right"
            }
          )}
          style={{ 
            borderRadius: `${borderRadius}px`,
            ...(isHighlighted && { borderColor: accentColor })
          }}
        >
          <div 
            className="p-6"
            style={{ 
              backgroundColor: accentColor,
              color: "#ffffff"
            }}
          >
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-white opacity-90">{subtitle}</p>}
          </div>
          
          <div 
            className="p-8"
            style={{ 
              backgroundColor,
              color: textColor
            }}
          >
            <div className="mb-6">
              <div className={`flex flex-col ${priceAlignment === "center" ? "items-center" : priceAlignment === "right" ? "items-end" : "items-start"}`}>
                <div className="flex items-center mb-1">
                  <span className="text-xl mr-1">{currency}</span>
                  <span className="text-5xl font-bold">{formatPrice(price)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {renderDiscount("featured")}
                  
                  {paymentLabel && (
                    <div className="text-sm text-gray-500">{paymentLabel}</div>
                  )}
                </div>
              </div>
            </div>
            
            {renderFeatures("default")}
            
            <div className="mt-6">
              <Button 
                className="w-full py-6 shadow-lg transition-transform hover:translate-y-[-2px]" 
                style={{ 
                  background: buttonBg,
                  color: buttonTextColor,
                  borderRadius: `${borderRadius}px`
                }}
                onClick={(e) => {
                  console.log("Botão do pricing clicado (featuredStyle)");
                  console.log("Configuração de navegação:", navigation.type, navigation);
                  e.stopPropagation();
                  handleNavigation();
                }}
              >
                {buttonText}
                {navigation.type === "next" && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Novo estilo horizontal
  const renderHorizontalStyle = () => {
    // Determinar se deve usar gradiente no fundo
    const bgStyle = useGradient
      ? { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` }
      : { backgroundColor };

    // Determinar o alinhamento do preço
    const priceAlignClass = priceAlignment === "center" 
      ? "justify-center text-center" 
      : priceAlignment === "right" 
        ? "justify-end text-right" 
        : "justify-start text-left";
        
    // Determinar o alinhamento dos recursos
    const featuresAlignClass = featuresAlignment === "center" 
      ? "justify-center text-center" 
      : featuresAlignment === "right" 
        ? "justify-end text-right" 
        : "justify-start text-left";
        
    // Determinar background do botão baseado nas preferências
    const buttonBg = useButtonGradient
      ? useGradient
        ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
        : isHighlighted 
          ? `linear-gradient(90deg, ${buttonColor}, ${accentColor})`
          : buttonColor
      : buttonColor;

    return (
      <div 
        className={cn(
          "rounded-xl p-4 transition-all w-full mx-auto", 
          {
            "shadow-lg": boxShadow,
            "border": true,
            "border-gray-200": !isHighlighted,
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`,
          ...(isHighlighted && { borderColor: accentColor })
        }}
      >
        {/* Layout sempre em grid com 3 colunas fixas */}
        <div className="grid grid-cols-3 gap-2 items-center">
          {/* Primeira coluna - Título e Preço */}
          <div className={`space-y-2 ${priceAlignClass}`}>
            <div className={`flex items-center gap-2 mb-2 ${priceAlignment === "center" ? "justify-center" : priceAlignment === "right" ? "justify-end" : "justify-start"}`}>
              {isHighlighted && (
                <div style={{ color: accentColor }}>
                  <Shield className="h-5 w-5 flex-shrink-0" />
                </div>
              )}
              <h3 className="text-lg font-bold truncate">{title}</h3>
            </div>
            {subtitle && <p className="text-xs text-gray-600 line-clamp-2">{subtitle}</p>}
            
            <div className={`flex flex-col ${priceAlignment === "center" ? "items-center" : priceAlignment === "right" ? "items-end" : "items-start"}`}>
              <div className="flex items-baseline flex-wrap">
                <span className="text-base font-medium mr-1">{currency}</span>
                <span className="text-2xl font-bold">{formatPrice(price)}</span>
                {paymentLabel && (
                  <span className="text-xs text-gray-500 ml-1">/{paymentLabel}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {renderDiscount("horizontal")}
              </div>
            </div>
          </div>
          
          {/* Segunda coluna - Recursos */}
          <div className={`max-h-[150px] overflow-y-auto ${featuresAlignClass}`}>
            {renderFeatures("horizontal")}
          </div>
          
          {/* Terceira coluna - Botão */}
          <div className="flex justify-end">
            <Button 
              className="px-4 py-4 font-medium text-sm rounded-lg shadow-md transition-all whitespace-nowrap"
              style={{ 
                background: buttonBg,
                color: buttonTextColor,
                borderRadius: `${borderRadius}px`
              }}
              onClick={(e) => {
                console.log("Botão do pricing clicado (horizontalStyle)");
                console.log("Configuração de navegação:", navigation.type, navigation);
                e.stopPropagation();
                handleNavigation();
              }}
            >
              {buttonText}
              {navigation.type === "next" && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderStyleVariant = () => {
    switch (style) {
      case 'minimal':
        return renderMinimalStyle();
      case 'featured':
        return renderFeaturedStyle();
      case 'horizontal':
        return renderHorizontalStyle();
      default:
        // Se o estilo não for reconhecido ou não for fornecido, usamos horizontal como estilo padrão
        console.log(`Estilo não reconhecido ou não fornecido: "${style}". Usando horizontal como padrão.`);
        return renderHorizontalStyle();
    }
  };

  const pricingElement = (
    <div className="w-full" onClick={previewMode ? undefined : () => onSelect(element.id)}>
      {renderStyleVariant()}
    </div>
  );

  return (
    <BaseElementRenderer {...props}>
      {pricingElement}
    </BaseElementRenderer>
  );
};

export default PricingRenderer;