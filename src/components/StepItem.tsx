import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Copy } from "lucide-react";
import { useState } from "react";

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

const StepItem = ({ 
  step, 
  index, 
  isActive, 
  onSelect, 
  onDelete, 
  onEdit,
  onDuplicate 
}: StepItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        group flex items-center justify-between rounded-lg p-2 border 
        ${isActive 
          ? 'border-blue-200 bg-blue-50/50 shadow-sm' 
          : 'border-transparent hover:border-gray-200 hover:bg-white/90'}
        cursor-pointer transition-all
      `}
      onClick={() => onSelect(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold
          ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
          {index + 1}
        </div>
        <div className="font-medium text-gray-800">
          {step.title}
        </div>
      </div>
      
      <div className={`
        flex items-center gap-1
        ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity
      `}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          onClick={(e) => onEdit(step, e)}
          title="Editar nome"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={(e) => onDuplicate(index, e)}
          title="Duplicar etapa"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
          onClick={(e) => onDelete(index, e)}
          title="Excluir etapa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepItem; 