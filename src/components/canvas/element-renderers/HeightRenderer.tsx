import React, { useEffect, useState } from "react";
import { ElementRendererProps, CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const HeightRenderer = (props: ElementRendererProps) => {
  const { element, onSelect, isSelected, onUpdate } = props;
  const { content = {}, previewMode } = element;
  const [height, setHeight] = useState(content?.height || 170);
  const [minHeight, setMinHeight] = useState(content?.minHeight || 140);
  const [maxHeight, setMaxHeight] = useState(content?.maxHeight || 220);
  
  // Unidade de medida (cm ou inch)
  const [unit, setUnit] = useState(content?.unit || "cm");
  
  // Cores personalizadas
  const [bgColor, setBgColor] = useState(content?.bgColor || "#000000");
  const [textColor, setTextColor] = useState(content?.textColor || "#ffffff");
  
  // Constante de conversão
  const CM_TO_INCH = 2.54;
  
  // Converter cm para inch
  const cmToInch = (cm: number): number => {
    return parseFloat((cm / CM_TO_INCH).toFixed(1));
  };
  
  // Converter inch para cm
  const inchToCm = (inch: number): number => {
    return Math.round(inch * CM_TO_INCH);
  };
  
  // Formatar o valor a ser exibido de acordo com a unidade
  const formatHeightValue = (): string => {
    if (unit === "inch") {
      return `${cmToInch(height)}`;
    }
    return `${height}`;
  };
  
  // Formatar os marcadores de acordo com a unidade
  const formatMarkerValue = (value: number): string => {
    if (unit === "inch") {
      return `${cmToInch(value)}`;
    }
    return `${value}`;
  };

  useEffect(() => {
    if (content) {
      setHeight(content.height || 170);
      setMinHeight(content.minHeight || 140);
      setMaxHeight(content.maxHeight || 220);
      setUnit(content.unit || "cm");
      setBgColor(content.bgColor || "#000000");
      setTextColor(content.textColor || "#ffffff");
    }
  }, [content]);

  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setHeight(newHeight);
    
    if (!previewMode && onSelect) {
      // In canvas mode, send update to parent to update the actual element
      const elementWithUpdatedContent = {
        ...element,
        content: {
          ...element.content,
          height: newHeight,
          unit: unit
        }
      };
      
      // We need to trigger a selection to update the config sidebar
      onSelect(element.id);
      
      // ElementFactory will pick this up and update the element
      if (onUpdate) {
        onUpdate(elementWithUpdatedContent);
      }
    }
  };

  // Alternar entre as unidades de medida
  const toggleUnit = () => {
    const newUnit = unit === "cm" ? "inch" : "cm";
    setUnit(newUnit);
    
    if (!previewMode && onSelect) {
      // In canvas mode, send update to parent to update the actual element
      const elementWithUpdatedContent = {
        ...element,
        content: {
          ...element.content,
          unit: newUnit
        }
      };
      
      // We need to trigger a selection to update the config sidebar
      onSelect(element.id);
      
      // ElementFactory will pick this up and update the element
      if (onUpdate) {
        onUpdate(elementWithUpdatedContent);
      }
    }
  };

  // Obter unidade formatada
  const getUnitLabel = (): string => {
    return unit === "inch" ? "in" : "cm";
  };
  
  // Obter marcadores de escala formatados
  const getMarkers = () => {
    return {
      min: formatMarkerValue(minHeight),
      mid: formatMarkerValue(Math.round((minHeight + maxHeight) / 2)),
      max: formatMarkerValue(maxHeight)
    };
  };
  
  const markers = getMarkers();

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium text-center mb-3">Selecione sua altura</h2>
          
          <div className="text-center w-full mb-4">
            <div 
              className="inline-flex items-center justify-center rounded-full px-6 py-2 mb-3"
              style={{ 
                backgroundColor: bgColor,
                color: textColor
              }}
            >
              <span className="text-xl font-bold">{formatHeightValue()}</span>
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
                {unit === "cm" ? "Mudar para polegadas" : "Mudar para centímetros"}
              </Button>
            </div>
          
            <div className="w-full px-3 relative">
              {/* Slider - enabled in both preview and edit modes */}
              <div className="mb-6 w-full">
                <Slider
                  value={[height]}
                  min={minHeight}
                  max={maxHeight}
                  step={1}
                  onValueChange={handleHeightChange}
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

export default HeightRenderer;
