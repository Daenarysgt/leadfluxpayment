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
  Video as VideoIcon
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
    { id: ComponentType.Image, name: "Imagem", icon: ImageIcon, color: "bg-indigo-100 text-indigo-600" },
    { id: ComponentType.Video, name: "Vídeo", icon: VideoIcon, color: "bg-red-100 text-red-600" },
    { id: ComponentType.Carousel, name: "Carrossel de Imagens", icon: Images, color: "bg-pink-100 text-pink-600" },
    { id: ComponentType.Button, name: "Botão", icon: ButtonIcon, color: "bg-green-100 text-green-600" },
    { id: ComponentType.Height, name: "Altura", icon: Ruler, color: "bg-amber-100 text-amber-600" },
    { id: ComponentType.Weight, name: "Peso", icon: Weight, color: "bg-orange-100 text-orange-600" },
    { id: ComponentType.Comparison, name: "Comparação de Itens", icon: SlidersHorizontal, color: "bg-teal-100 text-teal-600" },
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
  ];
  
  const filteredBasic = basicComponents.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAdvanced = advancedComponents.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
    
    // Cria um elemento fantasma personalizado para arrastar
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('rounded', 'p-2', 'bg-white', 'shadow-lg', 'text-sm', 'flex', 'items-center');
    ghostElement.innerHTML = `<span>Arrastando: ${componentType}</span>`;
    document.body.appendChild(ghostElement);
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    // Limpa o elemento fantasma após o uso
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };
  
  const renderComponentItem = (component: { id: string; name: string; icon: any; color: string }) => {
    const Icon = component.icon;
    return (
      <div
        key={component.id}
        className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-grab active:cursor-grabbing border-b group relative transition-all"
        draggable
        onDragStart={(e) => handleDragStart(e, component.id)}
        onDragEnd={() => {
          toast({
            title: "Componente arrastado",
            description: `Elemento "${component.name}" adicionado com sucesso.`,
          });
        }}
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
