
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const SpacerRenderer = (props: ElementRendererProps) => {
  const { element, isSelected } = props;
  const { content = {} } = element;
  
  // Get the spacer height from content or use default
  const height = content.height || 50;
  
  return (
    <BaseElementRenderer {...props}>
      <div
        className={cn(
          "flex items-center justify-center transition-all",
          isSelected ? "border border-dashed border-violet-500" : "border-transparent"
        )}
        style={{ height: `${height}px` }}
      >
        {isSelected && (
          <div className="flex items-center text-gray-400">
            <GripVertical className="h-5 w-5" />
            <span className="text-xs font-medium ml-1">{height}px</span>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default SpacerRenderer;
