import { ComponentType } from "@/utils/types";

export interface CanvasElement {
  id: string;
  type: string;
  position?: {
    x: number;
    y: number;
  };
  dimensions?: {
    width: number;
    height: number;
  };
  content?: any;
  style?: any;
  previewMode?: boolean;
  previewProps?: {
    activeStep: number;
    onStepChange: (newStep: number) => void;
    funnel?: any;
  };
}

export interface BuilderCanvasProps {
  isMobile: boolean;
  onElementSelect: (element: CanvasElement | null) => void;
  selectedElementId: string | null;
  elementUpdates?: CanvasElement;
  elements?: CanvasElement[];
  onElementsChange?: (elements: CanvasElement[]) => void;
}

export interface ElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDragStart?: ((id: string) => void) | null;
  onDragEnd?: (() => void) | null;
  onUpdate?: (updatedElement: CanvasElement) => void;
  isDragging?: boolean;
  index: number;
  totalElements: number;
  previewMode?: boolean;
  previewProps?: {
    activeStep: number;
    onStepChange: (newStep: number) => void;
    funnel?: any;
  };
}

export interface ComparisonItem {
  id: string;
  name: string;
  value: number;
  color: string;
  label?: string;
}

export interface ComparisonMetric {
  id: string;
  name: string;
  valueA: number;
  valueB: number;
}

export interface ComparisonContent {
  title?: string;
  leftTitle?: string;
  rightTitle?: string;
  items: ComparisonItem[];
  showCostComparison?: boolean;
  leftCostPercentage?: number;
  rightCostPercentage?: number;
  leftCostMin?: string;
  leftCostMax?: string;
  rightCostMin?: string;
  rightCostMax?: string;
  showDetailedComparison?: boolean;
  comparisonMetrics?: ComparisonMetric[];
}

export interface ButtonContent {
  buttonText?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  buttonColor?: string;
  textColor?: string;
  animationEnabled?: boolean;
  animationType?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow' | 'scale';
  delayEnabled?: boolean;
  delayTime?: number;
  marginTop?: number;
  borderRadius?: number;
  fullWidth?: boolean;
  navigation?: {
    type: 'next' | 'step' | 'url';
    stepId?: string;
    url?: string;
    openInNewTab?: boolean;
  };
  // Facebook Pixel event para rastreamento
  facebookEvent?: string;
  facebookCustomEventName?: string;
  facebookEventParams?: Record<string, any>;
  facebookEventDebugMode?: boolean;
}

export interface NotificationContent {
  toastText?: string;
  toastTitle?: string;
  toastSubtitle?: string;
  toastEnabled?: boolean;
  soundEnabled?: boolean;
  soundType?: 'sale' | 'success' | 'alert' | 'notification';
  toastColor?: string;
  toastTextColor?: string;
  toastDuration?: number;
  toastPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  customSound?: string;
  showIcon?: boolean;
  iconType?: 'success' | 'error' | 'info' | 'warning';
  showImage?: boolean;
  customImage?: string;
  borderRadius?: number;
  titleFontSize?: number;
  subtitleFontSize?: number;
}
