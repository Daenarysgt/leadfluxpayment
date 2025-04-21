import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import StepItem from "./sidebar/StepItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StepsSidebar = () => {
  const { currentFunnel, currentStep, setCurrentStep, addStep, deleteStep, duplicateStep } = useStore();

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleStepDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStep(index);
  };

  const handleStepEdit = (step: { id: string; title: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementar edição do título do step
    console.log('Editar step:', step);
  };

  const handleStepDuplicate = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateStep(index)
      .then(() => {
        console.log('Etapa duplicada com sucesso');
      })
      .catch(error => {
        console.error('Erro ao duplicar etapa:', error);
      });
  };

  const handleAddStep = () => {
    addStep();
  };

  return (
    <div className="w-[280px] border-r bg-gradient-to-b from-gray-50 to-white">
      <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <h2 className="font-semibold text-lg text-gray-800">Etapas do Funil</h2>
        <p className="text-sm text-gray-500 mt-1">Configure cada etapa do seu funil</p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4">
          <div className="space-y-3">
            {currentFunnel.steps.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                isActive={currentStep === index}
                onSelect={handleStepClick}
                onDelete={handleStepDelete}
                onEdit={handleStepEdit}
                onDuplicate={handleStepDuplicate}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="default"
            className="w-full mt-6 bg-white hover:bg-gray-50 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={handleAddStep}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nova Etapa
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default StepsSidebar;
