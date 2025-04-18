import { CanvasElement } from "@/types/canvasTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ConfigLabel } from "./common/ConfigLabel";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "./common/ColorPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SpacerConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const SpacerConfig = ({ element, onUpdate }: SpacerConfigProps) => {
  const content = element.content || {};
  const [activeTab, setActiveTab] = useState("dimensoes");
  
  // Configurações padrão se não existirem
  const height = content.height || 50;
  const backgroundColor = content.backgroundColor || "transparent";
  const border = content.border || false;
  const borderStyle = content.borderStyle || "dashed";
  const borderColor = content.borderColor || "#e5e7eb";
  const borderWidth = content.borderWidth || 1;
  const borderRadius = content.borderRadius || 0;
  const showVisualCue = content.showVisualCue !== false;
  const visualCueType = content.visualCueType || "line";
  const responsive = content.responsive || false;
  const mobileHeight = content.mobileHeight || height;
  const marginTop = content.marginTop || 0;
  const marginBottom = content.marginBottom || 0;
  
  // Atualiza o conteúdo do elemento
  const handleContentChange = (key: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        [key]: value
      }
    });
  };
  
  return (
    <div className="space-y-4 p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="dimensoes" className="flex-1">Dimensões</TabsTrigger>
          <TabsTrigger value="aparencia" className="flex-1">Aparência</TabsTrigger>
          <TabsTrigger value="avancado" className="flex-1">Avançado</TabsTrigger>
        </TabsList>
        
        {/* Tab de Dimensões */}
        <TabsContent value="dimensoes" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <ConfigLabel>Altura ({height}px)</ConfigLabel>
            </div>
            <Slider 
              value={[height]} 
              min={10} 
              max={500} 
              step={5} 
              onValueChange={(value) => handleContentChange('height', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <ConfigLabel>Margem Superior ({marginTop}px)</ConfigLabel>
            </div>
            <Slider 
              value={[marginTop]} 
              min={0} 
              max={100} 
              step={5} 
              onValueChange={(value) => handleContentChange('marginTop', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <ConfigLabel>Margem Inferior ({marginBottom}px)</ConfigLabel>
            </div>
            <Slider 
              value={[marginBottom]} 
              min={0} 
              max={100} 
              step={5} 
              onValueChange={(value) => handleContentChange('marginBottom', value[0])}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label className="text-sm font-medium">Design Responsivo</Label>
            <Switch 
              checked={responsive} 
              onCheckedChange={(checked) => handleContentChange('responsive', checked)}
            />
          </div>
          
          {responsive && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <ConfigLabel>Altura em dispositivos móveis ({mobileHeight}px)</ConfigLabel>
              </div>
              <Slider 
                value={[mobileHeight]} 
                min={5} 
                max={250} 
                step={5} 
                onValueChange={(value) => handleContentChange('mobileHeight', value[0])}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta altura será aplicada em telas menores que 768px.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Tab de Aparência */}
        <TabsContent value="aparencia" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Cor de Fundo</ConfigLabel>
            <div className="flex">
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => handleContentChange('backgroundColor', e.target.value)}
                className="h-8 w-full"
              />
              <ColorPicker
                value={backgroundColor}
                onChange={(color) => handleContentChange('backgroundColor', color)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label className="text-sm font-medium">Borda</Label>
            <Switch 
              checked={border} 
              onCheckedChange={(checked) => handleContentChange('border', checked)}
            />
          </div>
          
          {border && (
            <>
              <div className="space-y-2">
                <ConfigLabel>Estilo da Borda</ConfigLabel>
                <Select 
                  value={borderStyle} 
                  onValueChange={(value) => handleContentChange('borderStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Sólida</SelectItem>
                    <SelectItem value="dashed">Tracejada</SelectItem>
                    <SelectItem value="dotted">Pontilhada</SelectItem>
                    <SelectItem value="double">Dupla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <ConfigLabel>Cor da Borda</ConfigLabel>
                <div className="flex">
                  <Input
                    type="text"
                    value={borderColor}
                    onChange={(e) => handleContentChange('borderColor', e.target.value)}
                    className="h-8 w-full"
                  />
                  <ColorPicker
                    value={borderColor}
                    onChange={(color) => handleContentChange('borderColor', color)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <ConfigLabel>Largura da Borda ({borderWidth}px)</ConfigLabel>
                </div>
                <Slider 
                  value={[borderWidth]} 
                  min={1} 
                  max={10} 
                  step={1} 
                  onValueChange={(value) => handleContentChange('borderWidth', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <ConfigLabel>Raio da Borda ({borderRadius}px)</ConfigLabel>
                </div>
                <Slider 
                  value={[borderRadius]} 
                  min={0} 
                  max={50} 
                  step={1} 
                  onValueChange={(value) => handleContentChange('borderRadius', value[0])}
                />
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <Label className="text-sm font-medium">Mostrar Indicador Visual</Label>
            <Switch 
              checked={showVisualCue} 
              onCheckedChange={(checked) => handleContentChange('showVisualCue', checked)}
            />
          </div>
          
          {showVisualCue && (
            <div className="space-y-2">
              <ConfigLabel>Tipo de Indicador</ConfigLabel>
              <Select 
                value={visualCueType} 
                onValueChange={(value) => handleContentChange('visualCueType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="dots">Pontilhado</SelectItem>
                  <SelectItem value="arrows">Setas</SelectItem>
                  <SelectItem value="grip">Empunhadura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>
        
        {/* Tab Avançado */}
        <TabsContent value="avancado" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>ID CSS Personalizado (opcional)</ConfigLabel>
            <Input 
              value={content.customId || ''} 
              onChange={(e) => handleContentChange('customId', e.target.value)}
              placeholder="meu-espacador"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usado para CSS personalizado ou integrações específicas.
            </p>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Classes CSS Personalizadas (opcional)</ConfigLabel>
            <Input 
              value={content.customClass || ''} 
              onChange={(e) => handleContentChange('customClass', e.target.value)}
              placeholder="minha-classe outra-classe"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Adicione classes CSS separadas por espaço.
            </p>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>HTML data attribute (opcional)</ConfigLabel>
            <Input 
              value={content.dataAttribute || ''} 
              onChange={(e) => handleContentChange('dataAttribute', e.target.value)}
              placeholder="data-testid=meu-espacador"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Útil para testes automatizados ou tracking.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpacerConfig; 