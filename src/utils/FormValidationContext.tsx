import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

// Interface para elementos que precisam ser validados
interface ValidatableElement {
  id: string;
  validate: () => boolean;
  scrollIntoView: () => void;
  stepIndex: number;
}

interface FormValidationContextType {
  registerElement: (element: ValidatableElement) => void;
  unregisterElement: (id: string) => void;
  validateElementsInStep: (stepIndex: number) => boolean;
  getInvalidElements: (stepIndex: number) => ValidatableElement[];
  
  // Nova função para navegação centralizada com validação
  validateAndNavigate: (
    currentStep: number, 
    targetStep: number, 
    onStepChange: (step: number) => void,
    options?: { skipValidation?: boolean, showToast?: boolean }
  ) => boolean;
}

// Criar o contexto com valores iniciais
const FormValidationContext = createContext<FormValidationContextType>({
  registerElement: () => {},
  unregisterElement: () => {},
  validateElementsInStep: () => true,
  getInvalidElements: () => [],
  validateAndNavigate: () => false,
});

// Hook personalizado para usar o contexto
export const useFormValidation = () => useContext(FormValidationContext);

// Provedor do contexto
export const FormValidationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Map para armazenar elementos validáveis por ID
  const [validatableElements, setValidatableElements] = useState<Map<string, ValidatableElement>>(new Map());

  // Registrar um elemento validável
  const registerElement = (element: ValidatableElement) => {
    setValidatableElements(prev => {
      const newMap = new Map(prev);
      newMap.set(element.id, element);
      return newMap;
    });
  };

  // Remover um elemento validável
  const unregisterElement = (id: string) => {
    setValidatableElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  // Validar todos os elementos em uma etapa específica
  const validateElementsInStep = (stepIndex: number): boolean => {
    let allValid = true;
    
    // Verificar cada elemento da etapa atual
    for (const element of validatableElements.values()) {
      if (element.stepIndex === stepIndex) {
        const isValid = element.validate();
        if (!isValid) {
          allValid = false;
          // Continuar verificando todos os elementos para mostrar todos os erros
        }
      }
    }
    
    return allValid;
  };

  // Obter elementos inválidos para uma etapa específica
  const getInvalidElements = (stepIndex: number): ValidatableElement[] => {
    const invalidElements: ValidatableElement[] = [];
    
    for (const element of validatableElements.values()) {
      if (element.stepIndex === stepIndex && !element.validate()) {
        invalidElements.push(element);
      }
    }
    
    return invalidElements;
  };

  // Nova função: Navegação centralizada com validação
  const validateAndNavigate = (
    currentStep: number, 
    targetStep: number, 
    onStepChange: (step: number) => void,
    options: { skipValidation?: boolean, showToast?: boolean } = {}
  ): boolean => {
    const { skipValidation = false, showToast = true } = options;
    
    // Se estamos retrocedendo, não precisamos validar
    const isGoingBack = targetStep < currentStep;
    
    // Permitir navegação se:
    // - Estamos voltando para uma etapa anterior
    // - A validação está desativada
    // - Não há elementos para validar ou todos são válidos
    if (isGoingBack || skipValidation || validateElementsInStep(currentStep)) {
      // Navegação permitida
      onStepChange(targetStep);
      return true;
    } else {
      // Navegação bloqueada: há campos obrigatórios não preenchidos
      const invalidElements = getInvalidElements(currentStep);
      
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
  };

  // Criar o valor do contexto
  const contextValue: FormValidationContextType = {
    registerElement,
    unregisterElement,
    validateElementsInStep,
    getInvalidElements,
    validateAndNavigate
  };

  return (
    <FormValidationContext.Provider value={contextValue}>
      {children}
    </FormValidationContext.Provider>
  );
};

export default FormValidationContext; 