import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import { ChevronRight, ImageIcon } from "lucide-react";
import BaseElementRenderer from "./BaseElementRenderer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCallback, useMemo, useState, useEffect } from "react";
import { accessService } from "@/services/accessService";

const MultipleChoiceImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel } = useStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessingInteraction, setIsProcessingInteraction] = useState(false);
  
  // Adicionar estado para capturar dados do formulário
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  
  // Verificar se estamos em modo mobile
  const isMobile = previewMode && (previewProps as any)?.isMobile;
  
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
  
  // Memoize the options rendering to improve performance
  const renderedOptions = useMemo(() => {
    return content?.options ? content.options.map((option) => {
      const optionStyle = option.style || {};
      const backgroundColor = optionStyle.backgroundColor || funnelSettings.primaryColor || "#0F172A";
      const aspectRatio = optionStyle.aspectRatio || "1:1";
      const ratio = getAspectRatioValue(aspectRatio);
      
      // Novas propriedades
      const textAlign = optionStyle.textAlign || "left";
      const showArrows = content.showArrows !== false;
      const elementStyle = content.optionStyle || "default";
      
      // Bordas e arredondamento global
      const globalBorderRadius = content.borderRadius || 4;
      const showBorders = content.showBorders || false;
      const borderColor = content.borderColor || "#e2e8f0";
      
      // Estilos CSS com base no tipo de estilo selecionado
      let cardStyle: React.CSSProperties = { 
        borderRadius: `${globalBorderRadius}px`,
      };
      
      // Adicionar bordas se estiverem ativadas
      if (showBorders) {
        cardStyle = {
          ...cardStyle,
          border: `1px solid ${borderColor}`
        };
      }
      
      let textStyle: React.CSSProperties = {
        backgroundColor,
        fontFamily,
        fontSize: `${bodySize}px`,
        fontStyle,
        fontWeight,
        textDecoration,
        textTransform,
        textAlign,
        display: "flex",
        justifyContent: textAlign === "center" ? "center" : (textAlign === "right" ? "flex-end" : "flex-start"),
        alignItems: "center",
        // Estilos adicionais para garantir que o texto sempre apareça, especialmente em mobile
        position: "relative",
        width: "100%",
        color: "white", // Garantir que o texto seja visível
        padding: "8px",
        zIndex: 5
      };
      
      // Aplicar diferentes estilos com base na escolha do usuário
      switch (elementStyle) {
        case "flat":
          cardStyle = {
            ...cardStyle,
            boxShadow: "none",
            border: showBorders ? `1px solid ${borderColor}` : "1px solid #ddd",
          };
          break;
          
        case "3d":
          cardStyle = {
            ...cardStyle,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: showBorders ? `1px solid ${borderColor}` : "1px solid rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            position: "relative",
            overflow: "hidden",
          };
          break;
          
        case "neumorphism":
          cardStyle = {
            ...cardStyle,
            backgroundColor: "#f0f0f3",
            boxShadow: "10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff",
            border: showBorders ? `1px solid ${borderColor}` : "none"
          };
          textStyle = {
            ...textStyle,
            backgroundColor: "transparent",
            color: "#333"
          };
          break;
          
        case "glass":
          cardStyle = {
            ...cardStyle,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(4px)",
            border: showBorders ? `1px solid ${borderColor}` : "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          };
          break;
          
        default:
          // Estilo padrão, não fazer nada
          break;
      }
      
      // Classe CSS para o efeito 3D
      const card3DClass = elementStyle === "3d" 
        ? "option-3d" 
        : "";
      
      return (
        <div 
          key={option.id} 
          className={`relative overflow-hidden cursor-pointer transition-all hover:scale-[1.03] ${card3DClass}`}
          style={{
            ...cardStyle,
            // Garantir que no mobile a altura mínima seja suficiente
            minHeight: isMobile ? "120px" : "auto",
          }}
          onClick={() => handleOptionClick(option)}
        >
          <div className="relative">
            {aspectRatio !== "original" && ratio ? (
              <AspectRatio ratio={ratio} className="w-full">
                {option.image ? (
                  <img 
                    src={option.image} 
                    alt={option.text} 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      console.error("MultipleChoiceImageRenderer - Erro ao carregar imagem:", e);
                      // Substituir por placeholder em caso de erro
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </AspectRatio>
            ) : (
              <div className="relative">
                {option.image ? (
                  <img 
                    src={option.image} 
                    alt={option.text} 
                    className="w-full object-contain" 
                    onError={(e) => {
                      console.error("MultipleChoiceImageRenderer - Erro ao carregar imagem:", e);
                      // Substituir por placeholder em caso de erro
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Barra de texto com opção - Ajuste para garantir visibilidade em mobile */}
            <div className="absolute bottom-0 left-0 right-0 p-3" style={textStyle}>
              <span className="text-inherit font-medium flex-grow">{option.text}</span>
              {showArrows && <ChevronRight className="h-5 w-5 text-inherit ml-2" />}
            </div>
          </div>
        </div>
      );
    }) : null;
  }, [content?.options, content?.showArrows, content?.optionStyle, content?.borderRadius, content?.showBorders, content?.borderColor, getAspectRatioValue, handleOptionClick, fontFamily, bodySize, fontStyle, fontWeight, textDecoration, textTransform, funnelSettings.primaryColor, isMobile]);
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: content?.marginTop ? `${content.marginTop}px` : undefined,
    fontFamily
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {content?.title && (
          <h2 
            className="font-semibold text-center mb-4"
            style={{
              fontSize: `${headingSize}px`,
              fontFamily,
              lineHeight: String(lineHeight),
              fontStyle,
              fontWeight,
              textDecoration,
              textTransform
            }}
          >
            {content.title}
          </h2>
        )}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {renderedOptions}
        </div>
      </div>
      
      {/* Adicionar estilos CSS para o efeito 3D e compatibilidade mobile */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .option-3d {
          transform: perspective(1000px);
          transition: transform 0.3s;
        }
        .option-3d:hover {
          transform: perspective(1000px) rotateX(5deg) scale(1.03);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        /* Estilos adicionais para garantir a visibilidade em dispositivos móveis */
        @media (max-width: 768px) {
          .grid-cols-1 > div {
            margin-bottom: 16px;
          }
        }
      `}} />
      
    </BaseElementRenderer>
  );
};

export default MultipleChoiceImageRenderer;
