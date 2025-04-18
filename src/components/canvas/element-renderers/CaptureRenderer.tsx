import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { safelyTrackEvent } from "@/utils/pixelUtils";
import { useStore } from "@/utils/store";
import { accessService } from "@/services/accessService";

interface CaptureField {
  id: string;
  type: string;
  placeholder: string;
}

const CaptureRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  
  // Inicializa o estado para cada campo de captura
  const [formValues, setFormValues] = useState<{[fieldId: string]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Get capture settings or use defaults
  const title = content?.title || "";
  const description = content?.description || "";
  const buttonText = content?.buttonText || content?.defaultButtonText || "Subscribe";
  const successMessage = content?.successMessage || "Thank you for subscribing!";
  const showButton = content?.showButton !== false; // Por padrão, mostra o botão
  
  // Configurações de navegação
  const navigation = content?.navigation || { type: "next" };
  
  // Configurações do Facebook Pixel
  const facebookEvent = content?.facebookEvent || "";
  const facebookCustomEventName = content?.facebookCustomEventName || "";
  const facebookEventParams = content?.facebookEventParams || {};
  const facebookEventDebugMode = content?.facebookEventDebugMode || false;
  
  // Detectar e migrar de versão antiga para nova
  let captureFields = content?.captureFields;
  
  if (!captureFields || !Array.isArray(captureFields) || captureFields.length === 0) {
    // Compatibilidade com versão anterior
    captureFields = [{
      id: uuidv4(),
      type: content?.captureType || 'email',
      placeholder: content?.placeholder || 'Your email address'
    }];
  }
  
  // Get style settings or use defaults
  const titleAlignment = content?.style?.titleAlignment || "center";
  const primaryColor = content?.style?.primaryColor || "#8B5CF6";
  const marginTop = content?.style?.marginTop;
  
  const handleChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const performNavigation = async () => {
    console.log("CaptureRenderer - performNavigation called");
    console.log("Navigation config:", navigation);
    
    if (!navigation) return;
    
    // Rastrear evento do Facebook Pixel se configurado
    if (previewMode && facebookEvent && facebookEvent !== "none") {
      // Determinar qual nome de evento usar
      const eventName = facebookEvent === "custom" 
        ? facebookCustomEventName 
        : facebookEvent;
      
      // Não enviar evento personalizado se o nome estiver vazio
      if (facebookEvent === "custom" && !facebookCustomEventName) {
        if (facebookEventDebugMode) {
          console.warn("Facebook Pixel: Nome de evento personalizado não definido");
        }
        return;
      }
      
      // Adicionar feedback visual/log quando estiver em modo de debug
      if (facebookEventDebugMode) {
        console.group("🔍 Facebook Pixel - Evento Disparado");
        console.log("Evento:", eventName);
        console.log("Parâmetros:", facebookEventParams);
        console.groupEnd();
      }

      safelyTrackEvent(eventName, facebookEventParams);
    }
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      console.log("Preview mode navigation with activeStep:", activeStep);
      console.log("Total steps:", funnel?.steps?.length);
      
      switch (navigation.type) {
        case "next":
          console.log("Preview mode: Navigate to next step");
          if (funnel && funnel.steps.length > 0) {
            const isLastStep = activeStep === funnel.steps.length - 1;
            console.log("Is last step?", isLastStep);
            
            if (isLastStep) {
              // Se for o último step, registrar o clique e marcar como conversão
              console.log("Registrando conversão para o funil:", funnel.id);
              try {
                // Registrar o clique do botão
                await accessService.registerStepInteraction(
                  funnel.id,
                  Number(activeStep + 1),
                  null,
                  'form_submit'
                );
                // Marcar como conversão
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso!");
              } catch (error) {
                console.error("Erro ao registrar conversão:", error);
              }
            } else if (activeStep < funnel.steps.length - 1) {
              onStepChange(activeStep + 1);
            }
          }
          break;
        case "step":
          if (navigation.stepId && funnel) {
            console.log("Preview mode: Navigate to specific step:", navigation.stepId);
            const stepIndex = funnel.steps.findIndex(step => step.id === navigation.stepId);
            if (stepIndex !== -1) {
              const isLastStep = stepIndex === funnel.steps.length - 1;
              console.log("Is last step (specific)?", isLastStep);
              
              if (isLastStep) {
                // Se for o último step, registrar o clique e marcar como conversão
                console.log("Registrando conversão para o funil (specific):", funnel.id);
                try {
                  // Registrar o clique do botão
                  await accessService.registerStepInteraction(
                    funnel.id,
                    Number(stepIndex + 1),
                    null,
                    'form_submit'
                  );
                  // Marcar como conversão
                  await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
                  console.log("Conversão registrada com sucesso (specific)!");
                } catch (error) {
                  console.error("Erro ao registrar conversão (specific):", error);
                }
              } else {
                onStepChange(stepIndex);
              }
            }
          }
          break;
        case "url":
          if (navigation.url) {
            console.log("Preview mode: Navigate to URL:", navigation.url);
            if (funnel) {
              // Marcar como conversão antes de redirecionar
              console.log("Registrando conversão antes de redirecionar:", funnel.id);
              try {
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso (URL)!");
              } catch (error) {
                console.error("Erro ao registrar conversão (URL):", error);
              }
            }
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    } else {
      // Handle navigation in canvas mode
      switch (navigation.type) {
        case "next":
          if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          break;
        case "step":
          if (navigation.stepId && currentFunnel) {
            const stepIndex = currentFunnel.steps.findIndex(step => step.id === navigation.stepId);
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex);
            }
          }
          break;
        case "url":
          if (navigation.url) {
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valida se todos os campos obrigatórios estão preenchidos
    const allFieldsFilled = captureFields.every(field => formValues[field.id]?.trim());
    
    if (allFieldsFilled) {
      setSubmitted(true);
      setFormValues({});
      
      // Executar a navegação e rastreamento de eventos
      await performNavigation();
      
      // Se estiver no modo de preview, reseta após 3 segundos para demonstração
      if (element.previewMode) {
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    }
  };

  const getInputType = (type: string) => {
    switch(type) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      default: return 'text';
    }
  };

  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: marginTop !== undefined ? `${marginTop}px` : undefined
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full" style={containerStyle}>
        {(title || description) && (
          <div className={cn("mb-4", `text-${titleAlignment}`)}>
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        )}
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            {captureFields.map((field) => (
              <Input
                key={field.id}
                type={getInputType(field.type)}
                placeholder={field.placeholder}
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full"
                required
              />
            ))}
            {showButton && (
              <Button 
                type="submit" 
                className="w-full"
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
              >
                {buttonText}
              </Button>
            )}
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="text-green-500 h-12 w-12 mb-2" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default CaptureRenderer;
