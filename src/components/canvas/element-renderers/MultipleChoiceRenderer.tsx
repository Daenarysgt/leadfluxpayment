import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import BaseElementRenderer from "./BaseElementRenderer";
import { useCallback, useState, useEffect } from "react";
import { accessService } from "@/services/accessService";
import { Check } from "lucide-react";

const MultipleChoiceRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isProcessingInteraction, setIsProcessingInteraction] = useState(false);
  
  // Adicionar estado para capturar dados do formulário
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  
  // Obter configurações globais do funil, se disponíveis
  const funnelSettings = element.previewProps?.funnel?.settings || {};
  
  // Destructure configuration options with defaults
  const {
    allowMultipleSelection = false,
    indicatorType = "circle", // circle or square
    indicatorAlign = "left", // left or right
    indicatorColor = funnelSettings.primaryColor || "#8b5cf6", // Cor primária do funil ou padrão roxa
    indicatorIconColor = "#FFFFFF", // Cor padrão branca
    continueButtonText = "Continuar",
    helperText = "Selecione uma ou mais opções para avançar",
    showHelperText = true,
    showIndicators = true, // Nova opção para controlar visibilidade dos indicadores
    showEmojis = true // Garantir que showEmojis seja considerado (adicionado explicitamente)
  } = content || {};
  
  // Get style settings
  const style = content?.style || {};
  const marginTop = style.marginTop;
  
  // Obter configurações de fonte específicas do elemento ou usar valores padrão
  const fontFamily = style.fontFamily || funnelSettings.fontFamily || 'Inter';
  const titleFontSize = style.titleFontSize || 20;
  const optionFontSize = style.optionFontSize || 16;
  const descriptionFontSize = style.descriptionFontSize || 14;
  
  // Obter configuração de negrito para opções
  const optionsBold = style.optionsBold || false;
  
  // Obter configurações de estilo das opções
  const optionsStyle = style.optionsStyle || 'flat';
  
  // Get border radius configuration
  const borderRadiusRaw = style.borderRadius !== undefined ? style.borderRadius : (funnelSettings.borderRadius || 8);
  const borderRadiusValue = typeof borderRadiusRaw === 'string' ? parseInt(borderRadiusRaw) : borderRadiusRaw;
  
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
  
  // Função para executar a navegação com base na opção selecionada
  const executeNavigation = useCallback(async (optionId: string) => {
    // Evita processamento duplicado
    if (isProcessingInteraction) {
      console.log("Já existe uma interação em processamento. Aguardando...");
      return;
    }
    
    setIsProcessingInteraction(true);
    
    try {
      const option = content.options.find((opt: any) => opt.id === optionId);
      if (!option) {
        console.error("Opção não encontrada:", optionId);
        setIsProcessingInteraction(false);
        return;
      }

      // Verificar se há configuração de navegação
      if (!option.navigation) {
        console.warn("Opção sem configuração de navegação:", option.text);
        setIsProcessingInteraction(false);
        return;
      }

      const navigationType = option.navigation.type;
      console.log("MultipleChoiceRenderer - executeNavigation with option:", option);
      console.log("Navigation type:", navigationType, "Navigation config:", option.navigation);

      // Se for tipo "none", não realiza navegação
      if (navigationType === "none") {
        console.log("Navegação do tipo 'none' - nenhuma ação será executada");
        setIsProcessingInteraction(false);
        return;
      }

      // Handle navigation differently based on preview mode
      if (previewMode && previewProps) {
        const { activeStep, onStepChange, funnel } = previewProps;
        console.log("Preview props:", { activeStep, funnel: funnel?.id });
        
        if (funnel) {
          try {
            // IMPORTANTE: Primeiro garantir que a sessão existe atualizando o progresso
            console.log("Garantindo que a sessão existe atualizando o progresso primeiro");
            await accessService.updateProgress(funnel.id, activeStep + 1, null);
            
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
            
            // Depois registrar a interação de escolha
            const selection = option.text || option.value;
            console.log("Registrando interação para funil:", funnel.id, "etapa:", activeStep + 1, "valor:", selection);
            
            // RESTAURAÇÃO: Voltar a usar a função original, mas agora com button_id
            const interactionPromise = accessService.registerStepInteraction(
              funnel.id,
              activeStep + 1,
              null, // usar sessionId atual
              'choice', // IMPORTANTE: garantir que o tipo seja sempre 'choice' para múltipla escolha
              selection, // Usar o texto completo da opção
              `choice-option-${option.id}` // Usar formato de ID que não será bloqueado
            );
            
            // Aguardar explicitamente a conclusão
            await interactionPromise;
            
            // Log para confirmar que os dados foram salvos
            console.log(`Interação registrada com sucesso para opção: "${selection}" (ID: ${option.id}) na etapa ${activeStep + 1}`);
            
            // MODIFICAÇÃO: Reduzimos o atraso para melhorar a experiência do usuário
            await new Promise(resolve => setTimeout(resolve, 100));
            
            switch (navigationType) {
              case "next":
                // Navegar para a próxima etapa
              if (activeStep < funnel.steps.length - 1) {
                  console.log("Navegando para próxima etapa:", activeStep + 1);
                  onStepChange(activeStep + 1);
                } else {
                  console.log("Já está na última etapa, não é possível avançar");
                }
                break;
                
              case "step":
                // Navegar para uma etapa específica
                if (option.navigation.stepId) {
                  const targetIndex = funnel.steps.findIndex(s => s.id === option.navigation.stepId);
                  if (targetIndex !== -1) {
                    console.log("Navegando para etapa específica:", targetIndex);
                    onStepChange(targetIndex);
              } else {
                    console.error("Etapa de destino não encontrada:", option.navigation.stepId);
                  }
                }
                break;
                
              case "url":
                // Navegar para uma URL externa
                if (option.navigation.url) {
                  console.log("Navegando para URL externa:", option.navigation.url);
                window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
                }
                break;
                
              default:
                console.log("Tipo de navegação desconhecido ou não implementado:", navigationType);
                break;
            }
          } catch (error) {
            console.error("Erro durante execução da navegação:", error);
          }
        } else {
          console.error("Objeto funnel não disponível em previewProps");
        }
      }
      // When in canvas mode (not in preview)
      else if (currentFunnel) {
        console.log("Executando navegação no modo canvas (editor)");
        
        // Determine the current step index
        const currentStepIndex = currentFunnel.steps.findIndex(step => 
          step.canvasElements.some(el => el.id === element.id)
        );
        
        if (currentStepIndex === -1) {
          console.error("Não foi possível encontrar o índice do passo atual");
          setIsProcessingInteraction(false);
          return;
        }
        
        switch (navigationType) {
          case "next":
            // Navegar para o próximo passo no editor
            if (currentStepIndex < currentFunnel.steps.length - 1) {
              console.log("Navegando para o próximo passo no editor:", currentStepIndex + 1);
              setCurrentStep(currentStepIndex + 1);
            }
            break;
            
          case "step":
            // Navegar para um passo específico no editor
            if (option.navigation.stepId) {
              const targetIndex = currentFunnel.steps.findIndex(s => s.id === option.navigation.stepId);
              if (targetIndex !== -1) {
                console.log("Navegando para passo específico no editor:", targetIndex);
                setCurrentStep(targetIndex);
              }
            }
            break;
            
          case "url":
            // No editor, apenas mostrar um alerta sobre a navegação externa
            if (option.navigation.url) {
              console.log("No editor, a navegação para URL externa seria:", option.navigation.url);
              // Não vamos abrir a URL de fato no modo editor
            }
            break;
        }
      }
    } catch (error) {
      console.error("Erro durante executeNavigation:", error);
    } finally {
      setIsProcessingInteraction(false);
    }
  }, [previewMode, previewProps, currentFunnel, setCurrentStep, currentStep, content?.options, isProcessingInteraction, formFields]);
  
  const handleOptionClick = useCallback((option: any) => {
    console.log("MultipleChoiceRenderer - Option clicked:", option, "Allow multiple:", allowMultipleSelection);
    
    if (allowMultipleSelection) {
      // Modo de seleção múltipla - apenas atualiza a seleção sem navegar
      setSelectedOptions(prev => {
        // Toggle selection
        return prev.includes(option.id) 
          ? prev.filter(id => id !== option.id) 
          : [...prev, option.id];
      });
    } else {
      // Modo de seleção única - seleciona e navega imediatamente
      console.log("Seleção única - navegando imediatamente");
      
      // Atualizar a seleção
      setSelectedOptions([option.id]);
      
      // Verificar se a opção tem configuração de navegação
      if (option.navigation) {
        console.log("Opção tem navegação configurada:", option.navigation);
        // Executar navegação diretamente - vamos remover o timeout pois o controle de estado já impede chamadas duplicadas
        executeNavigation(option.id);
      } else {
        console.log("Opção clicada não tem navegação configurada. Criando navegação padrão para próxima etapa.");
        
        // NOVA FUNCIONALIDADE: Se não houver navegação configurada em modo de seleção única,
        // criar uma navegação padrão para a próxima etapa
        
        // Criar objeto de navegação temporário diretamente no objeto option
        option.navigation = { type: "next" };
        
        // Executar navegação com a configuração padrão
        executeNavigation(option.id);
      }
    }
  }, [allowMultipleSelection, executeNavigation]);
  
  const handleContinue = useCallback(() => {
    console.log("MultipleChoiceRenderer - Continue button clicked with selections:", selectedOptions);
    
    if (selectedOptions.length === 0) {
      console.log("Nenhuma opção selecionada, ignorando");
      return;
    }
    
    // No modo de seleção múltipla, navegamos apenas quando o botão é clicado
    if (allowMultipleSelection && selectedOptions.length > 0) {
      // Obter a última opção selecionada para navegação
      const lastSelectedId = selectedOptions[selectedOptions.length - 1];
      executeNavigation(lastSelectedId);
    }
  }, [selectedOptions, allowMultipleSelection, executeNavigation]);
  
  // Definir o estilo dos indicadores
  const getIndicatorStyle = () => {
    const baseStyle = {
      width: indicatorType === 'circle' ? '24px' : '20px',
      height: indicatorType === 'circle' ? '24px' : '20px',
      backgroundColor: 'transparent',
      borderRadius: indicatorType === 'circle' ? '50%' : '4px',
      border: `2px solid ${indicatorColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    };
    
    return baseStyle;
  };
  
  // Obter o estilo para um indicador selecionado
  const getSelectedIndicatorStyle = () => {
    return {
      ...getIndicatorStyle(),
      backgroundColor: indicatorColor,
      border: `2px solid ${indicatorColor}`
    };
  };
  
  // Definir o estilo das opções com base na configuração
  const getOptionStyle = (isSelected: boolean) => {
    let optionStyle: React.CSSProperties = {
      border: `1px solid ${isSelected ? indicatorColor : '#e2e8f0'}`,
      borderRadius: `${borderRadiusValue}px`,
      padding: '10px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: indicatorAlign === 'left' ? 'flex-start' : 'space-between',
      gap: '12px',
      backgroundColor: isSelected ? `${indicatorColor}10` : 'white',
      fontFamily: formatFontFamily(fontFamily),
      fontSize: `${optionFontSize}px`,
      fontWeight: optionsBold ? 'bold' : 'normal'
    };
    
    // Aplicar estilos adicionais com base no estilo de opção
    switch (optionsStyle) {
      case '3d':
        optionStyle = {
          ...optionStyle,
          boxShadow: isSelected ? `0 4px 6px -1px ${indicatorColor}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: isSelected ? 'translateY(-2px)' : 'none'
        };
        break;
      case 'neumorphism':
        optionStyle = {
          ...optionStyle,
          backgroundColor: '#f0f0f0',
          boxShadow: isSelected
            ? `inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.7), 0 0 0 2px ${indicatorColor}`
            : '3px 3px 6px rgba(0,0,0,0.2), -3px -3px 6px rgba(255,255,255,0.7)',
          border: 'none'
        };
        break;
      case 'glassmorphism':
        optionStyle = {
          ...optionStyle,
          backgroundColor: isSelected ? `${indicatorColor}20` : 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(7px)',
          border: isSelected ? `1px solid ${indicatorColor}60` : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        };
        break;
    }
    
    return optionStyle;
  };
  
  // Função auxiliar para formatar nome de fonte
  const formatFontFamily = (font: string) => {
    return font.includes(' ') && !font.includes(',') && !font.includes('"') ? `"${font}"` : font;
  };
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: marginTop !== undefined ? `${marginTop}px` : undefined,
    fontFamily: formatFontFamily(fontFamily)
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {content?.title && (
          <h2 
            className={cn(
              "font-medium mb-4",
              style.titleAlignment === "center" ? "text-center" : 
              style.titleAlignment === "right" ? "text-right" : "text-left"
            )}
            style={{
              fontSize: `${titleFontSize}px`,
              fontFamily: formatFontFamily(fontFamily)
            }}
          >
            {content.title}
          </h2>
        )}
        
        {content?.description && (
          <p 
            className={cn(
              "mb-4 text-muted-foreground",
              style.titleAlignment === "center" ? "text-center" : 
              style.titleAlignment === "right" ? "text-right" : "text-left"
            )}
            style={{
              fontSize: `${descriptionFontSize}px`,
              fontFamily: formatFontFamily(fontFamily)
            }}
          >
            {content.description}
          </p>
        )}
        
        <div className="space-y-3">
          {content?.options?.map((option: any) => {
            const isSelected = selectedOptions.includes(option.id);
            const shouldShowIndicator = showIndicators;
            
            return (
              <div
                key={option.id}
                style={getOptionStyle(isSelected)}
                className="group"
                onClick={() => handleOptionClick(option)}
                role="button"
                tabIndex={0}
              >
                {/* Indicador à esquerda */}
                {shouldShowIndicator && indicatorAlign === 'left' && (
                  <div style={isSelected ? getSelectedIndicatorStyle() : getIndicatorStyle()}>
                    {isSelected && <Check className="h-3 w-3" style={{ color: indicatorIconColor }} />}
                  </div>
                )}
                
                <span className="flex-1 flex items-center">
                  {showEmojis && option.emoji && (
                    <span className="mr-2 text-3xl font-apple-emoji">{option.emoji}</span>
                  )}
                  {option.text}
                </span>
                
                {/* Indicador à direita */}
                {shouldShowIndicator && indicatorAlign === 'right' && (
                  <div style={isSelected ? getSelectedIndicatorStyle() : getIndicatorStyle()}>
                    {isSelected && <Check className="h-3 w-3" style={{ color: indicatorIconColor }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Estilo para garantir que os emojis sejam exibidos corretamente */}
        <style dangerouslySetInnerHTML={{ __html: `
          .font-apple-emoji {
            font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
          }
        `}} />
        
        {showHelperText && allowMultipleSelection && (
          <p 
            className="mt-2 text-sm text-muted-foreground"
            style={{
              fontSize: `${descriptionFontSize}px`,
              fontFamily: formatFontFamily(fontFamily)
            }}
          >
            {helperText}
          </p>
        )}
        
        {allowMultipleSelection && (
          <button 
            className={cn(
              "w-full mt-4 py-3 px-4 font-medium transition-all",
              selectedOptions.length > 0 
                ? "cursor-pointer opacity-100" 
                : "opacity-50 cursor-not-allowed",
              isProcessingInteraction && "opacity-70 cursor-wait"
            )}
            style={{
              backgroundColor: selectedOptions.length > 0 ? indicatorColor : "#f5f5f5", 
              color: selectedOptions.length > 0 ? "white" : "#a0a0a0",
              borderRadius: `${borderRadiusValue}px`,
              fontFamily: formatFontFamily(fontFamily),
              fontSize: `${optionFontSize}px`
            }}
            onClick={handleContinue}
            disabled={selectedOptions.length === 0 || isProcessingInteraction}
          >
            {isProcessingInteraction ? "Processando..." : continueButtonText}
          </button>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceRenderer;
