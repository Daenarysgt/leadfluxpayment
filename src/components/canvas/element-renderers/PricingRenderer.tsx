import { useCallback } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { PricingContent } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BaseElementRenderer from "./BaseElementRenderer";
import { CheckCircle2, DollarSign, Tag, Check, Star, Shield, Award } from "lucide-react";

const PricingRenderer = (props: ElementRendererProps) => {
  const { element, onUpdate, isSelected, onSelect, previewMode } = props;
  const content = element.content as PricingContent;

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
    style = "default",
    alignment = "center",
    priceAlignment = "center",
    featuresAlignment = "left",
    useGradient = false,
    gradientStart = "#3B82F6",
    gradientEnd = "#8B5CF6",
    gradientDirection = "to right"
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
      <div className="flex items-center gap-2 my-2">
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

  // Estilo padrão modernizado
  const renderDefaultStyle = () => {
    // Determinar se deve usar gradiente
    const bgStyle = useGradient 
      ? { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` } 
      : { backgroundColor };

    return (
      <div 
        className={cn(
          "rounded-lg p-6 transition-all w-full max-w-md mx-auto relative overflow-hidden", 
          {
            "shadow-lg": boxShadow,
            "border-2": true,
            "border-indigo-500": isHighlighted,
            "border-gray-200": !isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`
        }}
      >
        {isHighlighted && (
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div 
              className="absolute transform rotate-45 translate-y-[-50%] w-[140%] py-1 text-center text-xs font-semibold shadow-md text-white"
              style={{ backgroundColor: accentColor, top: "40px", right: "-20px" }}
            >
              {highlightTag || "Popular"}
            </div>
          </div>
        )}
        
        <div className="relative">
          {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
          {subtitle && <p className="text-sm opacity-80 mb-4">{subtitle}</p>}
          
          <div className="mt-4">
            {renderPrice("large")}
            {renderDiscount("default")}
            {paymentLabel && (
              <div className="text-sm text-gray-500 mt-1">{paymentLabel}</div>
            )}
          </div>
          
          {renderFeatures("default")}
          
          <Button 
            className="w-full mt-6 py-6 font-medium text-base shadow-md transition-all duration-300 hover:shadow-lg"
            style={{ 
              backgroundColor: buttonColor, 
              color: buttonTextColor,
              borderRadius: `${borderRadius}px`
            }}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  };

  // Novo estilo moderno
  const renderModernStyle = () => {
    // Determinar se deve usar gradiente
    const bgStyle = useGradient 
      ? { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` } 
      : { backgroundColor };

    return (
      <div 
        className={cn(
          "rounded-xl overflow-hidden transition-all w-full max-w-md mx-auto", 
          {
            "shadow-xl": boxShadow,
            "ring-2 ring-indigo-500": isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`
        }}
      >
        {isHighlighted && highlightTag && (
          <div 
            className="w-full py-2 text-center text-sm font-medium text-white"
            style={{ backgroundColor: accentColor }}
          >
            {highlightTag}
          </div>
        )}
        
        <div className="p-8">
          <div className="mb-6">
            {title && <h3 className="text-xl font-bold mb-1">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          
          <div className="flex items-center mb-2">
            <span className="text-2xl font-semibold mr-2">{currency}</span>
            <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {formatPrice(price)}
            </span>
          </div>
          
          {renderDiscount("modern")}
          
          {paymentLabel && (
            <div className="text-sm text-gray-500 mt-1 mb-8">{paymentLabel}</div>
          )}
          
          <Button 
            className="w-full py-6 font-semibold text-base rounded-xl transition-all duration-300 hover:opacity-90"
            style={{ 
              background: useGradient
                ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
                : `linear-gradient(90deg, ${accentColor}, ${buttonColor})`,
              color: buttonTextColor,
              borderRadius: `${borderRadius}px`
            }}
          >
            {buttonText}
          </Button>
          
          {renderFeatures("modern")}
        </div>
      </div>
    );
  };

  // Estilo card
  const renderCardStyle = () => {
    // Determinar se deve usar gradiente
    const bgStyle = useGradient 
      ? { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` } 
      : { backgroundColor };

    return (
      <div 
        className={cn(
          "rounded-xl transition-all w-full max-w-md mx-auto overflow-hidden", 
          {
            "shadow-xl": boxShadow,
            "border": true,
            "border-gray-200": !isHighlighted,
            "border-purple-400": isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`
        }}
      >
        <div className="p-8">
          {isHighlighted && (
            <div className="mb-4 flex items-center justify-center">
              <span 
                className="px-4 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center"
              >
                <Star className="h-3 w-3 mr-1 text-yellow-500" /> {highlightTag || "Recomendado"}
              </span>
            </div>
          )}
        
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && <h3 className="text-2xl font-bold">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {isHighlighted && <Award className="h-8 w-8 text-purple-500" />}
          </div>
          
          <div className="mt-6 mb-4">
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold">{currency} {formatPrice(price)}</span>
              {paymentLabel && (
                <span className="text-sm text-gray-500 ml-2">/{paymentLabel}</span>
              )}
            </div>
            
            {renderDiscount("card")}
          </div>
          
          <Button 
            className="w-full py-5 mt-2 font-medium text-base rounded-lg shadow-sm transition-transform hover:translate-y-[-2px]"
            style={{ 
              background: useGradient
                ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
                : buttonColor, 
              color: buttonTextColor,
              borderRadius: `${borderRadius}px`
            }}
          >
            {buttonText}
          </Button>
          
          {renderFeatures("card")}
        </div>
      </div>
    );
  };

  // Estilo minimalista aprimorado
  const renderMinimalStyle = () => {
    // Determinar se deve usar gradiente no fundo ou manter o degradê do isHighlighted
    const bgStyle = useGradient
      ? { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` }
      : isHighlighted 
        ? { background: "linear-gradient(to bottom, #f9fafb, #ffffff)" }
        : { backgroundColor };

    return (
      <div 
        className={cn(
          "rounded-lg p-6 transition-all w-full max-w-md mx-auto", 
          {
            "shadow-sm": boxShadow,
            "border": true,
            "border-gray-200": !isHighlighted,
            "border-blue-300": isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {isHighlighted && highlightTag && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {highlightTag}
              </span>
            )}
          </div>
          
          <div className="flex items-baseline">
            <span className="text-lg mr-1">{currency}</span>
            <span className="text-4xl font-bold">{formatPrice(price)}</span>
            {paymentLabel && (
              <span className="text-sm text-gray-500 ml-2">/{paymentLabel}</span>
            )}
          </div>
          
          {renderDiscount("minimal")}
          
          <div className="pt-4">
            <Button 
              className={`w-full transition-colors ${isHighlighted ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              variant={isHighlighted ? "default" : "outline"}
              style={!isHighlighted ? { 
                borderColor: buttonColor, 
                color: buttonColor,
                borderRadius: `${borderRadius}px`
              } : {
                background: useGradient
                  ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
                  : buttonColor,
                color: buttonTextColor,
                borderRadius: `${borderRadius}px`
              }}
            >
              {buttonText}
            </Button>
          </div>
          
          {renderFeatures("minimal")}
        </div>
      </div>
    );
  };

  // Estilo destacado aprimorado
  const renderFeaturedStyle = () => {
    return (
      <div className="relative w-full max-w-md mx-auto transition-all">
        {highlightTag && isHighlighted && (
          <div className="absolute -top-4 left-0 w-full flex justify-center">
            <div
              className="px-4 py-1 rounded-full text-white text-xs font-bold shadow-lg"
              style={{ 
                background: useGradient 
                  ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
                  : isHighlighted 
                    ? `linear-gradient(135deg, ${accentColor}dd, ${accentColor})`
                    : accentColor
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
              "text-left": alignment === "left",
              "text-center": alignment === "center",
              "text-right": alignment === "right"
            }
          )}
          style={{ 
            borderColor: isHighlighted ? accentColor : 'transparent',
            borderRadius: `${borderRadius}px`
          }}
        >
          <div 
            className="p-6"
            style={{ 
              background: useGradient 
                ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
                : isHighlighted 
                  ? `linear-gradient(135deg, ${accentColor}dd, ${accentColor})`
                  : accentColor
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
              <div className={`flex items-center ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"} mb-1`}>
                <span className="text-xl mr-1">{currency}</span>
                <span className="text-5xl font-bold">{formatPrice(price)}</span>
              </div>
              
              <div className={`flex items-center ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"} gap-3`}>
                {renderDiscount("featured")}
                
                {paymentLabel && (
                  <div className="text-sm text-gray-500">{paymentLabel}</div>
                )}
              </div>
            </div>
            
            {renderFeatures("default")}
            
            <div className="mt-6">
              <Button 
                className="w-full py-6 shadow-lg transition-transform hover:translate-y-[-2px]" 
                style={{ 
                  background: useGradient
                    ? `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`
                    : isHighlighted 
                      ? `linear-gradient(90deg, ${buttonColor}, ${accentColor})`
                      : buttonColor, 
                  color: buttonTextColor,
                  borderRadius: `${borderRadius}px`
                }}
              >
                {buttonText}
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

    return (
      <div 
        className={cn(
          "rounded-xl p-4 transition-all w-full mx-auto", 
          {
            "shadow-lg": boxShadow,
            "border": true,
            "border-gray-200": !isHighlighted,
            "border-amber-300": isHighlighted,
          }
        )}
        style={{ 
          ...bgStyle,
          color: textColor,
          borderRadius: `${borderRadius}px`
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
            
            <div className="space-y-1">
              <div className={`flex items-baseline flex-wrap ${priceAlignment === "center" ? "justify-center" : priceAlignment === "right" ? "justify-end" : "justify-start"}`}>
                <span className="text-base font-medium mr-1">{currency}</span>
                <span className="text-2xl font-bold">{formatPrice(price)}</span>
                {paymentLabel && (
                  <span className="text-xs text-gray-500 ml-1">/{paymentLabel}</span>
                )}
              </div>
              <div className={priceAlignClass}>
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
                backgroundColor: buttonColor, 
                color: buttonTextColor,
                borderRadius: `${borderRadius}px`
              }}
            >
              {buttonText}
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
      case 'modern':
        return renderModernStyle();
      case 'card':
        return renderCardStyle();
      case 'horizontal':
        return renderHorizontalStyle();
      case 'default':
      default:
        return renderDefaultStyle();
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