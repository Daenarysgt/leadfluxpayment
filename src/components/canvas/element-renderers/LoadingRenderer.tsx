
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

const LoadingRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  // Get loading settings or use defaults
  const title = content?.title || "Loading...";
  const description = content?.description || "Please wait while we process your request.";
  
  // Get style settings or use defaults
  const loadingStyle = content?.style?.loadingStyle || "spinner";
  const primaryColor = content?.style?.primaryColor || "#8B5CF6";
  const titleAlignment = content?.style?.titleAlignment || "center";
  const size = content?.style?.size || "medium";
  
  // Determine size classes
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };
  
  const spinnerSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium;

  return (
    <BaseElementRenderer {...props}>
      <div className="p-6 w-full">
        <div className={cn("flex flex-col items-center justify-center", `text-${titleAlignment}`)}>
          {loadingStyle === "spinner" && (
            <Loader 
              className={cn("animate-spin mb-4", spinnerSize)} 
              style={{ color: primaryColor }}
            />
          )}
          
          {loadingStyle === "dots" && (
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={cn("rounded-full animate-pulse", spinnerSize)} 
                  style={{ 
                    backgroundColor: primaryColor,
                    animationDelay: `${(i - 1) * 0.3}s` 
                  }}
                />
              ))}
            </div>
          )}
          
          {loadingStyle === "progress" && (
            <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full animate-progress rounded-full"
                style={{ 
                  backgroundColor: primaryColor,
                }}
              />
            </div>
          )}
          
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default LoadingRenderer;
