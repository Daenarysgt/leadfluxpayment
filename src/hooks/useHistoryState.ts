import { useState, useCallback, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar o histórico de estados com funcionalidade de desfazer.
 * @param initialState O estado inicial
 * @param maxHistoryLength Número máximo de estados para manter no histórico (padrão: 50)
 * @returns Um objeto com o estado atual, uma função para atualizar o estado e funções para desfazer/refazer
 */
export function useHistoryState<T>(initialState: T, maxHistoryLength = 50) {
  // Estados principais
  const [history, setHistory] = useState<T[]>([initialState]);
  const [position, setPosition] = useState(0);
  const [state, setState] = useState<T>(initialState);
  
  // Estados derivados para controlar UI
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Atualizar estados derivados quando o histórico muda
  useEffect(() => {
    setCanUndo(position > 0);
    setCanRedo(position < history.length - 1);
    
    console.log(`useHistoryState - Atualizando estados: pos=${position}, len=${history.length}, canUndo=${position > 0}, canRedo=${position < history.length - 1}`);
  }, [history, position]);
  
  // Função para adicionar um novo estado ao histórico
  const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
    // Obter o valor do novo estado
    const nextState = typeof newState === 'function'
      ? (newState as ((prevState: T) => T))(state)
      : newState;
    
    // Se o novo estado for igual ao estado atual, não fazer nada
    if (JSON.stringify(nextState) === JSON.stringify(state)) {
      return;
    }
    
    console.log(`useHistoryState - Atualizando estado: pos=${position}, len=${history.length}`);
    
    // Remover estados futuros se estiver desfazendo e depois adicionando um novo estado
    const newHistory = history.slice(0, position + 1);
    
    // Adicionar o novo estado ao histórico
    newHistory.push(nextState);
    
    // Limitar o tamanho do histórico
    const limitedHistory = newHistory.length > maxHistoryLength
      ? newHistory.slice(newHistory.length - maxHistoryLength)
      : newHistory;
    
    // Ajustar a posição baseado no possível corte do histórico
    const newPosition = limitedHistory.length - 1;
    
    // Atualizar todos os estados em uma única renderização
    setHistory(limitedHistory);
    setPosition(newPosition);
    setState(nextState);
    
    console.log(`useHistoryState - Estado atualizado: nova pos=${newPosition}, novo len=${limitedHistory.length}`);
  }, [history, position, state, maxHistoryLength]);
  
  // Função para desfazer a última alteração
  const undo = useCallback(() => {
    if (position <= 0) {
      console.log(`useHistoryState - Não é possível desfazer: pos=${position}`);
      return false;
    }
    
    const newPosition = position - 1;
    const previousState = history[newPosition];
    
    console.log(`useHistoryState - Desfazendo: pos=${position} -> ${newPosition}`);
    
    setPosition(newPosition);
    setState(previousState);
    
    return previousState;
  }, [history, position]);
  
  // Função para refazer uma alteração desfeita
  const redo = useCallback(() => {
    if (position >= history.length - 1) {
      console.log(`useHistoryState - Não é possível refazer: pos=${position}, len=${history.length}`);
      return false;
    }
    
    const newPosition = position + 1;
    const nextState = history[newPosition];
    
    console.log(`useHistoryState - Refazendo: pos=${position} -> ${newPosition}`);
    
    setPosition(newPosition);
    setState(nextState);
    
    return nextState;
  }, [history, position]);
  
  // Função para limpar o histórico
  const clearHistory = useCallback(() => {
    setHistory([state]);
    setPosition(0);
  }, [state]);
  
  // Retornar APIs públicas
  return {
    state,
    setState: updateState,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentPosition: position
  };
} 