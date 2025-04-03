
import { Question, QuestionType } from "@/utils/types";
import QuestionTypeSelector from "@/components/QuestionTypeSelector";
import DraggableQuestion from "@/components/DraggableQuestion";

interface QuestionsSectionProps {
  questions: Question[];
  onAddQuestion: (type: QuestionType) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion: (stepId: string, questionId: string, updates: Partial<Question>) => void;
  stepId: string;
}

const QuestionsSection = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  stepId
}: QuestionsSectionProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="font-medium text-base mb-4">Questions</h3>
      
      {questions.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No questions added yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add a question from the question types below</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <DraggableQuestion 
              key={question.id}
              question={question}
              onDelete={() => onDeleteQuestion(question.id)}
              onUpdate={(updates) => onUpdateQuestion(stepId, question.id, updates)}
            />
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-medium text-base mb-3">Add Question</h3>
        <QuestionTypeSelector onSelectType={onAddQuestion} />
      </div>
    </div>
  );
};

export default QuestionsSection;
