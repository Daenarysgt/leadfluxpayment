import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Weight } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const WeightRenderer = (props: ElementRendererProps) => {
  const { element, onSelect, isSelected, onUpdate } = props;
  const { content = {}, previewMode } = element;
  const [weight, setWeight] = useState(content?.weight || 70);
  const [minWeight, setMinWeight] = useState(content?.minWeight || 40);
  const [maxWeight, setMaxWeight] = useState(content?.maxWeight || 150);
  
  console.log("WeightRenderer - Rendering with content:", content);

  // Update weight when content changes
  useEffect(() => {
    if (content?.weight !== undefined) {
      setWeight(content.weight);
    }
    if (content?.minWeight !== undefined) {
      setMinWeight(content.minWeight);
    }
    if (content?.maxWeight !== undefined) {
      setMaxWeight(content.maxWeight);
    }
  }, [content?.weight, content?.minWeight, content?.maxWeight]);

  // Handle weight change in any mode
  const handleWeightChange = (value: number[]) => {
    const newWeight = value[0];
    setWeight(newWeight);
    
    // Update the actual element content in both preview and canvas modes
    const elementWithUpdatedContent = {
      ...element,
      content: {
        ...element.content,
        weight: newWeight
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
      // This is a no-op currently but keeps the code consistent with HeightRenderer
      console.log("Preview mode weight change:", newWeight);
    }
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium text-center mb-3">Selecione seu peso</h2>
          
          <div className="text-center w-full mb-8">
            <div className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-2 mb-3">
              <span className="text-xl font-bold">{weight}</span>
              <span className="ml-1 text-sm">kg</span>
            </div>
            
            <div className="w-full px-3 relative">
              {/* Slider - enabled in both preview and edit modes */}
              <div className="mb-6 w-full">
                <Slider
                  defaultValue={[weight]}
                  min={minWeight}
                  max={maxWeight}
                  step={1}
                  value={[weight]}
                  onValueChange={handleWeightChange}
                />
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between w-full px-2 text-xs text-gray-500">
                <span>{minWeight}</span>
                <span>{Math.round((minWeight + maxWeight) / 2)}</span>
                <span>{maxWeight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default WeightRenderer;
