import { cn } from "@/lib/utils";
import { CanvasElement, ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import { ChevronRight, ImageIcon } from "lucide-react";
import BaseElementRenderer from "./BaseElementRenderer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCallback, useMemo, useState, useEffect } from "react";
import { accessService } from "@/services/accessService";
import { Option } from "@/utils/types";

// Adicionar esta função para converter textos de aspect ratio em classes CSS
const getAspectRatioClass = (aspectRatio: string): string => {
  switch (aspectRatio) {
    case "16:9":
      return "aspect-video"; // 16:9
    case "1:1":
      return "aspect-square"; // 1:1
    case "9:16":
      return "aspect-[9/16]"; // 9:16
    case "4:3":
      return "aspect-[4/3]"; // 4:3
    default:
      return "aspect-square"; // Default 1:1
  }
};

type OptionStyle = {
  aspectRatio?: string;
  imagePosition?: string;
  verticalPosition?: string; // Added vertical position control
  textAlign?: string;
  showArrow?: boolean;
  cardStyle?: string;
};

export interface MultipleChoiceImageElement extends CanvasElement {
  text: string;
  options: Option[];
  required: boolean;
  fontSize: number;
  horizontalPosition: string;
  verticalPosition: string;
  showArrows: boolean;
  textAlignment: string;
  cardStyle: 'outline' | 'filled' | 'flat' | '3d' | 'neomorphism' | 'glass';
}

const MultipleChoiceImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel } = useStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessingInteraction, setIsProcessingInteraction] = useState(false);
  const isEditing = !previewMode;
  
  // Adicionar estado para capturar dados do formulário
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  
  // Obter os valores do formulário na página
  useEffect(() => {
    if (!previewMode || !previewProps?.funnel) return;
    
    // Buscar todos os inputs visíveis na página
    const captureInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    
    // Monitorar mudanças nesses campos
    const handleInputChange = () => {
      const updatedFormFields: Record<string, string> = {};
      
      captureInputs.forEach((input: HTMLInputElement) => {
        // Se o input tiver um valor, associar ao tipo de campo
        if (input.value.trim()) {
          // Identificar o tipo de campo pelo placeholder ou atributos
          let fieldType = 'text';
          if (input.type === 'email') fieldType = 'email';
          if (input.type === 'tel') fieldType = 'phone';
          
          // Tentar identificar pelo placeholder
          const placeholder = input.placeholder.toLowerCase();
          if (placeholder.includes('email')) fieldType = 'email';
          if (placeholder.includes('telefone') || placeholder.includes('whatsapp') || placeholder.includes('celular')) fieldType = 'phone';
          if (placeholder.includes('nome')) fieldType = 'name';
          
          updatedFormFields[fieldType] = input.value;
        }
      });
      
      setFormFields(updatedFormFields);
    };
    
    // Adicionar event listeners para todos os inputs
    captureInputs.forEach(input => {
      input.addEventListener('input', handleInputChange);
      // Capturar valores iniciais
      if ((input as HTMLInputElement).value) {
        handleInputChange();
      }
    });
    
    // Cleanup
    return () => {
      captureInputs.forEach(input => {
        input.removeEventListener('input', handleInputChange);
      });
    };
  }, [previewMode, previewProps]);
  
  // Obter configurações visuais do tema do funil, se houver
  const funnelSettings = previewProps?.funnel?.settings || {};
  
  // Estilo visual a partir das configurações
  const headingSize = content?.style?.headingSize || 20;
  const bodySize = content?.style?.bodySize || 16;
  const fontFamily = content?.style?.fontFamily || funnelSettings.fontFamily || "Inter";
  const lineHeight = content?.style?.lineHeight || 1.5;
  const fontStyle = content?.style?.fontStyle || "normal";
  const fontWeight = content?.style?.fontWeight || 400;
  const textDecoration = content?.style?.textDecoration || "none";
  const textTransform = content?.style?.textTransform || "none";
  
  // Arredondar bordas
  const borderRadiusValue = content?.style?.borderRadius || 4;
  
  // Add the getImagePositionStyle function
  const getImagePositionStyle = (horizontalPosition: string, verticalPosition: string) => {
    const objectPosition = {
      // Horizontal positioning
      left: 'left',
      center: 'center',
      right: 'right',
      // Vertical positioning
      top: 'top',
      middle: 'center',
      bottom: 'bottom'
    };
    
    return {
      objectPosition: `${objectPosition[horizontalPosition] || 'center'} ${objectPosition[verticalPosition] || 'center'}`
    };
  };

  // Function to get card style class based on cardStyle prop
  const getCardStyleClass = (cardStyle: string = 'outline') => {
    switch (cardStyle) {
      case 'filled':
        return 'bg-primary/10 border border-primary/20';
      case 'flat':
        return 'bg-white border border-gray-200';
      case '3d':
        return 'bg-white border border-gray-200 shadow-lg transform hover:-translate-y-1 transition-transform';
      case 'neomorphism':
        return 'bg-white shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.8)] border-none';
      case 'glass':
        return 'bg-white/20 backdrop-blur-md border border-white/30';
      case 'outline':
      default:
        return 'bg-transparent border border-gray-200';
    }
  };

  // Extract new properties with defaults
  const horizontalPosition = content?.horizontalPosition || 'center';
  const verticalPosition = content?.verticalPosition || 'middle';
  const showArrows = content?.showArrows !== undefined ? content.showArrows : true;
  const textAlignment = content?.textAlignment || 'center';
  const cardStyle = content?.cardStyle || 'outline';

  // Define all hooks consistently at the top level
  const handleOptionClick = useCallback(async (option: any) => {
    console.log("MultipleChoiceImageRenderer - Opção clicada:", option);
    
    if (isProcessingInteraction) {
      console.log("Já existe uma interação em processamento. Aguardando...");
      return;
    }
    
    setIsProcessingInteraction(true);
    setSelectedOption(option.id);
    
    try {
      // Se estamos no modo de preview, tentamos lidar com a navegação
    if (previewMode && previewProps) {
        const { activeStep, onStepChange, funnel } = previewProps;
        
        // Registrar a interação com o valor selecionado
        if (funnel) {
          const interactionValue = option.text || option.value || "Nova opção";
          console.log("Registrando interação com valor:", interactionValue, "para funil:", funnel.id, "etapa:", activeStep + 1);
          
          // Verificar se há dados do formulário para salvar
          if (Object.keys(formFields).length > 0) {
            console.log('Dados do formulário detectados para salvar:', formFields);
            try {
              // Salvar os dados do formulário
              await accessService.saveCaptureFormData(
                funnel.id,
                null, // sessionId será preenchido pelo serviço
                formFields
              );
              console.log('Dados do formulário salvos com sucesso junto com a escolha de opção');
            } catch (formError) {
              console.error("Erro ao salvar dados do formulário:", formError);
            }
          }
          
          // Registrar apenas uma única interação do tipo 'choice' para a opção selecionada pelo usuário
          await accessService.registerStepInteraction(
            funnel.id,
            Number(activeStep + 1),
            null,
            'choice',
            interactionValue,
            `choice-option-${option.id}` // Usar formato de ID que não será bloqueado
          );
          
          console.log(`Interação da imagem registrada com sucesso: "${interactionValue}" na etapa ${activeStep + 1}`);
          
          // Verificar se a opção tem configuração de navegação
          if (option.navigation) {
            console.log("Opção tem navegação configurada:", option.navigation);
            
            // Executa a navegação com base no tipo
            switch (option.navigation.type) {
              case "next":
                // Ir para o próximo passo
                if (activeStep < funnel.steps.length - 1) {
                  onStepChange(activeStep + 1);
                }
                break;
              case "step":
                // Ir para um passo específico
                if (option.navigation.stepId) {
                  const stepIndex = funnel.steps.findIndex(step => step.id === option.navigation.stepId);
                  if (stepIndex !== -1) {
                    onStepChange(stepIndex);
                  }
                }
                break;
              case "url":
                // Navegar para uma URL externa
                if (option.navigation.url) {
                  window.open(option.navigation.url, "_blank");
                }
                break;
              default:
                // Caso "none" ou desconhecido, não faz navegação
                console.log("Sem navegação configurada ou tipo desconhecido");
                break;
            }
          } else {
            // Comportamento padrão quando não há navegação configurada é ir para o próximo passo
            console.log("Sem navegação configurada, indo para o próximo passo por padrão");
            if (activeStep < funnel.steps.length - 1) {
              onStepChange(activeStep + 1);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao processar a interação:", error);
    } finally {
      // Adicionar um pequeno delay antes de resetar para evitar cliques acidentais duplicados
      setTimeout(() => {
        setIsProcessingInteraction(false);
      }, 300);
    }
  }, [previewMode, previewProps, isProcessingInteraction, formFields]);

  // Function to get the aspect ratio value - memoized
  const getAspectRatioValue = useCallback((aspectRatio: string | undefined): number | undefined => {
    switch (aspectRatio) {
      case "16:9":
        return 16/9;
      case "9:16":
        return 9/16;
      case "4:3":
        return 4/3;
      case "1:1":
        return 1;
      case "original":
        return undefined;
      default:
        return 1;
    }
  }, []);
  
  // Memoized rendered options
  const renderedOptions = useMemo(() => {
    const options = content?.options || [];
    
    return options.length > 0 ? options.map((option: any, index: number) => {
      const optionStyle = option.style || {};
      const aspectRatio = optionStyle.aspectRatio || "1:1";
      const textAlign = optionStyle.textAlign || textAlignment || "center";
      const isSelected = selectedOption === option.id;
      
      const cardClassName = cn(
        "relative rounded-lg overflow-hidden transition-all duration-300 border",
        isSelected && "ring-2 ring-primary",
        getCardStyleClass(cardStyle),
        {
          "border-gray-200 hover:border-primary/50": cardStyle === "outline",
          "border-0 bg-gray-100": cardStyle === "flat",
          "shadow-lg transform hover:scale-[1.02] active:scale-[0.98]": cardStyle === "3d",
          "shadow-[inset_0_0_5px_rgba(0,0,0,0.1)] bg-gray-50": cardStyle === "neomorphism",
          "bg-white/30 backdrop-blur-sm border-white/20": cardStyle === "glass",
        }
      );

      return (
        <div
          key={option.id}
          className={cardClassName}
          onClick={() => (!isEditing && handleOptionClick) ? handleOptionClick(option) : null}
        >
          {option.imageUrl && (
            <div className={`w-full overflow-hidden ${getAspectRatioClass(aspectRatio)}`}>
              <img
                src={option.imageUrl}
                alt={option.text || `Option ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
                style={getImagePositionStyle(
                  optionStyle?.imagePosition || horizontalPosition || 'center',
                  optionStyle?.verticalPosition || verticalPosition || 'middle'
                )}
              />
            </div>
          )}

          <div 
            className={cn(
              "p-3 flex items-center space-x-2",
              isEditing ? "cursor-default" : "cursor-pointer"
            )}
          >
            <div className="flex-1" style={{ textAlign }}>
              <div 
                className={`p-2 ${
                  cardStyle === '3d' ? 'text-white' : 'text-gray-800'
                }`}
                style={{ textAlign: textAlign }}
              >
                {option.text}
              </div>
            </div>
            {showArrows && !isEditing && (
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                )}
                style={{ width: "28px", height: "28px" }}
              >
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      );
    }) : null;
  }, [content?.options, handleOptionClick, selectedOption, previewMode, horizontalPosition, verticalPosition, showArrows, textAlignment, cardStyle]);
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: content?.marginTop ? `${content.marginTop}px` : undefined,
    fontFamily
  };
  
  // Determine grid layout based on content configuration
  const gridLayout = useMemo(() => {
    // Default to 2 columns
    let columns = 2;
    
    // If we have a specific layout configuration in the content, use it
    if (content?.layout?.columns) {
      columns = content.layout.columns;
    }
    
    return `grid-cols-${columns}`;
  }, [content?.layout]);
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {content?.title && (
          <h2 
            className="font-semibold mb-4"
            style={{
              fontSize: `${headingSize}px`,
              fontFamily,
              lineHeight: String(lineHeight),
              fontStyle,
              fontWeight,
              textDecoration,
              textTransform,
              textAlign: textAlignment
            }}
          >
            {content.title}
          </h2>
        )}
        <div 
          className={`grid gap-4 ${gridLayout}`}
          style={{
            justifyContent: horizontalPosition === 'left' ? 'start' : 
                           horizontalPosition === 'right' ? 'end' : 'center'
          }}
        >
          {renderedOptions}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceImageRenderer;
