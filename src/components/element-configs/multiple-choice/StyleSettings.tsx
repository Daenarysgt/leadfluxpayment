
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface StyleSettingsProps {
  showEmojis: boolean;
  showImages: boolean;
  borderRadius: number;
  hoverColor: string;
  onToggleEmojis: () => void;
  onToggleImages: () => void;
  onBorderRadiusChange: (value: number[]) => void;
  onHoverColorChange: (color: string) => void;
}

const StyleSettings = ({
  showEmojis,
  showImages,
  borderRadius,
  hoverColor,
  onToggleEmojis,
  onToggleImages,
  onBorderRadiusChange,
  onHoverColorChange
}: StyleSettingsProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Personalização</h4>

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
  );
};

export default StyleSettings;
