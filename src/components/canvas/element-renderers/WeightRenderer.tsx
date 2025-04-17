import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const WeightRenderer = (props: ElementRendererProps) => {
  const { element, onSelect, isSelected, onUpdate } = props;
  const { content = {}, previewMode } = element;
  const [weight, setWeight] = useState(content?.weight || 70);
  const [minWeight, setMinWeight] = useState(content?.minWeight || 40);
  const [maxWeight, setMaxWeight] = useState(content?.maxWeight || 150);
  
  // Unidade de medida (kg ou lb)
  const [unit, setUnit] = useState(content?.unit || "kg");
  
  // Cores personalizadas
  const [bgColor, setBgColor] = useState(content?.bgColor || "#000000");
  const [textColor, setTextColor] = useState(content?.textColor || "#ffffff");
  
  // Constante de conversão
  const KG_TO_LB = 2.20462;
  const LB_TO_KG = 0.453592;
  
  // Converter kg para lb
  const kgToLb = (kg: number): number => {
    return parseFloat((kg * KG_TO_LB).toFixed(1));
  };
  
  // Converter lb para kg
  const lbToKg = (lb: number): number => {
    return Math.round(lb * LB_TO_KG);
  };
  
  // Formatar o valor a ser exibido de acordo com a unidade
  const formatWeightValue = (): string => {
    if (unit === "lb") {
      return `${kgToLb(weight)}`;
    }
    return `${weight}`;
  };
  
  // Formatar os marcadores de acordo com a unidade
  const formatMarkerValue = (value: number): string => {
    if (unit === "lb") {
      return `${kgToLb(value)}`;
    }
    return `${value}`;
  };

  // Update weight and settings when content changes
  useEffect(() => {
    if (content) {
      if (content.weight !== undefined) setWeight(content.weight);
      if (content.minWeight !== undefined) setMinWeight(content.minWeight);
      if (content.maxWeight !== undefined) setMaxWeight(content.maxWeight);
      if (content.unit !== undefined) setUnit(content.unit);
      if (content.bgColor !== undefined) setBgColor(content.bgColor);
      if (content.textColor !== undefined) setTextColor(content.textColor);
    }
  }, [content]);

  // Alternar entre as unidades de medida
  const toggleUnit = () => {
    const newUnit = unit === "kg" ? "lb" : "kg";
    setUnit(newUnit);
    
    if (!previewMode && onUpdate) {
      // In canvas mode, we need to trigger a selection to update the config sidebar
      if (onSelect) {
        onSelect(element.id);
      }
      
      // Update the element in the canvas
      onUpdate({
        ...element,
        content: {
          ...element.content,
          unit: newUnit
        }
      });
    }
  };

  // Handle weight change in any mode
  const handleWeightChange = (value: number[]) => {
    const newWeight = value[0];
    setWeight(newWeight);
    
    // Update the actual element content in both preview and canvas modes
    const elementWithUpdatedContent = {
      ...element,
      content: {
        ...element.content,
        weight: newWeight,
        unit: unit
      }
    };
    
    if (!previewMode && onUpdate) {
      // In canvas mode, we need to trigger a selection to update the config sidebar
      if (onSelect) {
        onSelect(element.id);
      }
      
      // Update the element in the canvas
      onUpdate(elementWithUpdatedContent);
    } else if (previewMode && element.previewProps?.onStepChange) {
      // In preview mode, we still want to update the element
      console.log("Preview mode weight change:", newWeight);
    }
  };
  
  // Obter unidade formatada
  const getUnitLabel = (): string => {
    return unit === "lb" ? "lb" : "kg";
  };
  
  // Obter marcadores de escala formatados
  const getMarkers = () => {
    return {
      min: formatMarkerValue(minWeight),
      mid: formatMarkerValue(Math.round((minWeight + maxWeight) / 2)),
      max: formatMarkerValue(maxWeight)
    };
  };
  
  const markers = getMarkers();
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium text-center mb-3">Selecione seu peso</h2>
          
          <div className="text-center w-full mb-4">
            <div 
              className="inline-flex items-center justify-center rounded-full px-6 py-2 mb-3"
              style={{ 
                backgroundColor: bgColor,
                color: textColor
              }}
            >
              <span className="text-xl font-bold">{formatWeightValue()}</span>
              <span className="ml-1 text-sm">{getUnitLabel()}</span>
            </div>
            
            {/* Unit toggle button */}
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleUnit}
                className="text-xs"
              >
                {unit === "kg" ? "Mudar para libras" : "Mudar para quilos"}
              </Button>
            </div>
            
            <div className="w-full px-3 relative">
              {/* Slider - enabled in both preview and edit modes */}
              <div className="mb-6 w-full">
                <Slider
                  value={[weight]}
                  min={minWeight}
                  max={maxWeight}
                  step={1}
                  onValueChange={handleWeightChange}
                />
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between w-full px-2 text-xs text-gray-500">
                <span>{markers.min}</span>
                <span>{markers.mid}</span>
                <span>{markers.max}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default WeightRenderer;
