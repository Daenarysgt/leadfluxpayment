import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/utils/store";
import TitleInput from "./multiple-choice/TitleInput";
import OptionsList from "./multiple-choice/OptionsList";
import StyleSettings from "./multiple-choice/StyleSettings";
import { EMOJI_OPTIONS, DEFAULT_BORDER_RADIUS } from "./multiple-choice/constants";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lista de fontes disponíveis
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Raleway", label: "Raleway" },
  { value: "Oswald", label: "Oswald" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" }
];

interface MultipleChoiceConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const MultipleChoiceConfig = ({ element, onUpdate }: MultipleChoiceConfigProps) => {
  const { currentFunnel } = useStore();
  const [activeTab, setActiveTab] = useState<string>("content");
  
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
  const [showIndicators, setShowIndicators] = useState(element.content?.showIndicators !== false);
  const [marginTop, setMarginTop] = useState(element.content?.style?.marginTop || 0);
  
  // Novos estados para fonte e tamanhos
  const [fontFamily, setFontFamily] = useState(element.content?.style?.fontFamily || "Inter");
  const [titleFontSize, setTitleFontSize] = useState(element.content?.style?.titleFontSize || 20);
  const [optionFontSize, setOptionFontSize] = useState(element.content?.style?.optionFontSize || 16);
  const [descriptionFontSize, setDescriptionFontSize] = useState(element.content?.style?.descriptionFontSize || 14);
  
  // Novo estado para controlar o negrito das opções
  const [optionsBold, setOptionsBold] = useState(element.content?.style?.optionsBold || false);

  // Adicionar novo estado para o estilo das opções
  const [optionsStyle, setOptionsStyle] = useState<'flat' | '3d' | 'neumorphism' | 'glassmorphism'>(
    element.content?.style?.optionsStyle || 'flat'
  );

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
    setAllowMultipleSelection(element.content?.allowMultipleSelection || false);
    
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
    
    // Get show indicators setting (default é true)
    setShowIndicators(element.content?.showIndicators !== false);
    
    // Get optionsStyle setting (default é 'flat')
    setOptionsStyle(element.content?.style?.optionsStyle || 'flat');
    
    // Get margin top
    setMarginTop(element.content?.style?.marginTop || 0);
    
    // Obter configurações de fonte
    setFontFamily(element.content?.style?.fontFamily || "Inter");
    setTitleFontSize(element.content?.style?.titleFontSize || 20);
    setOptionFontSize(element.content?.style?.optionFontSize || 16);
    setDescriptionFontSize(element.content?.style?.descriptionFontSize || 14);
    
    // Obter configuração de negrito para opções
    setOptionsBold(element.content?.style?.optionsBold || false);
  }, [element]);

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
    setAllowMultipleSelection(newAllowMultipleSelection);
    
    onUpdate({
      content: {
        ...element.content,
        allowMultipleSelection: newAllowMultipleSelection
      }
    });
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
  
  const toggleIndicators = () => {
    const newShowIndicators = !showIndicators;
    setShowIndicators(newShowIndicators);
    
    onUpdate({
      content: {
        ...element.content,
        showIndicators: newShowIndicators
      }
    });
  };
  
  // Função para formatar corretamente nomes de fontes
  const formatFontFamily = (font: string) => {
    // Adicionar aspas apenas se o nome da fonte tiver espaço
    return font.includes(' ') ? `"${font}"` : font;
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

  const handleMarginTopChange = (value: number[]) => {
    const marginTopValue = value[0];
    setMarginTop(marginTopValue);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          marginTop: marginTopValue
        }
      }
    });
  };
  
  // Novas funções para atualizar as configurações de fonte
  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          fontFamily: value
        }
      }
    });
  };
  
  const handleTitleFontSizeChange = (value: number[]) => {
    const size = value[0];
    setTitleFontSize(size);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          titleFontSize: size
        }
      }
    });
  };
  
  const handleOptionFontSizeChange = (value: number[]) => {
    const size = value[0];
    setOptionFontSize(size);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          optionFontSize: size
        }
      }
    });
  };
  
  const handleDescriptionFontSizeChange = (value: number[]) => {
    const size = value[0];
    setDescriptionFontSize(size);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          descriptionFontSize: size
        }
      }
    });
  };

  // Nova função para atualizar configuração de negrito das opções
  const handleOptionsBoldChange = (value: boolean) => {
    setOptionsBold(value);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          optionsBold: value
        }
      }
    });
  };

  // Adicionar função para alterar o estilo das opções
  const handleOptionsStyleChange = (style: 'flat' | '3d' | 'neumorphism' | 'glassmorphism') => {
    setOptionsStyle(style);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content.style || {}),
          optionsStyle: style
        }
      }
    });
  };

  const handleOptionSelectedBackgroundColorChange = (optionId: string, backgroundColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            selectedBackgroundColor: backgroundColor 
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

  const handleOptionSelectedBorderColorChange = (optionId: string, borderColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            selectedBorderColor: borderColor 
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

  const handleOptionSelectedTextColorChange = (optionId: string, textColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            selectedTextColor: textColor 
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

  return (
    <div className="p-4 pb-16 space-y-6">
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        {/* Aba de Conteúdo */}
        <TabsContent value="content" className="space-y-6 pt-4">
          <TitleInput 
            title={element.content?.title || ""} 
            onChange={handleTitleChange} 
          />
          
          <Separator />
          
          <OptionsList 
            options={element.content?.options || []}
            showEmojis={showEmojis}
            showImages={showImages}
            emojiOptions={EMOJI_OPTIONS}
            steps={steps}
            onOptionTextChange={handleOptionTextChange}
            onOptionEmojiChange={handleOptionEmojiChange}
            onOptionBackgroundColorChange={handleOptionBackgroundColorChange}
            onOptionBorderColorChange={handleOptionBorderColorChange}
            onOptionTextColorChange={handleOptionTextColorChange}
            onSelectedBackgroundColorChange={handleOptionSelectedBackgroundColorChange}
            onSelectedBorderColorChange={handleOptionSelectedBorderColorChange}
            onSelectedTextColorChange={handleOptionSelectedTextColorChange}
            onOptionNavigationTypeChange={handleOptionNavigationTypeChange}
            onOptionStepIdChange={handleOptionStepIdChange}
            onOptionUrlChange={handleOptionUrlChange}
            onDeleteOption={handleDeleteOption}
            onAddOption={handleAddOption}
          />
        </TabsContent>
        
        {/* Aba de Estilo */}
        <TabsContent value="style" className="space-y-6 pt-4">
          {/* Seção de Aparência */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Aparência</h3>
            
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
              showIndicators={showIndicators}
              optionsStyle={optionsStyle}
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
              onToggleIndicators={toggleIndicators}
              onOptionsStyleChange={handleOptionsStyleChange}
            />
          </div>
        </TabsContent>
        
        {/* Aba de Configurações */}
        <TabsContent value="settings" className="space-y-6 pt-4">
          {/* Configurações de Fonte */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Fonte e Tipografia</h3>
            
            {/* Família de Fonte */}
            <div className="space-y-2">
              <Label htmlFor="font-family">Fonte</Label>
              <Select 
                value={fontFamily} 
                onValueChange={handleFontFamilyChange}
              >
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: formatFontFamily(font.value) }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tamanho da Fonte do Título */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title-font-size">Tamanho do Título: {titleFontSize}px</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleTitleFontSizeChange([Math.max(12, titleFontSize - 1)])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleTitleFontSizeChange([titleFontSize + 1])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Slider
                id="title-font-size"
                min={12}
                max={40}
                step={1}
                value={[titleFontSize]}
                onValueChange={handleTitleFontSizeChange}
              />
              <div className="p-2 border rounded-md bg-gray-50 overflow-hidden whitespace-nowrap text-ellipsis">
                <span 
                  style={{ 
                    fontFamily: formatFontFamily(fontFamily),
                    fontSize: `${titleFontSize}px`
                  }}
                >
                  Exemplo de título
                </span>
              </div>
            </div>
            
            {/* Tamanho da Fonte das Opções */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="option-font-size">Tamanho das Opções: {optionFontSize}px</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleOptionFontSizeChange([Math.max(10, optionFontSize - 1)])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleOptionFontSizeChange([optionFontSize + 1])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Slider
                id="option-font-size"
                min={10}
                max={32}
                step={1}
                value={[optionFontSize]}
                onValueChange={handleOptionFontSizeChange}
              />
              <div className="p-2 border rounded-md bg-gray-50">
                <span 
                  style={{ 
                    fontFamily: formatFontFamily(fontFamily),
                    fontSize: `${optionFontSize}px`,
                    fontWeight: optionsBold ? 'bold' : 'normal'
                  }}
                >
                  Exemplo de opção
                </span>
              </div>
            </div>
            
            {/* Negrito para Opções */}
            <div className="flex items-center justify-between space-y-0 pt-2">
              <Label htmlFor="options-bold">Texto das opções em negrito</Label>
              <Switch
                id="options-bold"
                checked={optionsBold}
                onCheckedChange={handleOptionsBoldChange}
              />
            </div>
            
            {/* Tamanho da Fonte das Descrições */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description-font-size">Tamanho das Descrições: {descriptionFontSize}px</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleDescriptionFontSizeChange([Math.max(8, descriptionFontSize - 1)])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleDescriptionFontSizeChange([descriptionFontSize + 1])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Slider
                id="description-font-size"
                min={8}
                max={24}
                step={1}
                value={[descriptionFontSize]}
                onValueChange={handleDescriptionFontSizeChange}
              />
              <div className="p-2 border rounded-md bg-gray-50 text-gray-500">
                <span 
                  style={{ 
                    fontFamily: formatFontFamily(fontFamily),
                    fontSize: `${descriptionFontSize}px`
                  }}
                >
                  Exemplo de descrição de opção
                </span>
              </div>
            </div>
            
            {/* Controle de Margem Superior */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="margin-top">Margem superior</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{marginTop}px</span>
                  <div className="flex flex-col">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5"
                      onClick={() => handleMarginTopChange([marginTop - 5])}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5"
                      onClick={() => handleMarginTopChange([marginTop + 5])}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Slider
                id="margin-top"
                min={-100}
                max={100}
                step={1}
                value={[marginTop]}
                onValueChange={handleMarginTopChange}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultipleChoiceConfig;
