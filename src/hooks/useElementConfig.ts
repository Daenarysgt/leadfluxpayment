import { useCallback, useState, useRef, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";

export const useElementConfig = (
  selectedElement: CanvasElement | null,
  onUpdate: (element: CanvasElement) => void
) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedElementCopy, setSelectedElementCopy] = useState<any>(null);
  const lastUpdateRef = useRef<{id: string | null, update: any, timestamp: number}>({
    id: null, 
    update: null, 
    timestamp: 0
  });
  const internalUpdateRef = useRef(false);
  const updateQueueRef = useRef<Array<any>>([]);
  const processingUpdateRef = useRef(false);
  
  // When the selected element changes, update our copy
  useEffect(() => {
    if (selectedElement && selectedElement.id) {
      setIsOpen(true);
      
      // Skip if this is an internal update that we initiated ourselves
      if (internalUpdateRef.current) {
        internalUpdateRef.current = false;
        return;
      }
      
      // Make a deep copy to avoid reference issues
      const elementCopy = JSON.parse(JSON.stringify(selectedElement));
      setSelectedElementCopy(elementCopy);
      
      // Clear any pending updates for the previous element
      updateQueueRef.current = [];
    } else {
      setIsOpen(false);
    }
  }, [selectedElement]);

  // Clean up when the component is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedElementCopy(null);
      updateQueueRef.current = [];
    }
  }, [isOpen]);

  const processUpdates = useCallback(() => {
    if (processingUpdateRef.current || updateQueueRef.current.length === 0) {
      return;
    }
    
    processingUpdateRef.current = true;
    
    try {
      // Take the last update from the queue
      const updates = updateQueueRef.current.pop();
      // Clear the queue as we only process the most recent update
      updateQueueRef.current = [];
      
      if (!selectedElementCopy || !updates) {
        return;
      }
      
      // Skip if this is the exact same update as before (prevents loops)
      const updateString = JSON.stringify(updates);
      const previousUpdateString = lastUpdateRef.current.id === selectedElementCopy.id 
        ? JSON.stringify(lastUpdateRef.current.update)
        : null;
      
      // Don't process duplicate updates within 100ms
      const now = Date.now();
      if (previousUpdateString === updateString && 
          now - lastUpdateRef.current.timestamp < 100) {
        console.log("ElementConfigSidebar - Skipping duplicate update");
        return;
      }
      
      // Create a deep copy of the selected element
      const elementToUpdate = JSON.parse(JSON.stringify(selectedElementCopy));
      
      // Build a complete update object
      const fullUpdate = {
        ...elementToUpdate,
        ...updates,
        id: selectedElementCopy.id
      };
      
      // Handle content updates properly
      if (updates.content && elementToUpdate.content) {
        // Create a new content object
        fullUpdate.content = { ...elementToUpdate.content };
        
        // Process each content property
        Object.keys(updates.content).forEach(key => {
          if (Array.isArray(updates.content[key])) {
            // For arrays, always use the complete new array
            fullUpdate.content[key] = [...updates.content[key]];
          }
          else if (key === 'formattedText') {
            // For formattedText, always completely replace
            fullUpdate.content[key] = updates.content[key];
          }
          else if (typeof updates.content[key] === 'object' && updates.content[key] !== null) {
            // For nested objects, merge them
            fullUpdate.content[key] = {
              ...(fullUpdate.content[key] || {}),
              ...updates.content[key]
            };
          } else {
            // For simple properties, just replace
            fullUpdate.content[key] = updates.content[key];
          }
        });
      }
      
      console.log("ElementConfigSidebar - sending fullUpdate:", fullUpdate);
      
      // Store this update to prevent duplicates
      lastUpdateRef.current = {
        id: selectedElementCopy.id,
        update: JSON.parse(JSON.stringify(updates)),
        timestamp: now
      };
      
      // Update our copy of the element
      setSelectedElementCopy(prevCopy => {
        // Deep merge the updates into our copy
        const newCopy = JSON.parse(JSON.stringify(prevCopy));
        if (updates.content && newCopy.content) {
          Object.keys(updates.content).forEach(key => {
            if (Array.isArray(updates.content[key])) {
              newCopy.content[key] = [...updates.content[key]];
            } else if (typeof updates.content[key] === 'object' && updates.content[key] !== null) {
              newCopy.content[key] = {
                ...(newCopy.content[key] || {}),
                ...updates.content[key]
              };
            } else {
              newCopy.content[key] = updates.content[key];
            }
          });
        }
        
        // Update other top-level properties
        Object.keys(updates).forEach(key => {
          if (key !== 'content') {
            newCopy[key] = updates[key];
          }
        });
        
        return newCopy;
      });
      
      // Mark that we're about to do an internal update
      internalUpdateRef.current = true;
      
      // Send the update up to the parent component
      onUpdate(fullUpdate);
      
      // Garantir que o evento de atualização seja persistido
      console.log("ElementConfigSidebar - Enviando atualização completa para o sistema");
    } finally {
      processingUpdateRef.current = false;
      
      // Check if there are more updates to process
      if (updateQueueRef.current.length > 0) {
        setTimeout(processUpdates, 10);
      }
    }
  }, [selectedElementCopy, onUpdate]);

  // Handle updates from config components
  const handleUpdate = useCallback((updates: any) => {
    if (!selectedElementCopy) return;
    
    console.log("ElementConfigSidebar - updates received:", updates);
    
    // Queue the update
    updateQueueRef.current.push(updates);
    
    // Process the update (will take only the last one if multiple are queued)
    processUpdates();
    
    // Forçar uma atualização adicional após um breve delay
    setTimeout(() => {
      if (updateQueueRef.current.length === 0 && selectedElementCopy) {
        console.log("ElementConfigSidebar - Forçando processamento de atualizações pendentes");
        processUpdates();
      }
    }, 100);
  }, [selectedElementCopy, processUpdates]);

  return {
    isOpen,
    selectedElementCopy,
    handleUpdate
  };
};
