import { useCallback } from "react";
import { useStore } from "@/utils/store";

export const useStepNavigation = () => {
  const { 
    currentFunnel,
    currentStep,
    setCurrentStep
  } = useStore();

  // Navegar para a próxima etapa
  const navigateToNextStep = useCallback(() => {
    if (!currentFunnel?.steps) return;
    
    // Obter o índice da próxima etapa
    const nextStep = currentStep + 1;
    
    // Verificar se existe uma próxima etapa
    if (nextStep < currentFunnel.steps.length) {
      setCurrentStep(nextStep);
      return true;
    }
    
    return false;
  }, [currentFunnel, currentStep, setCurrentStep]);

  // Navegar para uma etapa específica por ID
  const navigateToStep = useCallback((stepId: string) => {
    if (!currentFunnel?.steps) return false;
    
    // Encontrar o índice da etapa pelo ID
    const stepIndex = currentFunnel.steps.findIndex(step => step.id === stepId);
    
    // Se a etapa foi encontrada, navegar para ela
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
      return true;
    }
    
    return false;
  }, [currentFunnel, setCurrentStep]);

  return {
    navigateToNextStep,
    navigateToStep,
    currentStep
  };
}; 