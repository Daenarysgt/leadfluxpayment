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
import { ChevronRight, CornerUpRight, ExternalLink, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  continueButtonNavigationType: "next" | "step" | "url" | "none";
  continueButtonStepId?: string;
  continueButtonUrl?: string;
  steps?: Array<{ id: string; title: string }>;
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
  onContinueButtonNavigationTypeChange: (type: "next" | "step" | "url" | "none") => void;
  onContinueButtonStepIdChange: (stepId: string) => void;
  onContinueButtonUrlChange: (url: string) => void;
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
  continueButtonNavigationType,
  continueButtonStepId,
  continueButtonUrl,
  steps = [],
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
  onContinueButtonNavigationTypeChange,
  onContinueButtonStepIdChange,
  onContinueButtonUrlChange
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowMultipleSelection"
                  checked={allowMultipleSelection}
                  onCheckedChange={(checked) => {
                    console.log("Switch toggled directly to:", checked);
                    onToggleMultipleSelection();
                  }}
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Button clicked to toggle", !allowMultipleSelection);
                    onToggleMultipleSelection();
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {allowMultipleSelection ? "Desativar" : "Ativar"}
                </button>
              </div>
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
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Navegação do botão continuar</Label>
                  <Select 
                    value={continueButtonNavigationType}
                    onValueChange={(value) => onContinueButtonNavigationTypeChange(value as "next" | "step" | "url" | "none")}
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
                  
                  {continueButtonNavigationType === "step" && steps.length > 0 && (
                    <div className="pt-1">
                      <Select 
                        value={continueButtonStepId || ""}
                        onValueChange={(value) => onContinueButtonStepIdChange(value)}
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
                  
                  {continueButtonNavigationType === "step" && steps.length === 0 && (
                    <div className="pt-1 text-xs text-amber-600">
                      Nenhuma etapa disponível. Crie etapas primeiro.
                    </div>
                  )}
                  
                  {continueButtonNavigationType === "url" && (
                    <div className="pt-1">
                      <Input
                        type="url"
                        placeholder="https://www.example.com"
                        className="h-8 text-xs"
                        value={continueButtonUrl || ""}
                        onChange={(e) => onContinueButtonUrlChange(e.target.value)}
                      />
                    </div>
                  )}
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
          </div>
        </CardContent>
      </Card>
    </Form>
  );
};

export default StyleSettings;
