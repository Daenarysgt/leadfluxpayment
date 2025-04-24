/**
 * Definições de tipos globais para o projeto
 * Para dar suporte a propriedades adicionadas ao objeto window
 */

// Interface para o adaptador de banco de dados para steps
interface StepsDatabaseAdapter {
  getCanvasElements: (step: any) => Promise<any[]>;
  saveCanvasElements: (stepId: string, elements: any[]) => Promise<boolean>;
}

// Estender a interface Window global
interface Window {
  stepsDatabaseAdapter?: StepsDatabaseAdapter;
} 