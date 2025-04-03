
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/utils/store";
import TitleInput from "./multiple-choice/TitleInput";
import OptionsList from "./multiple-choice/OptionsList";
import StyleSettings from "./multiple-choice/StyleSettings";
import { EMOJI_OPTIONS, DEFAULT_BORDER_RADIUS, DEFAULT_HOVER_COLOR } from "./multiple-choice/constants";

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
  const [hoverColor, setHoverColor] = useState(DEFAULT_HOVER_COLOR);

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
    
    // Get current hover color or default
    setHoverColor(element.content?.style?.hoverColor || DEFAULT_HOVER_COLOR);
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

  const handleOptionHoverTextColorChange = (optionId: string, hoverTextColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            hoverTextColor 
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

  const handleOptionNavigationTypeChange = (optionId: string, type: "next" | "step" | "url") => {
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
        textColor: "",
        hoverTextColor: ""
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
    
    // Create a deep copy of options to avoid reference issues
    const updatedOptions = element.content.options.map((option: any) => ({
      ...option,
      emoji: newShowEmojis ? (option.emoji || "😊") : undefined
    }));
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const toggleImages = () => {
    const newShowImages = !showImages;
    setShowImages(newShowImages);
    
    // Create a deep copy of options to avoid reference issues
    const updatedOptions = element.content.options.map((option: any) => ({
      ...option,
      image: newShowImages ? (option.image || "/placeholder.svg") : undefined
    }));
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const radius = value[0];
    setBorderRadius(radius);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          borderRadius: radius
        }
      }
    });
  };

  const handleHoverColorChange = (color: string) => {
    setHoverColor(color);
    
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          hoverColor: color
        }
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
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
        onOptionHoverTextColorChange={handleOptionHoverTextColorChange}
        onOptionNavigationTypeChange={handleOptionNavigationTypeChange}
        onOptionStepIdChange={handleOptionStepIdChange}
        onOptionUrlChange={handleOptionUrlChange}
        onDeleteOption={handleDeleteOption}
        onAddOption={handleAddOption}
      />

      <Separator />
      
      <StyleSettings 
        showEmojis={showEmojis}
        showImages={showImages}
        borderRadius={borderRadius}
        hoverColor={hoverColor}
        onToggleEmojis={toggleEmojis}
        onToggleImages={toggleImages}
        onBorderRadiusChange={handleBorderRadiusChange}
        onHoverColorChange={handleHoverColorChange}
      />
    </div>
  );
};

export default MultipleChoiceConfig;
