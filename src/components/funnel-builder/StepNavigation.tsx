
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (index: number) => void;
  onAddStep: () => void;
  onDeleteStep: () => void;
}

const StepNavigation = ({
  currentStep,
  totalSteps,
  onStepChange,
  onAddStep,
  onDeleteStep
}: StepNavigationProps) => {
  return (
    <div className="flex items-center justify-between mb-4 p-4 border-b">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onStepChange(currentStep + 1)}
          disabled={currentStep === totalSteps - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddStep}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Step
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onDeleteStep}
          disabled={totalSteps <= 1}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
