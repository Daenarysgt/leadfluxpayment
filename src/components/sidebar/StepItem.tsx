import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import StepEditor from "./StepEditor";

interface StepItemProps {
  step: {
    id: string;
    title: string;
  };
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
  onEdit: (step: { id: string; title: string }, e: React.MouseEvent) => void;
  onDuplicate: (index: number, e: React.MouseEvent) => void;
}

const StepItem = ({ step, index, isActive, onSelect, onDelete, onEdit, onDuplicate }: StepItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("StepItem - Botão de duplicação clicado");
    try {
      if (typeof onDuplicate === 'function') {
        onDuplicate(index, e);
      } else {
        console.error("onDuplicate não é uma função", onDuplicate);
      }
    } catch (error) {
      console.error("Erro ao chamar onDuplicate:", error);
    }
  };

  if (isEditing) {
    return (
      <div 
        className={`
          rounded-lg border ${isActive ? 'border-violet-200 bg-violet-50/50' : 'border-gray-200 bg-white'} 
          shadow-sm transition-all duration-200
        `}
      >
        <StepEditor 
          step={step} 
          onComplete={() => setIsEditing(false)} 
        />
      </div>
    );
  }

  return (
    <div
      className={`
        group flex items-center justify-between rounded-lg border 
        ${isActive 
          ? 'border-violet-200 bg-violet-50/50 shadow-sm' 
          : 'border-transparent bg-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm'
        }
        cursor-pointer transition-all duration-200
      `}
      onClick={() => onSelect(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 flex items-center p-3">
        <div className={`
          w-6 h-6 flex items-center justify-center rounded-md text-sm font-medium mr-3
          ${isActive 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-600/10 group-hover:via-purple-500/10 group-hover:to-purple-600/10 group-hover:text-violet-700'
          }
          transition-all duration-300
        `}>
          {index + 1}
        </div>
        <span className={`
          font-medium truncate
          ${isActive ? 'text-violet-900' : 'text-gray-700'}
        `}>
          {step.title}
        </span>
      </div>
      
      <div className={`
        flex items-center gap-1 pr-2
        ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-200
      `}>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 text-gray-500 hover:text-violet-600"
          onClick={handleEditClick}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 text-gray-500 hover:text-violet-600"
          onClick={handleDuplicateClick}
          title="Duplicar etapa"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 text-gray-500 hover:text-red-600"
          onClick={(e) => onDelete(index, e)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default StepItem;
