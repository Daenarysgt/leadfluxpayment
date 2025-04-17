import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface HeightConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const HeightConfig = ({ element, onUpdate }: HeightConfigProps) => {
  const { content = {} } = element;
  const [height, setHeight] = useState(content.height || 170);
  const [minHeight, setMinHeight] = useState(content.minHeight || 140);
  const [maxHeight, setMaxHeight] = useState(content.maxHeight || 220);
  
  // Unidade de medida (cm ou inch)
  const [unit, setUnit] = useState(content.unit || "cm");
  
  // Cor de fundo e texto
  const [bgColor, setBgColor] = useState(content.bgColor || "#000000");
  const [textColor, setTextColor] = useState(content.textColor || "#ffffff");
  
  // Constantes de conversão
  const CM_TO_INCH = 2.54;
  const INCH_TO_CM = 0.393701;
  
  // Converter cm para inch e vice-versa
  const cmToInch = (cm: number): number => {
    return parseFloat((cm / CM_TO_INCH).toFixed(1));
  };
  
  const inchToCm = (inch: number): number => {
    return Math.round(inch * CM_TO_INCH);
  };
  
  // Obter o valor formatado conforme a unidade
  const getFormattedValue = (value: number, toUnit: string): number => {
    if (toUnit === "inch") {
      return cmToInch(value);
    }
    return value;
  };
  
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
    const inputValue = parseInt(e.target.value);
    
    if (!isNaN(inputValue)) {
      let cmValue = inputValue;
      
      // Converter para cm se o valor estiver em polegadas
      if (unit === "inch") {
        cmValue = inchToCm(inputValue);
      }
      
      // Validar se está dentro dos limites
      if (cmValue >= minHeight && cmValue <= maxHeight) {
        setHeight(cmValue);
        onUpdate({
          content: {
            ...content,
            height: cmValue
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
            <Label>Altura Padrão ({getFormattedValue(height, unit)} {unit})</Label>
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
            <div className="flex gap-2">
              <Input
                type="number"
                value={getFormattedValue(height, unit)}
                onChange={handleManualHeightChange}
                min={getFormattedValue(minHeight, unit)}
                max={getFormattedValue(maxHeight, unit)}
                className="flex-1"
              />
              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inch">polegadas</SelectItem>
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
