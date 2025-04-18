import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { GripVertical, ChevronUp, ChevronDown, Dot, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SpacerRenderer = (props: ElementRendererProps) => {
  const { element, isSelected } = props;
  const { content = {} } = element;
  
  // Get spacer properties with defaults
  const height = content.height || 50;
  const backgroundColor = content.backgroundColor || "transparent";
  const border = content.border || false;
  const borderStyle = content.borderStyle || "dashed";
  const borderColor = content.borderColor || "#e5e7eb";
  const borderWidth = content.borderWidth || 1;
  const borderRadius = content.borderRadius || 0;
  const showVisualCue = content.showVisualCue !== false;
  const visualCueType = content.visualCueType || "line";
  const marginTop = content.marginTop || 0;
  const marginBottom = content.marginBottom || 0;
  const customId = content.customId || '';
  const customClass = content.customClass || '';
  const dataAttribute = content.dataAttribute || '';
  
  // Parse data attributes
  const dataAttrs: Record<string, string> = {};
  if (dataAttribute) {
    const parts = dataAttribute.split('=');
    if (parts.length === 2) {
      const key = parts[0].trim();
      const value = parts[1].trim();
      dataAttrs[key] = value;
    }
  }
  
  // Render different visual cues based on type
  const renderVisualCue = () => {
    if (!showVisualCue && !isSelected) return null;
    
    switch (visualCueType) {
      case 'line':
        return (
          <div className="w-16 h-0.5 bg-gray-300" />
        );
      case 'dots':
        return (
          <div className="flex items-center">
            {[1, 2, 3].map((i) => (
              <Dot key={i} className="h-4 w-4 text-gray-400" />
            ))}
          </div>
        );
      case 'arrows':
        return (
          <div className="flex flex-col items-center">
            <ArrowUp className="h-4 w-4 text-gray-400" />
            <div className="h-2" />
            <ArrowDown className="h-4 w-4 text-gray-400" />
          </div>
        );
      case 'grip':
        return (
          <div className="flex items-center text-gray-400">
            <GripVertical className="h-5 w-5" />
            <span className="text-xs font-medium ml-1">{height}px</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-400">
            <GripVertical className="h-5 w-5" />
            <span className="text-xs font-medium ml-1">{height}px</span>
          </div>
        );
    }
  };
  
  // Build the border style if enabled
  const borderStyles = border ? {
    borderWidth: `${borderWidth}px`,
    borderStyle,
    borderColor,
    borderRadius: `${borderRadius}px`
  } : {};
  
  return (
    <BaseElementRenderer {...props}>
      <div
        id={customId || undefined}
        className={cn(
          "flex items-center justify-center transition-all",
          customClass,
          isSelected ? "border border-dashed border-violet-500" : ""
        )}
        style={{ 
          height: `${height}px`,
          backgroundColor,
          marginTop: `${marginTop}px`,
          marginBottom: `${marginBottom}px`,
          ...borderStyles
        }}
        {...dataAttrs}
      >
        {(isSelected || showVisualCue) && renderVisualCue()}
      </div>
    </BaseElementRenderer>
  );
};

export default SpacerRenderer;
