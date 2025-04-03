
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Trash2, MoveHorizontal, MoveVertical, Sliders } from "lucide-react";
import { ConfigLabel } from "./common/ConfigLabel";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CartesianConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const CartesianConfig = ({ element, onUpdate }: CartesianConfigProps) => {
  const content = element.content || {};
  const [activeTab, setActiveTab] = useState("basic");
  
  const comparisonData = content.comparisonData || [
    {
      title: "Nível de Faturamento",
      leftLabel: "Médio",
      leftValue: 50,
      rightLabel: "Alto",
      rightValue: 90,
    },
    {
      title: "Nível de Lucro",
      leftLabel: "Baixo",
      leftValue: 25,
      rightLabel: "Alto", 
      rightValue: 70,
    },
    {
      title: "Taxa de conversão",
      leftLabel: "Baixa",
      leftValue: 31,
      rightLabel: "Alta",
      rightValue: 76,
    }
  ];
  
  // Get chart points or use defaults
  const chartPoints = content.chartPoints || [
    { x: 0, y: 2, label: content.lowerLabel || "Sem a inlead" },
    { x: 1, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 6 },
    { x: 4, y: 9 },
    { x: 5, y: 11, label: content.upperLabel || "Com a inlead" }
  ];
  
  // Get label positions or use defaults
  const lowerLabelPosition = content.lowerLabelPosition || { x: 10, y: 75 };
  const upperLabelPosition = content.upperLabelPosition || { x: 90, y: 15 };
  
  const handleContentChange = (key: string, value: any) => {
    onUpdate({
      content: {
        ...content,
        [key]: value
      }
    });
  };
  
  const updateComparisonItem = (index: number, field: string, value: any) => {
    const updatedData = [...comparisonData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    
    handleContentChange('comparisonData', updatedData);
  };
  
  const addComparisonItem = () => {
    const newItem = {
      title: `Métrica ${comparisonData.length + 1}`,
      leftLabel: "Baixo",
      leftValue: 30,
      rightLabel: "Alto",
      rightValue: 70,
    };
    
    handleContentChange('comparisonData', [...comparisonData, newItem]);
  };
  
  const removeComparisonItem = (index: number) => {
    const updatedData = [...comparisonData];
    updatedData.splice(index, 1);
    handleContentChange('comparisonData', updatedData);
  };
  
  const updateChartPoint = (index: number, field: string, value: any) => {
    const updatedPoints = [...chartPoints];
    updatedPoints[index] = {
      ...updatedPoints[index],
      [field]: value
    };
    
    handleContentChange('chartPoints', updatedPoints);
  };
  
  const addChartPoint = () => {
    // Insert a new point before the last point
    const lastIndex = chartPoints.length - 1;
    const secondLastIndex = Math.max(0, lastIndex - 1);
    
    // Calculate position between last two points or a reasonable default
    const newX = chartPoints.length > 1 
      ? chartPoints[secondLastIndex].x + 1 
      : chartPoints.length;
      
    const prevY = chartPoints.length > 1 ? chartPoints[secondLastIndex].y : 5;
    const lastY = chartPoints.length > 0 ? chartPoints[lastIndex].y : 10;
    
    // Create a reasonable point between the previous ones
    const newY = Math.round((prevY + lastY) / 2);
    
    const newPoints = [...chartPoints];
    // If we have a last point with a label, insert before it
    newPoints.splice(lastIndex, 0, { x: newX, y: newY });
    
    // Ensure x values are sequential
    newPoints.forEach((point, idx) => {
      point.x = idx;
    });
    
    handleContentChange('chartPoints', newPoints);
  };
  
  const removeChartPoint = (index: number) => {
    // Don't allow removing the first or last point which have labels
    if (index === 0 || index === chartPoints.length - 1) {
      return;
    }
    
    const updatedPoints = [...chartPoints];
    updatedPoints.splice(index, 1);
    
    // Ensure x values are sequential
    updatedPoints.forEach((point, idx) => {
      point.x = idx;
    });
    
    handleContentChange('chartPoints', updatedPoints);
  };
  
  const updateLabelPosition = (labelType: 'lower' | 'upper', axis: 'x' | 'y', value: number) => {
    const positionKey = labelType === 'lower' ? 'lowerLabelPosition' : 'upperLabelPosition';
    const currentPosition = labelType === 'lower' ? lowerLabelPosition : upperLabelPosition;
    
    handleContentChange(positionKey, {
      ...currentPosition,
      [axis]: value
    });
  };

  return (
    <div className="space-y-4 p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="basic" className="flex-1">Básico</TabsTrigger>
          <TabsTrigger value="chart" className="flex-1">Gráfico</TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1">Métricas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Título</ConfigLabel>
            <Input 
              value={content.title || 'Nível de sucesso com a inlead'} 
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Título do gráfico"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <ConfigLabel>Rótulo eixo X</ConfigLabel>
              <Input 
                value={content.xAxisLabel || 'Baixo'} 
                onChange={(e) => handleContentChange('xAxisLabel', e.target.value)}
                placeholder="Eixo X"
              />
            </div>
            
            <div className="space-y-2">
              <ConfigLabel>Rótulo eixo Y</ConfigLabel>
              <Input 
                value={content.yAxisLabel || 'Alto'} 
                onChange={(e) => handleContentChange('yAxisLabel', e.target.value)}
                placeholder="Eixo Y"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Rótulo Inferior</ConfigLabel>
            <Input 
              value={content.lowerLabel || 'Sem a inlead'} 
              onChange={(e) => handleContentChange('lowerLabel', e.target.value)}
              placeholder="Rótulo inferior"
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Rótulo Superior</ConfigLabel>
            <Input 
              value={content.upperLabel || 'Com a inlead'} 
              onChange={(e) => handleContentChange('upperLabel', e.target.value)}
              placeholder="Rótulo superior"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <ConfigLabel>Mostrar Métricas de Comparação</ConfigLabel>
              <Switch 
                checked={content.showComparison !== false} 
                onCheckedChange={(checked) => handleContentChange('showComparison', checked)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chart" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <ConfigLabel>Posição dos Rótulos</ConfigLabel>
            </div>
            
            <div className="border rounded-md p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <ConfigLabel>Rótulo Inferior</ConfigLabel>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Horizontal (X)</span>
                      <span className="text-xs">{lowerLabelPosition.x}%</span>
                    </div>
                    <Slider
                      value={[lowerLabelPosition.x]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateLabelPosition('lower', 'x', value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Vertical (Y)</span>
                      <span className="text-xs">{lowerLabelPosition.y}%</span>
                    </div>
                    <Slider
                      value={[lowerLabelPosition.y]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateLabelPosition('lower', 'y', value[0])}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <ConfigLabel>Rótulo Superior</ConfigLabel>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Horizontal (X)</span>
                      <span className="text-xs">{upperLabelPosition.x}%</span>
                    </div>
                    <Slider
                      value={[upperLabelPosition.x]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateLabelPosition('upper', 'x', value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Vertical (Y)</span>
                      <span className="text-xs">{upperLabelPosition.y}%</span>
                    </div>
                    <Slider
                      value={[upperLabelPosition.y]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateLabelPosition('upper', 'y', value[0])}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <ConfigLabel>Pontos do Gráfico</ConfigLabel>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addChartPoint} 
                disabled={chartPoints.length >= 10}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-3">
              {chartPoints.map((point, index) => {
                const isEndpoint = index === 0 || index === chartPoints.length - 1;
                return (
                  <div key={index} className="border p-3 rounded-md relative">
                    {!isEndpoint && (
                      <div className="absolute right-2 top-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChartPoint(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center mb-3">
                      <div className="h-5 w-5 rounded-full mr-2" style={{ backgroundColor: getPointColor(index, chartPoints.length) }}></div>
                      <div className="font-medium">Ponto {index + 1}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Valor Y</span>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={point.y}
                            onChange={(e) => updateChartPoint(index, 'y', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-4">
          {content.showComparison !== false && (
            <>
              <div className="flex justify-between items-center">
                <ConfigLabel>Métricas de Comparação</ConfigLabel>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addComparisonItem} 
                  disabled={comparisonData.length >= 5}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-6">
                {comparisonData.map((item, index) => (
                  <div key={index} className="border p-3 rounded-md relative">
                    <div className="absolute right-2 top-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComparisonItem(index)}
                        disabled={comparisonData.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="space-y-2">
                        <ConfigLabel>Título da Métrica</ConfigLabel>
                        <Input
                          value={item.title}
                          onChange={(e) => updateComparisonItem(index, 'title', e.target.value)}
                          placeholder="Título da métrica"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <ConfigLabel>Rótulo Esquerdo</ConfigLabel>
                          <Input
                            value={item.leftLabel}
                            onChange={(e) => updateComparisonItem(index, 'leftLabel', e.target.value)}
                            placeholder="Rótulo esquerdo"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <ConfigLabel>Valor Esquerdo (%)</ConfigLabel>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.leftValue}
                            onChange={(e) => updateComparisonItem(index, 'leftValue', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <ConfigLabel>Rótulo Direito</ConfigLabel>
                          <Input
                            value={item.rightLabel}
                            onChange={(e) => updateComparisonItem(index, 'rightLabel', e.target.value)}
                            placeholder="Rótulo direito"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <ConfigLabel>Valor Direito (%)</ConfigLabel>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.rightValue}
                            onChange={(e) => updateComparisonItem(index, 'rightValue', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {content.showComparison === false && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Ative a opção "Mostrar Métricas de Comparação" na aba básica</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to get point color based on position
const getPointColor = (index: number, total: number) => {
  const colors = [
    "#FF6B6B", // Red
    "#FF9066", // Orange-red
    "#FFD166", // Yellow
    "#CBDE6C", // Yellow-green
    "#91E4A5", // Light green
    "#67E8C3"  // Teal
  ];
  
  if (total <= 1) return colors[0];
  
  // Map index to color index
  const colorIndex = Math.min(
    Math.floor((index / (total - 1)) * (colors.length - 1)),
    colors.length - 1
  );
  
  return colors[colorIndex];
};

export default CartesianConfig;
