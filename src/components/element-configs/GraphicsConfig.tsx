import React, { useState } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart,
  PieChart,
  LineChart,
  Pencil,
  Trash2,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  Tag,
  Info
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GraphicsConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const GraphicsConfig = ({ element, onUpdate }: GraphicsConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  const title = content.title !== undefined ? content.title : "Gráfico";
  const description = content.description || "";
  const chartType = content.chartType || "bar";
  const chartData = content.chartData || getDefaultData();
  const showLegend = content.showLegend !== false;
  const showTooltip = content.showTooltip !== false;
  const showGrid = content.showGrid !== false;
  const showLabels = content.showLabels !== false;
  const valueLabel = content.valueLabel || "value";
  
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [tempItem, setTempItem] = useState({ name: "", value: 0, color: "" });

  // Atualiza os dados do elemento
  const handleUpdate = (newData: any) => {
    onUpdate({
      content: {
        ...content,
        ...newData
      }
    });
  };

  // Atualiza as configurações de estilo
  const handleStyleUpdate = (styleData: any) => {
    onUpdate({
      content: {
        ...content,
        style: {
          ...style,
          ...styleData
        }
      }
    });
  };

  // Adiciona um novo item de dados
  const handleAddItem = () => {
    if (editingItem !== null) {
      // Atualiza um item existente
      const newData = [...chartData];
      newData[editingItem] = { 
        name: tempItem.name || `Item ${editingItem + 1}`, 
        value: Number(tempItem.value) || 0,
        color: chartData[editingItem].color || getRandomColor(tempItem.name + Date.now())
      };
      
      handleUpdate({ chartData: newData });
      setEditingItem(null);
      setTempItem({ name: "", value: 0, color: "" });
    } else {
      // Adiciona um novo item
      const newData = [
        ...chartData,
        { 
          name: tempItem.name || `Item ${chartData.length + 1}`, 
          value: Number(tempItem.value) || Math.floor(Math.random() * 500),
          color: getRandomColor(tempItem.name + Date.now())
        }
      ];
      
      handleUpdate({ chartData: newData });
      setTempItem({ name: "", value: 0, color: "" });
    }
  };

  // Remove um item de dados
  const handleRemoveItem = (index: number) => {
    const newData = [...chartData];
    newData.splice(index, 1);
    handleUpdate({ chartData: newData });
    
    if (editingItem === index) {
      setEditingItem(null);
      setTempItem({ name: "", value: 0, color: "" });
    }
  };

  // Inicia a edição de um item
  const handleEditItem = (index: number) => {
    setEditingItem(index);
    setTempItem({ 
      name: chartData[index].name, 
      value: chartData[index].value,
      color: chartData[index].color || ""
    });
  };

  // Renderiza o ícone para o tipo de gráfico
  const renderChartTypeIcon = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart className="h-4 w-4" />;
      case "pie":
        return <PieChart className="h-4 w-4" />;
      case "line":
        return <LineChart className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <Tabs defaultValue="content">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="Título do gráfico"
            />
            <p className="text-xs text-gray-500">Deixe vazio para remover o título</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Descrição do gráfico"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chartType">Tipo de Gráfico</Label>
            <Select
              value={chartType}
              onValueChange={(value) => handleUpdate({ chartType: value })}
            >
              <SelectTrigger id="chartType">
                <SelectValue placeholder="Selecione o tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span>Gráfico de Barras</span>
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    <span>Gráfico de Pizza</span>
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    <span>Gráfico de Linha</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valueLabel">Texto do Valor (Legenda)</Label>
            <Input
              id="valueLabel"
              value={valueLabel}
              onChange={(e) => handleUpdate({ valueLabel: e.target.value })}
              placeholder="value"
            />
            <p className="text-xs text-gray-500">Deixe vazio para remover o texto</p>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showLegend" className="cursor-pointer">Mostrar Legenda</Label>
              <Switch
                id="showLegend"
                checked={showLegend}
                onCheckedChange={(checked) => handleUpdate({ showLegend: checked })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTooltip" className="cursor-pointer">Mostrar Tooltip</Label>
              <Switch
                id="showTooltip"
                checked={showTooltip}
                onCheckedChange={(checked) => handleUpdate({ showTooltip: checked })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showGrid" className="cursor-pointer">Mostrar Grid</Label>
              <Switch
                id="showGrid"
                checked={showGrid}
                onCheckedChange={(checked) => handleUpdate({ showGrid: checked })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showLabels" className="cursor-pointer">Mostrar Rótulos</Label>
              <Switch
                id="showLabels"
                checked={showLabels}
                onCheckedChange={(checked) => handleUpdate({ showLabels: checked })}
              />
            </div>
          </div>
          
          {chartType === "pie" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="donut" className="cursor-pointer">Formato Donut</Label>
                <Switch
                  id="donut"
                  checked={style?.donut || false}
                  onCheckedChange={(checked) => handleStyleUpdate({ donut: checked })}
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Dados do Gráfico</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setTempItem({ name: "", value: 0, color: "" });
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Novo Item
              </Button>
            </div>
            
            {chartData.length > 0 ? (
              <ScrollArea className="h-[180px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate max-w-[120px]">{item.name}</TableCell>
                        <TableCell>{item.value}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditItem(index)}
                              className="p-0 h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="p-0 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 border rounded-md">
                <Info className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Nenhum dado adicionado</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={() => handleUpdate({ chartData: getDefaultData() })}
                >
                  Adicionar dados de exemplo
                </Button>
              </div>
            )}
            
            <div className={cn(
              "border rounded-md p-3 space-y-3",
              editingItem !== null ? "bg-gray-50" : ""
            )}>
              <h4 className="text-sm font-medium">
                {editingItem !== null ? "Editar Item" : "Adicionar Item"}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="itemName" className="text-xs">Nome</Label>
                  <Input
                    id="itemName"
                    size={1}
                    value={tempItem.name}
                    onChange={(e) => setTempItem({ ...tempItem, name: e.target.value })}
                    placeholder="Nome da categoria"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="itemValue" className="text-xs">Valor</Label>
                  <Input
                    id="itemValue"
                    type="number"
                    min={0}
                    value={tempItem.value}
                    onChange={(e) => setTempItem({ ...tempItem, value: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                {editingItem !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setTempItem({ name: "", value: 0, color: "" });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button size="sm" onClick={handleAddItem}>
                  {editingItem !== null ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <Label>Alinhamento do Título</Label>
            <div className="flex border rounded-md p-1">
              <Button
                type="button"
                variant={style?.titleAlign === "left" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleUpdate({ titleAlign: "left" })}
              >
                <AlignLeft className="h-4 w-4 mr-2" /> Esquerda
              </Button>
              <Button
                type="button"
                variant={!style?.titleAlign || style?.titleAlign === "center" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleUpdate({ titleAlign: "center" })}
              >
                <AlignCenter className="h-4 w-4 mr-2" /> Centro
              </Button>
              <Button
                type="button"
                variant={style?.titleAlign === "right" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleUpdate({ titleAlign: "right" })}
              >
                <AlignRight className="h-4 w-4 mr-2" /> Direita
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento da Descrição</Label>
            <div className="flex border rounded-md p-1">
              <Button
                type="button"
                variant={style?.descriptionAlign === "left" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleUpdate({ descriptionAlign: "left" })}
              >
                <AlignLeft className="h-4 w-4 mr-2" /> Esquerda
              </Button>
              <Button
                type="button"
                variant={!style?.descriptionAlign || style?.descriptionAlign === "center" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleUpdate({ descriptionAlign: "center" })}
              >
                <AlignCenter className="h-4 w-4 mr-2" /> Centro
              </Button>
              <Button
                type="button"
                variant={style?.descriptionAlign === "right" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleUpdate({ descriptionAlign: "right" })}
              >
                <AlignRight className="h-4 w-4 mr-2" /> Direita
              </Button>
            </div>
          </div>
          
          {chartType === "bar" && (
            <div className="space-y-2">
              <Label htmlFor="barColor">Cor das Barras</Label>
              <div className="flex gap-2">
                <Input
                  id="barColor"
                  value={style?.barColor || ""}
                  onChange={(e) => handleStyleUpdate({ barColor: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={style?.barColor || "#8B5CF6"}
                  onChange={(e) => handleStyleUpdate({ barColor: e.target.value })}
                  className="w-10 h-8 p-0 cursor-pointer"
                />
              </div>
            </div>
          )}
          
          {chartType === "line" && (
            <div className="space-y-2">
              <Label htmlFor="lineColor">Cor da Linha</Label>
              <div className="flex gap-2">
                <Input
                  id="lineColor"
                  value={style?.lineColor || ""}
                  onChange={(e) => handleStyleUpdate({ lineColor: e.target.value })}
                  placeholder="#0EA5E9"
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={style?.lineColor || "#0EA5E9"}
                  onChange={(e) => handleStyleUpdate({ lineColor: e.target.value })}
                  className="w-10 h-8 p-0 cursor-pointer"
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Funções auxiliares 
function getDefaultData() {
  return [
    { name: "Categoria A", value: 400, color: "#8B5CF6" },
    { name: "Categoria B", value: 300, color: "#0EA5E9" },
    { name: "Categoria C", value: 200, color: "#F97316" },
    { name: "Categoria D", value: 100, color: "#D946EF" },
  ];
}

function getRandomColor(seed: string): string {
  // Lista ampliada de cores vibrantes
  const colors = [
    "#8B5CF6", // Roxo
    "#0EA5E9", // Azul
    "#F97316", // Laranja
    "#D946EF", // Rosa
    "#10B981", // Verde
    "#F59E0B", // Âmbar
    "#6366F1", // Índigo
    "#EC4899", // Rosa escuro
    "#3B82F6", // Azul violeta
    "#EF4444", // Vermelho
    "#14B8A6", // Verde azulado
    "#8B5CF6", // Púrpura
    "#F43F5E", // Rosa avermelhado
    "#22C55E", // Verde esmeralda
    "#A855F7", // Púrpura claro
    "#F59E0B", // Laranja dourado
  ];
  
  // Se não há seed ou é uma string vazia, retorna uma cor aleatória
  if (!seed || seed.trim() === "") {
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Usa o nome e timestamp como seed para selecionar uma cor
  const index = Math.abs(seed.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0) % colors.length);
  
  return colors[index];
}

export default GraphicsConfig;
