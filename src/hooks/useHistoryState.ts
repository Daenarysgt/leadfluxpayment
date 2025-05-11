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
  const [canUndoState, setCanUndoState] = useState(false);
  const [canRedoState, setCanRedoState] = useState(false);
  
  // Histórico de estados
  const historyRef = useRef<T[]>([initialState]);
  
  // Posição atual no histórico
  const positionRef = useRef<number>(0);
  
  // Atualizar estados de canUndo e canRedo
  const updateButtonStates = useCallback(() => {
    setCanUndoState(positionRef.current > 0);
    setCanRedoState(positionRef.current < historyRef.current.length - 1);
    console.log(`useHistoryState - Atualizando estados: canUndo=${positionRef.current > 0}, canRedo=${positionRef.current < historyRef.current.length - 1}, pos=${positionRef.current}, len=${historyRef.current.length}`);
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
      historyRef.current.push(nextState);
      
      // Limitar o tamanho do histórico
      if (historyRef.current.length > maxHistoryLength) {
        historyRef.current = historyRef.current.slice(historyRef.current.length - maxHistoryLength);
        positionRef.current = maxHistoryLength - 1;
      }
      
      // Atualizar estados dos botões
      setTimeout(updateButtonStates, 0);
      
      return nextState;
    });
  }, [maxHistoryLength, updateButtonStates]);
  
  // Função para desfazer a última alteração
  const undo = useCallback(() => {
    console.log(`useHistoryState - História atual: pos=${positionRef.current}, len=${historyRef.current.length}`);
    
    if (positionRef.current <= 0) {
      console.log('Não há mais alterações para desfazer');
      return false;
    }
    
    // Decrementar a posição no histórico
    positionRef.current--;
    
    // Obter o estado anterior
    const previousState = historyRef.current[positionRef.current];
    
    // Atualizar os estados de controle imediatamente para evitar race conditions
    const canUndoNow = positionRef.current > 0;
    const canRedoNow = positionRef.current < historyRef.current.length - 1;
    setCanUndoState(canUndoNow);
    setCanRedoState(canRedoNow);
    
    console.log(`useHistoryState - Após desfazer: pos=${positionRef.current}, canUndo=${canUndoNow}, canRedo=${canRedoNow}`);
    
    // Atualizar o estado sem modificar o histórico
    setState(previousState);
    
    return previousState;
  }, []);
  
  // Função para refazer uma alteração desfeita
  const redo = useCallback(() => {
    console.log(`useHistoryState - História atual: pos=${positionRef.current}, len=${historyRef.current.length}`);
    
    if (positionRef.current >= historyRef.current.length - 1) {
      console.log('Não há mais alterações para refazer');
      return false;
    }
    
    // Incrementar a posição no histórico
    positionRef.current++;
    
    // Obter o próximo estado
    const nextState = historyRef.current[positionRef.current];
    
    // Atualizar os estados de controle imediatamente para evitar race conditions
    const canUndoNow = positionRef.current > 0;
    const canRedoNow = positionRef.current < historyRef.current.length - 1;
    setCanUndoState(canUndoNow);
    setCanRedoState(canRedoNow);
    
    console.log(`useHistoryState - Após refazer: pos=${positionRef.current}, canUndo=${canUndoNow}, canRedo=${canRedoNow}`);
    
    // Atualizar o estado sem modificar o histórico
    setState(nextState);
    
    return nextState;
  }, []);
  
  // Função para limpar o histórico
  const clearHistory = useCallback(() => {
    historyRef.current = [state];
    positionRef.current = 0;
    
    // Atualizar estados dos botões
    setTimeout(updateButtonStates, 0);
  }, [state, updateButtonStates]);
  
  // Atualizar os estados na montagem e sempre que o histórico mudar
  useEffect(() => {
    updateButtonStates();
  }, [updateButtonStates, state]);
  
  return {
    state,
    setState: updateState,
    undo,
    redo,
    clearHistory,
    canUndo: canUndoState,
    canRedo: canRedoState,
    historyLength: historyRef.current.length,
    currentPosition: positionRef.current
  };
} 