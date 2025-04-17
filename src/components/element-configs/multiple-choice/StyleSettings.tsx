import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export interface StyleSettingsProps {
  showEmojis: boolean;
  showImages: boolean;
  borderRadius: number;
  allowMultipleSelection: boolean;
  indicatorType: 'circle' | 'square';
  indicatorAlign: 'left' | 'right';
  continueButtonText: string;
  helperText: string;
  showHelperText: boolean;
  onToggleEmojis: () => void;
  onToggleImages: () => void;
  onBorderRadiusChange: (value: number[]) => void;
  onToggleMultipleSelection: () => void;
  onIndicatorTypeChange: (type: 'circle' | 'square') => void;
  onIndicatorAlignChange: (align: 'left' | 'right') => void;
  onContinueButtonTextChange: (text: string) => void;
  onHelperTextChange: (text: string) => void;
  onToggleHelperText: () => void;
}

const StyleSettings: React.FC<StyleSettingsProps> = ({
  showEmojis,
  showImages,
  borderRadius,
  allowMultipleSelection,
  indicatorType,
  indicatorAlign,
  continueButtonText,
  helperText,
  showHelperText,
  onToggleEmojis,
  onToggleImages,
  onBorderRadiusChange,
  onToggleMultipleSelection,
  onIndicatorTypeChange,
  onIndicatorAlignChange,
  onContinueButtonTextChange,
  onHelperTextChange,
  onToggleHelperText
}) => {
  const form = useForm();

  return (
    <Form {...form}>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Aparência</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="showEmojis" className="text-xs flex items-center justify-between">
                  Mostrar Emojis
                  <Switch
                    id="showEmojis"
                    checked={showEmojis}
                    onCheckedChange={onToggleEmojis}
                  />
                </Label>
              </div>
              
              <div>
                <Label htmlFor="showImages" className="text-xs flex items-center justify-between">
                  Mostrar Imagens
                  <Switch
                    id="showImages"
                    checked={showImages}
                    onCheckedChange={onToggleImages}
                  />
                </Label>
              </div>
            </div>
            
            <div className="pt-2">
              <Label className="text-xs mb-2 block">Arredondamento das bordas</Label>
              <Slider
                defaultValue={[borderRadius]}
                max={20}
                step={1}
                onValueChange={onBorderRadiusChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Comportamento</h3>
            
            <Label htmlFor="allowMultipleSelection" className="text-xs flex items-center justify-between">
              Permitir múltipla seleção
              <Switch
                id="allowMultipleSelection"
                checked={allowMultipleSelection}
                onCheckedChange={onToggleMultipleSelection}
              />
            </Label>
            
            {allowMultipleSelection && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="showHelperText" className="text-xs flex items-center justify-between">
                  Mostrar texto de ajuda
                  <Switch
                    id="showHelperText"
                    checked={showHelperText}
                    onCheckedChange={onToggleHelperText}
                  />
                </Label>
                
                {showHelperText && (
                  <div className="pt-2">
                    <Label htmlFor="helperText" className="text-xs mb-1 block">Texto de ajuda</Label>
                    <Input
                      id="helperText"
                      value={helperText}
                      onChange={(e) => onHelperTextChange(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                )}
                
                <div className="pt-2">
                  <Label htmlFor="continueButtonText" className="text-xs mb-1 block">Texto do botão de continuar</Label>
                  <Input
                    id="continueButtonText"
                    value={continueButtonText}
                    onChange={(e) => onContinueButtonTextChange(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Indicadores</h3>
            
            <div>
              <Label className="text-xs mb-2 block">Tipo de indicador</Label>
              <RadioGroup
                defaultValue={indicatorType}
                value={indicatorType}
                onValueChange={(value) => onIndicatorTypeChange(value as 'circle' | 'square')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="circle" id="circle" />
                  <Label htmlFor="circle" className="text-xs">Círculo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="square" id="square" />
                  <Label htmlFor="square" className="text-xs">Quadrado</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="pt-2">
              <Label className="text-xs mb-2 block">Alinhamento do indicador</Label>
              <RadioGroup
                defaultValue={indicatorAlign}
                value={indicatorAlign}
                onValueChange={(value) => onIndicatorAlignChange(value as 'left' | 'right')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="left" />
                  <Label htmlFor="left" className="text-xs">Esquerda</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="right" />
                  <Label htmlFor="right" className="text-xs">Direita</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
};

export default StyleSettings;
