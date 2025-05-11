import { useEffect, useCallback } from 'react';

/**
 * Detecta se o dispositivo atual é um Mac
 */
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/**
 * Hook para lidar com atalhos de teclado na interface
 * @param callbacks Objeto contendo funções para cada atalho de teclado
 */
export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onCut,
  onSave,
  disabled = false,
}: {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onSave?: () => void;
  disabled?: boolean;
}) => {
  // Handler para teclas pressionadas
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Verificar se o foco está em um campo de edição de texto
      const isEditingText = 
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.hasAttribute('contenteditable') ||
        // Verificar também elementos com role="textbox" que podem ser editores rich text
        document.activeElement?.getAttribute('role') === 'textbox';

      // Atalho para Desfazer (Ctrl+Z ou Command+Z)
      if (
        (event.key === 'z' || event.key === 'Z') &&
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) &&
        !event.shiftKey
      ) {
        // Não interceptar o evento se estiver editando texto
        if (isEditingText) {
          return; // Permite que o editor de texto manipule o evento
        }
        
        event.preventDefault();
        if (onUndo) onUndo();
        return;
      }

      // Atalho para Refazer (Ctrl+Y ou Command+Shift+Z)
      if (
        ((event.key === 'y' || event.key === 'Y') && 
         ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) && 
         !event.shiftKey) ||
        ((event.key === 'z' || event.key === 'Z') && 
         ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) && 
         event.shiftKey)
      ) {
        // Não interceptar o evento se estiver editando texto
        if (isEditingText) {
          return; // Permite que o editor de texto manipule o evento
        }
        
        event.preventDefault();
        if (onRedo) onRedo();
        return;
      }

      // Atalho para excluir (Delete ou Backspace)
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Não prevenir o comportamento padrão aqui para permitir edição de texto
        if (!isEditingText && onDelete) {
          onDelete();
          return;
        }
      }

      // Atalho para copiar (Ctrl+C ou Command+C)
      if (
        (event.key === 'c' || event.key === 'C') &&
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey))
      ) {
        // Não prevenir se estiver em um campo de texto
        if (!isEditingText && onCopy) {
          event.preventDefault();
          onCopy();
          return;
        }
      }

      // Atalho para colar (Ctrl+V ou Command+V)
      if (
        (event.key === 'v' || event.key === 'V') &&
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey))
      ) {
        // Não prevenir se estiver em um campo de texto
        if (!isEditingText && onPaste) {
          event.preventDefault();
          onPaste();
          return;
        }
      }

      // Atalho para recortar (Ctrl+X ou Command+X)
      if (
        (event.key === 'x' || event.key === 'X') &&
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey))
      ) {
        // Não prevenir se estiver em um campo de texto
        if (!isEditingText && onCut) {
          event.preventDefault();
          onCut();
          return;
        }
      }

      // Atalho para salvar (Ctrl+S ou Command+S)
      if (
        (event.key === 's' || event.key === 'S') &&
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey))
      ) {
        event.preventDefault();
        if (onSave) onSave();
        return;
      }
    },
    [onUndo, onRedo, onDelete, onCopy, onPaste, onCut, onSave, disabled]
  );

  useEffect(() => {
    // Adicionar o listener de evento global
    document.addEventListener('keydown', handleKeyDown);

    // Limpar ao desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 