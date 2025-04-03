
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";

interface HeightConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const HeightConfig = ({ element, onUpdate }: HeightConfigProps) => {
  const { content = {} } = element;
  const [height, setHeight] = useState(content.height || 170);
  const [minHeight, setMinHeight] = useState(content.minHeight || 140);
  const [maxHeight, setMaxHeight] = useState(content.maxHeight || 220);
  
  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setHeight(newHeight);
    
    onUpdate({
      content: {
        ...content,
        height: newHeight
      }
    });
  };
  
  const handleMinHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 100 && value < maxHeight) {
      setMinHeight(value);
      onUpdate({
        content: {
          ...content,
          minHeight: value
        }
      });
    }
  };
  
  const handleMaxHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value <= 250 && value > minHeight) {
      setMaxHeight(value);
      onUpdate({
        content: {
          ...content,
          maxHeight: value
        }
      });
    }
  };
  
  const handleManualHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minHeight && value <= maxHeight) {
      setHeight(value);
      onUpdate({
        content: {
          ...content,
          height: value
        }
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="basic">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1">Básico</TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">Avançado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label>Altura Padrão ({height} cm)</Label>
            <Slider
              value={[height]}
              min={minHeight}
              max={maxHeight}
              step={1}
              onValueChange={handleHeightChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Valor Específico</Label>
            <Input
              type="number"
              value={height}
              onChange={handleManualHeightChange}
              min={minHeight}
              max={maxHeight}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Altura Mínima (cm)</Label>
              <Input
                type="number"
                value={minHeight}
                onChange={handleMinHeightChange}
                min={100}
                max={maxHeight - 10}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Altura Máxima (cm)</Label>
              <Input
                type="number"
                value={maxHeight}
                onChange={handleMaxHeightChange}
                min={minHeight + 10}
                max={250}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeightConfig;
