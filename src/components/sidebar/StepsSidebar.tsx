import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStepManager } from "@/hooks/useStepManager";
import StepItem from "./StepItem";
import { useCallback, useMemo } from "react";

const StepsSidebar = () => {
  const { 
    currentFunnel,
    currentStep,
    handleAddStep,
    handleSelectStep,
    handleDeleteStep,
    handleDuplicateStep,
    sortedSteps
  } = useStepManager();
  
  const handleEditStart = useCallback((step: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking on the step
  }, []);
  
  // Função wrapper para evitar problemas de binding
  const handleDuplicate = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`StepsSidebar - Chamando duplicação para o índice: ${index}`);
    if (typeof handleDuplicateStep === 'function') {
      handleDuplicateStep(index, e);
    } else {
      console.error('handleDuplicateStep não é uma função', handleDuplicateStep);
    }
  }, [handleDuplicateStep]);
  
  // Encontrar o índice do step atual na lista ordenada
  const activeStepIndex = useMemo(() => {
    if (!currentFunnel?.steps || currentStep === undefined) return -1;
    
    const currentStepId = currentFunnel.steps[currentStep]?.id;
    if (!currentStepId) return -1;
    
    return sortedSteps.findIndex(step => step.id === currentStepId);
  }, [currentFunnel?.steps, currentStep, sortedSteps]);
  
  if (!currentFunnel) return null;
  
  return (
    <div className="border-r bg-white flex flex-col overflow-hidden">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-medium text-sm text-gray-700">ETAPAS</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedSteps.map((step, index) => (
          <StepItem
            key={`step-${step.id}`}
            step={step}
            index={index}
            isActive={activeStepIndex === index}
            onSelect={handleSelectStep}
            onDelete={handleDeleteStep}
            onDuplicate={handleDuplicate}
            onEdit={handleEditStart}
          />
        ))}
        
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs font-normal hover:bg-violet-50 hover:text-violet-700 transition-colors"
            onClick={handleAddStep}
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar Etapa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepsSidebar;
