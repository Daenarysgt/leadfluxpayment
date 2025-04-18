import { useCallback } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { PricingContent } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BaseElementRenderer from "./BaseElementRenderer";
import { CheckCircle2, DollarSign, Tag } from "lucide-react";

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
    alignment = "center"
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

  const renderPrice = () => {
    return (
      <div className="flex items-end justify-center">
        <span className="text-lg mr-1">{currency}</span>
        <span className="text-5xl font-bold">{price.toFixed(2).replace(".", ",")}</span>
      </div>
    );
  };

  const renderDiscount = () => {
    if (!originalPrice && !discount) return null;
    
    return (
      <div className="flex items-center gap-2 my-2">
        {originalPrice && (
          <span className="text-gray-500 line-through text-sm">
            {currency} {originalPrice.toFixed(2).replace(".", ",")}
          </span>
        )}
        {discount && (
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-medium">
            {discount}% {discountLabel}
          </span>
        )}
      </div>
    );
  };

  const renderFeatures = () => {
    if (!features.length) return null;

    return (
      <ul className="mt-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderDefaultStyle = () => {
    return (
      <div 
        className={cn(
          "rounded-lg p-6 transition-all w-full max-w-md mx-auto", 
          {
            "shadow-lg": boxShadow,
            "border-2 border-blue-500": isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          backgroundColor,
          color: textColor,
          borderRadius: `${borderRadius}px`
        }}
      >
        {highlightTag && isHighlighted && (
          <div 
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: accentColor }}
          >
            {highlightTag}
          </div>
        )}
        
        <div className="relative">
          {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
          {subtitle && <p className="text-sm opacity-75 mb-4">{subtitle}</p>}
          
          <div className="mt-4">
            {renderPrice()}
            {renderDiscount()}
            {paymentLabel && (
              <div className="text-sm text-gray-500 mt-1">{paymentLabel}</div>
            )}
          </div>
          
          {renderFeatures()}
          
          <Button 
            className="w-full mt-6" 
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

  const renderMinimalStyle = () => {
    return (
      <div 
        className={cn(
          "rounded-lg p-6 transition-all w-full max-w-md mx-auto", 
          {
            "shadow-sm": boxShadow,
            "border border-gray-200": true,
            "border-2 border-blue-500": isHighlighted,
            "text-left": alignment === "left",
            "text-center": alignment === "center",
            "text-right": alignment === "right"
          }
        )}
        style={{ 
          backgroundColor,
          color: textColor,
          borderRadius: `${borderRadius}px`
        }}
      >
        <div className="space-y-4">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          
          <div className="flex items-baseline justify-center">
            <span className="text-lg mr-1">{currency}</span>
            <span className="text-4xl font-bold">{price.toFixed(2).replace(".", ",")}</span>
            {paymentLabel && (
              <span className="text-sm text-gray-500 ml-2">/{paymentLabel}</span>
            )}
          </div>
          
          {renderDiscount()}
          
          <div className="pt-4">
            <Button 
              className="w-full" 
              variant="outline"
              style={{ 
                borderColor: buttonColor, 
                color: buttonColor,
                borderRadius: `${borderRadius}px`
              }}
            >
              {buttonText}
            </Button>
          </div>
          
          {renderFeatures()}
        </div>
      </div>
    );
  };

  const renderFeaturedStyle = () => {
    return (
      <div className="relative w-full max-w-md mx-auto">
        {highlightTag && isHighlighted && (
          <div className="absolute -top-4 left-0 w-full flex justify-center">
            <div
              className="px-4 py-1 rounded-full text-white text-xs font-bold shadow-md"
              style={{ backgroundColor: accentColor }}
            >
              {highlightTag}
            </div>
          </div>
        )}
        
        <div 
          className={cn(
            "rounded-lg overflow-hidden transition-all", 
            {
              "shadow-xl": boxShadow,
              "border-2": true,
              "border-blue-500": isHighlighted,
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
            className="p-4"
            style={{ backgroundColor: accentColor }}
          >
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-white opacity-90">{subtitle}</p>}
          </div>
          
          <div 
            className="p-6"
            style={{ 
              backgroundColor,
              color: textColor
            }}
          >
            <div className="mb-6">
              <div className="flex items-baseline justify-center mb-1">
                <span className="text-xl mr-1">{currency}</span>
                <span className="text-5xl font-bold">{price.toFixed(2).replace(".", ",")}</span>
              </div>
              
              {renderDiscount()}
              
              {paymentLabel && (
                <div className="text-sm text-gray-500 mt-1">{paymentLabel}</div>
              )}
            </div>
            
            {renderFeatures()}
            
            <div className="mt-6">
              <Button 
                className="w-full py-6" 
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
      </div>
    );
  };

  const renderStyleVariant = () => {
    switch (style) {
      case 'minimal':
        return renderMinimalStyle();
      case 'featured':
        return renderFeaturedStyle();
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