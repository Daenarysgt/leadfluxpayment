
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
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
}

const StepItem = ({ 
  step, 
  index, 
  isActive, 
  onSelect, 
  onDelete, 
  onEdit 
}: StepItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);
  
  const handleEditComplete = useCallback(() => {
    setIsEditing(false);
  }, []);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    // Importante: Pare a propagação para evitar que o evento de click atinja o contêiner
    e.stopPropagation();
    
    // Log detalhado para depuração
    console.log(`StepItem - Solicitando exclusão da etapa "${step.title}" no índice ESPECÍFICO ${index}`);
    
    // Chamar a função de exclusão passando o índice específico desta etapa
    onDelete(index, e);
  }, [index, step.title, onDelete]);
  
  if (isEditing) {
    return (
      <StepEditor 
        step={step} 
        onComplete={handleEditComplete}
      />
    );
  }
  
  return (
    <div 
      className={cn(
        "px-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-2 flex items-center justify-between",
        isActive 
          ? "border-l-violet-600 bg-violet-50 text-violet-700 font-medium" 
          : "border-l-transparent"
      )}
      onClick={() => onSelect(index)}
    >
      <span>{step.title}</span>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-50 hover:opacity-100" 
          onClick={handleEdit}
        >
          <Pencil className="h-3.5 w-3.5 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-50 hover:opacity-100" 
          onClick={handleDelete}
        >
          <X className="h-3.5 w-3.5 text-red-600" />
        </Button>
        {isActive && <ChevronRight className="h-3.5 w-3.5 ml-1" />}
      </div>
    </div>
  );
};

export default StepItem;
