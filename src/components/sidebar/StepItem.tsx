import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Copy, GripVertical } from "lucide-react";
import { useState } from "react";
import StepEditor from "./StepEditor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onDuplicate?: (index: number, e: React.MouseEvent) => void;
}

const StepItem = ({ step, index, isActive, onSelect, onDelete, onEdit, onDuplicate }: StepItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Configuração do sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div 
        className={`
          rounded-lg border ${isActive ? 'border-violet-200 bg-violet-50/50' : 'border-gray-200 bg-white'} 
          shadow-sm transition-all duration-200
        `}
        ref={setNodeRef}
        style={style}
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
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center justify-between rounded-lg border 
        ${isDragging ? 'border-violet-300 bg-violet-50 shadow-md' : ''}
        ${isActive 
          ? 'border-violet-200 bg-violet-50/50 shadow-sm' 
          : 'border-transparent bg-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm'
        }
        cursor-pointer transition-all duration-200 pr-1 overflow-hidden
      `}
      onClick={() => !isDragging && onSelect(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-grow flex items-center p-3 pr-0 min-w-0 overflow-hidden max-w-[calc(100%-70px)]">
        <div 
          className="drag-handle mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-violet-500 flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </div>
        <div className={`
          w-6 h-6 flex items-center justify-center rounded-md text-sm font-medium mr-2.5 flex-shrink-0
          ${isActive 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-600/10 group-hover:via-purple-500/10 group-hover:to-purple-600/10 group-hover:text-violet-700'
          }
          transition-all duration-300
        `}>
          {index + 1}
        </div>
        <span className={`
          font-medium truncate overflow-hidden flex-1 min-w-0
          ${isActive ? 'text-violet-900' : 'text-gray-700'}
        `} title={step.title}>
          {step.title}
        </span>
      </div>
      
      <div className={`
        flex items-center gap-0.5 flex-shrink-0 ml-0.5 w-[68px]
        ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-200
      `}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0.5 text-gray-500 hover:text-violet-600"
          onClick={handleEditClick}
          title="Editar"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        {onDuplicate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0.5 text-gray-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(index, e);
            }}
            title="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0.5 text-gray-500 hover:text-red-600"
          onClick={(e) => onDelete(index, e)}
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default StepItem;
