
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";

interface RatingConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const RatingConfig = ({ element, onUpdate }: RatingConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  
  const [activeTab, setActiveTab] = useState("content");
  
  const handleContentChange = (key: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        [key]: value
      }
    });
  };
  
  const handleStyleChange = (key: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        style: {
          ...style,
          [key]: value
        }
      }
    });
  };

  return (
    <div className="space-y-4 p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Título</ConfigLabel>
            <Input 
              value={content.title || ''} 
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Avalie sua experiência"
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Descrição</ConfigLabel>
            <Textarea 
              value={content.description || ''} 
              onChange={(e) => handleContentChange('description', e.target.value)}
              placeholder="Por favor, avalie sua experiência conosco"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Valor mínimo</ConfigLabel>
            <Input 
              type="number"
              min={0}
              max={9}
              value={content.minValue ?? 1} 
              onChange={(e) => handleContentChange('minValue', Math.min(9, Math.max(0, parseInt(e.target.value) || 1)))}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Valor máximo</ConfigLabel>
            <Input 
              type="number"
              min={2}
              max={10}
              value={content.maxValue ?? 5} 
              onChange={(e) => handleContentChange('maxValue', Math.min(10, Math.max(2, parseInt(e.target.value) || 5)))}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Valor padrão selecionado: {content.defaultValue || 0}</ConfigLabel>
            <Slider 
              min={0} 
              max={content.maxValue || 5} 
              step={1}
              value={[content.defaultValue || 0]} 
              onValueChange={(values) => handleContentChange('defaultValue', values[0])}
            />
            <div className="text-xs text-muted-foreground">
              Zero significa nenhuma seleção padrão
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Tipo de avaliação</ConfigLabel>
            <Select 
              value={style.ratingType || 'stars'} 
              onValueChange={(value) => handleStyleChange('ratingType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Estrelas</SelectItem>
                <SelectItem value="numbers">Números</SelectItem>
                <SelectItem value="hearts">Corações</SelectItem>
                <SelectItem value="thumbs">Polegar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Cor ativa</ConfigLabel>
            <ColorPicker 
              value={style.activeColor || '#FFB400'} 
              onChange={(color) => handleStyleChange('activeColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Cor inativa</ConfigLabel>
            <ColorPicker 
              value={style.inactiveColor || '#D1D5DB'} 
              onChange={(color) => handleStyleChange('inactiveColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Tamanho</ConfigLabel>
            <Select 
              value={style.size || 'medium'} 
              onValueChange={(value) => handleStyleChange('size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Alinhamento</ConfigLabel>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  type="button"
                  className={`border rounded p-2 ${style.alignment === align ? 'bg-primary text-white' : 'bg-background'}`}
                  onClick={() => handleStyleChange('alignment', align)}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <ConfigLabel>Mostrar rótulos</ConfigLabel>
            <Switch 
              checked={style.showLabels === true} 
              onCheckedChange={(checked) => handleStyleChange('showLabels', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <ConfigLabel>Permitir meia avaliação</ConfigLabel>
            <Switch 
              checked={style.allowHalf === true} 
              onCheckedChange={(checked) => handleStyleChange('allowHalf', checked)}
            />
            <div className="text-xs text-muted-foreground">
              Somente para estrelas e corações
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RatingConfig;
