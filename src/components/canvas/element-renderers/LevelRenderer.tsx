import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
  const titleAlignment = style.titleAlignment || "center";
  const showLabels = style.showLabels !== false;
  const showPercentage = style.showPercentage === true;
  
  // Get custom label texts
  const beginnerLabel = style.beginnerLabel || "Beginner";
  const expertLabel = style.expertLabel || "Expert";
  
  // Get text colors
  const labelsColor = style.labelsColor || "#6B7280";
  const levelTextColor = style.levelTextColor || primaryColor;
  const percentageColor = style.percentageColor || primaryColor;
  
  // Process custom level text if provided
  const levelTextTemplate = content?.levelText || "Level %value% of %max%";
  const levelText = levelTextTemplate
    .replace("%value%", value.toString())
    .replace("%max%", maxValue.toString());

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
          <Progress value={percentage} className="h-3" style={{ 
            "--progress-background": primaryColor 
          } as React.CSSProperties} />
        </div>
        
        {showLabels && (
          <div className="flex justify-between text-sm">
            <span style={{ color: labelsColor }}>{beginnerLabel}</span>
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
        
        <div className="mt-4 text-center font-medium" style={{ color: levelTextColor }}>
          {levelText}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default LevelRenderer;
