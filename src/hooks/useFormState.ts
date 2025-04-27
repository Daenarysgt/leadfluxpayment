import { useState, useCallback } from 'react';

export interface FormField {
  value: string;
  error?: string | null;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export const useFormState = (initialValues: Record<string, string> = {}) => {
  const [formState, setFormState] = useState<FormState>(() => {
    // Converter valores iniciais simples para o formato de FormField
    const initialFormState: FormState = {};
    Object.keys(initialValues).forEach(key => {
      initialFormState[key] = {
        value: initialValues[key],
        touched: false,
        error: null
      };
    });
    return initialFormState;
  });

  // Atualizar um único campo
  const updateField = useCallback((name: string, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: {
        ...(prevState[name] || { touched: false, error: null }),
        value,
        touched: true,
      }
    }));
  }, []);

  // Definir um erro para um campo
  const setFieldError = useCallback((name: string, error: string | null) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: {
        ...(prevState[name] || { value: '', touched: false }),
        error
      }
    }));
  }, []);

  // Limpar todos os campos
  const resetForm = useCallback((newValues: Record<string, string> = {}) => {
    const resetFormState: FormState = {};
    Object.keys(newValues).forEach(key => {
      resetFormState[key] = {
        value: newValues[key],
        touched: false,
        error: null
      };
    });
    setFormState(resetFormState);
  }, []);

  // Obter apenas os valores dos campos
  const getValues = useCallback(() => {
    const values: Record<string, string> = {};
    Object.keys(formState).forEach(key => {
      values[key] = formState[key].value;
    });
    return values;
  }, [formState]);

  // Verificar se todos os campos estão válidos
  const isValid = useCallback(() => {
    return !Object.values(formState).some(field => field.error);
  }, [formState]);

  return {
    formState,
    updateField,
    setFieldError,
    resetForm,
    getValues,
    isValid
  };
};

export default useFormState; 