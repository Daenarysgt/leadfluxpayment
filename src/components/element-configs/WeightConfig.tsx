
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";

interface WeightConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const WeightConfig = ({ element, onUpdate }: WeightConfigProps) => {
  const { content = {} } = element;
  const [weight, setWeight] = useState(content.weight || 70);
  const [minWeight, setMinWeight] = useState(content.minWeight || 40);
  const [maxWeight, setMaxWeight] = useState(content.maxWeight || 150);
  
  const handleWeightChange = (value: number[]) => {
    const newWeight = value[0];
    setWeight(newWeight);
    
    onUpdate({
      content: {
        ...content,
        weight: newWeight
      }
    });
  };
  
  const handleMinWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 20 && value < maxWeight) {
      setMinWeight(value);
      onUpdate({
        content: {
          ...content,
          minWeight: value
        }
      });
    }
  };
  
  const handleMaxWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value <= 300 && value > minWeight) {
      setMaxWeight(value);
      onUpdate({
        content: {
          ...content,
          maxWeight: value
        }
      });
    }
  };
  
  const handleManualWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minWeight && value <= maxWeight) {
      setWeight(value);
      onUpdate({
        content: {
          ...content,
          weight: value
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
            <Label>Peso Padrão ({weight} kg)</Label>
            <Slider
              value={[weight]}
              min={minWeight}
              max={maxWeight}
              step={1}
              onValueChange={handleWeightChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Valor Específico</Label>
            <Input
              type="number"
              value={weight}
              onChange={handleManualWeightChange}
              min={minWeight}
              max={maxWeight}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peso Mínimo (kg)</Label>
              <Input
                type="number"
                value={minWeight}
                onChange={handleMinWeightChange}
                min={20}
                max={maxWeight - 10}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Peso Máximo (kg)</Label>
              <Input
                type="number"
                value={maxWeight}
                onChange={handleMaxWeightChange}
                min={minWeight + 10}
                max={300}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeightConfig;
