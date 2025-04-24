import { Funnel, Question, QuestionType, Step } from '../types';

export interface FunnelStore {
  funnels: Funnel[];
  currentFunnel: Funnel | null;
  currentStep: number;
  
  createFunnel: (name: string) => Promise<Funnel>;
  updateFunnel: (funnel: Funnel) => Promise<Funnel>;
  deleteFunnel: (id: string) => Promise<void>;
  renameFunnel: (id: string, newName: string) => Promise<Funnel>;
  duplicateFunnel: (id: string) => Promise<Funnel>;
  setCurrentFunnel: (id: string | null) => void;
  setFunnels: (funnels: Funnel[]) => void;
  addStep: () => void;
  updateStep: (stepId: string, step: Partial<Step>) => void;
  deleteStep: (stepIndex: number) => void;
  addQuestion: (stepId: string, type: QuestionType) => void;
  updateQuestion: (stepId: string, questionId: string, question: Partial<Question>) => void;
  deleteQuestion: (stepId: string, questionId: string) => void;
  reorderQuestions: (stepId: string, questionIds: string[]) => void;
  setCurrentStep: (stepIndex: number) => void;
  duplicateStep: (stepIndex: number) => Promise<string>;
  
  setCanvasElements: (stepId: string, elements: any[]) => void;
  getCanvasElements: (stepId: string) => any[];
}
