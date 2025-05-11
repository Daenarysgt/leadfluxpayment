import { useState } from "react";
import { ComponentType } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Square as ButtonIcon, 
  FileText, 
  Image as ImageIcon, 
  BarChart2, 
  MessageSquareQuote, 
  Sliders, 
  StickyNote, 
  Loader2, 
  Box, 
  ArrowRight,
  Type,
  CheckSquare,
  ImagePlus,
  Images,
  GripVertical,
  ChevronRight,
  Ruler,
  Weight,
  SlidersHorizontal,
  Star,
  Video as VideoIcon,
  DollarSign,
  Clock,
  ChevronDown,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const ElementsSidebar = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  
  const basicComponents = [
    { id: ComponentType.MultipleChoice, name: "Múltipla Escolha", icon: CheckSquare, color: "bg-blue-100 text-blue-600" },
    { id: ComponentType.MultipleChoiceImage, name: "Múltipla Escolha com Imagem", icon: ImagePlus, color: "bg-purple-100 text-purple-600" },
    { id: ComponentType.Text, name: "Texto", icon: Type, color: "bg-gray-100 text-gray-600" },
    { id: ComponentType.Notes, name: "Notas", icon: StickyNote, color: "bg-amber-100 text-amber-600" },
    { id: ComponentType.Image, name: "Imagem", icon: ImageIcon, color: "bg-indigo-100 text-indigo-600" },
    { id: ComponentType.Video, name: "Vídeo", icon: VideoIcon, color: "bg-red-100 text-red-600" },
    { id: ComponentType.Carousel, name: "Carrossel de Imagens", icon: Images, color: "bg-pink-100 text-pink-600" },
    { id: ComponentType.Button, name: "Botão", icon: ButtonIcon, color: "bg-green-100 text-green-600" },
    { id: ComponentType.Height, name: "Altura", icon: Ruler, color: "bg-amber-100 text-amber-600" },
    { id: ComponentType.Weight, name: "Peso", icon: Weight, color: "bg-orange-100 text-orange-600" },
    { id: ComponentType.Comparison, name: "Comparação de Itens", icon: SlidersHorizontal, color: "bg-teal-100 text-teal-600" },
    { id: ComponentType.Price, name: "Preço", icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
  ];
  
  const advancedComponents = [
    { id: ComponentType.Arguments, name: "Argumentos", icon: FileText, color: "bg-cyan-100 text-cyan-600" },
    { id: ComponentType.Graphics, name: "Gráficos", icon: BarChart2, color: "bg-emerald-100 text-emerald-600" },
    { id: ComponentType.Testimonials, name: "Depoimentos", icon: MessageSquareQuote, color: "bg-violet-100 text-violet-600" },
    { id: ComponentType.Level, name: "Nível", icon: Sliders, color: "bg-fuchsia-100 text-fuchsia-600" },
    { id: ComponentType.Capture, name: "Captura", icon: StickyNote, color: "bg-lime-100 text-lime-600" },
    { id: ComponentType.Loading, name: "Loading", icon: Loader2, color: "bg-rose-100 text-rose-600" },
    { id: ComponentType.Cartesian, name: "Cartesiano", icon: Box, color: "bg-sky-100 text-sky-600" },
    { id: ComponentType.Spacer, name: "Espaço", icon: GripVertical, color: "bg-yellow-100 text-yellow-600" },
    { id: ComponentType.Rating, name: "Avaliação", icon: Star, color: "bg-amber-100 text-amber-600" },
    { id: ComponentType.Timer, name: "Timer", icon: Clock, color: "bg-blue-100 text-blue-600" },
    { id: ComponentType.Accordion, name: "Acordeão", icon: ChevronDown, color: "bg-indigo-100 text-indigo-600" },
    { id: ComponentType.FeatureCards, name: "Cards de Recursos", icon: Layers, color: "bg-purple-100 text-purple-600" },
  ];
  
  const filteredBasic = basicComponents.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAdvanced = advancedComponents.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDragStart = (e: React.DragEvent, componentId: string, componentName: string) => {
    console.log(`Iniciando arrasto do componente: ${componentName} (${componentId})`);
    
    // Garantir que o tipo de componente seja definido corretamente
    e.dataTransfer.setData("componentType", componentId);
    e.dataTransfer.effectAllowed = "copy";
    
    // Criar uma imagem de arrasto personalizada para feedback visual
    const dragIcon = document.createElement('div');
    dragIcon.style.padding = '10px 15px';
    dragIcon.style.background = '#8b5cf6';
    dragIcon.style.borderRadius = '4px';
    dragIcon.style.color = 'white';
    dragIcon.style.fontSize = '14px';
    dragIcon.style.fontWeight = 'bold';
    dragIcon.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    dragIcon.style.pointerEvents = 'none';
    dragIcon.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">
      <span>${componentName}</span>
    </div>`;
    
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 50, 25);
    
    // Remover o elemento após um pequeno delay
    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
    
    // Adicionar classe visual durante o arrasto
    const target = e.currentTarget as HTMLElement;
    target.classList.add("opacity-50");
    
    // Criar e adicionar uma dica visual para o usuário
    const feedbackEl = document.createElement('div');
    feedbackEl.textContent = `Arrastando: ${componentName}`;
    feedbackEl.className = 'fixed top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-3 py-1 rounded-full text-sm shadow-lg z-50';
    feedbackEl.id = 'drag-feedback';
    document.body.appendChild(feedbackEl);
    
    // Adicionar efeito de vibração leve quando começar a arrastar
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    // Remover classe visual
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("opacity-50");
    
    // Remover feedback visual
    const feedbackEl = document.getElementById('drag-feedback');
    if (feedbackEl) {
      document.body.removeChild(feedbackEl);
    }
  };
  
  const renderComponentItem = (component: { id: string; name: string; icon: any; color: string }) => {
    const Icon = component.icon;
    return (
      <div
        key={component.id}
        className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-grab active:cursor-grabbing border-b group relative transition-all hover:bg-violet-50"
        draggable
        onDragStart={(e) => handleDragStart(e, component.id, component.name)}
        onDragEnd={handleDragEnd}
      >
        <div className={cn("h-8 w-8 rounded-md flex items-center justify-center mr-3", component.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm">{component.name}</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 absolute right-3 transition-opacity" />
      </div>
    );
  };
  
  return (
    <div className="border-l bg-white flex flex-col h-screen overflow-hidden">
      <div className="p-3 border-b bg-gray-50 flex-shrink-0">
        <h3 className="font-medium text-sm text-gray-700">ELEMENTOS</h3>
        <div className="mt-2">
          <Input
            type="text"
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="h-full">
        <div className="p-4 pb-24">
          <Input
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="todos" className="flex-1">Todos</TabsTrigger>
              <TabsTrigger value="favoritos" className="flex-1">Favoritos</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="flex-1 overflow-y-auto pb-8">
              <div className="px-3 py-2">
                <h4 className="text-xs font-semibold text-gray-500 mb-1">BÁSICOS</h4>
              </div>
              <div className="border-t">
                {filteredBasic.map(renderComponentItem)}
              </div>
              
              <div className="px-3 py-2 mt-2">
                <h4 className="text-xs font-semibold text-gray-500 mb-1">AVANÇADOS</h4>
              </div>
              <div className="border-t">
                {filteredAdvanced.map(renderComponentItem)}
              </div>
            </TabsContent>
            
            <TabsContent value="favoritos" className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-sm text-gray-500">Seus componentes favoritos aparecerão aqui</p>
                <Button variant="link" size="sm" className="mt-2">
                  Adicionar favoritos
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ElementsSidebar;
