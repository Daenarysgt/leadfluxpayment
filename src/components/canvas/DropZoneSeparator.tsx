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
    
    console.log("DropZoneSeparator - DragEnter - tipos:", e.dataTransfer.types);
    
    // Verificar se é um drag de elemento ou componente
    if (e.dataTransfer.types.includes("elementId") || e.dataTransfer.types.includes("componentType")) {
      console.log("DropZoneSeparator - DragEnter - ativando hover");
      setIsHovered(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      console.log("DropZoneSeparator - DragLeave - desativando hover");
      setIsHovered(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Alterar o cursor para indicar que um drop é possível
    if (e.dataTransfer.types.includes("elementId") || e.dataTransfer.types.includes("componentType")) {
      console.log("DropZoneSeparator - DragOver - definindo dropEffect");
      e.dataTransfer.dropEffect = "move";
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("DropZoneSeparator - Drop - tipos:", e.dataTransfer.types);
    console.log("DropZoneSeparator - Drop - componentType:", e.dataTransfer.getData("componentType"));
    
    setIsHovered(false);
    
    // Chamar a função de callback
    onDrop(e);
  };
  
  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        (isHovered || isActive) ? "h-16 opacity-100" : "h-0 opacity-0"
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: "relative",
        zIndex: isActive || isHovered ? 50 : -1,
        pointerEvents: (isActive || isHovered) ? "auto" : "none",
        overflow: "visible"
      }}
    >
      <div 
        className={cn(
          "absolute inset-0 mx-4 rounded-md transition-all", 
          (isHovered || isActive) ? 
            "bg-violet-200 border-2 border-dashed border-violet-400" : 
            "bg-transparent border-0"
        )}
        style={{
          transform: "translateY(-50%)",
          top: "50%",
          height: (isHovered || isActive) ? "16px" : "0px",
          opacity: (isHovered || isActive) ? 1 : 0
        }}
      >
        {(isHovered) && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-violet-500 text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap font-medium">
            Soltar aqui
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZoneSeparator; 