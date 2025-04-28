import { useCallback } from 'react';
import { useFormValidation } from '@/utils/FormValidationContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook para navegação entre etapas com validação
 * @param activeStep Índice da etapa atual
 * @param onStepChange Função original para mudar de etapa
 * @returns Função de navegação que valida os campos antes de avançar
 */
export const useValidatedNavigation = (
  activeStep: number,
  onStepChange: (step: number) => void
) => {
  const { validateElementsInStep, getInvalidElements } = useFormValidation();
  
  const navigateWithValidation = useCallback((
    targetStep: number,
    options: { skipValidation?: boolean, showToast?: boolean } = {}
  ) => {
    const { skipValidation = false, showToast = true } = options;
    
    // Se estamos retrocedendo, não precisamos validar
    const isGoingBack = targetStep < activeStep;
    
    // Permitir navegação se:
    // - Estamos voltando para uma etapa anterior
    // - A validação está desativada
    // - Não há elementos para validar ou todos são válidos
    if (isGoingBack || skipValidation || validateElementsInStep(activeStep)) {
      // Navegação permitida
      onStepChange(targetStep);
      return true;
    } else {
      // Navegação bloqueada: há campos obrigatórios não preenchidos
      const invalidElements = getInvalidElements(activeStep);
      
      // Mostrar feedback visual
      if (invalidElements.length > 0) {
        // Rolar para o primeiro elemento inválido
        invalidElements[0].scrollIntoView();
        
        // Exibir toast de erro se solicitado
        if (showToast) {
          toast({
            title: "Campos obrigatórios",
            description: "Preencha todos os campos obrigatórios para continuar.",
            variant: "destructive",
          });
        }
      }
      
      return false;
    }
  }, [activeStep, onStepChange, validateElementsInStep, getInvalidElements, toast]);
  
  return navigateWithValidation;
}; 