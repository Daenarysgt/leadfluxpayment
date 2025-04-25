import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";

interface CanvasDropZoneProps {
  onDrop: (componentType: string) => void;
  isEmpty: boolean;
  children: React.ReactNode;
}

const CanvasDropZone = ({ onDrop, isEmpty, children }: CanvasDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const emptyMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isDraggingTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Handle showing empty message with a delay
  useEffect(() => {
    // Clear any existing timer whenever isEmpty changes
    if (emptyMessageTimerRef.current) {
      clearTimeout(emptyMessageTimerRef.current);
      emptyMessageTimerRef.current = null;
    }
    
    // If it's empty, set a timer to show the empty message
    if (isEmpty) {
      emptyMessageTimerRef.current = setTimeout(() => {
        setShowEmptyMessage(true);
      }, 500);
    } else {
      // If not empty, immediately hide the message
      setShowEmptyMessage(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (emptyMessageTimerRef.current) {
        clearTimeout(emptyMessageTimerRef.current);
      }
      if (isDraggingTimer.current) {
        clearTimeout(isDraggingTimer.current);
      }
    };
  }, [isEmpty]);
  
  // Add global drag event listeners to better capture drag events
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      // Prevent default behavior to enable dropping
      e.preventDefault();
      
      // Check if this is a component drag operation
      if (e.dataTransfer?.types.includes("componentType") && 
          !e.dataTransfer?.types.includes("elementId") && 
          !e.dataTransfer?.types.includes("text/plain")) {
        
        // Check if the drag is over our drop zone or one of its children
        if (dropZoneRef.current) {
          const rect = dropZoneRef.current.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            // If we're over our element, set dragging to true
            setIsDragging(true);
            
            // Clear any existing timer
            if (isDraggingTimer.current) {
              clearTimeout(isDraggingTimer.current);
            }
          }
        }
      }
    };
    
    const handleGlobalDragEnd = () => {
      // Set a small delay before hiding the drop indicator
      if (isDraggingTimer.current) {
        clearTimeout(isDraggingTimer.current);
      }
      
      isDraggingTimer.current = setTimeout(() => {
        setIsDragging(false);
      }, 100);
    };
    
    // Add global listeners
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('drop', handleGlobalDragEnd);
    
    // Cleanup
    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show the drop indicator for new components, not for reordering
    if (e.dataTransfer.types.includes("componentType") && 
        !e.dataTransfer.types.includes("elementId") && 
        !e.dataTransfer.types.includes("text/plain")) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Check if the drag has actually left the drop zone (not just entered a child)
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      // Use a small delay to prevent flickering when moving between elements
      if (isDraggingTimer.current) {
        clearTimeout(isDraggingTimer.current);
      }
      
      isDraggingTimer.current = setTimeout(() => {
        setIsDragging(false);
      }, 50);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Get component type from the drop data
    const componentType = e.dataTransfer.getData("componentType");
    
    // If it's for element reordering, don't handle it here
    if (e.dataTransfer.types.includes("elementId") || 
        e.dataTransfer.types.includes("text/plain")) {
      console.log("CanvasDropZone - Ignoring drop for element reordering");
      return;
    }
    
    // Only add new component if we have a component type
    if (componentType) {
      console.log("CanvasDropZone - Handling drop for new component:", componentType);
      onDrop(componentType);
    }
  };
  
  return (
    <div 
      ref={dropZoneRef}
      className="relative flex flex-col items-center w-full h-full bg-gray-50 overflow-y-auto p-4 pt-10 canvas-drop-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-violet-100/50 flex items-center justify-center z-40 pointer-events-none border-2 border-dashed border-violet-400">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Plus className="w-12 h-12 text-violet-500 mx-auto mb-2" />
            <p className="text-lg font-medium">Solte para adicionar o elemento</p>
          </div>
        </div>
      )}
      
      {showEmptyMessage && !isDragging && isEmpty && (
        <EmptyCanvasMessage />
      )}
      
      {children}
    </div>
  );
};

const EmptyCanvasMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-4">
      <span className="text-3xl">📊</span>
    </div>
    <h3 className="font-medium text-lg mb-2">Canvas vazio</h3>
    <p className="text-gray-500 max-w-sm">
      Arraste elementos do menu lateral e solte aqui para começar a construir seu funil.
    </p>
  </div>
);

export default CanvasDropZone;
