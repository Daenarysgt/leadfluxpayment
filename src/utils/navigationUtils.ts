import { toast } from '@/components/ui/use-toast';

// Interface para o serviço de validação (pode ser usado em qualquer lugar)
export interface ValidationService {
  validateStep: (currentStepIndex: number, targetStepIndex: number, showToast?: boolean) => boolean;
}

// Singleton para o serviço de validação global
class GlobalValidationService implements ValidationService {
  private static instance: GlobalValidationService;
  private validateFn: ((currentStepIndex: number, targetStepIndex: number, showToast?: boolean) => boolean) | null = null;

  private constructor() {}

  public static getInstance(): GlobalValidationService {
    if (!GlobalValidationService.instance) {
      GlobalValidationService.instance = new GlobalValidationService();
    }
    return GlobalValidationService.instance;
  }

  // Registra a função de validação do contexto
  public registerValidationFunction(validateFn: (currentStepIndex: number, targetStepIndex: number, showToast?: boolean) => boolean): void {
    this.validateFn = validateFn;
  }

  // Valida a etapa atual
  public validateStep(currentStepIndex: number, targetStepIndex: number, showToast: boolean = true): boolean {
    // Se não há função de validação registrada, permitir navegação
    if (!this.validateFn) {
      return true;
    }

    // Se estamos voltando para uma etapa anterior, não precisamos validar
    if (targetStepIndex < currentStepIndex) {
      return true;
    }

    try {
      // Usar a função de validação registrada
      return this.validateFn(currentStepIndex, targetStepIndex, showToast);
    } catch (error) {
      console.error("Erro ao validar etapa:", error);
      
      // Em caso de erro, exibir mensagem e permitir a navegação
      if (showToast) {
        toast({
          title: "Aviso",
          description: "Não foi possível validar os campos obrigatórios",
          variant: "default",
        });
      }
      
      return true; // Em caso de erro, permitir a navegação
    }
  }
}

// Exportar a instância para uso global
export const validationService = GlobalValidationService.getInstance();

// Função de navegação segura - para uso em qualquer componente
// Esta função verifica a validação antes de executar a função de navegação
export const navigateWithValidation = (
  currentStepIndex: number,
  targetStepIndex: number,
  navigateFn: (step: number) => void,
  options?: {
    skipValidation?: boolean,
    showToast?: boolean
  }
): boolean => {
  const { skipValidation = false, showToast = true } = options || {};

  // Se a validação está desativada, navegar diretamente
  if (skipValidation) {
    navigateFn(targetStepIndex);
    return true;
  }

  // Validar antes de navegar
  if (validationService.validateStep(currentStepIndex, targetStepIndex, showToast)) {
    // Navegação permitida
    navigateFn(targetStepIndex);
    return true;
  }

  // Navegação bloqueada
  return false;
}; 