
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Question, QuestionType } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Grip, Trash2, PencilLine, Type, Mail, Phone, 
  CircleUserRound, Star, CheckSquare, X, Plus 
} from "lucide-react";

interface DraggableQuestionProps {
  question: Question;
  onDelete: () => void;
  onUpdate: (updates: Partial<Question>) => void;
}

const DraggableQuestion = ({ question, onDelete, onUpdate }: DraggableQuestionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const getQuestionIcon = () => {
    switch (question.type) {
      case QuestionType.ShortText:
      case QuestionType.LongText:
        return <Type className="h-4 w-4" />;
      case QuestionType.Email:
        return <Mail className="h-4 w-4" />;
      case QuestionType.Phone:
        return <Phone className="h-4 w-4" />;
      case QuestionType.Name:
      case QuestionType.Gender:
        return <CircleUserRound className="h-4 w-4" />;
      case QuestionType.Rating:
        return <Star className="h-4 w-4" />;
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const handleAddOption = () => {
    if (!question.options) {
      onUpdate({ options: [{ id: crypto.randomUUID(), text: "Nova opção" }] });
      return;
    }
    
    onUpdate({
      options: [...question.options, { id: crypto.randomUUID(), text: "Nova opção" }]
    });
  };

  const handleUpdateOption = (optionId: string, text: string) => {
    if (!question.options) return;
    
    const updatedOptions = question.options.map((option) =>
      option.id === optionId ? { ...option, text } : option
    );
    
    onUpdate({ options: updatedOptions });
  };

  const handleDeleteOption = (optionId: string) => {
    if (!question.options) return;
    
    const updatedOptions = question.options.filter((option) => option.id !== optionId);
    onUpdate({ options: updatedOptions });
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Grip className="h-4 w-4 text-muted-foreground cursor-move" />
          <div className="flex items-center space-x-1 text-sm font-medium">
            {getQuestionIcon()}
            <span>{isEditing ? "Editando Pergunta" : question.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsEditing(!isEditing)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {isEditing ? (
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor={`question-title-${question.id}`}>Texto da Pergunta</Label>
            <Input 
              id={`question-title-${question.id}`}
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor={`question-desc-${question.id}`}>Descrição (Opcional)</Label>
            <Input 
              id={`question-desc-${question.id}`}
              value={question.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-1"
              placeholder="Adicione uma descrição para esta pergunta"
            />
          </div>
          
          {(question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) && (
            <div className="space-y-2">
              <Label>Opções</Label>
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md flex-shrink-0">
                      <span className="text-xl">{option.emoji || "😊"}</span>
                    </div>
                    <Input 
                      value={option.text}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Opção
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            <input 
              type="checkbox" 
              id={`required-${question.id}`}
              checked={question.required || false}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor={`required-${question.id}`}>Obrigatório</Label>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Concluído
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-4">
          {question.description && (
            <p className="text-sm text-muted-foreground mb-2">{question.description}</p>
          )}
          
          {(question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) && (
            <div className="space-y-1">
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
          
          {question.required && (
            <div className="mt-2 text-xs text-muted-foreground">Obrigatório</div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DraggableQuestion;
