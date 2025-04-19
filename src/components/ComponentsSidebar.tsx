import { useState } from "react";
import { ComponentType } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlignCenter, 
  AlignJustify, 
  ArrowRight, 
  BarChart2, 
  Box, 
  FileText, 
  Image, 
  Loader2, 
  MessageSquareQuote, 
  Sliders, 
  StickyNote, 
  Type,
  DollarSign,
} from "lucide-react";

const ComponentsSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string>("text");
  
  const components = [
    { id: ComponentType.Text, name: "Texto", icon: Type },
    { id: ComponentType.Arguments, name: "Argumentos", icon: FileText },
    { id: ComponentType.Button, name: "Botão", icon: ArrowRight },
    { id: ComponentType.Image, name: "Imagem", icon: Image },
    { id: ComponentType.Graphics, name: "Gráficos", icon: BarChart2 },
    { id: ComponentType.Testimonials, name: "Depoimentos", icon: MessageSquareQuote },
    { id: ComponentType.Level, name: "Nível", icon: Sliders },
    { id: ComponentType.Capture, name: "Captura", icon: StickyNote },
    { id: ComponentType.Loading, name: "Loading", icon: Loader2 },
    { id: ComponentType.Cartesian, name: "Cartesiano", icon: Box },
    { id: ComponentType.Spacer, name: "Espaço", icon: AlignCenter },
    { id: ComponentType.Pricing, name: "Preços", icon: DollarSign },
  ];
  
  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
  };
  
  return (
    <div className={`border-l bg-white ${isCollapsed ? 'w-12' : 'w-60'} transition-all duration-300 flex flex-col`}>
      <div className="p-2 border-b flex justify-between items-center">
        <span className={`font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Componentes</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            {components.map((component) => {
              const Icon = component.icon;
              return (
                <Button
                  key={component.id}
                  variant={activeComponent === component.id ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveComponent(component.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component.id)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {components.map((component) => {
              const Icon = component.icon;
              return (
                <Button
                  key={component.id}
                  variant={activeComponent === component.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveComponent(component.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {component.name}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      
      {!isCollapsed && activeComponent === ComponentType.Text && (
        <div className="p-4 border-t">
          <h3 className="font-medium mb-2">Texto</h3>
          <p className="text-muted-foreground text-sm">
            Arraste este componente para adicionar texto ao seu funil.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComponentsSidebar;
