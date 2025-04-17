import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WeightConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const WeightConfig = ({ element, onUpdate }: WeightConfigProps) => {
  const { content = {} } = element;
  const [weight, setWeight] = useState(content.weight || 70);
  const [minWeight, setMinWeight] = useState(content.minWeight || 40);
  const [maxWeight, setMaxWeight] = useState(content.maxWeight || 150);
  
  // Unidade de medida (kg ou lb)
  const [unit, setUnit] = useState(content.unit || "kg");
  
  // Cores personalizadas
  const [bgColor, setBgColor] = useState(content.bgColor || "#000000");
  const [textColor, setTextColor] = useState(content.textColor || "#ffffff");
  
  // Constantes de conversão
  const KG_TO_LB = 2.20462;
  const LB_TO_KG = 0.453592;
  
  // Converter kg para lb e vice-versa
  const kgToLb = (kg: number): number => {
    return parseFloat((kg * KG_TO_LB).toFixed(1));
  };
  
  const lbToKg = (lb: number): number => {
    return Math.round(lb * LB_TO_KG);
  };
  
  // Obter o valor formatado conforme a unidade
  const getFormattedValue = (value: number, toUnit: string): number => {
    if (toUnit === "lb") {
      return kgToLb(value);
    }
    return value;
  };
  
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
    const inputValue = parseInt(e.target.value);
    
    if (!isNaN(inputValue)) {
      let kgValue = inputValue;
      
      // Converter para kg se o valor estiver em libras
      if (unit === "lb") {
        kgValue = lbToKg(inputValue);
      }
      
      // Validar se está dentro dos limites
      if (kgValue >= minWeight && kgValue <= maxWeight) {
        setWeight(kgValue);
        onUpdate({
          content: {
            ...content,
            weight: kgValue
          }
        });
      }
    }
  };
  
  const handleUnitChange = (value: string) => {
    setUnit(value);
    onUpdate({
      content: {
        ...content,
        unit: value
      }
    });
  };
  
  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBgColor(color);
    onUpdate({
      content: {
        ...content,
        bgColor: color
      }
    });
  };
  
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTextColor(color);
    onUpdate({
      content: {
        ...content,
        textColor: color
      }
    });
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
            <Label>Peso Padrão ({getFormattedValue(weight, unit)} {unit})</Label>
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
            <div className="flex gap-2">
              <Input
                type="number"
                value={getFormattedValue(weight, unit)}
                onChange={handleManualWeightChange}
                min={getFormattedValue(minWeight, unit)}
                max={getFormattedValue(maxWeight, unit)}
                className="flex-1"
              />
              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <Label>Cores do Indicador</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cor de Fundo</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={handleBgColorChange}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <Input 
                    value={bgColor}
                    onChange={handleBgColorChange}
                    className="flex-1 uppercase"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cor do Texto</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={handleTextColorChange}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <Input 
                    value={textColor}
                    onChange={handleTextColorChange}
                    className="flex-1 uppercase"
                  />
                </div>
              </div>
            </div>
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
