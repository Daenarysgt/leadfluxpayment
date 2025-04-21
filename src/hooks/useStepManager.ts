import { useCallback, useRef, useMemo } from "react";
import { useStore } from "@/utils/store";
import { useToast } from "@/hooks/use-toast";

export const useStepManager = () => {
  const { 
    currentFunnel,
    currentStep,
    setCurrentStep,
    addStep,
    deleteStep,
    duplicateStep
  } = useStore();
  
  const { toast } = useToast();
  const isChangingStepRef = useRef<boolean>(false);
  
  // Ordenar os steps por ordem_index para garantir consistência
  const sortedSteps = useMemo(() => {
    if (!currentFunnel?.steps) return [];
    
    return [...currentFunnel.steps].sort((a, b) => {
      const orderA = a.order_index ?? 0;
      const orderB = b.order_index ?? 0;
      return orderA - orderB;
    });
  }, [currentFunnel?.steps]);
  
  // Mapear ids de steps para seus índices ordenados
  const stepIndexMap = useMemo(() => {
    const map = new Map();
    sortedSteps.forEach((step, index) => {
      map.set(step.id, index);
    });
    return map;
  }, [sortedSteps]);
  
  // Encontra o maior order_index atual para determinar o próximo
  const getNextOrderIndex = useCallback(() => {
    if (!currentFunnel?.steps || currentFunnel.steps.length === 0) return 0;
    
    let maxOrderIndex = 0;
    currentFunnel.steps.forEach(step => {
      const orderIndex = step.order_index ?? 0;
      if (orderIndex > maxOrderIndex) {
        maxOrderIndex = orderIndex;
      }
    });
    
    return maxOrderIndex + 1;
  }, [currentFunnel?.steps]);
  
  const handleAddStep = useCallback(() => {
    // Garantir que o novo step tenha um order_index maior que todos os existentes
    const nextOrderIndex = getNextOrderIndex();
    console.log(`Calculado próximo order_index: ${nextOrderIndex}`);
    
    // Não podemos passar o order_index diretamente para o addStep, 
    // então teremos que atualizar o order_index após a criação do step
    addStep();
    
    toast({
      title: "Etapa adicionada",
      description: "Uma nova etapa foi adicionada ao funil. Você pode começar a editar esta nova página agora.",
    });
  }, [addStep, toast, getNextOrderIndex]);
  
  const handleSelectStep = useCallback((index: number) => {
    if (!currentFunnel?.steps) return;
    
    // Obter o id do step a partir do índice na lista ordenada
    const stepId = sortedSteps[index]?.id;
    if (!stepId) return;
    
    // Encontrar o índice correspondente ao step na lista original
    let stepIndex = currentFunnel.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    if (currentStep !== stepIndex && !isChangingStepRef.current) {
      // Set flag to prevent multiple rapid changes
      isChangingStepRef.current = true;
      
      console.log(`StepsSidebar - Selecting step ${stepIndex} from current ${currentStep}`);
      setCurrentStep(stepIndex);
      
      toast({
        title: `Etapa ${index + 1} selecionada`,
        description: "As configurações desta etapa foram carregadas.",
      });
      
      // Reset flag after a small delay
      setTimeout(() => {
        isChangingStepRef.current = false;
      }, 300);
    }
  }, [currentStep, currentFunnel, sortedSteps, setCurrentStep, toast]);
  
  const handleDeleteStep = useCallback((index: number, e: React.MouseEvent) => {
    // Garantir que o evento não se propague
    e.stopPropagation();
    
    if (!currentFunnel) return;
    
    // Não permitir excluir a última etapa
    if (currentFunnel.steps.length <= 1) {
      toast({
        title: "Não é possível excluir",
        description: "Um funil precisa ter pelo menos uma etapa.",
        variant: "destructive"
      });
      return;
    }
    
    // Obter o id do step a partir do índice na lista ordenada
    const stepId = sortedSteps[index]?.id;
    if (!stepId) return;
    
    // Encontrar o índice correspondente ao step na lista original
    let stepIndex = currentFunnel.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    // Log detalhado para depuração do problema
    console.log(`useStepManager - Solicitando exclusão da etapa no índice específico: ${stepIndex}`);
    console.log(`useStepManager - Etapas antes da exclusão:`, currentFunnel.steps.map((s, i) => `${i}: ${s.title} (${s.id})`));
    
    // Verificação de segurança para garantir que o índice seja válido
    if (stepIndex < 0 || stepIndex >= currentFunnel.steps.length) {
      console.error(`useStepManager - Índice inválido: ${stepIndex}, total de etapas: ${currentFunnel.steps.length}`);
      return;
    }
    
    // Chamar a função de exclusão com o índice explícito
    deleteStep(stepIndex);
    
    // Mostrar notificação
    toast({
      title: `Etapa excluída`,
      description: "A etapa foi removida do funil com sucesso.",
    });
  }, [currentFunnel, sortedSteps, deleteStep, toast]);
  
  const handleDuplicateStep = useCallback((index: number, e: React.MouseEvent) => {
    // Garantir que o evento não se propague
    e.stopPropagation();
    
    if (!currentFunnel) return;
    
    // Obter o id do step a partir do índice na lista ordenada
    const stepId = sortedSteps[index]?.id;
    if (!stepId) return;
    
    // Encontrar o índice correspondente ao step na lista original
    let stepIndex = currentFunnel.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    // Verificação de segurança para garantir que o índice seja válido
    if (stepIndex < 0 || stepIndex >= currentFunnel.steps.length) {
      console.error(`useStepManager - Índice inválido para duplicação: ${stepIndex}`);
      return;
    }
    
    // Chamar a função de duplicação
    duplicateStep(stepIndex)
      .then(() => {
        // Mostrar notificação
        toast({
          title: `Etapa duplicada`,
          description: "A etapa foi duplicada com todos os seus elementos.",
        });
      })
      .catch(error => {
        console.error("Erro ao duplicar etapa:", error);
        toast({
          title: "Erro ao duplicar etapa",
          description: "Ocorreu um erro ao tentar duplicar esta etapa.",
          variant: "destructive"
        });
      });
  }, [currentFunnel, sortedSteps, duplicateStep, toast]);
  
  return {
    currentFunnel,
    currentStep,
    handleAddStep,
    handleSelectStep,
    handleDeleteStep,
    handleDuplicateStep,
    isChangingStepRef,
    sortedSteps
  };
};
