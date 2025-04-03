
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
    // Focus the input when the component mounts
    inputRef.current?.focus();
    
    // Select all text
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
    
    // Preserve cursor position
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
    <div className="flex-1 flex items-center space-x-2 px-3 py-2" onClick={e => e.stopPropagation()}>
      <Input 
        ref={inputRef}
        value={stepName}
        onChange={handleInputChange}
        className="h-7 py-1 text-sm"
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
        size="icon" 
        className="h-6 w-6" 
        onClick={handleSave}
      >
        <Save className="h-3.5 w-3.5 text-green-600" />
      </Button>
    </div>
  );
};

export default StepEditor;
