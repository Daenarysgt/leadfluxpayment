export interface LoadingElement {
  title?: string;
  description?: string;
  style?: {
    loadingStyle?: 'spinner' | 'dots' | 'progress';
    primaryColor?: string;
    size?: 'small' | 'medium' | 'large';
    titleAlignment?: 'left' | 'center' | 'right';
  };
  navigation?: {
    autoRedirect?: boolean;
    redirectDelay?: number;
    type?: 'next' | 'step' | 'url';
    stepId?: string;
    url?: string;
    openInNewTab?: boolean;
    showRedirectText?: boolean;
  };
} 