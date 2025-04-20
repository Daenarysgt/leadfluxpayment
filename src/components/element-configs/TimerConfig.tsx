import { useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlignLeft, AlignCenter, AlignRight, Clock, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { AdvancedColorPicker } from "./common/AdvancedColorPicker";

interface TimerConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const TimerConfig = ({ element, onUpdate }: TimerConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  
  // Function to update content
  const updateContent = (updates: any) => {
    onUpdate({
      content: {
        ...content,
        ...updates
      }
    });
  };
  
  // Function to update style
  const updateStyle = (updates: any) => {
    onUpdate({
      content: {
        ...content,
        style: {
          ...(content.style || {}),
          ...updates
        }
      }
    });
  };
  
  // Handlers for time inputs
  const handleTimeChange = (field: string, value: number) => {
    // Validate the input number is non-negative
    const numValue = Math.max(0, value);
    updateContent({ [field]: numValue });
  };
  
  return (
    <Tabs defaultValue="content">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
        <TabsTrigger value="display" className="flex-1">Exibição</TabsTrigger>
        <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
      </TabsList>
      
      {/* Content Tab */}
      <TabsContent value="content" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={content.title || ""}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Conta Regressiva"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={content.description || ""}
              onChange={(e) => updateContent({ description: e.target.value })}
              placeholder="Aproveite esta oferta especial por tempo limitado!"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label>Configuração do Tempo</Label>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="space-y-1">
                <Label htmlFor="hours" className="text-xs">Horas</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={content.hours !== undefined ? content.hours : 0}
                  onChange={(e) => handleTimeChange("hours", parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="minutes" className="text-xs">Minutos</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={content.minutes !== undefined ? content.minutes : 30}
                  onChange={(e) => handleTimeChange("minutes", parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="seconds" className="text-xs">Segundos</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={content.seconds !== undefined ? content.seconds : 0}
                  onChange={(e) => handleTimeChange("seconds", parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expireText">Texto após expiração</Label>
            <Input
              id="expireText"
              value={content.expireText || ""}
              onChange={(e) => updateContent({ expireText: e.target.value })}
              placeholder="Oferta Expirada!"
            />
          </div>
        </div>
      </TabsContent>
      
      {/* Display Tab */}
      <TabsContent value="display" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showDays">Mostrar Dias</Label>
            <Switch
              id="showDays"
              checked={content.showDays === true}
              onCheckedChange={(checked) => updateContent({ showDays: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showHours">Mostrar Horas</Label>
            <Switch
              id="showHours"
              checked={content.showHours !== false}
              onCheckedChange={(checked) => updateContent({ showHours: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showMinutes">Mostrar Minutos</Label>
            <Switch
              id="showMinutes"
              checked={content.showMinutes !== false}
              onCheckedChange={(checked) => updateContent({ showMinutes: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showSeconds">Mostrar Segundos</Label>
            <Switch
              id="showSeconds"
              checked={content.showSeconds !== false}
              onCheckedChange={(checked) => updateContent({ showSeconds: checked })}
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label>Tamanho do Timer</Label>
            <Select
              value={style.size || "medium"}
              onValueChange={(value) => updateStyle({ size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Médio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>
      
      {/* Style Tab */}
      <TabsContent value="style" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Alinhamento do Título</Label>
            <ToggleGroup 
              type="single" 
              value={style.titleAlign || "center"}
              onValueChange={(value) => value && updateStyle({ titleAlign: value })}
              className="justify-start"
            >
              <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Centralizar">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Alinhar à direita">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento da Descrição</Label>
            <ToggleGroup 
              type="single" 
              value={style.descriptionAlign || "center"}
              onValueChange={(value) => value && updateStyle({ descriptionAlign: value })}
              className="justify-start"
            >
              <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Centralizar">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Alinhar à direita">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento do Timer</Label>
            <ToggleGroup 
              type="single" 
              value={style.timerAlign || "center"}
              onValueChange={(value) => value && updateStyle({ timerAlign: value })}
              className="justify-start"
            >
              <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Centralizar">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Alinhar à direita">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label>Cor do texto</Label>
            <AdvancedColorPicker
              value={style.textColor || "#111827"}
              onChange={(color) => updateStyle({ textColor: color })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor de fundo dos dígitos</Label>
            <AdvancedColorPicker
              value={style.digitBackgroundColor || "#F3F4F6"}
              onChange={(color) => updateStyle({ digitBackgroundColor: color })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor do texto dos dígitos</Label>
            <AdvancedColorPicker
              value={style.digitTextColor || "#1F2937"}
              onChange={(color) => updateStyle({ digitTextColor: color })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor das legendas</Label>
            <AdvancedColorPicker
              value={style.labelTextColor || "#6B7280"}
              onChange={(color) => updateStyle({ labelTextColor: color })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor do texto de expiração</Label>
            <AdvancedColorPicker
              value={style.expireTextColor || "#EF4444"}
              onChange={(color) => updateStyle({ expireTextColor: color })}
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label>Cor de fundo</Label>
            <AdvancedColorPicker
              value={style.backgroundColor || "#FFFFFF"}
              onChange={(color) => updateStyle({ backgroundColor: color })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor da borda</Label>
            <AdvancedColorPicker
              value={style.borderColor || "#E5E7EB"}
              onChange={(color) => updateStyle({ borderColor: color })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Largura da borda</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[style.borderWidth || 1]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => updateStyle({ borderWidth: value[0] })}
              />
              <span className="w-8 text-center">{style.borderWidth || 1}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Raio da borda</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[style.borderRadius || 8]}
                min={0}
                max={24}
                step={1}
                onValueChange={(value) => updateStyle({ borderRadius: value[0] })}
              />
              <span className="w-8 text-center">{style.borderRadius || 8}</span>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TimerConfig; 