import { useState } from "react";
import { useStore } from "@/utils/store";
import { QuestionType } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";

export const useFunnelStepManager = () => {
  const { toast } = useToast();
  const { 
    currentFunnel, 
    currentStep, 
    setCurrentStep, 
    addStep, 
    updateStep, 
    deleteStep,
    duplicateStep,
    addQuestion,
    deleteQuestion,
    updateQuestion
  } = useStore();

  const handleStepChange = (index: number) => {
    if (index >= 0 && index < (currentFunnel?.steps.length || 0)) {
      setCurrentStep(index);
    }
  };

  const handleAddStep = () => {
    addStep();
    setCurrentStep((currentFunnel?.steps.length || 0));
    toast({
      title: "Step added",
      description: `A new step has been added to your funnel`,
    });
  };

  const handleDeleteStep = () => {
    if (!currentFunnel || currentFunnel.steps.length <= 1) {
      toast({
        title: "Cannot delete step",
        description: "Your funnel must have at least one step",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`FunnelBuilder - Deleting current step at index: ${currentStep}`);
    console.log(`FunnelBuilder - Current steps:`, currentFunnel.steps.map((s, i) => `${i}: ${s.title}`));
    
    deleteStep(currentStep);
    
    toast({
      title: "Step deleted",
      description: `Step has been removed from your funnel`,
    });
  };

  const handleUpdateStepTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFunnel) return;
    const currentStepData = currentFunnel.steps[currentStep];
    updateStep(currentStepData.id, { title: e.target.value });
  };

  const handleUpdateButtonText = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFunnel) return;
    const currentStepData = currentFunnel.steps[currentStep];
    updateStep(currentStepData.id, { buttonText: e.target.value });
  };

  const handleAddQuestion = (type: QuestionType) => {
    if (!currentFunnel) return;
    const currentStepData = currentFunnel.steps[currentStep];
    addQuestion(currentStepData.id, type);
    toast({
      title: "Question added",
      description: `A new ${type} question has been added to ${currentStepData.title}`,
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!currentFunnel) return;
    const currentStepData = currentFunnel.steps[currentStep];
    deleteQuestion(currentStepData.id, questionId);
    toast({
      title: "Question deleted",
      description: "The question has been removed from this step",
    });
  };

  const handleDuplicateStep = async () => {
    if (!currentFunnel) return;
    
    try {
      const result = await duplicateStep();
      
      if (result) {
        toast({
          title: "Step duplicated",
          description: `"${result.step.title}" has been created with all its content`,
        });
      }
    } catch (error) {
      console.error("Error duplicating step:", error);
      toast({
        title: "Error duplicating step",
        description: "There was a problem duplicating the step. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    currentFunnel,
    currentStep,
    handleStepChange,
    handleAddStep,
    handleDeleteStep,
    handleDuplicateStep,
    handleUpdateStepTitle,
    handleUpdateButtonText,
    handleAddQuestion,
    handleDeleteQuestion,
    updateQuestion
  };
};
