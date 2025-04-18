import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";
import { Label } from "@/components/ui/label";

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

  // Get style settings
  const primaryColor = style?.primaryColor || "#8B5CF6";
  const titleAlignment = style?.titleAlignment || "center";
  const showLabels = style?.showLabels !== false;
  const showMiddleLabel = style?.showMiddleLabel !== false;
  const showPercentage = style?.showPercentage === true;
  const beginnerLabel = style?.beginnerLabel || "Beginner";
  const expertLabel = style?.expertLabel || "Expert";
  const middleLabel = style?.middleLabel || "Intermediário";
  const labelsColor = style?.labelsColor || "#6B7280";
  const percentageColor = style?.percentageColor || primaryColor;
  const secondaryColor = style?.secondaryColor || "#8B5CF6";

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
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4 pb-16">
          <div className="space-y-2">
            <ConfigLabel>Cor da barra de progresso</ConfigLabel>
            <ColorPicker 
              value={primaryColor} 
              onChange={(color) => handleStyleChange('primaryColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Alinhamento do título</ConfigLabel>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  type="button"
                  className={`border rounded p-2 ${titleAlignment === align ? 'bg-primary text-white' : 'bg-background'}`}
                  onClick={() => handleStyleChange('titleAlignment', align)}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Labels settings */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Show Labels</Label>
              <Switch 
                checked={showLabels}
                onCheckedChange={(checked) => {
                  handleStyleChange('showLabels', checked);
                }}
              />
            </div>
            
            {showLabels && (
              <>
                <div className="flex justify-between items-center mt-2">
                  <Label className="text-sm font-medium">Show Middle Label</Label>
                  <Switch 
                    checked={showMiddleLabel}
                    onCheckedChange={(checked) => {
                      handleStyleChange('showMiddleLabel', checked);
                    }}
                  />
                </div>
              
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-2 block">Beginner Label</Label>
                    <Input
                      value={beginnerLabel}
                      onChange={(e) => {
                        handleStyleChange('beginnerLabel', e.target.value);
                      }}
                      className="h-8"
                    />
                  </div>
                  
                  {showMiddleLabel && (
                    <div>
                      <Label className="text-xs mb-2 block">Middle Label</Label>
                      <Input
                        value={middleLabel}
                        onChange={(e) => {
                          handleStyleChange('middleLabel', e.target.value);
                        }}
                        className="h-8"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-xs mb-2 block">Expert Label</Label>
                    <Input
                      value={expertLabel}
                      onChange={(e) => {
                        handleStyleChange('expertLabel', e.target.value);
                      }}
                      className="h-8"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-2 block">Labels Color</Label>
                  <div className="flex">
                    <Input
                      type="text"
                      value={labelsColor}
                      onChange={(e) => {
                        handleStyleChange('labelsColor', e.target.value);
                      }}
                      className="h-8 w-full"
                    />
                    <ColorPicker
                      value={labelsColor}
                      onChange={(color) => {
                        handleStyleChange('labelsColor', color);
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Percentage settings */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Show Percentage</Label>
              <Switch 
                checked={showPercentage}
                onCheckedChange={(checked) => {
                  handleStyleChange('showPercentage', checked);
                }}
              />
            </div>
            
            {showPercentage && (
              <div>
                <Label className="text-xs mb-2 block">Percentage Color</Label>
                <div className="flex">
                  <Input
                    type="text"
                    value={percentageColor}
                    onChange={(e) => {
                      handleStyleChange('percentageColor', e.target.value);
                    }}
                    className="h-8 w-full"
                  />
                  <ColorPicker
                    value={percentageColor}
                    onChange={(color) => {
                      handleStyleChange('percentageColor', color);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label className="text-xs mb-2 block">Primary Color</Label>
            <div className="flex">
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => {
                  handleStyleChange('primaryColor', e.target.value);
                }}
                className="h-8 w-full"
              />
              <ColorPicker
                value={primaryColor}
                onChange={(color) => {
                  handleStyleChange('primaryColor', color);
                }}
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs mb-2 block">Secondary Color</Label>
            <div className="flex">
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => {
                  handleStyleChange('secondaryColor', e.target.value);
                }}
                className="h-8 w-full"
              />
              <ColorPicker
                value={secondaryColor}
                onChange={(color) => {
                  handleStyleChange('secondaryColor', color);
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LevelConfig;
