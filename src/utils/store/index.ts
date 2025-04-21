import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FunnelStore } from './types';

// Import all action creators
import { 
  createFunnelAction, 
  updateFunnelAction, 
  deleteFunnelAction, 
  renameFunnelAction,
  duplicateFunnelAction,
  setCurrentFunnelAction,
  setFunnelsAction 
} from './funnelActions';

import { 
  addStepAction, 
  updateStepAction, 
  deleteStepAction, 
  setCurrentStepAction 
} from './stepActions';

import { 
  addQuestionAction, 
  updateQuestionAction, 
  deleteQuestionAction, 
  reorderQuestionsAction 
} from './questionActions';

import { 
  setCanvasElementsAction, 
  getCanvasElementsAction 
} from './canvasActions';

export const useStore = create<FunnelStore>()(
  persist(
    (set, get) => ({
      funnels: [],
      currentFunnel: null,
      currentStep: 0,
      
      // Funnel actions
      createFunnel: createFunnelAction(set, get),
      updateFunnel: updateFunnelAction(set),
      deleteFunnel: deleteFunnelAction(set),
      renameFunnel: renameFunnelAction(set),
      duplicateFunnel: duplicateFunnelAction(set),
      setCurrentFunnel: setCurrentFunnelAction(set, get),
      setFunnels: setFunnelsAction(set),
      
      // Step actions
      addStep: addStepAction(set, get),
      updateStep: updateStepAction(set, get),
      deleteStep: deleteStepAction(set, get),
      setCurrentStep: setCurrentStepAction(set, get),
      
      // Question actions
      addQuestion: addQuestionAction(set, get),
      updateQuestion: updateQuestionAction(set, get),
      deleteQuestion: deleteQuestionAction(set, get),
      reorderQuestions: reorderQuestionsAction(set, get),
      
      // Canvas actions
      setCanvasElements: setCanvasElementsAction(set, get),
      getCanvasElements: getCanvasElementsAction(get),
    }),
    {
      name: 'funnel-builder-store',
    }
  )
);

// Re-export types for easier imports
export * from './types';
