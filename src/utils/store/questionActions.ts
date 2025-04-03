
import { Question, QuestionType } from '../types';

export const addQuestionAction = (set: any, get: any) => (stepId: string, type: QuestionType) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  const newQuestion: Question = {
    id: crypto.randomUUID(),
    type,
    title: 'New Question',
  };
  
  if (type === QuestionType.SingleChoice || type === QuestionType.MultipleChoice) {
    newQuestion.options = [
      { id: crypto.randomUUID(), text: 'Option 1' },
      { id: crypto.randomUUID(), text: 'Option 2' },
    ];
  }
  
  const updatedSteps = currentFunnel.steps.map((step) => {
    if (step.id === stepId) {
      return {
        ...step,
        questions: [...step.questions, newQuestion],
      };
    }
    return step;
  });
  
  const updatedFunnel = {
    ...currentFunnel,
    steps: updatedSteps,
    updatedAt: new Date(),
  };
  
  set((state) => ({
    currentFunnel: updatedFunnel,
    funnels: state.funnels.map((funnel) => 
      funnel.id === currentFunnel.id ? updatedFunnel : funnel
    ),
  }));
};

export const updateQuestionAction = (set: any, get: any) => (stepId: string, questionId: string, questionUpdates: any) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  const updatedSteps = currentFunnel.steps.map((step) => {
    if (step.id === stepId) {
      const updatedQuestions = step.questions.map((question) => 
        question.id === questionId ? { ...question, ...questionUpdates } : question
      );
      
      return {
        ...step,
        questions: updatedQuestions,
      };
    }
    return step;
  });
  
  const updatedFunnel = {
    ...currentFunnel,
    steps: updatedSteps,
    updatedAt: new Date(),
  };
  
  set((state) => ({
    currentFunnel: updatedFunnel,
    funnels: state.funnels.map((funnel) => 
      funnel.id === currentFunnel.id ? updatedFunnel : funnel
    ),
  }));
};

export const deleteQuestionAction = (set: any, get: any) => (stepId: string, questionId: string) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  const updatedSteps = currentFunnel.steps.map((step) => {
    if (step.id === stepId) {
      return {
        ...step,
        questions: step.questions.filter((q) => q.id !== questionId),
      };
    }
    return step;
  });
  
  const updatedFunnel = {
    ...currentFunnel,
    steps: updatedSteps,
    updatedAt: new Date(),
  };
  
  set((state) => ({
    currentFunnel: updatedFunnel,
    funnels: state.funnels.map((funnel) => 
      funnel.id === currentFunnel.id ? updatedFunnel : funnel
    ),
  }));
};

export const reorderQuestionsAction = (set: any, get: any) => (stepId: string, questionIds: string[]) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  const step = currentFunnel.steps.find((s) => s.id === stepId);
  if (!step) return;
  
  const questionMap = new Map(step.questions.map((q) => [q.id, q]));
  const reorderedQuestions = questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is Question => !!q);
  
  const updatedSteps = currentFunnel.steps.map((s) => 
    s.id === stepId ? { ...s, questions: reorderedQuestions } : s
  );
  
  const updatedFunnel = {
    ...currentFunnel,
    steps: updatedSteps,
    updatedAt: new Date(),
  };
  
  set((state) => ({
    currentFunnel: updatedFunnel,
    funnels: state.funnels.map((funnel) => 
      funnel.id === currentFunnel.id ? updatedFunnel : funnel
    ),
  }));
};
