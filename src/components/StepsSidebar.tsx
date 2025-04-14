import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import StepItem from "./sidebar/StepItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StepsSidebar = () => {
  const { currentFunnel, currentStep, setCurrentStep, addStep, deleteStep } = useStore();

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

  const handleAddStep = () => {
    addStep();
  };

  return (
    <div className="w-[240px] border-r bg-gray-50/40">
      <ScrollArea className="h-full">
        <div className="p-4 pb-24">
          <div className="space-y-2">
            {currentFunnel.steps.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                isActive={currentStep === index}
                onSelect={handleStepClick}
                onDelete={handleStepDelete}
                onEdit={handleStepEdit}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4 text-muted-foreground"
            onClick={handleAddStep}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Etapa
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default StepsSidebar;
