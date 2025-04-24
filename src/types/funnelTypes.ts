export interface Step {
  id: string;
  title: string;
  buttonText?: string;
  backButtonText?: string;
  showProgressBar?: boolean;
  canvasElements?: any[];
  order_index?: number;
  funnel_id: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  questions?: any[];
}

export interface FunnelStore {
  addStep: () => void;
  deleteStep: (index: number) => Promise<boolean>;
  updateStep: (stepId: string, updates: Partial<Step>) => void;
  duplicateStep: (index: number) => Promise<string>;
} 