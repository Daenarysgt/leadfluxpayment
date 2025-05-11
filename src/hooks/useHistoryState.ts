import { useState, useCallback, useRef, useEffect } from 'react';

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
  
  // Flag para marcar atualizações internas que não devem ser rastreadas no histórico
  const internalUpdateRef = useRef(false);
  
  // Debug contador para estatísticas
  const statsRef = useRef({
    updates: 0,
    undos: 0,
    redos: 0
  });
  
  // Log de debug para o histórico
  useEffect(() => {
    console.log(`HistoryState - Position: ${positionRef.current}/${historyRef.current.length - 1}, Updates: ${statsRef.current.updates}, Undos: ${statsRef.current.undos}, Redos: ${statsRef.current.redos}`);
  }, [state]);
  
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
      
      // Se for uma atualização interna, apenas atualizar o estado sem modificar o histórico
      if (internalUpdateRef.current) {
        internalUpdateRef.current = false;
        return nextState;
      }
      
      statsRef.current.updates++;
      
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
      
      console.log(`HistoryState - Added new state at position ${newPosition}, total history: ${historyRef.current.length}`);
      return nextState;
    });
  }, [maxHistoryLength]);
  
  // Função para desfazer a última alteração
  const undo = useCallback(() => {
    if (positionRef.current <= 0) {
      console.log('HistoryState - Não há mais alterações para desfazer');
      return false;
    }
    
    // Decrementar a posição no histórico
    positionRef.current--;
    statsRef.current.undos++;
    
    // Obter o estado anterior
    const previousState = historyRef.current[positionRef.current];
    
    // Atualizar o estado sem modificar o histórico
    internalUpdateRef.current = true;
    setState(previousState);
    
    console.log(`HistoryState - Undid action, moving to position ${positionRef.current}/${historyRef.current.length - 1}`);
    
    return previousState;
  }, []);
  
  // Função para refazer uma alteração desfeita
  const redo = useCallback(() => {
    if (positionRef.current >= historyRef.current.length - 1) {
      console.log('HistoryState - Não há mais alterações para refazer');
      return false;
    }
    
    // Incrementar a posição no histórico
    positionRef.current++;
    statsRef.current.redos++;
    
    // Obter o próximo estado
    const nextState = historyRef.current[positionRef.current];
    
    // Atualizar o estado sem modificar o histórico
    internalUpdateRef.current = true;
    setState(nextState);
    
    console.log(`HistoryState - Redid action, moving to position ${positionRef.current}/${historyRef.current.length - 1}`);
    
    return nextState;
  }, []);
  
  // Função para limpar o histórico
  const clearHistory = useCallback(() => {
    console.log(`HistoryState - Clearing history. Current state preserved.`);
    historyRef.current = [state];
    positionRef.current = 0;
  }, [state]);

  // Função para verificar o estado atual do histórico (debug)
  const getHistoryDebugInfo = useCallback(() => {
    return {
      currentPosition: positionRef.current,
      historyLength: historyRef.current.length,
      canUndo: positionRef.current > 0,
      canRedo: positionRef.current < historyRef.current.length - 1,
      stats: { ...statsRef.current }
    };
  }, []);
  
  return {
    state,
    setState: updateState,
    undo,
    redo,
    clearHistory,
    getHistoryDebugInfo,
    canUndo: positionRef.current > 0,
    canRedo: positionRef.current < historyRef.current.length - 1,
    historyLength: historyRef.current.length,
    currentPosition: positionRef.current
  };
} 