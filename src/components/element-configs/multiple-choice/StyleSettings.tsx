import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface StyleSettingsProps {
  showEmojis: boolean;
  showImages: boolean;
  borderRadius: number;
  allowMultipleSelection: boolean;
  indicatorType: 'circle' | 'square';
  indicatorAlign: 'left' | 'right';
  indicatorColor: string;
  indicatorIconColor: string;
  continueButtonText: string;
  helperText: string;
  showHelperText: boolean;
  showIndicators: boolean;
  optionsStyle: 'flat' | '3d' | 'neumorphism' | 'glassmorphism';
  onToggleEmojis: () => void;
  onToggleImages: () => void;
  onBorderRadiusChange: (value: number[]) => void;
  onToggleMultipleSelection: () => void;
  onIndicatorTypeChange: (type: 'circle' | 'square') => void;
  onIndicatorAlignChange: (align: 'left' | 'right') => void;
  onIndicatorColorChange: (color: string) => void;
  onIndicatorIconColorChange: (color: string) => void;
  onContinueButtonTextChange: (text: string) => void;
  onHelperTextChange: (text: string) => void;
  onToggleHelperText: () => void;
  onToggleIndicators: () => void;
  onOptionsStyleChange: (style: 'flat' | '3d' | 'neumorphism' | 'glassmorphism') => void;
}

const StyleSettings: React.FC<StyleSettingsProps> = ({
  showEmojis,
  showImages,
  borderRadius,
  allowMultipleSelection,
  indicatorType,
  indicatorAlign,
  indicatorColor,
  indicatorIconColor,
  continueButtonText,
  helperText,
  showHelperText,
  showIndicators,
  optionsStyle,
  onToggleEmojis,
  onToggleImages,
  onBorderRadiusChange,
  onToggleMultipleSelection,
  onIndicatorTypeChange,
  onIndicatorAlignChange,
  onIndicatorColorChange,
  onIndicatorIconColorChange,
  onContinueButtonTextChange,
  onHelperTextChange,
  onToggleHelperText,
  onToggleIndicators,
  onOptionsStyleChange
}) => {
  const form = useForm();

  const renderStylePreview = (style: 'flat' | '3d' | 'neumorphism' | 'glassmorphism') => {
    const getPreviewStyles = () => {
      const baseStyles = {
        height: '24px',
        width: '100%',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      };

      switch(style) {
        case 'flat':
          return {
            ...baseStyles,
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0'
          };
        case '3d':
          return {
            ...baseStyles,
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.15)'
          };
        case 'neumorphism':
          return {
            ...baseStyles,
            backgroundColor: '#f0f0f0',
            boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.8)'
          };
        case 'glassmorphism':
          return {
            ...baseStyles,
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          };
        default:
          return baseStyles;
      }
    };

    return (
      <div style={getPreviewStyles()}></div>
    );
  };

  return (
    <Form {...form}>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Aparência</h3>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="optionsStyle" className="text-xs block">Estilo das opções</Label>
              <Select
                value={optionsStyle}
                onValueChange={(value) => 
                  onOptionsStyleChange(value as 'flat' | '3d' | 'neumorphism' | 'glassmorphism')
                }
              >
                <SelectTrigger id="optionsStyle" className="h-8 text-xs">
                  <SelectValue placeholder="Selecione um estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat" className="text-xs">
                    <div className="flex items-center gap-2">
                      <span>Plano (padrão)</span>
                      <div className="w-16">{renderStylePreview('flat')}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="3d" className="text-xs">
                    <div className="flex items-center gap-2">
                      <span>3D</span>
                      <div className="w-16">{renderStylePreview('3d')}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="neumorphism" className="text-xs">
                    <div className="flex items-center gap-2">
                      <span>Neumorfismo</span>
                      <div className="w-16">{renderStylePreview('neumorphism')}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="glassmorphism" className="text-xs">
                    <div className="flex items-center gap-2">
                      <span>Vidro</span>
                      <div className="w-16">{renderStylePreview('glassmorphism')}</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
            
            <Label htmlFor="showIndicators" className="text-xs flex items-center justify-between">
              Mostrar indicadores
              <Switch
                id="showIndicators"
                checked={showIndicators}
                onCheckedChange={onToggleIndicators}
              />
            </Label>
            
            {showIndicators && (
              <>
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
                
                <div className="pt-3">
                  <Label className="text-xs mb-2 block">Cor do indicador selecionado</Label>
                  <div className="flex space-x-2 items-center">
                    <div 
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: indicatorColor || '#8b5cf6' }}
                    />
                    <Input
                      value={indicatorColor}
                      onChange={(e) => onIndicatorColorChange(e.target.value)}
                      placeholder="#8b5cf6"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="pt-3">
                  <Label className="text-xs mb-2 block">Cor do ícone do indicador</Label>
                  <div className="flex space-x-2 items-center">
                    <div 
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: indicatorIconColor || '#FFFFFF' }}
                    />
                    <Input
                      value={indicatorIconColor}
                      onChange={(e) => onIndicatorIconColorChange(e.target.value)}
                      placeholder="#FFFFFF"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Form>
  );
};

export default StyleSettings;
