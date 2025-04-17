import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptionItem from "./OptionItem";

interface OptionsListProps {
  options: Array<{
    id: string;
    text: string;
    emoji?: string;
    image?: string;
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      hoverTextColor?: string;
      selectedBackgroundColor?: string;
      selectedBorderColor?: string;
      selectedTextColor?: string;
    };
    navigation?: {
      type: "next" | "step" | "url";
      stepId?: string;
      url?: string;
    };
  }>;
  showEmojis: boolean;
  showImages: boolean;
  emojiOptions: string[];
  steps?: Array<{ id: string; title: string }>;
  onOptionTextChange: (optionId: string, text: string) => void;
  onOptionEmojiChange: (optionId: string, emoji: string) => void;
  onOptionBackgroundColorChange: (optionId: string, color: string) => void;
  onOptionBorderColorChange: (optionId: string, color: string) => void;
  onOptionTextColorChange: (optionId: string, color: string) => void;
  onOptionHoverTextColorChange: (optionId: string, color: string) => void;
  onOptionSelectedBackgroundColorChange?: (optionId: string, color: string) => void;
  onOptionSelectedBorderColorChange?: (optionId: string, color: string) => void;
  onOptionSelectedTextColorChange?: (optionId: string, color: string) => void;
  onOptionNavigationTypeChange: (optionId: string, type: "next" | "step" | "url") => void;
  onOptionStepIdChange: (optionId: string, stepId: string) => void;
  onOptionUrlChange: (optionId: string, url: string) => void;
  onDeleteOption: (optionId: string) => void;
  onAddOption: () => void;
  onOptionSelectedStyleChange?: (optionId: string, property: string, value: string) => void;
}

const OptionsList = ({
  options,
  showEmojis,
  showImages,
  emojiOptions,
  steps = [],
  onOptionTextChange,
  onOptionEmojiChange,
  onOptionBackgroundColorChange,
  onOptionBorderColorChange,
  onOptionTextColorChange,
  onOptionHoverTextColorChange,
  onOptionSelectedBackgroundColorChange,
  onOptionSelectedBorderColorChange,
  onOptionSelectedTextColorChange,
  onOptionNavigationTypeChange,
  onOptionStepIdChange,
  onOptionUrlChange,
  onDeleteOption,
  onAddOption,
  onOptionSelectedStyleChange
}: OptionsListProps) => {
  // Handler para as cores de seleção
  const handleSelectedBackgroundColorChange = (optionId: string, color: string) => {
    if (onOptionSelectedStyleChange) {
      onOptionSelectedStyleChange(optionId, 'selectedBackgroundColor', color);
    } else if (onOptionSelectedBackgroundColorChange) {
      onOptionSelectedBackgroundColorChange(optionId, color);
    }
  };
  
  const handleSelectedBorderColorChange = (optionId: string, color: string) => {
    if (onOptionSelectedStyleChange) {
      onOptionSelectedStyleChange(optionId, 'selectedBorderColor', color);
    } else if (onOptionSelectedBorderColorChange) {
      onOptionSelectedBorderColorChange(optionId, color);
    }
  };
  
  const handleSelectedTextColorChange = (optionId: string, color: string) => {
    if (onOptionSelectedStyleChange) {
      onOptionSelectedStyleChange(optionId, 'selectedTextColor', color);
    } else if (onOptionSelectedTextColorChange) {
      onOptionSelectedTextColorChange(optionId, color);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Opções</h4>
      <div className="space-y-3">
        {options?.map((option) => (
          <OptionItem
            key={`option-${option.id}`}
            option={option}
            showEmojis={showEmojis}
            showImages={showImages}
            emojiOptions={emojiOptions}
            steps={steps}
            onTextChange={onOptionTextChange}
            onEmojiChange={onOptionEmojiChange}
            onBackgroundColorChange={onOptionBackgroundColorChange}
            onBorderColorChange={onOptionBorderColorChange}
            onTextColorChange={onOptionTextColorChange}
            onHoverTextColorChange={onOptionHoverTextColorChange}
            onSelectedBackgroundColorChange={handleSelectedBackgroundColorChange}
            onSelectedBorderColorChange={handleSelectedBorderColorChange}
            onSelectedTextColorChange={handleSelectedTextColorChange}
            onNavigationTypeChange={onOptionNavigationTypeChange}
            onStepIdChange={onOptionStepIdChange}
            onUrlChange={onOptionUrlChange}
            onDelete={onDeleteOption}
            canDelete={options.length > 1}
          />
        ))}
      </div>
      
      <Button
        variant="outline" 
        size="sm"
        onClick={onAddOption}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" /> Adicionar opção
      </Button>
    </div>
  );
};

export default OptionsList;
