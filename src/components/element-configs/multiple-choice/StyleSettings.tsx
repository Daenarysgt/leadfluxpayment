import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Circle, Square, AlignLeft, AlignRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface StyleSettingsProps {
  showEmojis: boolean;
  showImages: boolean;
  borderRadius: number;
  hoverColor: string;
  allowMultipleSelection: boolean;
  indicatorType: 'circle' | 'square';
  indicatorAlign: 'left' | 'right';
  continueButtonText: string;
  onToggleEmojis: () => void;
  onToggleImages: () => void;
  onBorderRadiusChange: (value: number[]) => void;
  onHoverColorChange: (color: string) => void;
  onToggleMultipleSelection: () => void;
  onIndicatorTypeChange: (type: 'circle' | 'square') => void;
  onIndicatorAlignChange: (align: 'left' | 'right') => void;
  onContinueButtonTextChange: (text: string) => void;
}

const StyleSettings = ({
  showEmojis,
  showImages,
  borderRadius,
  hoverColor,
  allowMultipleSelection,
  indicatorType,
  indicatorAlign,
  continueButtonText,
  onToggleEmojis,
  onToggleImages,
  onBorderRadiusChange,
  onHoverColorChange,
  onToggleMultipleSelection,
  onIndicatorTypeChange,
  onIndicatorAlignChange,
  onContinueButtonTextChange
}: StyleSettingsProps) => {
  return (
    <div className="space-y-6">
      <h4 className="font-medium">Personalização</h4>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-emojis">Mostrar emojis</Label>
          <Switch
            id="show-emojis"
            checked={showEmojis}
            onCheckedChange={onToggleEmojis}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-images">Mostrar imagens</Label>
          <Switch
            id="show-images"
            checked={showImages}
            onCheckedChange={onToggleImages}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-multiple-selection">Permitir múltipla seleção</Label>
          <Switch
            id="allow-multiple-selection"
            checked={allowMultipleSelection}
            onCheckedChange={onToggleMultipleSelection}
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <Label className="text-sm font-medium">Tipo de indicador</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={indicatorType === 'circle' ? 'default' : 'outline'}
            size="sm"
            className={cn("flex-1 gap-2", indicatorType === 'circle' && "bg-violet-600")}
            onClick={() => onIndicatorTypeChange('circle')}
          >
            <Circle className="h-4 w-4" />
            Círculo
          </Button>
          <Button
            type="button"
            variant={indicatorType === 'square' ? 'default' : 'outline'}
            size="sm"
            className={cn("flex-1 gap-2", indicatorType === 'square' && "bg-violet-600")}
            onClick={() => onIndicatorTypeChange('square')}
          >
            <Square className="h-4 w-4" />
            Quadrado
          </Button>
        </div>
        
        <Label className="text-sm font-medium">Alinhamento do indicador</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={indicatorAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            className={cn("flex-1 gap-2", indicatorAlign === 'left' && "bg-violet-600")}
            onClick={() => onIndicatorAlignChange('left')}
          >
            <AlignLeft className="h-4 w-4" />
            Esquerda
          </Button>
          <Button
            type="button"
            variant={indicatorAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            className={cn("flex-1 gap-2", indicatorAlign === 'right' && "bg-violet-600")}
            onClick={() => onIndicatorAlignChange('right')}
          >
            <AlignRight className="h-4 w-4" />
            Direita
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="border-radius">Arredondamento de bordas</Label>
            <span className="text-sm text-gray-500">{borderRadius}px</span>
          </div>
          <Slider
            id="border-radius"
            min={0}
            max={20}
            step={1}
            value={[borderRadius]}
            onValueChange={onBorderRadiusChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hover-color">Cor do hover</Label>
          <div className="flex space-x-2">
            <div 
              className="h-10 w-10 rounded border"
              style={{ backgroundColor: hoverColor }}
            />
            <Input
              id="hover-color"
              type="text"
              value={hoverColor}
              onChange={(e) => onHoverColorChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {allowMultipleSelection && (
        <>
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="continue-button-text">Texto do botão continuar</Label>
            <Input
              id="continue-button-text"
              type="text"
              value={continueButtonText}
              onChange={(e) => onContinueButtonTextChange(e.target.value)}
              placeholder="Continuar"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StyleSettings;
