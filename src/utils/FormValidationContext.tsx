import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

// Criar o contexto com valores iniciais
const FormValidationContext = createContext<FormValidationContextType>({
  registerElement: () => {},
  unregisterElement: () => {},
  validateElementsInStep: () => true,
  getInvalidElements: () => []
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

  // Criar o valor do contexto
  const contextValue: FormValidationContextType = {
    registerElement,
    unregisterElement,
    validateElementsInStep,
    getInvalidElements
  };

  return (
    <FormValidationContext.Provider value={contextValue}>
      {children}
    </FormValidationContext.Provider>
  );
};

export default FormValidationContext; 