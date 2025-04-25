import { Trash2, GripVertical, Image as ImageIcon, ExternalLink, ChevronRight, CornerUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AdvancedColorPicker } from "../common/AdvancedColorPicker";

interface OptionItemProps {
  option: {
    id: string;
    text: string;
    emoji?: string;
    image?: string;
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      selectedBackgroundColor?: string;
      selectedBorderColor?: string;
      selectedTextColor?: string;
    };
    navigation?: {
      type: "next" | "step" | "url" | "none";
      stepId?: string;
      url?: string;
    };
  };
  showEmojis: boolean;
  showImages: boolean;
  emojiOptions: string[];
  steps?: Array<{ id: string; title: string }>;
  onTextChange: (id: string, text: string) => void;
  onEmojiChange: (id: string, emoji: string) => void;
  onBackgroundColorChange: (id: string, color: string) => void;
  onBorderColorChange: (id: string, color: string) => void;
  onTextColorChange: (id: string, color: string) => void;
  onSelectedBackgroundColorChange?: (id: string, color: string) => void;
  onSelectedBorderColorChange?: (id: string, color: string) => void;
  onSelectedTextColorChange?: (id: string, color: string) => void;
  onNavigationTypeChange: (id: string, type: "next" | "step" | "url" | "none") => void;
  onStepIdChange: (id: string, stepId: string) => void;
  onUrlChange: (id: string, url: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  onOptionSelectedStyleChange?: (optionId: string, property: string, value: string) => void;
}

const OptionItem = ({
  option,
  showEmojis,
  showImages,
  emojiOptions,
  steps = [],
  onTextChange,
  onEmojiChange,
  onBackgroundColorChange,
  onBorderColorChange,
  onTextColorChange,
  onSelectedBackgroundColorChange,
  onSelectedBorderColorChange,
  onSelectedTextColorChange,
  onNavigationTypeChange,
  onStepIdChange,
  onUrlChange,
  onDelete,
  canDelete
}: OptionItemProps) => {
  const navigationType = option.navigation?.type || "next";
  
  return (
    <div key={option.id} className="space-y-3 p-3 border rounded-md">
      <div className="flex items-center space-x-2">
        <div className="cursor-move text-gray-400">
          <GripVertical className="h-5 w-5" />
        </div>
        
        {showEmojis && (
          <select
            value={option.emoji || "😊"}
            onChange={(e) => onEmojiChange(option.id, e.target.value)}
            className="text-xl border rounded p-1 w-14"
          >
            {emojiOptions.map(emoji => (
              <option key={emoji} value={emoji}>{emoji}</option>
            ))}
          </select>
        )}
        
        {showImages && (
          <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        
        <Input
          value={option.text}
          onChange={(e) => onTextChange(option.id, e.target.value)}
          className="flex-1"
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(option.id)}
          disabled={!canDelete}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`bg-color-${option.id}`} className="text-xs">Cor de fundo</Label>
          <div className="flex items-center space-x-2">
            <AdvancedColorPicker
              value={option.style?.backgroundColor || '#FFFFFF'}
              onChange={(color) => onBackgroundColorChange(option.id, color)}
              size="sm"
            />
            <span className="text-xs">{option.style?.backgroundColor || '#FFFFFF'}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`border-color-${option.id}`} className="text-xs">Cor da borda</Label>
          <div className="flex items-center space-x-2">
            <AdvancedColorPicker
              value={option.style?.borderColor || '#E5E7EB'}
              onChange={(color) => onBorderColorChange(option.id, color)}
              size="sm"
            />
            <span className="text-xs">{option.style?.borderColor || '#E5E7EB'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`text-color-${option.id}`} className="text-xs">Cor do texto</Label>
          <div className="flex items-center space-x-2">
            <AdvancedColorPicker
              value={option.style?.textColor || '#000000'}
              onChange={(color) => onTextColorChange(option.id, color)}
              size="sm"
            />
            <span className="text-xs">{option.style?.textColor || '#000000'}</span>
          </div>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <Label className="text-xs font-medium">Estilo quando selecionado</Label>
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="space-y-1">
          <Label htmlFor={`selected-bg-color-${option.id}`} className="text-xs">Cor de fundo</Label>
          <div className="flex items-center space-x-2">
            <AdvancedColorPicker
              value={option.style?.selectedBackgroundColor || '#f5f3ff'}
              onChange={(color) => onSelectedBackgroundColorChange && onSelectedBackgroundColorChange(option.id, color)}
              size="sm"
            />
            <span className="text-xs">{option.style?.selectedBackgroundColor || '#f5f3ff'}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`selected-border-color-${option.id}`} className="text-xs">Cor da borda</Label>
          <div className="flex items-center space-x-2">
            <AdvancedColorPicker
              value={option.style?.selectedBorderColor || '#8b5cf6'}
              onChange={(color) => onSelectedBorderColorChange && onSelectedBorderColorChange(option.id, color)}
              size="sm"
            />
            <span className="text-xs">{option.style?.selectedBorderColor || '#8b5cf6'}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 mt-2">
        <Label htmlFor={`selected-text-color-${option.id}`} className="text-xs">Cor do texto</Label>
        <div className="flex items-center space-x-2">
          <AdvancedColorPicker
            value={option.style?.selectedTextColor || '#4c1d95'}
            onChange={(color) => onSelectedTextColorChange && onSelectedTextColorChange(option.id, color)}
            size="sm"
          />
          <span className="text-xs">{option.style?.selectedTextColor || '#4c1d95'}</span>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="space-y-2">
        <Label className="text-xs">Navegação</Label>
        <Select 
          defaultValue={navigationType}
          onValueChange={(value) => onNavigationTypeChange(option.id, value as "next" | "step" | "url" | "none")}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecione a ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">
              <div className="flex items-center">
                <X className="h-3.5 w-3.5 mr-1.5" />
                <span>Nenhum</span>
              </div>
            </SelectItem>
            <SelectItem value="next" className="text-xs">
              <div className="flex items-center">
                <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
                <span>Ir para próxima etapa</span>
              </div>
            </SelectItem>
            <SelectItem value="step" className="text-xs">
              <div className="flex items-center">
                <CornerUpRight className="h-3.5 w-3.5 mr-1.5" />
                <span>Ir para etapa específica</span>
              </div>
            </SelectItem>
            <SelectItem value="url" className="text-xs">
              <div className="flex items-center">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                <span>Abrir URL externa</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {navigationType === "step" && steps.length > 0 && (
          <div className="pt-1">
            <Select 
              defaultValue={option.navigation?.stepId || ""}
              onValueChange={(value) => onStepIdChange(option.id, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione uma etapa" />
              </SelectTrigger>
              <SelectContent>
                {steps.map((step) => (
                  <SelectItem key={step.id} value={step.id} className="text-xs">
                    {step.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {navigationType === "step" && steps.length === 0 && (
          <div className="pt-1 text-xs text-amber-600">
            Nenhuma etapa disponível. Crie etapas primeiro.
          </div>
        )}
        
        {navigationType === "url" && (
          <div className="pt-1">
            <Input
              type="url"
              placeholder="https://www.example.com"
              className="h-8 text-xs"
              value={option.navigation?.url || ""}
              onChange={(e) => onUrlChange(option.id, e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionItem;
