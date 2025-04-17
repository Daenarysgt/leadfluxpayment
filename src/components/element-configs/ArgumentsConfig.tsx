import React, { useState } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, GripVertical, CheckCircle, Star, ArrowRight, CircleCheck, Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArgumentsConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

interface ArgumentItem {
  id: string;
  text: string;
}

interface MarkerIconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const markerIconOptions: MarkerIconOption[] = [
  { value: "check-circle", label: "Círculo com check", icon: <CheckCircle /> },
  { value: "star", label: "Estrela", icon: <Star /> },
  { value: "arrow-right", label: "Seta para direita", icon: <ArrowRight /> },
  { value: "circle-check", label: "Check em círculo", icon: <CircleCheck /> },
  { value: "info", label: "Informação", icon: <Info /> },
  { value: "x", label: "X", icon: <X /> },
];

const ArgumentsConfig = ({ element, onUpdate }: ArgumentsConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  const title = content.title !== undefined ? content.title : "Argumentos";
  const description = content.description || "";
  const argumentItems = content.argumentItems || [];
  const showCheckmarks = content.showCheckmarks !== false;
  const checkmarkColor = style.checkmarkColor || "#22c55e";
  
  const titleAlign = style.titleAlign || "center";
  const descriptionAlign = style.descriptionAlign || "center";
  const argumentsAlign = style.argumentsAlign || "left";
  const markerIcon = style.markerIcon || "check-circle";
  
  // Cores do texto
  const titleColor = style.titleColor || "#000000";
  const descriptionColor = style.descriptionColor || "#6b7280";
  const argumentsColor = style.argumentsColor || "#374151";
  
  const [newArgument, setNewArgument] = useState("");
  
  const handleUpdate = (updates: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        ...updates
      }
    });
  };
  
  const handleStyleUpdate = (updates: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        style: {
          ...(content.style || {}),
          ...updates
        }
      }
    });
  };
  
  const addArgument = () => {
    if (!newArgument.trim()) return;
    
    const newItem = {
      id: crypto.randomUUID(),
      text: newArgument
    };
    
    handleUpdate({
      argumentItems: [...argumentItems, newItem]
    });
    
    setNewArgument("");
  };
  
  const removeArgument = (id: string) => {
    handleUpdate({
      argumentItems: argumentItems.filter((arg: ArgumentItem) => arg.id !== id)
    });
  };
  
  const updateArgument = (id: string, text: string) => {
    handleUpdate({
      argumentItems: argumentItems.map((arg: ArgumentItem) => 
        arg.id === id ? { ...arg, text } : arg
      )
    });
  };
  
  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="content">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="Título dos argumentos"
            />
            <p className="text-xs text-gray-500">Deixe vazio para remover o título</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Descrição opcional"
              rows={2}
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mostrar marcadores</Label>
              <Switch
                checked={showCheckmarks}
                onCheckedChange={(checked) => handleUpdate({ showCheckmarks: checked })}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <Label>Argumentos</Label>
            
            <div className="space-y-2">
              {argumentItems.map((arg: ArgumentItem, index: number) => (
                <div key={arg.id} className="flex items-center gap-2 group">
                  <div className="p-1.5 text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Input
                    value={arg.text}
                    onChange={(e) => updateArgument(arg.id, e.target.value)}
                    placeholder="Texto do argumento"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeArgument(arg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={newArgument}
                onChange={(e) => setNewArgument(e.target.value)}
                placeholder="Novo argumento"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArgument();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={addArgument}
                disabled={!newArgument.trim()}
                className="h-8 w-8 p-0"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Alinhamento do título</Label>
            <RadioGroup
              value={titleAlign}
              onValueChange={(value) => handleStyleUpdate({ titleAlign: value })}
              className="flex space-x-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="left" id="title-left" className="sr-only" />
                <Label
                  htmlFor="title-left"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    titleAlign === "left" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Esq
                </Label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="center" id="title-center" className="sr-only" />
                <Label
                  htmlFor="title-center"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    titleAlign === "center" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Centro
                </Label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="right" id="title-right" className="sr-only" />
                <Label
                  htmlFor="title-right"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    titleAlign === "right" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Dir
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento da descrição</Label>
            <RadioGroup
              value={descriptionAlign}
              onValueChange={(value) => handleStyleUpdate({ descriptionAlign: value })}
              className="flex space-x-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="left" id="desc-left" className="sr-only" />
                <Label
                  htmlFor="desc-left"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    descriptionAlign === "left" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Esq
                </Label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="center" id="desc-center" className="sr-only" />
                <Label
                  htmlFor="desc-center"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    descriptionAlign === "center" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Centro
                </Label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="right" id="desc-right" className="sr-only" />
                <Label
                  htmlFor="desc-right"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    descriptionAlign === "right" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Dir
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento dos argumentos</Label>
            <RadioGroup
              value={argumentsAlign}
              onValueChange={(value) => handleStyleUpdate({ argumentsAlign: value })}
              className="flex space-x-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="left" id="args-left" className="sr-only" />
                <Label
                  htmlFor="args-left"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    argumentsAlign === "left" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Esq
                </Label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="center" id="args-center" className="sr-only" />
                <Label
                  htmlFor="args-center"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    argumentsAlign === "center" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Centro
                </Label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="right" id="args-right" className="sr-only" />
                <Label
                  htmlFor="args-right"
                  className={cn(
                    "flex items-center justify-center w-12 h-8 border rounded-md text-xs cursor-pointer",
                    argumentsAlign === "right" ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  Dir
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {showCheckmarks && (
            <>
              <div className="space-y-2">
                <Label>Tipo de marcador</Label>
                <Select 
                  value={markerIcon} 
                  onValueChange={(value) => handleStyleUpdate({ markerIcon: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    {markerIconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{React.cloneElement(option.icon as React.ReactElement, { className: "h-4 w-4" })}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cor dos marcadores</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-md border cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: checkmarkColor }}
                    onClick={() => {
                      // Lógica para seletor de cor, isso poderia ser substituído por um seletor de cor adequado
                      const newColor = prompt("Digite o código de cor em formato hexadecimal (ex: #ff0000)", checkmarkColor);
                      if (newColor) {
                        handleStyleUpdate({ checkmarkColor: newColor });
                      }
                    }}
                  />
                  <Input 
                    value={checkmarkColor} 
                    onChange={(e) => handleStyleUpdate({ checkmarkColor: e.target.value })}
                    placeholder="#22c55e"
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Cor do título</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-md border cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: titleColor }}
                    onClick={() => {
                      const newColor = prompt("Digite o código de cor em formato hexadecimal (ex: #ff0000)", titleColor);
                      if (newColor) {
                        handleStyleUpdate({ titleColor: newColor });
                      }
                    }}
                  />
                  <Input 
                    value={titleColor} 
                    onChange={(e) => handleStyleUpdate({ titleColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor da descrição</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-md border cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: descriptionColor }}
                    onClick={() => {
                      const newColor = prompt("Digite o código de cor em formato hexadecimal (ex: #ff0000)", descriptionColor);
                      if (newColor) {
                        handleStyleUpdate({ descriptionColor: newColor });
                      }
                    }}
                  />
                  <Input 
                    value={descriptionColor} 
                    onChange={(e) => handleStyleUpdate({ descriptionColor: e.target.value })}
                    placeholder="#6b7280"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor do texto dos argumentos</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-md border cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: argumentsColor }}
                    onClick={() => {
                      const newColor = prompt("Digite o código de cor em formato hexadecimal (ex: #ff0000)", argumentsColor);
                      if (newColor) {
                        handleStyleUpdate({ argumentsColor: newColor });
                      }
                    }}
                  />
                  <Input 
                    value={argumentsColor} 
                    onChange={(e) => handleStyleUpdate({ argumentsColor: e.target.value })}
                    placeholder="#374151"
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArgumentsConfig;
