import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import StepItem from "./sidebar/StepItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const StepsSidebar = () => {
  const { currentFunnel, currentStep, setCurrentStep, addStep, deleteStep, duplicateStep, reorderSteps } = useStore();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

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
        toast({
          title: "Etapa duplicada",
          description: "A etapa foi duplicada com sucesso.",
        });
      })
      .catch(error => {
        console.error('Erro ao duplicar etapa:', error);
        toast({
          title: "Erro ao duplicar etapa",
          description: "Ocorreu um erro ao tentar duplicar esta etapa.",
          variant: "destructive"
        });
      });
  };

  const handleAddStep = () => {
    addStep();
  };
  
  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);
    const { source, destination } = result;
    
    // Se não há destino ou o item foi solto na mesma posição
    if (!destination || (source.index === destination.index)) {
      return;
    }
    
    console.log(`Reordenando etapa: ${source.index} -> ${destination.index}`);
    
    // Chamar a ação de reordenação
    reorderSteps(source.index, destination.index)
      .then(() => {
        toast({
          title: "Etapas reordenadas",
          description: "A ordem das etapas foi atualizada com sucesso.",
        });
      })
      .catch(error => {
        console.error("Erro ao reordenar etapas:", error);
        toast({
          title: "Erro ao reordenar etapas",
          description: "Ocorreu um erro ao tentar reordenar as etapas.",
          variant: "destructive"
        });
      });
  }, [reorderSteps, toast]);
  
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  return (
    <div className="w-[280px] border-r bg-gradient-to-b from-gray-50 to-white">
      <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <h2 className="font-semibold text-lg text-gray-800">Etapas do Funil</h2>
        <p className="text-sm text-gray-500 mt-1">Configure cada etapa do seu funil</p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <Droppable droppableId="steps-list">
              {(provided) => (
                <div 
                  className="space-y-3"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {currentFunnel.steps.map((step, index) => (
                    <Draggable 
                      key={step.id} 
                      draggableId={step.id} 
                      index={index}
                      disableInteractiveElementBlocking
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'opacity-70' : ''}`}
                        >
                          <StepItem
                            key={step.id}
                            step={step}
                            index={index}
                            isActive={currentStep === index && !isDragging}
                            onSelect={handleStepClick}
                            onDelete={handleStepDelete}
                            onEdit={handleStepEdit}
                            onDuplicate={handleStepDuplicate}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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
