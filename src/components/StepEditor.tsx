import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/utils/store";
import { useToast } from "@/hooks/use-toast";

interface StepEditorProps {
  step: {
    id: string;
    title: string;
  };
  onComplete: () => void;
}

const StepEditor = ({ step, onComplete }: StepEditorProps) => {
  const [stepName, setStepName] = useState(step.title);
  const { updateStep } = useStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.setSelectionRange(0, stepName.length);
    }
  }, []);
  
  useEffect(() => {
    setStepName(step.title);
  }, [step.title]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const newValue = input.value;
    const cursorPosition = input.selectionStart || 0;
    
    setStepName(newValue);
    
    requestAnimationFrame(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        try {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        } catch (e) {
          console.error("Falha ao restaurar posição do cursor no StepEditor", e);
        }
      }
    });
  }, []);
  
  const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (stepName.trim()) {
      updateStep(step.id, { title: stepName.trim() });
      toast({
        title: "Nome atualizado",
        description: "O nome da etapa foi atualizado com sucesso.",
      });
      onComplete();
    }
  };
  
  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onComplete();
  };
  
  return (
    <div 
      className="flex items-center p-3" 
      onClick={e => e.stopPropagation()}
    >
      <div className="flex-1 flex items-center gap-2">
        <Input 
          ref={inputRef}
          value={stepName}
          onChange={handleInputChange}
          className="h-9 bg-white border-blue-200 focus:ring-2 focus:ring-blue-200"
          placeholder="Nome da etapa..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSave(e);
            } else if (e.key === 'Escape') {
              handleCancel(e);
            }
          }}
        />
        <div className="flex items-center gap-1">
          <Button 
            variant="default"
            size="sm"
            className="h-9 px-3 bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            Salvar
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="h-9 px-3"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepEditor; 