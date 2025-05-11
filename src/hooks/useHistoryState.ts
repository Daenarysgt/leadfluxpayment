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
      historyRef.current.push(nextState);
      
      // Limitar o tamanho do histórico
      if (historyRef.current.length > maxHistoryLength) {
        historyRef.current = historyRef.current.slice(historyRef.current.length - maxHistoryLength);
        positionRef.current = maxHistoryLength - 1;
      }
      
      return nextState;
    });
  }, [maxHistoryLength]);
  
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
    setState(JSON.parse(JSON.stringify(previousState)));
    
    return true;
  }, []);
  
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
    setState(JSON.parse(JSON.stringify(nextState)));
    
    return true;
  }, []);
  
  // Função para limpar o histórico
  const clearHistory = useCallback(() => {
    historyRef.current = [state];
    positionRef.current = 0;
  }, [state]);
  
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