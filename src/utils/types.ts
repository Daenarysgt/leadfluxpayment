export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  options?: Option[];
  required?: boolean;
  configuration?: Record<string, any>;
}

export interface Option {
  id: string;
  text: string;
  icon?: string;
  image?: string;
  emoji?: string;
}

export interface Funnel {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  settings: FunnelSettings;
  status: 'draft' | 'active';
  user_id: string;
  created_at: string;
  updated_at: string;
  conversion_rate?: number;
  slug?: string;
  password_hash?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  max_views?: number;
}

export interface Step {
  id: string;
  title: string;
  questions: Question[];
  showProgressBar?: boolean;
  buttonText: string;
  backButtonText?: string;
  canvasElements?: any[]; // Array de elementos do canvas para este step
  position?: number; // Posição do step no funil para garantir ordem correta
  order_index?: number; // Índice de ordenação no banco de dados
  funnel_id?: string; // Referência ao funil ao qual este step pertence
  created_at?: string;
  updated_at?: string;
}

export interface FunnelSettings {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  logo?: string;
  backgroundImage?: string;
  backgroundImageStyle?: 'cover' | 'contain' | 'repeat' | 'fixed';
  showProgressBar: boolean;
  collectLeadData: boolean;
  showPreviousButton?: boolean;
  termsAndConditions?: string;
  privacyPolicy?: string;
  
  // Design settings
  textColor?: string;
  headingSize?: string;
  bodySize?: string;
  containerWidth?: string;
  spacingVertical?: string;
  spacingHorizontal?: string;
  
  // Domain and SEO settings
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  
  // Integration settings
  webhookUrl?: string;
  
  // Facebook Pixel settings
  facebookPixelId?: string;
  pixelTracking?: {
    pageView?: boolean;
    completeRegistration?: boolean;
  };
  
  // Added missing properties with proper types
  accentColor?: string;
  textBold?: boolean; // Changed from string to boolean
  textItalic?: boolean; // Changed from string to boolean
  textUnderline?: boolean; // Changed from string to boolean
  textUppercase?: boolean; // Changed from string to boolean
  lineHeight?: string;
  borderRadius?: string;
  borderWidth?: string;
  shadowStrength?: string;
  autoSave?: boolean;
  showShareButtons?: boolean;
  favicon?: string;
}

export enum QuestionType {
  ShortText = "shortText",
  LongText = "longText",
  SingleChoice = "singleChoice",
  MultipleChoice = "multipleChoice",
  Email = "email",
  Phone = "phone",
  Name = "name",
  Gender = "gender",
  Rating = "rating",
  Date = "date",
  File = "file",
  Address = "address",
  Website = "website",
  Number = "number",
  ImageChoice = "imageChoice",
  Carousel = "carousel",
  Height = "height",
  Weight = "weight",
  Comparison = "comparison",
}

export interface FunnelResponse {
  id: string;
  funnelId: string;
  answers: Answer[];
  leadInfo?: LeadInfo;
  startedAt: Date;
  completedAt?: Date;
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface LeadInfo {
  name?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export enum ComponentType {
  Text = "text",
  Image = "image",
  Button = "button",
  Arguments = "arguments",
  Graphics = "graphics",
  Testimonials = "testimonials",
  Level = "level",
  Capture = "capture",
  Loading = "loading",
  Cartesian = "cartesian",
  Spacer = "spacer",
  MultipleChoice = "multipleChoice",
  MultipleChoiceImage = "multipleChoiceImage",
  Carousel = "carousel",
  Height = "height",
  Weight = "weight",
  Comparison = "comparison",
  Rating = "rating",
  Video = "video"
}

export interface TabOption {
  id: string;
  label: string;
}

export interface Navigation {
  type: "next" | "step" | "url" | "none";
  stepId?: string;
  url?: string;
  openInNewTab?: boolean;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  image?: string;
  emoji?: string;
  description?: string;
  style?: {
    backgroundColor?: string;
    selectedBackgroundColor?: string;
    borderColor?: string;
    selectedBorderColor?: string;
    textColor?: string;
    selectedTextColor?: string;
  };
  navigation?: Navigation;
}

export interface MultipleChoiceContent {
  title?: string;
  description?: string;
  options: MultipleChoiceOption[];
  style?: {
    borderRadius?: number;
    backgroundColor?: string;
  };
  showEmojis?: boolean;
  showImages?: boolean;
  allowMultipleSelection?: boolean;
  indicatorType?: 'circle' | 'square';
  indicatorAlign?: 'left' | 'right';
  indicatorColor?: string;
  indicatorIconColor?: string;
  continueButtonText?: string;
  helperText?: string;
  showHelperText?: boolean;
}
