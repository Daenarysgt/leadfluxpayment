import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/utils/store";
import TitleInput from "./multiple-choice/TitleInput";
import OptionsList from "./multiple-choice/OptionsList";
import StyleSettings from "./multiple-choice/StyleSettings";
import { EMOJI_OPTIONS, DEFAULT_BORDER_RADIUS } from "./multiple-choice/constants";

interface MultipleChoiceConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const MultipleChoiceConfig = ({ element, onUpdate }: MultipleChoiceConfigProps) => {
  const { currentFunnel } = useStore();
  
  // Initialize state with values from the element
  const [showEmojis, setShowEmojis] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [borderRadius, setBorderRadius] = useState(DEFAULT_BORDER_RADIUS);
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false);
  const [indicatorType, setIndicatorType] = useState<'circle' | 'square'>('circle');
  const [indicatorAlign, setIndicatorAlign] = useState<'left' | 'right'>('left');
  const [indicatorColor, setIndicatorColor] = useState('#8b5cf6'); // Cor roxa padrão
  const [indicatorIconColor, setIndicatorIconColor] = useState('#FFFFFF'); // Cor branca padrão
  const [continueButtonText, setContinueButtonText] = useState("Continuar");
  const [helperText, setHelperText] = useState("Selecione uma ou mais opções para avançar");
  const [showHelperText, setShowHelperText] = useState(false);
  
  // Estado para navegação do botão continuar
  const [continueButtonNavigationType, setContinueButtonNavigationType] = useState<"next" | "step" | "url" | "none">("next");
  const [continueButtonStepId, setContinueButtonStepId] = useState<string>("");
  const [continueButtonUrl, setContinueButtonUrl] = useState<string>("");

  // Get steps from the current funnel
  const steps = currentFunnel?.steps.map(step => ({
    id: step.id,
    title: step.title
  })) || [];

  // Set initial state from element when it changes
  useEffect(() => {
    // Check if options exist and if any option has an emoji
    const hasEmojis = element.content?.options?.some((option: any) => !!option.emoji);
    setShowEmojis(hasEmojis || false);
    
    // Check if options exist and if any option has an image
    const hasImages = element.content?.options?.some((option: any) => !!option.image);
    setShowImages(hasImages || false);
    
    // Get current border radius or default
    setBorderRadius(element.content?.style?.borderRadius || DEFAULT_BORDER_RADIUS);
    
    // Get multiple selection setting
    const multipleSelection = !!element.content?.allowMultipleSelection;
    console.log("Setting initial allowMultipleSelection state:", multipleSelection, "from element:", element.content?.allowMultipleSelection);
    setAllowMultipleSelection(multipleSelection);
    
    // Get indicator type
    setIndicatorType(element.content?.indicatorType || 'circle');
    
    // Get indicator alignment
    setIndicatorAlign(element.content?.indicatorAlign || 'left');
    
    // Get indicator color
    setIndicatorColor(element.content?.indicatorColor || '#8b5cf6');
    
    // Get indicator icon color
    setIndicatorIconColor(element.content?.indicatorIconColor || '#FFFFFF');
    
    // Get continue button text
    setContinueButtonText(element.content?.continueButtonText || "Continuar");
    
    // Get helper text
    setHelperText(element.content?.helperText || "Selecione uma ou mais opções para avançar");
    
    // Get show helper text setting
    setShowHelperText(element.content?.showHelperText === true);
    
    // Set continue button navigation settings
    setContinueButtonNavigationType(element.content?.continueButtonNavigation?.type || "next");
    setContinueButtonStepId(element.content?.continueButtonNavigation?.stepId || "");
    setContinueButtonUrl(element.content?.continueButtonNavigation?.url || "");
  }, [element]);

  // Função para sincronizar a navegação de todas as opções com a navegação do botão Continuar
  const syncOptionsNavigationWithContinueButton = () => {
    if (!element.content?.options) return;
    
    // Obtém a navegação atual do botão Continuar
    const continueNavType = element.content?.continueButtonNavigation?.type || "next";
    const continueStepId = element.content?.continueButtonNavigation?.stepId || "";
    const continueUrl = element.content?.continueButtonNavigation?.url || "";
    
    // Prepara a navegação que será aplicada a todas as opções
    const newNavigation = {
      type: continueNavType
    };
    
    // Adiciona stepId ou url se necessário
    if (continueNavType === "step" && continueStepId) {
      Object.assign(newNavigation, { stepId: continueStepId });
    } else if (continueNavType === "url" && continueUrl) {
      Object.assign(newNavigation, { url: continueUrl });
    }
    
    // Atualiza todas as opções com a mesma navegação do botão Continuar
    const updatedOptions = element.content.options.map((option: any) => ({
      ...option,
      navigation: newNavigation
    }));
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  // These ensure our handlers apply the changes immediately
  const handleTitleChange = (title: string) => {
    onUpdate({
      content: {
        ...element.content,
        title
      }
    });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    const updatedOptions = element.content.options.map((option: any) => 
      option.id === optionId ? { ...option, text } : option
    );
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionEmojiChange = (optionId: string, emoji: string) => {
    const updatedOptions = element.content.options.map((option: any) => 
      option.id === optionId ? { ...option, emoji } : option
    );
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionBackgroundColorChange = (optionId: string, backgroundColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            backgroundColor 
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionBorderColorChange = (optionId: string, borderColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            borderColor 
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionTextColorChange = (optionId: string, textColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            textColor 
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionNavigationTypeChange = (optionId: string, type: "next" | "step" | "url" | "none") => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          navigation: { 
            ...(option.navigation || {}), 
            type
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionStepIdChange = (optionId: string, stepId: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          navigation: { 
            ...(option.navigation || {}), 
            type: "step",
            stepId
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionUrlChange = (optionId: string, url: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          navigation: { 
            ...(option.navigation || {}), 
            type: "url",
            url
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleAddOption = () => {
    const newOption = {
      id: crypto.randomUUID(),
      text: "Nova opção",
      emoji: showEmojis ? "😊" : undefined,
      image: showImages ? "/placeholder.svg" : undefined,
      style: {
        backgroundColor: "",
        borderColor: "",
        textColor: ""
      },
      navigation: {
        type: "next"
      }
    };
    
    onUpdate({
      content: {
        ...element.content,
        options: [...(element.content.options || []), newOption]
      }
    });
  };

  const handleDeleteOption = (optionId: string) => {
    const updatedOptions = element.content.options.filter((option: any) => option.id !== optionId);
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const toggleEmojis = () => {
    const newShowEmojis = !showEmojis;
    setShowEmojis(newShowEmojis);
    
    // Aplica ou remove emojis das opções
    const updatedOptions = element.content.options.map((option: any) => {
      if (newShowEmojis && !option.emoji) {
        // Se ativando emojis e a opção não tem emoji, adicionar um padrão
        return { 
          ...option, 
          emoji: "😊" // Emoji padrão
        };
      } else if (!newShowEmojis && option.emoji) {
        // Se desativando emojis e a opção tem emoji, remover
        const { emoji, ...optionWithoutEmoji } = option;
        return optionWithoutEmoji;
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions,
        showEmojis: newShowEmojis
      }
    });
  };

  const toggleImages = () => {
    const newShowImages = !showImages;
    setShowImages(newShowImages);
    
    // Aplica ou remove imagens das opções
    const updatedOptions = element.content.options.map((option: any) => {
      if (newShowImages && !option.image) {
        // Se ativando imagens e a opção não tem imagem, adicionar um padrão
        return { 
          ...option, 
          image: "/placeholder.svg" // Imagem padrão
        };
      } else if (!newShowImages && option.image) {
        // Se desativando imagens e a opção tem imagem, remover
        const { image, ...optionWithoutImage } = option;
        return optionWithoutImage;
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions,
        showImages: newShowImages
      }
    });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const radius = value[0];
    setBorderRadius(radius);
    
    // Atualiza o estilo global do elemento
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          borderRadius: radius
        }
      }
    });
  };

  const toggleMultipleSelection = () => {
    const newAllowMultipleSelection = !allowMultipleSelection;
    console.log("Toggling multiple selection from", allowMultipleSelection, "to", newAllowMultipleSelection);
    setAllowMultipleSelection(newAllowMultipleSelection);
    
    // Atualiza o estado de allowMultipleSelection
    onUpdate({
      content: {
        ...element.content,
        allowMultipleSelection: newAllowMultipleSelection
      }
    });
    
    // Se estiver ativando múltipla seleção, sincroniza a navegação de todas as opções
    // com a navegação do botão Continuar
    if (newAllowMultipleSelection) {
      console.log("Synchronizing options navigation with continue button");
      syncOptionsNavigationWithContinueButton();
    }
  };
  
  const handleIndicatorTypeChange = (type: 'circle' | 'square') => {
    setIndicatorType(type);
    
    onUpdate({
      content: {
        ...element.content,
        indicatorType: type
      }
    });
  };
  
  const handleIndicatorAlignChange = (align: 'left' | 'right') => {
    setIndicatorAlign(align);
    
    onUpdate({
      content: {
        ...element.content,
        indicatorAlign: align
      }
    });
  };
  
  const handleContinueButtonTextChange = (text: string) => {
    setContinueButtonText(text);
    
    onUpdate({
      content: {
        ...element.content,
        continueButtonText: text
      }
    });
  };
  
  const handleHelperTextChange = (text: string) => {
    setHelperText(text);
    
    onUpdate({
      content: {
        ...element.content,
        helperText: text
      }
    });
  };
  
  const toggleHelperText = () => {
    const newShowHelperText = !showHelperText;
    setShowHelperText(newShowHelperText);
    
    onUpdate({
      content: {
        ...element.content,
        showHelperText: newShowHelperText
      }
    });
  };
  
  const handleOptionSelectedStyleChange = (optionId: string, property: string, value: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            [property]: value 
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleIndicatorColorChange = (color: string) => {
    setIndicatorColor(color);
    
    onUpdate({
      content: {
        ...element.content,
        indicatorColor: color
      }
    });
  };
  
  const handleIndicatorIconColorChange = (color: string) => {
    setIndicatorIconColor(color);
    
    onUpdate({
      content: {
        ...element.content,
        indicatorIconColor: color
      }
    });
  };

  // Adicionar handlers para navegação do botão continuar
  const handleContinueButtonNavigationTypeChange = (type: "next" | "step" | "url" | "none") => {
    setContinueButtonNavigationType(type);
    
    onUpdate({
      content: {
        ...element.content,
        continueButtonNavigation: {
          ...(element.content.continueButtonNavigation || {}),
          type
        }
      }
    });
    
    // Se múltipla seleção estiver ativa, sincroniza a navegação de todas as opções
    if (allowMultipleSelection) {
      // Precisamos fazer isso após a atualização do estado, então usamos um setTimeout
      setTimeout(() => syncOptionsNavigationWithContinueButton(), 0);
    }
  };
  
  const handleContinueButtonStepIdChange = (stepId: string) => {
    setContinueButtonStepId(stepId);
    
    onUpdate({
      content: {
        ...element.content,
        continueButtonNavigation: {
          ...(element.content.continueButtonNavigation || {}),
          type: "step",
          stepId
        }
      }
    });
    
    // Se múltipla seleção estiver ativa, sincroniza a navegação de todas as opções
    if (allowMultipleSelection) {
      setTimeout(() => syncOptionsNavigationWithContinueButton(), 0);
    }
  };
  
  const handleContinueButtonUrlChange = (url: string) => {
    setContinueButtonUrl(url);
    
    onUpdate({
      content: {
        ...element.content,
        continueButtonNavigation: {
          ...(element.content.continueButtonNavigation || {}),
          type: "url",
          url
        }
      }
    });
    
    // Se múltipla seleção estiver ativa, sincroniza a navegação de todas as opções
    if (allowMultipleSelection) {
      setTimeout(() => syncOptionsNavigationWithContinueButton(), 0);
    }
  };

  return (
    <div className="p-4 pb-16 space-y-6">
      <TitleInput 
        title={element.content?.title || ""} 
        onChange={handleTitleChange} 
      />

      <Separator />
      
      <OptionsList 
        options={element.content?.options || []}
        allowMultipleSelection={allowMultipleSelection}
        showEmojis={showEmojis}
        showImages={showImages}
        emojiOptions={EMOJI_OPTIONS}
        steps={steps}
        onOptionTextChange={handleOptionTextChange}
        onOptionEmojiChange={handleOptionEmojiChange}
        onOptionBackgroundColorChange={handleOptionBackgroundColorChange}
        onOptionBorderColorChange={handleOptionBorderColorChange}
        onOptionTextColorChange={handleOptionTextColorChange}
        onOptionNavigationTypeChange={handleOptionNavigationTypeChange}
        onOptionStepIdChange={handleOptionStepIdChange}
        onOptionUrlChange={handleOptionUrlChange}
        onDeleteOption={handleDeleteOption}
        onAddOption={handleAddOption}
        onOptionSelectedStyleChange={handleOptionSelectedStyleChange}
      />

      <Separator />
      
      <StyleSettings 
        showEmojis={showEmojis}
        showImages={showImages}
        borderRadius={borderRadius}
        allowMultipleSelection={allowMultipleSelection}
        indicatorType={indicatorType}
        indicatorAlign={indicatorAlign}
        indicatorColor={indicatorColor}
        indicatorIconColor={indicatorIconColor}
        continueButtonText={continueButtonText}
        helperText={helperText}
        showHelperText={showHelperText}
        continueButtonNavigationType={continueButtonNavigationType}
        continueButtonStepId={continueButtonStepId}
        continueButtonUrl={continueButtonUrl}
        steps={steps}
        onToggleEmojis={toggleEmojis}
        onToggleImages={toggleImages}
        onBorderRadiusChange={handleBorderRadiusChange}
        onToggleMultipleSelection={toggleMultipleSelection}
        onIndicatorTypeChange={handleIndicatorTypeChange}
        onIndicatorAlignChange={handleIndicatorAlignChange}
        onIndicatorColorChange={handleIndicatorColorChange}
        onIndicatorIconColorChange={handleIndicatorIconColorChange}
        onContinueButtonTextChange={handleContinueButtonTextChange}
        onHelperTextChange={handleHelperTextChange}
        onToggleHelperText={toggleHelperText}
        onContinueButtonNavigationTypeChange={handleContinueButtonNavigationTypeChange}
        onContinueButtonStepIdChange={handleContinueButtonStepIdChange}
        onContinueButtonUrlChange={handleContinueButtonUrlChange}
      />
    </div>
  );
};

export default MultipleChoiceConfig;
