import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import BaseElementRenderer from "./BaseElementRenderer";
import { useCallback, useState } from "react";
import { accessService } from "@/services/accessService";

const MultipleChoiceRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleOptionClick = useCallback(async (option: any) => {
    console.log("MultipleChoiceRenderer - Option clicked:", option);
    setSelectedOption(option.id);

    if (!option.navigation) return;
    
    const navigationType = option.navigation.type;
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      console.log("Preview mode - Current step:", activeStep);
      
      if (funnel) {
        // Registrar a escolha do usuário
        await accessService.registerStepInteraction(
          funnel.id,
          activeStep + 1,
          null, // usar sessionId atual
          'choice',
          option.text || option.value
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
        else if (navigationType === "step" && option.navigation.stepId) {
          console.log("Preview mode: Navigate to specific step:", option.navigation.stepId);
          const stepIndex = funnel.steps.findIndex(step => step.id === option.navigation.stepId);
          if (stepIndex !== -1) {
            if (stepIndex === funnel.steps.length - 1) {
              // Se for o último step, marcar como conversão
              await accessService.updateProgress(funnel.id, stepIndex + 1, null, true);
            } else {
              onStepChange(stepIndex);
            }
          }
        }
        else if (navigationType === "url" && option.navigation.url) {
          console.log("Preview mode: Open external URL:", option.navigation.url);
          // Marcar como conversão antes de redirecionar
          await accessService.updateProgress(funnel.id, activeStep + 1, null, true);
          window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
        }
      }
    } else {
      // Handle navigation in canvas mode
      if (navigationType === "next") {
        if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
      else if (navigationType === "step" && option.navigation.stepId) {
        if (currentFunnel) {
          const stepIndex = currentFunnel.steps.findIndex(step => step.id === option.navigation.stepId);
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
          }
        }
      }
      else if (navigationType === "url" && option.navigation.url) {
        window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
      }
    }
  }, [previewMode, previewProps, currentFunnel, setCurrentStep, currentStep]);

  return (
    <BaseElementRenderer {...props}>
      <div className="space-y-4">
        {content.title && (
          <h3 className="text-lg font-medium">{content.title}</h3>
        )}
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
        <div className="space-y-2">
          {content.options?.map((option: any) => (
            <div
              key={option.id}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-muted/50",
                selectedOption === option.id && "border-violet-500 bg-violet-50"
              )}
              onClick={() => handleOptionClick(option)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedOption === option.id ? "border-violet-500 bg-violet-500" : "border-gray-300"
                )}>
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{option.text}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceRenderer;
