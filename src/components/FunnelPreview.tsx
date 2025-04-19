import { useStore } from "@/utils/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionType, Funnel } from "@/utils/types";
import { ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import CanvasPreview from "@/components/funnel-preview/CanvasPreview";
import FacebookPixel from '@/components/pixel/FacebookPixel';

interface FunnelPreviewProps {
  isMobile?: boolean;
  funnel?: Funnel;
  stepIndex?: number;
  onNextStep?: (index: number) => void;
}

const FunnelPreview = ({ isMobile = false, funnel, stepIndex = 0, onNextStep }: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
  }, [funnel?.id, currentFunnel?.id, stepIndex]);

  // If no funnel is available, show a message
  if (!activeFunnel) {
    return <div className="text-center py-8">No funnel selected</div>;
  }

  // Make sure activeStep is within bounds of available steps
  const safeCurrentStep = Math.min(activeStep, activeFunnel.steps.length - 1);
  const stepData = activeFunnel.steps[safeCurrentStep];
  
  // If for some reason stepData is undefined, display a fallback
  if (!stepData) {
    return <div className="text-center py-8">No step data available</div>;
  }
  
  const { primaryColor, backgroundColor, logo } = activeFunnel.settings;
  
  // Check if this is the last step of the funnel
  const isLastStep = safeCurrentStep === activeFunnel.steps.length - 1;

  // Custom styles based on funnel settings
  const customStyles = {
    "--primary-color": primaryColor,
    transition: 'background-color 0.3s ease'
  } as React.CSSProperties;

  // Debug log para verificar se o logo está chegando
  console.log("FunnelPreview - Logo encontrado nas settings:", !!logo, typeof logo);
  
  // Verificar se o logo é uma string base64 válida
  let validLogo = logo;
  if (typeof logo === 'string' && !logo.startsWith('data:image/')) {
    console.error("FunnelPreview - Logo não é uma string base64 válida");
    // Tentar corrigir formatos comuns de base64 sem o prefixo
    if (logo.startsWith('/9j/') || logo.startsWith('iVBOR')) {
      console.log("FunnelPreview - Tentando corrigir formato do logo");
      validLogo = `data:image/jpeg;base64,${logo}`;
    } else {
      validLogo = null;
    }
  }

  // Get the canvas elements from the current step's questions
  const canvasElements = stepData.canvasElements || [];

  const handleStepChange = (newStep: number) => {
    console.log("FunnelPreview - Changing step to:", newStep);
    setActiveStep(newStep);
    
    // Notify parent component if callback is provided
    if (onNextStep) {
      onNextStep(newStep);
    }
  };

  // Verificar se há imagem de fundo configurada para ajustar a visualização
  const hasBackgroundImage = !!activeFunnel.settings.backgroundImage;
  const useBackgroundOpacity = hasBackgroundImage && typeof activeFunnel.settings.backgroundOpacity === 'number';
  const contentStyle = 'transparent'; // Força estilo sempre como transparent
  
  // Classes condicionais baseadas no tipo de dispositivo
  const wrapperClass = isMobile 
    ? "w-full mobile-full-width relative" 
    : "w-full relative";
  
  const contentWrapperClass = isMobile 
    ? "flex flex-col items-center w-full mobile-full-width mx-auto py-4 px-4 mt-6 content-with-fixed-progress-bar" 
    : "flex flex-col items-center w-full max-w-lg mx-auto py-6 px-4 sm:py-10 sm:px-6 mt-8 content-with-fixed-progress-bar";
  
  const logoWrapperClass = isMobile
    ? "w-full flex justify-center py-4 mb-2" 
    : "w-full flex justify-center py-6 mb-4";
  
  // Progress bar classes (estilo da concorrência)
  const progressBarContainerClass = "funnel-progress-bar";
  
  const progressBarClass = "w-full h-0.5 bg-transparent";
  
  const contentClass = isMobile
    ? "w-full mobile-full-width mt-2"
    : "w-full mt-3";

  // Estilo do container principal específico para mobile
  const mainContainerStyle = isMobile ? {
    width: '100%',
    maxWidth: '100%',
    padding: 0,
    margin: 0,
    borderRadius: 0
  } : {};

  return (
    <div className={wrapperClass} style={{...customStyles, ...mainContainerStyle}}>
      {/* Facebook Pixel integration */}
      {activeFunnel.settings.facebookPixelId && (
        <FacebookPixel 
          pixelId={activeFunnel.settings.facebookPixelId}
          trackPageView={activeFunnel.settings.pixelTracking?.pageView !== false}
          trackRegistrationComplete={isLastStep && activeFunnel.settings.pixelTracking?.completeRegistration !== false}
        />
      )}
      
      {/* Progress Bar - com estilo da concorrência */}
      {activeFunnel.settings.showProgressBar && (
        <div className={progressBarContainerClass}>
          <div className="track"></div>
          <div 
            className="progress"
            style={{ 
              width: `${((safeCurrentStep + 1) / activeFunnel.steps.length) * 100}%`,
              backgroundColor: primaryColor 
            }}
          ></div>
        </div>
      )}
      
      {/* Add a spacer to account for the fixed progress bar */}
      <div className="h-4"></div>
      
      <div className={contentWrapperClass}>
        {/* Logotipo */}
        {validLogo && (
          <div className={logoWrapperClass}>
            <img 
              src={validLogo} 
              alt="Logo" 
              className="max-h-14 object-contain"
              onError={(e) => {
                console.error("FunnelPreview - Erro ao carregar logo:", e);
                // Esconder o elemento em caso de erro
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log("FunnelPreview - Logo carregado com sucesso");
              }}
            />
          </div>
        )}

        <div className={contentClass} style={mainContainerStyle}>
          {canvasElements && canvasElements.length > 0 ? (
            <CanvasPreview
              canvasElements={canvasElements}
              activeStep={safeCurrentStep}
              onStepChange={handleStepChange}
              funnel={activeFunnel}
            />
          ) : (
            // Otherwise, fall back to the traditional question rendering
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-center">{stepData.title}</h2>
              
              {stepData.questions.map((question) => (
                <div key={question.id} className="space-y-4">
                  <h3 className="font-medium">{question.title}</h3>
                  {question.description && (
                    <p className="text-sm text-muted-foreground">{question.description}</p>
                  )}
                  
                  {(question.type === QuestionType.ShortText || 
                    question.type === QuestionType.Email ||
                    question.type === QuestionType.Phone ||
                    question.type === QuestionType.Name ||
                    question.type === QuestionType.Website ||
                    question.type === QuestionType.Number) && (
                    <Input placeholder={`Enter your ${question.type}`} />
                  )}
                  
                  {question.type === QuestionType.LongText && (
                    <Textarea 
                      placeholder="Type your answer here..."
                      className="min-h-[100px]"
                    />
                  )}
                  
                  {(question.type === QuestionType.SingleChoice || 
                    question.type === QuestionType.MultipleChoice) && 
                    question.options && (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <div 
                          key={option.id} 
                          className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input 
                            type={question.type === QuestionType.SingleChoice ? "radio" : "checkbox"} 
                            id={option.id} 
                            name={question.id}
                            className="h-4 w-4"
                            style={{ accentColor: primaryColor }}
                          />
                          <Label htmlFor={option.id} className="cursor-pointer flex-1">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === QuestionType.ImageChoice && question.options && (
                    <div className="grid grid-cols-2 gap-4">
                      {question.options.map((option) => (
                        <div 
                          key={option.id} 
                          className="border rounded-md p-4 flex flex-col items-center hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          {option.emoji && (
                            <span className="text-2xl mb-3">{option.emoji}</span>
                          )}
                          {option.image && (
                            <img 
                              src={option.image} 
                              alt={option.text} 
                              className="w-full h-24 object-cover mb-3 rounded-md" 
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              id={option.id} 
                              name={question.id}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={option.id}>{option.text}</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 flex justify-center">
                {!isLastStep ? (
                  <Button 
                    type="button"
                    style={{
                      backgroundColor: primaryColor,
                      color: "white",
                      padding: "0.75rem 1.5rem"
                    }}
                    className="flex items-center gap-2"
                    onClick={() => handleStepChange(safeCurrentStep + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    style={{
                      backgroundColor: primaryColor,
                      color: "white",
                      padding: "0.75rem 1.5rem"
                    }}
                    className="flex items-center gap-2"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelPreview;
