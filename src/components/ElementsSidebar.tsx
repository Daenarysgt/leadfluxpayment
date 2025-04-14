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
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ElementsSidebarProps {
  // Add any props if needed
}

const ElementsSidebar = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  
  const basicComponents = [
    { id: ComponentType.MultipleChoice, name: "Múltipla Escolha", icon: CheckSquare, color: "bg-blue-100 text-blue-600" },
    { id: ComponentType.MultipleChoiceImage, name: "Múltipla Escolha com Imagem", icon: ImagePlus, color: "bg-purple-100 text-purple-600" },
    { id: ComponentType.Text, name: "Texto", icon: Type, color: "bg-gray-100 text-gray-600" },
    { id: ComponentType.Image, name: "Imagem", icon: ImageIcon, color: "bg-indigo-100 text-indigo-600" },
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
    <div className="w-[280px] border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg text-gray-800 mb-1">Elementos</h2>
        <p className="text-sm text-gray-500 mb-4">Arraste e solte na sua página</p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar elementos..." 
            className="pl-9 h-9 bg-gray-50/80 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <div className="px-4 border-b">
          <TabsList className="w-full justify-start gap-2 h-12 bg-transparent">
            <TabsTrigger 
              value="todos"
              className={cn(
                "rounded-md data-[state=active]:bg-gray-100/80",
                "data-[state=active]:shadow-none text-sm px-3"
              )}
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="favoritos"
              className={cn(
                "rounded-md data-[state=active]:bg-gray-100/80",
                "data-[state=active]:shadow-none text-sm px-3"
              )}
            >
              <Star className="h-4 w-4 mr-1" />
              Favoritos
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4">
            <div className="space-y-4">
              {/* Seção Básicos */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Básicos</h3>
                <div className="grid gap-2">
                  <ElementItem
                    icon="📝"
                    label="Múltipla Escolha"
                    description="Pergunta com opções"
                  />
                  <ElementItem
                    icon="🖼️"
                    label="Múltipla Escolha com Imagem"
                    description="Opções com imagens"
                  />
                  <ElementItem
                    icon="📄"
                    label="Texto"
                    description="Campo de texto livre"
                  />
                  <ElementItem
                    icon="🌄"
                    label="Imagem"
                    description="Upload de imagem"
                  />
                  <ElementItem
                    icon="🎯"
                    label="Botão"
                    description="Botão de ação"
                  />
                </div>
              </div>

              {/* Seção Avançados */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Avançados</h3>
                <div className="grid gap-2">
                  <ElementItem
                    icon="📊"
                    label="Gráficos"
                    description="Visualização de dados"
                  />
                  <ElementItem
                    icon="📋"
                    label="Argumentos"
                    description="Lista de argumentos"
                  />
                  <ElementItem
                    icon="💬"
                    label="Depoimentos"
                    description="Feedback de usuários"
                  />
                  <ElementItem
                    icon="📈"
                    label="Nível"
                    description="Indicador de progresso"
                  />
                </div>
              </div>

              {/* Seção Especiais */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Especiais</h3>
                <div className="grid gap-2">
                  <ElementItem
                    icon="📸"
                    label="Captura"
                    description="Captura de tela"
                  />
                  <ElementItem
                    icon="⏳"
                    label="Loading"
                    description="Indicador de carregamento"
                  />
                  <ElementItem
                    icon="🎯"
                    label="Cartesiano"
                    description="Gráfico cartesiano"
                  />
                  <ElementItem
                    icon="⭐"
                    label="Avaliação"
                    description="Sistema de estrelas"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

// Componente auxiliar para os itens
const ElementItem = ({ icon, label, description }: { icon: string; label: string; description: string }) => (
  <div className="group flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50 cursor-move transition-all duration-200">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-gray-50 group-hover:bg-white transition-colors">
      <span className="text-xl">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-xs text-gray-500 truncate">{description}</p>
    </div>
  </div>
);

export default ElementsSidebar;
