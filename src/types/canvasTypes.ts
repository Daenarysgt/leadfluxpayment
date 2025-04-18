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
  animationEnabled?: boolean;
  delayEnabled?: boolean;
  delayTime?: number;
  navigation?: {
    type: 'next' | 'step' | 'url';
    stepId?: string;
    url?: string;
    openInNewTab?: boolean;
  };
  // Facebook Pixel event para rastreamento
  facebookEvent?: string;
}

export interface PricingContent {
  title?: string;
  subtitle?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency?: string;
  discountLabel?: string;
  paymentType?: 'single' | 'subscription';
  paymentPeriod?: 'monthly' | 'yearly' | 'onetime';
  paymentLabel?: string;
  buttonText?: string;
  features?: string[];
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  borderRadius?: number;
  boxShadow?: boolean;
  highlightTag?: string;
  isHighlighted?: boolean;
  style?: 'default' | 'minimal' | 'featured';
  alignment?: 'left' | 'center' | 'right';
  navigation?: {
    type: 'next' | 'step' | 'url';
    stepId?: string;
    url?: string;
    openInNewTab?: boolean;
  };
}
