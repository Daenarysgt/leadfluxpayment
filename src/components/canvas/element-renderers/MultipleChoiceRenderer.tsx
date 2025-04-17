import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import BaseElementRenderer from "./BaseElementRenderer";
import { useCallback, useState, useEffect } from "react";
import { accessService } from "@/services/accessService";
import { Check } from "lucide-react";

const MultipleChoiceRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Destructure configuration options with defaults
  const {
    allowMultipleSelection = false,
    indicatorType = "circle", // circle or square
    indicatorAlign = "left", // left or right
    continueButtonText = "Continuar"
  } = content || {};
  
  // Reset selected options when element changes
  useEffect(() => {
    setSelectedOptions([]);
  }, [element.id]);
  
  const handleOptionClick = useCallback((option: any) => {
    console.log("MultipleChoiceRenderer - Option clicked:", option);
    
    // Handle multiple selection
    setSelectedOptions(prev => {
      if (allowMultipleSelection) {
        // Toggle selection
        return prev.includes(option.id) 
          ? prev.filter(id => id !== option.id) 
          : [...prev, option.id];
      } else {
        // Single selection
        return [option.id];
      }
    });
  }, [allowMultipleSelection]);
  
  const handleContinue = useCallback(async () => {
    // Exit if no options selected
    if (selectedOptions.length === 0) return;
    
    const selectedOptionsData = content.options.filter((opt: any) => 
      selectedOptions.includes(opt.id)
    );
    
    // Find the first selected option with navigation
    const navigationOption = selectedOptionsData.find((opt: any) => opt.navigation);
    
    if (!navigationOption) return;
    
    const navigationType = navigationOption.navigation.type;
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      console.log("Preview mode - Current step:", activeStep);
      
      if (funnel) {
        // Register all selected choices
        const selections = selectedOptionsData.map((opt: any) => opt.text || opt.value).join(", ");
        await accessService.registerStepInteraction(
          funnel.id,
          activeStep + 1,
          null, // usar sessionId atual
          'choice',
          selections
        );
        
        if (navigationType === "next") {
          console.log("Preview mode: Navigate to next step");
          if (activeStep < funnel.steps.length - 1) {
            onStepChange(activeStep + 1);
          } else if (activeStep === funnel.steps.length - 1) {
            // Se for o último step, marcar como conversão
            await accessService.updateProgress(funnel.id, activeStep + 1, null, true);
          }
        }
        else if (navigationType === "step" && navigationOption.navigation.stepId) {
          console.log("Preview mode: Navigate to specific step:", navigationOption.navigation.stepId);
          const stepIndex = funnel.steps.findIndex(step => step.id === navigationOption.navigation.stepId);
          if (stepIndex !== -1) {
            if (stepIndex === funnel.steps.length - 1) {
              // Se for o último step, marcar como conversão
              await accessService.updateProgress(funnel.id, stepIndex + 1, null, true);
            } else {
              onStepChange(stepIndex);
            }
          }
        }
        else if (navigationType === "url" && navigationOption.navigation.url) {
          console.log("Preview mode: Open external URL:", navigationOption.navigation.url);
          // Marcar como conversão antes de redirecionar
          await accessService.updateProgress(funnel.id, activeStep + 1, null, true);
          window.open(navigationOption.navigation.url, navigationOption.navigation.openInNewTab ? "_blank" : "_self");
        }
      }
    } else {
      // Handle navigation in canvas mode
      if (navigationType === "next") {
        if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
      else if (navigationType === "step" && navigationOption.navigation.stepId) {
        if (currentFunnel) {
          const stepIndex = currentFunnel.steps.findIndex(step => step.id === navigationOption.navigation.stepId);
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
          }
        }
      }
      else if (navigationType === "url" && navigationOption.navigation.url) {
        window.open(navigationOption.navigation.url, navigationOption.navigation.openInNewTab ? "_blank" : "_self");
      }
    }
  }, [previewMode, previewProps, currentFunnel, setCurrentStep, currentStep, selectedOptions, content.options]);

  return (
    <BaseElementRenderer {...props}>
      <div className="space-y-4">
        {content.title && (
          <h3 className="text-lg font-medium">{content.title}</h3>
        )}
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
        
        {/* Texto auxiliar para seleção múltipla */}
        {allowMultipleSelection && (
          <p className="text-sm text-muted-foreground">
            Selecione uma ou mais opções para avançar
          </p>
        )}
        
        <div className="space-y-2">
          {content.options?.map((option: any) => {
            // Prepare styles based on option configurations
            const optionStyle = option.style || {};
            const isSelected = selectedOptions.includes(option.id);
            const borderRadius = content.style?.borderRadius || 8; // Default border radius
            const hoverColor = content.style?.hoverColor || "#f3f4f6"; // Default hover color
            
            // Inline styles for the option
            const styleObject = {
              backgroundColor: isSelected ? (optionStyle.selectedBackgroundColor || "#f5f3ff") : (optionStyle.backgroundColor || ""),
              borderColor: isSelected ? (optionStyle.selectedBorderColor || "#8b5cf6") : (optionStyle.borderColor || ""),
              color: isSelected ? (optionStyle.selectedTextColor || "#4c1d95") : (optionStyle.textColor || ""),
              borderRadius: `${borderRadius}px`,
              transition: "all 0.2s ease",
            };
            
            // Create CSS class name for hover effect
            const hoverClass = `hover-option-${option.id}`;
            
            // Add a style tag for this specific option's hover effect if not already added
            if (!document.getElementById(hoverClass) && typeof document !== 'undefined') {
              const style = document.createElement('style');
              style.id = hoverClass;
              style.innerHTML = `
                .${hoverClass}:hover {
                  background-color: ${!isSelected ? (hoverColor || "#f3f4f6") : ""} !important;
                  color: ${optionStyle.hoverTextColor || ""} !important;
                }
              `;
              document.head.appendChild(style);
            }
            
            // Prepare the indicator element (circle or square)
            const renderIndicator = () => {
              if (indicatorType === "square") {
                return (
                  <div className={cn(
                    "w-5 h-5 flex items-center justify-center border-2",
                    isSelected 
                      ? "border-violet-500 bg-violet-500" 
                      : "border-gray-300 bg-white"
                  )}
                  style={{ borderRadius: "4px" }}>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                );
              } else {
                return (
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected 
                      ? "border-violet-500 bg-violet-500" 
                      : "border-gray-300 bg-white"
                  )}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                );
              }
            };
            
            return (
              <div
                key={option.id}
                className={cn(
                  "p-4 border cursor-pointer transition-all duration-200",
                  isSelected && "border-violet-500",
                  hoverClass
                )}
                style={styleObject}
                onClick={() => handleOptionClick(option)}
              >
                <div className={cn(
                  "flex items-center gap-3",
                  indicatorAlign === "right" && "flex-row-reverse"
                )}>
                  {renderIndicator()}
                  <div className={cn(
                    "flex-1 flex items-center",
                    indicatorAlign === "right" && "justify-end"
                  )}>
                    {option.emoji && (
                      <span className="mr-2 text-xl">{option.emoji}</span>
                    )}
                    <div>
                      <span className="font-medium">{option.text}</span>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Botão de continuar para seleção múltipla */}
        {allowMultipleSelection && selectedOptions.length > 0 && (
          <button 
            className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white py-3 px-4 rounded-lg font-medium"
            onClick={handleContinue}
          >
            {continueButtonText}
          </button>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceRenderer;
