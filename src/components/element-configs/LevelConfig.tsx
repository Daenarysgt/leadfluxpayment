import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";

interface LevelConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const LevelConfig = ({ element, onUpdate }: LevelConfigProps) => {
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
              placeholder="Nível de Experiência"
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Descrição</ConfigLabel>
            <Textarea 
              value={content.valueDescription || ''} 
              onChange={(e) => handleContentChange('valueDescription', e.target.value)}
              placeholder="Descrição opcional do nível"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Nível atual: {content.value || 3}</ConfigLabel>
            <Slider 
              min={1} 
              max={content.maxValue || 5} 
              step={1}
              value={[content.value || 3]} 
              onValueChange={(values) => handleContentChange('value', values[0])}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Nível máximo: {content.maxValue || 5}</ConfigLabel>
            <Slider 
              min={3} 
              max={10} 
              step={1}
              value={[content.maxValue || 5]} 
              onValueChange={(values) => handleContentChange('maxValue', values[0])}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Texto do nível (ex: "Level 3 of 6")</ConfigLabel>
            <Input 
              value={content.levelText || 'Level %value% of %max%'} 
              onChange={(e) => handleContentChange('levelText', e.target.value)}
              placeholder="Level %value% of %max%"
            />
            <p className="text-xs text-gray-500">
              Use %value% para o valor atual e %max% para o valor máximo
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4 pb-16">
          <div className="space-y-2">
            <ConfigLabel>Cor da barra de progresso</ConfigLabel>
            <ColorPicker 
              value={style.primaryColor || '#8B5CF6'} 
              onChange={(color) => handleStyleChange('primaryColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Cor do texto do nível</ConfigLabel>
            <ColorPicker 
              value={style.levelTextColor || style.primaryColor || '#8B5CF6'} 
              onChange={(color) => handleStyleChange('levelTextColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Alinhamento do título</ConfigLabel>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  type="button"
                  className={`border rounded p-2 ${style.titleAlignment === align ? 'bg-primary text-white' : 'bg-background'}`}
                  onClick={() => handleStyleChange('titleAlignment', align)}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <ConfigLabel>Mostrar rótulos</ConfigLabel>
            <Switch 
              checked={style.showLabels !== false} 
              onCheckedChange={(checked) => handleStyleChange('showLabels', checked)}
            />
          </div>
          
          {style.showLabels !== false && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <ConfigLabel>Rótulo Inicial</ConfigLabel>
                <Input 
                  value={style.beginnerLabel || 'Beginner'} 
                  onChange={(e) => handleStyleChange('beginnerLabel', e.target.value)}
                  placeholder="Iniciante"
                />
              </div>
              
              <div className="space-y-2">
                <ConfigLabel>Rótulo Final</ConfigLabel>
                <Input 
                  value={style.expertLabel || 'Expert'} 
                  onChange={(e) => handleStyleChange('expertLabel', e.target.value)}
                  placeholder="Especialista"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <ConfigLabel>Cor dos rótulos</ConfigLabel>
                <ColorPicker 
                  value={style.labelsColor || '#6B7280'} 
                  onChange={(color) => handleStyleChange('labelsColor', color)}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <ConfigLabel>Mostrar porcentagem</ConfigLabel>
            <Switch 
              checked={style.showPercentage === true} 
              onCheckedChange={(checked) => handleStyleChange('showPercentage', checked)}
            />
          </div>
          
          {style.showPercentage === true && (
            <div className="space-y-2">
              <ConfigLabel>Cor da porcentagem</ConfigLabel>
              <ColorPicker 
                value={style.percentageColor || style.primaryColor || '#8B5CF6'} 
                onChange={(color) => handleStyleChange('percentageColor', color)}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LevelConfig;
