import { CanvasElement } from './canvasTypes';

export interface ConfigPanelRendererProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
} 