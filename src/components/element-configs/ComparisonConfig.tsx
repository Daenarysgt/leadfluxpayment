
import { useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface ComparisonConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const ComparisonConfig = ({ element, onUpdate }: ComparisonConfigProps) => {
  const content = element.content || {};
  const items = content.items || [];
  
  // Preset colors
  const colors = [
    "#22c55e", // green
    "#ef4444", // red
    "#3b82f6", // blue
    "#f97316", // orange
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6b7280", // gray
    "#fbbf24"  // yellow
  ];

  const handleTitleChange = (value: string) => {
    onUpdate({
      content: {
        ...content,
        title: value
      }
    });
  };

  const handleColumnTitleChange = (side: 'left' | 'right', value: string) => {
    onUpdate({
      content: {
        ...content,
        [side === 'left' ? 'leftTitle' : 'rightTitle']: value
      }
    });
  };

  const handleItemNameChange = (id: string, value: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, name: value } : item
    );
    
    onUpdate({
      content: {
        ...content,
        items: updatedItems
      }
    });
  };

  const handleItemValueChange = (id: string, value: number) => {
    // Ensure value is between 0 and 100
    const normalizedValue = Math.min(100, Math.max(0, value));
    
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, value: normalizedValue, label: `${normalizedValue}%` } : item
    );
    
    onUpdate({
      content: {
        ...content,
        items: updatedItems
      }
    });
  };

  const handleColorChange = (id: string, color: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, color } : item
    );
    
    onUpdate({
      content: {
        ...content,
        items: updatedItems
      }
    });
  };

  const addItem = (column: 'left' | 'right') => {
    // Get appropriate color based on column
    const defaultColor = column === 'left' ? colors[0] : colors[1];
    
    // Find where to insert the new item
    const newItems = [...items];
    let insertIndex = newItems.length;
    
    // If adding to left column (even indexes), find the last even index + 1
    // If adding to right column (odd indexes), find the last odd index + 1
    if (column === 'left') {
      // Find the last odd-indexed item and insert after it, or at the beginning
      const lastOddIndex = newItems.reduce((lastIdx, _, idx) => (idx % 2 === 1 ? idx : lastIdx), -1);
      insertIndex = lastOddIndex + 1;
    } else {
      // Find the last even-indexed item and insert after it, or at position 1
      const lastEvenIndex = newItems.reduce((lastIdx, _, idx) => (idx % 2 === 0 ? idx : lastIdx), -1);
      insertIndex = lastEvenIndex + 1;
    }
    
    // Create new item with appropriate defaults
    const newItem = {
      id: uuidv4(),
      name: "Nova opção",
      value: 50,
      color: defaultColor,
      label: "50%"
    };
    
    // Insert at the calculated position
    newItems.splice(insertIndex, 0, newItem);
    
    onUpdate({
      content: {
        ...content,
        items: newItems
      }
    });
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    
    onUpdate({
      content: {
        ...content,
        items: updatedItems
      }
    });
  };

  const toggleCostComparison = (checked: boolean) => {
    onUpdate({
      content: {
        ...content,
        showCostComparison: checked
      }
    });
  };

  const updateCostValue = (side: 'left' | 'right', field: 'Min' | 'Max' | 'Percentage', value: string | number) => {
    const fieldName = `${side}Cost${field}`;
    onUpdate({
      content: {
        ...content,
        [fieldName]: value
      }
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="items">Opções</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="comparison-title">Título da Comparação</Label>
            <Input 
              id="comparison-title" 
              value={content.title || ''} 
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Comparação de opções"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="left-column-title">Título Coluna Esquerda</Label>
              <Input 
                id="left-column-title" 
                value={content.leftTitle || ''} 
                onChange={(e) => handleColumnTitleChange('left', e.target.value)}
                placeholder="Opção A"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="right-column-title">Título Coluna Direita</Label>
              <Input 
                id="right-column-title" 
                value={content.rightTitle || ''} 
                onChange={(e) => handleColumnTitleChange('right', e.target.value)}
                placeholder="Opção B"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium">Coluna Esquerda</h3>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => addItem('left')}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          {items.filter((_, index) => index % 2 === 0).map((item, index) => (
            <div key={item.id} className="border rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Item {index + 1}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7"
                  disabled={items.length <= 2}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`item-name-${item.id}`}>Nome</Label>
                <Input 
                  id={`item-name-${item.id}`} 
                  value={item.name} 
                  onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`item-value-${item.id}`}>Valor (%)</Label>
                <Input 
                  id={`item-value-${item.id}`} 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={item.value} 
                  onChange={(e) => handleItemValueChange(item.id, parseInt(e.target.value, 10))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(item.id, color)}
                      className={`h-8 w-full rounded-md transition-all ${
                        item.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'ring-1 ring-inset ring-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Selecionar cor ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <Separator className="my-6" />
          
          <div className="flex justify-between">
            <h3 className="text-sm font-medium">Coluna Direita</h3>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => addItem('right')}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          {items.filter((_, index) => index % 2 === 1).map((item, index) => (
            <div key={item.id} className="border rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Item {index + 1}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7"
                  disabled={items.length <= 2}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`item-name-${item.id}`}>Nome</Label>
                <Input 
                  id={`item-name-${item.id}`} 
                  value={item.name} 
                  onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`item-value-${item.id}`}>Valor (%)</Label>
                <Input 
                  id={`item-value-${item.id}`} 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={item.value} 
                  onChange={(e) => handleItemValueChange(item.id, parseInt(e.target.value, 10))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(item.id, color)}
                      className={`h-8 w-full rounded-md transition-all ${
                        item.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'ring-1 ring-inset ring-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Selecionar cor ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-cost-comparison"
              checked={content.showCostComparison || false}
              onCheckedChange={toggleCostComparison}
            />
            <Label htmlFor="show-cost-comparison">Exibir comparação de custos</Label>
          </div>
          
          {content.showCostComparison && (
            <>
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Coluna Esquerda</h3>
                <div className="space-y-2">
                  <Label htmlFor="left-cost-percentage">Percentual</Label>
                  <Input
                    id="left-cost-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={content.leftCostPercentage || 70}
                    onChange={(e) => updateCostValue('left', 'Percentage', parseInt(e.target.value, 10))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="left-cost-min">Valor Mínimo</Label>
                    <Input
                      id="left-cost-min"
                      value={content.leftCostMin || "100"}
                      onChange={(e) => updateCostValue('left', 'Min', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="left-cost-max">Valor Máximo</Label>
                    <Input
                      id="left-cost-max"
                      value={content.leftCostMax || "5.000"}
                      onChange={(e) => updateCostValue('left', 'Max', e.target.value)}
                      placeholder="5.000"
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Coluna Direita</h3>
                <div className="space-y-2">
                  <Label htmlFor="right-cost-percentage">Percentual</Label>
                  <Input
                    id="right-cost-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={content.rightCostPercentage || 20}
                    onChange={(e) => updateCostValue('right', 'Percentage', parseInt(e.target.value, 10))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="right-cost-min">Valor Mínimo</Label>
                    <Input
                      id="right-cost-min"
                      value={content.rightCostMin || "100"}
                      onChange={(e) => updateCostValue('right', 'Min', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="right-cost-max">Valor Máximo</Label>
                    <Input
                      id="right-cost-max"
                      value={content.rightCostMax || "5.000"}
                      onChange={(e) => updateCostValue('right', 'Max', e.target.value)}
                      placeholder="5.000"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComparisonConfig;
