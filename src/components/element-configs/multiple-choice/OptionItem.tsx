
import { Trash2, GripVertical, Image as ImageIcon, ExternalLink, ChevronRight, CornerUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
      hoverTextColor?: string;
    };
    navigation?: {
      type: "next" | "step" | "url";
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
  onHoverTextColorChange: (id: string, color: string) => void;
  onNavigationTypeChange: (id: string, type: "next" | "step" | "url") => void;
  onStepIdChange: (id: string, stepId: string) => void;
  onUrlChange: (id: string, url: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
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
  onHoverTextColorChange,
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
          size="icon"
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
          <div className="flex space-x-2">
            <div 
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: option.style?.backgroundColor || '#FFFFFF' }}
            />
            <Input
              id={`bg-color-${option.id}`}
              type="text"
              value={option.style?.backgroundColor || ''}
              onChange={(e) => onBackgroundColorChange(option.id, e.target.value)}
              placeholder="#FFFFFF"
              className="h-6 text-xs"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`border-color-${option.id}`} className="text-xs">Cor da borda</Label>
          <div className="flex space-x-2">
            <div 
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: option.style?.borderColor || '#E5E7EB' }}
            />
            <Input
              id={`border-color-${option.id}`}
              type="text"
              value={option.style?.borderColor || ''}
              onChange={(e) => onBorderColorChange(option.id, e.target.value)}
              placeholder="#E5E7EB"
              className="h-6 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`text-color-${option.id}`} className="text-xs">Cor do texto</Label>
          <div className="flex space-x-2">
            <div 
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: option.style?.textColor || '#000000' }}
            />
            <Input
              id={`text-color-${option.id}`}
              type="text"
              value={option.style?.textColor || ''}
              onChange={(e) => onTextColorChange(option.id, e.target.value)}
              placeholder="#000000"
              className="h-6 text-xs"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`hover-text-color-${option.id}`} className="text-xs">Cor do texto (hover)</Label>
          <div className="flex space-x-2">
            <div 
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: option.style?.hoverTextColor || '#000000' }}
            />
            <Input
              id={`hover-text-color-${option.id}`}
              type="text"
              value={option.style?.hoverTextColor || ''}
              onChange={(e) => onHoverTextColorChange(option.id, e.target.value)}
              placeholder="#000000"
              className="h-6 text-xs"
            />
          </div>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="space-y-2">
        <Label className="text-xs">Navegação</Label>
        <Select 
          defaultValue={navigationType}
          onValueChange={(value) => onNavigationTypeChange(option.id, value as "next" | "step" | "url")}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecione a ação" />
          </SelectTrigger>
          <SelectContent>
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
