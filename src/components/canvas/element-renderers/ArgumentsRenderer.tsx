import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { CheckCircle, Star, ArrowRight, CircleCheck, Info, X } from "lucide-react";

interface ArgumentItem {
  id: string;
  text: string;
}

const ArgumentsRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  const title = content?.title !== undefined ? content.title : "Argumentos";
  const description = content?.description || "";
  const argumentItems = content?.argumentItems || [];
  const style = content?.style || {};
  const showCheckmarks = content?.showCheckmarks !== false;
  const checkmarkColor = style?.checkmarkColor || "#22c55e";
  const argumentsAlign = style?.argumentsAlign || "left";
  const markerIcon = style?.markerIcon || "check-circle";
  
  const titleColor = style?.titleColor || "#000000";
  const descriptionColor = style?.descriptionColor || "#6b7280";
  const argumentsColor = style?.argumentsColor || "#374151";
  
  const renderIcon = () => {
    const iconProps = {
      className: "h-5 w-5 mt-0.5 flex-shrink-0",
      style: { color: checkmarkColor }
    };
    
    switch (markerIcon) {
      case "check-circle":
        return <CheckCircle {...iconProps} />;
      case "star":
        return <Star {...iconProps} />;
      case "arrow-right":
        return <ArrowRight {...iconProps} />;
      case "circle-check":
        return <CircleCheck {...iconProps} />;
      case "info":
        return <Info {...iconProps} />;
      case "x":
        return <X {...iconProps} />;
      default:
        return <CheckCircle {...iconProps} />;
    }
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        {title !== "" && (
          <h2 className={cn(
            "text-xl font-medium mb-2 text-center",
            style?.titleAlign === "left" && "text-left",
            style?.titleAlign === "right" && "text-right"
          )}
            style={{ color: titleColor }}
          >
            {title}
          </h2>
        )}
        
        {description && (
          <p className={cn(
            "mb-4 text-center",
            style?.descriptionAlign === "left" && "text-left",
            style?.descriptionAlign === "right" && "text-right"
          )}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        )}
        
        <div className="space-y-3 mt-4">
          {argumentItems.map((arg: ArgumentItem) => (
            <div 
              key={arg.id} 
              className={cn(
                "flex items-start gap-3",
                argumentsAlign === "center" && "justify-center",
                argumentsAlign === "right" && "justify-end"
              )}
            >
              {showCheckmarks && renderIcon()}
              <p style={{ color: argumentsColor }}>{arg.text}</p>
            </div>
          ))}
          
          {argumentItems.length === 0 && (
            <div className="py-6 text-center text-gray-500">
              <p>Nenhum argumento adicionado</p>
            </div>
          )}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default ArgumentsRenderer;
