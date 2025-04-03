
import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Ruler } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const HeightRenderer = (props: ElementRendererProps) => {
  const { element, onSelect, isSelected } = props;
  const { content = {}, previewMode } = element;
  const [height, setHeight] = useState(content?.height || 170);
  const [minHeight, setMinHeight] = useState(content?.minHeight || 140); 
  const [maxHeight, setMaxHeight] = useState(content?.maxHeight || 220);
  
  console.log("HeightRenderer - Rendering with content:", content);

  // Update height when content changes
  useEffect(() => {
    if (content?.height) {
      setHeight(content.height);
    }
    if (content?.minHeight) {
      setMinHeight(content.minHeight);
    }
    if (content?.maxHeight) {
      setMaxHeight(content.maxHeight);
    }
  }, [content?.height, content?.minHeight, content?.maxHeight]);

  // Handle height change in any mode
  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setHeight(newHeight);
    
    if (!previewMode && onSelect) {
      // In canvas mode, send update to parent to update the actual element
      const elementWithUpdatedContent = {
        ...element,
        content: {
          ...element.content,
          height: newHeight
        }
      };
      
      // We need to trigger a selection to update the config sidebar
      onSelect(element.id);
      
      // ElementFactory will pick this up and update the element
      if (props.onUpdate) {
        props.onUpdate(elementWithUpdatedContent);
      }
    }
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium text-center mb-3">Selecione sua altura</h2>
          
          <div className="text-center w-full mb-8">
            <div className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-2 mb-3">
              <span className="text-xl font-bold">{height}</span>
              <span className="ml-1 text-sm">cm</span>
            </div>
            
            <div className="w-full px-3 relative">
              {/* Slider - enabled in both preview and edit modes */}
              <div className="mb-6 w-full">
                <Slider
                  defaultValue={[height]}
                  min={minHeight}
                  max={maxHeight}
                  step={1}
                  value={[height]}
                  onValueChange={handleHeightChange}
                />
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between w-full px-2 text-xs text-gray-500">
                <span>{minHeight}</span>
                <span>{Math.round((minHeight + maxHeight) / 2)}</span>
                <span>{maxHeight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default HeightRenderer;
