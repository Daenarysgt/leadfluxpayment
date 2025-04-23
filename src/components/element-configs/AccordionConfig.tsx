import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronUp, 
  Trash, 
  PlusCircle,
  ArrowDown,
  ArrowUp,
  Bold,
  Type
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AccordionConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const AccordionConfig = ({ element, onUpdate }: AccordionConfigProps) => {
  // Acessar o conteúdo atual do elemento
  const content = element.content || {};
  
  // Estado local para o item sendo editado atualmente
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  
  // Garantir que temos um array de itens, mesmo que vazio
  const items = content.items || [];
  const currentItem = items[currentItemIndex] || {};
  
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState("geral");
  
  // Atualizar o conteúdo do elemento
  const handleContentUpdate = (updates: any) => {
    onUpdate({
      content: {
        ...content,
        ...updates
      }
    });
  };
  
  // Adicionar novo item
  const addItem = () => {
    const newItems = [...items, {
      title: `Item ${items.length + 1}`,
      content: "Conteúdo do item",
      titleColor: "#000000",
      contentColor: "#666666",
      contentBackgroundColor: "#ffffff",
      titleSize: 16,
      contentSize: 14,
      titleBold: false,
      titleItalic: false,
      backgroundColor: "#f9fafb",
      borderColor: "#e5e7eb"
    }];
    
    handleContentUpdate({ items: newItems });
    setCurrentItemIndex(newItems.length - 1);
  };
  
  // Remover item
  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    handleContentUpdate({ items: newItems });
    
    // Ajustar o índice atual se necessário
    if (currentItemIndex >= newItems.length) {
      setCurrentItemIndex(Math.max(0, newItems.length - 1));
    }
  };
  
  // Atualizar item específico
  const updateItem = (index: number, updates: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      ...updates
    };
    
    handleContentUpdate({ items: newItems });
  };
  
  // Mover item para cima
  const moveItemUp = (index: number) => {
    if (index === 0) return;
    
    const newItems = [...items];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    
    handleContentUpdate({ items: newItems });
    setCurrentItemIndex(index - 1);
  };
  
  // Mover item para baixo
  const moveItemDown = (index: number) => {
    if (index === items.length - 1) return;
    
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    
    handleContentUpdate({ items: newItems });
    setCurrentItemIndex(index + 1);
  };
  
  return (
    <div className="p-4 space-y-6 pb-24">
      <div>
        <h3 className="text-lg font-medium">Configurar Accordion</h3>
        <p className="text-sm text-muted-foreground">
          Configure o comportamento e aparência do acordeão.
        </p>
      </div>
      
      <Separator />
      
      <Tabs
        defaultValue="geral"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="estilo">Estilo</TabsTrigger>
        </TabsList>
        
        {/* Aba de Configurações Gerais */}
        <TabsContent value="geral" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="accordion-title">Título do Accordion (opcional)</Label>
            <Input
              id="accordion-title"
              value={content.title || ""}
              onChange={(e) => handleContentUpdate({ title: e.target.value })}
              placeholder="Digite um título para todo o acordeão"
            />
            <p className="text-xs text-muted-foreground">
              Este título será exibido acima de todos os itens do acordeão
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Estilo de visualização</Label>
            <Select
              value={content.displayStyle || "default"}
              onValueChange={(value) => handleContentUpdate({ displayStyle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="faq">FAQ (Perguntas Frequentes)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Escolha como o acordeão será exibido visualmente
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Comportamento dos itens</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="allow-multiple"
                checked={content.allowMultiple || false}
                onCheckedChange={(checked) => handleContentUpdate({ allowMultiple: checked })}
              />
              <Label htmlFor="allow-multiple">Permitir múltiplos itens abertos</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Quando ativado, vários itens podem estar abertos simultaneamente
            </p>
          </div>
        </TabsContent>
        
        {/* Aba de Itens */}
        <TabsContent value="itens" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-medium">Gerenciar Itens</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
          
          {items.length > 0 ? (
            <div className="space-y-6">
              {/* Lista de itens */}
              <div className="border rounded-md overflow-hidden">
                {items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${index === currentItemIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                    onClick={() => setCurrentItemIndex(index)}
                  >
                    <div className="truncate flex-1">
                      <span className="text-sm font-medium">{item.title || `Item ${index + 1}`}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItemUp(index);
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItemDown(index);
                        }}
                        disabled={index === items.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(index);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Editor do item atual */}
              {items.length > 0 && (
                <div className="space-y-4 border rounded-md p-4">
                  <h5 className="text-sm font-medium">Editar Item {currentItemIndex + 1}</h5>
                  
                  <div className="space-y-2">
                    <Label htmlFor="item-title">Título</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="item-title"
                        value={currentItem.title || ""}
                        onChange={(e) => updateItem(currentItemIndex, { title: e.target.value })}
                        placeholder="Título do item"
                      />
                      <ToggleGroup type="multiple" variant="outline">
                        <ToggleGroupItem
                          value="bold"
                          aria-label="Negrito"
                          className="h-9 w-9 p-0"
                          data-state={currentItem.titleBold ? "on" : "off"}
                          onClick={() => updateItem(currentItemIndex, { titleBold: !currentItem.titleBold })}
                        >
                          <Bold className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="italic"
                          aria-label="Itálico"
                          className="h-9 w-9 p-0"
                          data-state={currentItem.titleItalic ? "on" : "off"}
                          onClick={() => updateItem(currentItemIndex, { titleItalic: !currentItem.titleItalic })}
                        >
                          <span className="italic font-serif text-sm">I</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="item-content">Conteúdo</Label>
                    <Textarea
                      id="item-content"
                      value={currentItem.content || ""}
                      onChange={(e) => updateItem(currentItemIndex, { content: e.target.value })}
                      placeholder="Conteúdo do item"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-color">Cor do título</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          id="title-color"
                          value={currentItem.titleColor || "#000000"}
                          onChange={(e) => updateItem(currentItemIndex, { titleColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={currentItem.titleColor || "#000000"}
                          onChange={(e) => updateItem(currentItemIndex, { titleColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content-color">Cor do conteúdo</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          id="content-color"
                          value={currentItem.contentColor || "#666666"}
                          onChange={(e) => updateItem(currentItemIndex, { contentColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={currentItem.contentColor || "#666666"}
                          onChange={(e) => updateItem(currentItemIndex, { contentColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-bg-color">Cor de fundo do cabeçalho</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          id="item-bg-color"
                          value={currentItem.backgroundColor || "#f9fafb"}
                          onChange={(e) => updateItem(currentItemIndex, { backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={currentItem.backgroundColor || "#f9fafb"}
                          onChange={(e) => updateItem(currentItemIndex, { backgroundColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item-border-color">Cor da borda</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          id="item-border-color"
                          value={currentItem.borderColor || "#e5e7eb"}
                          onChange={(e) => updateItem(currentItemIndex, { borderColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={currentItem.borderColor || "#e5e7eb"}
                          onChange={(e) => updateItem(currentItemIndex, { borderColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="content-bg-color">Cor de fundo do conteúdo</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          id="content-bg-color"
                          value={currentItem.contentBackgroundColor || "#ffffff"}
                          onChange={(e) => updateItem(currentItemIndex, { contentBackgroundColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={currentItem.contentBackgroundColor || "#ffffff"}
                          onChange={(e) => updateItem(currentItemIndex, { contentBackgroundColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="title-size">Tamanho do título</Label>
                        <span className="text-xs text-muted-foreground">
                          {currentItem.titleSize || 16}px
                        </span>
                      </div>
                      <Slider
                        id="title-size"
                        min={12}
                        max={24}
                        step={1}
                        value={[currentItem.titleSize || 16]}
                        onValueChange={(values) => updateItem(currentItemIndex, { titleSize: values[0] })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="content-size">Tamanho do conteúdo</Label>
                        <span className="text-xs text-muted-foreground">
                          {currentItem.contentSize || 14}px
                        </span>
                      </div>
                      <Slider
                        id="content-size"
                        min={10}
                        max={20}
                        step={1}
                        value={[currentItem.contentSize || 14]}
                        onValueChange={(values) => updateItem(currentItemIndex, { contentSize: values[0] })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-md">
              <Type className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <h5 className="font-medium mb-1">Nenhum item adicionado</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione itens ao seu accordeão para começar
              </p>
              <Button
                variant="outline"
                onClick={addItem}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Aba de Estilo */}
        <TabsContent value="estilo" className="space-y-4 pt-4">
          <div className="space-y-6">
            {/* Cores dos ícones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="active-icon-color">Cor do ícone expandido</Label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="color"
                    id="active-icon-color"
                    value={content.corDoIconeExpandido || "#3b82f6"}
                    onChange={(e) => handleContentUpdate({ corDoIconeExpandido: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={content.corDoIconeExpandido || "#3b82f6"}
                    onChange={(e) => handleContentUpdate({ corDoIconeExpandido: e.target.value })}
                    className="flex-1"
                  />
                  <ChevronUp className="h-5 w-5 ml-2" style={{ color: content.corDoIconeExpandido || "#3b82f6" }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inactive-icon-color">Cor do ícone recolhido</Label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="color"
                    id="inactive-icon-color"
                    value={content.corDoIconeRecolhido || "#64748b"}
                    onChange={(e) => handleContentUpdate({ corDoIconeRecolhido: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={content.corDoIconeRecolhido || "#64748b"}
                    onChange={(e) => handleContentUpdate({ corDoIconeRecolhido: e.target.value })}
                    className="flex-1"
                  />
                  <ChevronDown className="h-5 w-5 ml-2" style={{ color: content.corDoIconeRecolhido || "#64748b" }} />
                </div>
              </div>
            </div>
            
            {/* Arredondamento das bordas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="border-radius">Arredondamento das bordas</Label>
                <span className="text-xs text-muted-foreground">
                  {content.borderRadius || 6}px
                </span>
              </div>
              <Slider
                id="border-radius"
                min={0}
                max={20}
                step={1}
                value={[content.borderRadius || 6]}
                onValueChange={(values) => handleContentUpdate({ borderRadius: values[0] })}
              />
            </div>
            
            {/* Margem superior */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="margin-top">Margem superior</Label>
                <span className="text-xs text-muted-foreground">
                  {content.marginTop || 0}px
                </span>
              </div>
              <Slider
                id="margin-top"
                min={0}
                max={100}
                step={1}
                value={[content.marginTop || 0]}
                onValueChange={(values) => handleContentUpdate({ marginTop: values[0] })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccordionConfig; 