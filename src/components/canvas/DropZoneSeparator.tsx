import { cn } from "@/lib/utils";
import React from "react";

interface DropZoneSeparatorProps {
  isActive?: boolean;
  onDrop: (e: React.DragEvent) => void;
}

const DropZoneSeparator: React.FC<DropZoneSeparatorProps> = ({ isActive = false, onDrop }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar se é um drag de elemento ou componente
    if (e.dataTransfer.types.includes("elementId") || e.dataTransfer.types.includes("componentType")) {
      setIsHovered(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsHovered(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Alterar o cursor para indicar que um drop é possível
    if (e.dataTransfer.types.includes("elementId") || e.dataTransfer.types.includes("componentType")) {
      e.dataTransfer.dropEffect = "move";
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    
    // Chamar a função de callback
    onDrop(e);
  };
  
  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        (isHovered || isActive) ? "h-12 opacity-100" : "h-4 opacity-50"
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: "relative",
        zIndex: 10,
        cursor: "pointer"
      }}
    >
      <div 
        className={cn(
          "absolute inset-0 mx-4 rounded-md transition-all", 
          (isHovered || isActive) ? "bg-violet-200 border-2 border-dashed border-violet-400" : "bg-violet-100 border border-dashed border-violet-300"
        )}
        style={{
          transform: "translateY(-50%)",
          top: "50%",
          height: (isHovered || isActive) ? "10px" : "3px"
        }}
      >
        {(isHovered || isActive) && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-violet-500 text-white text-xs px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
            Soltar aqui
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZoneSeparator; 