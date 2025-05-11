import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para gerenciar o histórico de estados com funcionalidade de desfazer.
 * @param initialState O estado inicial
 * @param maxHistoryLength Número máximo de estados para manter no histórico (padrão: 50)
 * @returns Um objeto com o estado atual, uma função para atualizar o estado e uma função para desfazer
 */
export function useHistoryState<T>(initialState: T, maxHistoryLength = 50) {
  // Estado atual
  const [state, setState] = useState<T>(initialState);
  
  // Histórico de estados
  const historyRef = useRef<T[]>([initialState]);
  
  // Posição atual no histórico
  const positionRef = useRef<number>(0);
  
  // Função para criar uma cópia profunda garantindo que todos os tipos de dados sejam preservados
  const deepClone = useCallback((data: any) => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error("useHistoryState - Erro ao fazer clone profundo:", error);
      // Fallback para caso de erro (raro, mas possível)
      return data;
    }
  }, []);
  
  // Função para atualizar o estado e adicionar ao histórico
  const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
    setState((prevState: T) => {
      // Determinar o valor do novo estado
      const nextState = typeof newState === 'function'
        ? (newState as ((prevState: T) => T))(prevState)
        : newState;
      
      // Se o novo estado for igual ao estado atual, não fazer nada
      if (JSON.stringify(nextState) === JSON.stringify(prevState)) {
        return prevState;
      }
      
      // Atualizar a posição no histórico
      const newPosition = positionRef.current + 1;
      positionRef.current = newPosition;
      
      // Remover estados futuros se estiver desfazendo e depois adicionando um novo estado
      if (newPosition < historyRef.current.length) {
        historyRef.current = historyRef.current.slice(0, newPosition);
      }
      
      // Adicionar o novo estado ao histórico
      // Usar cópia profunda para garantir que não há referências compartilhadas
      historyRef.current.push(deepClone(nextState));
      
      // Limitar o tamanho do histórico
      if (historyRef.current.length > maxHistoryLength) {
        historyRef.current = historyRef.current.slice(historyRef.current.length - maxHistoryLength);
        positionRef.current = maxHistoryLength - 1;
      }
      
      return nextState;
    });
  }, [maxHistoryLength, deepClone]);
  
  // Função para desfazer a última alteração
  const undo = useCallback(() => {
    if (positionRef.current <= 0) {
      console.log('Não há mais alterações para desfazer');
      return false;
    }
    
    // Decrementar a posição no histórico
    positionRef.current--;
    
    // Obter o estado anterior
    const previousState = historyRef.current[positionRef.current];
    
    // Atualizar o estado sem modificar o histórico
    // Importante: Usamos uma cópia profunda para garantir que todos os valores, incluindo cores, sejam corretamente atualizados
    console.log('useHistoryState - Desfazendo para estado anterior:', previousState);
    setState(deepClone(previousState));
    
    return true;
  }, [deepClone]);
  
  // Função para refazer uma alteração desfeita
  const redo = useCallback(() => {
    if (positionRef.current >= historyRef.current.length - 1) {
      console.log('Não há mais alterações para refazer');
      return false;
    }
    
    // Incrementar a posição no histórico
    positionRef.current++;
    
    // Obter o próximo estado
    const nextState = historyRef.current[positionRef.current];
    
    // Atualizar o estado sem modificar o histórico
    // Importante: Usamos uma cópia profunda para garantir que todos os valores, incluindo cores, sejam corretamente atualizados
    console.log('useHistoryState - Refazendo para próximo estado:', nextState);
    setState(deepClone(nextState));
    
    return true;
  }, [deepClone]);
  
  // Função para limpar o histórico
  const clearHistory = useCallback(() => {
    const currentStateCopy = deepClone(state);
    historyRef.current = [currentStateCopy];
    positionRef.current = 0;
  }, [state, deepClone]);
  
  return {
    state,
    setState: updateState,
    undo,
    redo,
    clearHistory,
    canUndo: positionRef.current > 0,
    canRedo: positionRef.current < historyRef.current.length - 1,
    historyLength: historyRef.current.length,
    currentPosition: positionRef.current
  };
} 