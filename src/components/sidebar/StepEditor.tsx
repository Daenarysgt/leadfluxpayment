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
          console.error("Failed to restore cursor position in StepEditor", e);
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
  
  return (
    <div 
      className="flex items-center space-x-2 p-3" 
      onClick={e => e.stopPropagation()}
    >
      <div className="w-6 h-6 flex items-center justify-center rounded-md text-sm font-medium mr-1 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500">
        <Save className="h-3.5 w-3.5 text-white" />
      </div>
      <Input 
        ref={inputRef}
        value={stepName}
        onChange={handleInputChange}
        className="h-8 text-sm bg-white focus:ring-2 focus:ring-violet-200 border-gray-200"
        placeholder="Nome da etapa..."
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handleSave(e);
          } else if (e.key === 'Escape') {
            onComplete();
          }
        }}
      />
      <Button 
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
        onClick={handleSave}
      >
        Salvar
      </Button>
    </div>
  );
};

export default StepEditor;
