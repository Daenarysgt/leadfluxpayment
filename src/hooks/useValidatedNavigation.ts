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
  const { validateAndNavigate } = useFormValidation();
  
  const navigateWithValidation = useCallback((
    targetStep: number,
    options: { skipValidation?: boolean, showToast?: boolean } = {}
  ) => {
    return validateAndNavigate(
      activeStep,
      targetStep,
      onStepChange,
      options
    );
  }, [activeStep, onStepChange, validateAndNavigate]);
  
  return navigateWithValidation;
}; 