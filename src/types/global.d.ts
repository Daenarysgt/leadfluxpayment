/**
 * Definições de tipos globais para o projeto
 * Para dar suporte a propriedades adicionadas ao objeto window
 */

// Interface para o adaptador de banco de dados para steps
interface StepsDatabaseAdapter {
  getCanvasElements: (step: any) => Promise<any[]>;
  saveCanvasElements: (stepId: string, elements: any[]) => Promise<boolean>;
}

// Interface para hooks da aplicação
interface LeadfluxAppHooks {
  preventCanvasReload: (stepId?: string) => void;
}

// Global type definitions
interface Window {
  LEADFLUX_APP_HOOKS?: {
    preventCanvasReload?: (stepId?: string) => void;
    [key: string]: any;
  };
  preloadedCanvasElements?: {
    [stepId: string]: any[];
  };
  canvasResizeObserver?: MutationObserver;
}

declare global {
  interface Window {
    stepsDatabaseAdapter?: StepsDatabaseAdapter;
    preloadedCanvasElements?: {
      [stepId: string]: any[];
    };
    LEADFLUX_APP_HOOKS?: LeadfluxAppHooks;
  }
}

export {}; 