import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import StepItem from "./sidebar/StepItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { Step } from "@/utils/types";

const StepsSidebar = () => {
  const { currentFunnel, currentStep, setCurrentStep, addStep, deleteStep, reorderSteps } = useStore();
  const [steps, setSteps] = useState<Step[]>([]);

  // Sincronizar os steps do currentFunnel para o estado local
  useEffect(() => {
    if (currentFunnel?.steps) {
      setSteps(currentFunnel.steps);
    }
  }, [currentFunnel]);

  // Configuração de sensores para detectar eventos de arrastar
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Função para lidar com o evento de término do arrasto
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Encontrar os índices dos steps envolvidos
      const oldIndex = steps.findIndex(step => step.id === active.id);
      const newIndex = steps.findIndex(step => step.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Criar uma nova ordem dos steps
        const newSteps = arrayMove(steps, oldIndex, newIndex);
        
        // Atualizar o estado local
        setSteps(newSteps);
        
        // Atualizar a posição do currentStep se necessário
        if (currentStep === oldIndex) {
          setCurrentStep(newIndex);
        } else if (currentStep >= Math.min(oldIndex, newIndex) && currentStep <= Math.max(oldIndex, newIndex)) {
          // Ajustar a posição do currentStep se ele estiver entre o antigo e o novo índice
          const offset = oldIndex < newIndex ? -1 : 1;
          setCurrentStep(currentStep + offset);
        }
        
        // Preparar os dados para atualizar a ordem no banco de dados
        const reorderData = newSteps.map((step, index) => ({
          id: step.id,
          order_index: index
        }));
        
        // Chamar a função reorderSteps para persistir as mudanças
        reorderSteps(reorderData).catch(error => {
          console.error("Erro ao reordenar etapas:", error);
        });
      }
    }
  };

  return (
    <div className="w-[280px] border-r bg-gradient-to-b from-gray-50 to-white">
      <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <h2 className="font-semibold text-lg text-gray-800">Etapas do Funil</h2>
        <p className="text-sm text-gray-500 mt-1">Configure cada etapa do seu funil</p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={steps.map(step => step.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {steps.map((step, index) => (
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
            </SortableContext>
          </DndContext>

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
