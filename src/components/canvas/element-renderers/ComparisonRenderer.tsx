import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Progress } from "@/components/ui/progress";
import { GitCompareIcon } from "lucide-react";

const ComparisonRenderer = (props: ElementRendererProps) => {
  const { element, onSelect, isSelected, onUpdate } = props;
  const { content = {}, previewMode } = element;
  const [items, setItems] = useState(content?.items || [
    { id: "1", name: "Opção A", value: 100, color: "#22c55e", label: "100%" },
    { id: "2", name: "Opção B", value: 30, color: "#ef4444", label: "30%" }
  ]);
  const [title, setTitle] = useState(content?.title || "Comparação de opções");
  const [leftTitle, setLeftTitle] = useState(content?.leftTitle || "VSL / Typebot / LP");
  const [rightTitle, setRightTitle] = useState(content?.rightTitle || "LeadFlux");
  
  // Cores do texto
  const style = content?.style || {};
  const titleColor = style?.titleColor || "#000000";
  const columnTitleColor = style?.columnTitleColor || "#000000";
  const itemNameColor = style?.itemNameColor || "#000000";
  const itemValueColor = style?.itemValueColor || "#6b7280";
  
  // Update local state when content changes
  useEffect(() => {
    if (content?.items) {
      setItems(content.items);
    }
    if (content?.title !== undefined) {
      setTitle(content.title);
    }
    if (content?.leftTitle !== undefined) {
      setLeftTitle(content.leftTitle);
    }
    if (content?.rightTitle !== undefined) {
      setRightTitle(content.rightTitle);
    }
  }, [content?.items, content?.title, content?.leftTitle, content?.rightTitle]);

  // Group items by their position (odd indexes for left column, even for right)
  const leftItems = items.filter((_, index) => index % 2 === 0);
  const rightItems = items.filter((_, index) => index % 2 === 1);

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        {title && (
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-xl font-semibold text-center" style={{ color: titleColor }}>{title}</h2>
          </div>
        )}
        
        {/* Comparison headers */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold" style={{ color: columnTitleColor }}>{leftTitle}</h3>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold" style={{ color: columnTitleColor }}>{rightTitle}</h3>
          </div>
        </div>

        {/* Comparison metrics */}
        <div className="space-y-6">
          {items.length > 0 && Array.from({ length: Math.ceil(items.length / 2) }).map((_, rowIndex) => {
            const leftItem = items[rowIndex * 2];
            const rightItem = items[rowIndex * 2 + 1];
            
            if (!leftItem) return null;
            
            return (
              <div key={`row-${rowIndex}`} className="grid grid-cols-2 gap-6">
                {/* Left column item */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: itemNameColor }}>{leftItem.name}</span>
                    <span className="text-sm" style={{ color: itemValueColor }}>{leftItem.label || `${leftItem.value}%`}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all ease-in-out duration-500"
                      style={{ 
                        width: `${leftItem.value}%`,
                        backgroundColor: leftItem.color || '#22c55e' 
                      }}
                    />
                  </div>
                </div>
                
                {/* Right column item */}
                {rightItem && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium" style={{ color: itemNameColor }}>{rightItem.name}</span>
                      <span className="text-sm" style={{ color: itemValueColor }}>{rightItem.label || `${rightItem.value}%`}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all ease-in-out duration-500"
                        style={{ 
                          width: `${rightItem.value}%`,
                          backgroundColor: rightItem.color || '#ef4444' 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Cost comparison (if enabled) */}
          {content?.showCostComparison && (
            <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: itemNameColor }}>Custo</span>
                </div>
                <div className="relative pt-4">
                  <div className="bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all ease-in-out duration-500"
                      style={{ 
                        width: `${content.leftCostPercentage || 70}%`,
                        backgroundColor: leftItems[0]?.color || "#ef4444"
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span style={{ color: itemValueColor }}>R${content.leftCostMin || "100"}</span>
                    <span style={{ color: itemValueColor }}>R${content.leftCostMax || "5.000"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{ color: itemNameColor }}>Custo</span>
                </div>
                <div className="relative pt-4">
                  <div className="bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all ease-in-out duration-500"
                      style={{ 
                        width: `${content.rightCostPercentage || 20}%`,
                        backgroundColor: rightItems[0]?.color || "#22c55e"
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span style={{ color: itemValueColor }}>R${content.rightCostMin || "100"}</span>
                    <span style={{ color: itemValueColor }}>R${content.rightCostMax || "5.000"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default ComparisonRenderer;
