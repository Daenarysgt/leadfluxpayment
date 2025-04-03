
import { useState } from "react";
import { useStore } from "@/utils/store";
import { Question, QuestionType } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  GripVertical, 
  Pencil, 
  Plus, 
  Trash, 
  X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionEditorProps {
  question: Question;
  stepId: string;
  isActive: boolean;
}

const QuestionEditor = ({ question, stepId, isActive }: QuestionEditorProps) => {
  const { toast } = useToast();
  const { updateQuestion, deleteQuestion } = useStore();
  const [isEditing, setIsEditing] = useState(true);
  const [draggedOver, setDraggedOver] = useState(false);
  
  const handleUpdateQuestion = (updates: Partial<Question>) => {
    updateQuestion(stepId, question.id, updates);
  };
  
  const handleDeleteQuestion = () => {
    deleteQuestion(stepId, question.id);
    toast({
      title: "Pergunta excluída",
      description: "A pergunta foi excluída com sucesso.",
    });
  };
  
  const handleAddOption = () => {
    const newOption = {
      id: crypto.randomUUID(),
      text: "Nova opção",
      emoji: "😊"
    };
    
    if (!question.options) {
      handleUpdateQuestion({ options: [newOption] });
    } else {
      handleUpdateQuestion({
        options: [...question.options, newOption]
      });
    }
  };
  
  const handleUpdateOption = (optionId: string, updates: { text?: string; emoji?: string }) => {
    if (!question.options) return;
    
    const updatedOptions = question.options.map(option => 
      option.id === optionId ? { ...option, ...updates } : option
    );
    
    handleUpdateQuestion({ options: updatedOptions });
  };
  
  const handleDeleteOption = (optionId: string) => {
    if (!question.options) return;
    
    const updatedOptions = question.options.filter(option => option.id !== optionId);
    handleUpdateQuestion({ options: updatedOptions });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };
  
  const handleDragLeave = () => {
    setDraggedOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    const componentType = e.dataTransfer.getData("componentType");
    console.log("Dropped component:", componentType);
    // Handle component drop logic here
  };
  
  const emojiOptions = ["😊", "😃", "🙂", "😐", "😑", "😕", "☹️", "😢", "😭"];
  
  return (
    <div 
      className={`mb-4 ${draggedOver ? 'border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Card className="shadow-sm">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-move" />
            <span className="font-medium">Pergunta</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-destructive"
              onClick={handleDeleteQuestion}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Input
                  value={question.title}
                  onChange={(e) => handleUpdateQuestion({ title: e.target.value })}
                  placeholder="Digite sua pergunta aqui"
                  className="text-lg font-medium border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {(question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md border">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md">
                        <span className="text-xl">{option.emoji}</span>
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) => handleUpdateOption(option.id, { text: e.target.value })}
                        className="flex-1 border-none focus-visible:ring-0"
                      />
                      <div className="flex items-center space-x-1">
                        <select 
                          value={option.emoji || "😊"}
                          onChange={(e) => handleUpdateOption(option.id, { emoji: e.target.value })}
                          className="border rounded p-1"
                        >
                          {emojiOptions.map(emoji => (
                            <option key={emoji} value={emoji}>{emoji}</option>
                          ))}
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteOption(option.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleAddOption}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar opção
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{question.title}</h3>
              
              {(question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md border">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md">
                        <span className="text-xl">{option.emoji || "😊"}</span>
                      </div>
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Continue Button (Preview) */}
          <div className="mt-6">
            <Button 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionEditor;
