import * as React from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import * as ProgressPrimitive from "@radix-ui/react-progress";

const LevelRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;

  // Get level settings or use defaults
  const title = content?.title || "Experience Level";
  const value = content?.value || 3;
  const maxValue = content?.maxValue || 5;
  const valueDescription = content?.valueDescription || "";
  
  // Calculate percentage for progress bar
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Get style settings or use defaults
  const style = content?.style || {};
  const primaryColor = style.primaryColor || "#8B5CF6";
  const secondaryColor = style.secondaryColor || primaryColor;
  const titleAlignment = style.titleAlignment || "center";
  const showLabels = style.showLabels !== false;
  const showMiddleLabel = style.showMiddleLabel !== false;
  const showPercentage = style.showPercentage === true;
  
  // Get custom label texts
  const beginnerLabel = style.beginnerLabel || "Beginner";
  const expertLabel = style.expertLabel || "Expert";
  const middleLabel = style.middleLabel || "Intermediate";
  
  // Get text colors
  const labelsColor = style.labelsColor || "#6B7280";
  const percentageColor = style.percentageColor || primaryColor;

  // Custom Progress component that accepts color
  const CustomProgress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { progressColor?: string }
  >(({ className, value, progressColor, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full",
        className
      )}
      style={{
        backgroundColor: `${progressColor}30`
      }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all"
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: progressColor
        }}
      />
    </ProgressPrimitive.Root>
  ));

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        <h3 className={cn("text-lg font-medium mb-2", `text-${titleAlignment}`)}>
          {title}
        </h3>
        
        {valueDescription && (
          <p className={cn("text-sm text-gray-500 mb-3", `text-${titleAlignment}`)}>{valueDescription}</p>
        )}
        
        <div className="mt-2 mb-4">
          <CustomProgress value={percentage} className="h-3" progressColor={primaryColor} />
        </div>
        
        {showLabels && (
          <div className="flex justify-between text-sm relative">
            <span style={{ color: labelsColor }}>{beginnerLabel}</span>
            {showMiddleLabel && (
              <span style={{ color: labelsColor, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                {middleLabel}
              </span>
            )}
            <span style={{ color: labelsColor }}>{expertLabel}</span>
          </div>
        )}
        
        {showPercentage && (
          <div className="text-right mt-1">
            <span className="text-sm font-medium" style={{ color: percentageColor }}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default LevelRenderer;
