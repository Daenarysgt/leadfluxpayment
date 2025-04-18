import { useState, useEffect, useRef, useCallback } from "react";
import { ComponentType } from "@/utils/types";
import { PricingContent } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, CheckCircle2, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { AdvancedColorPicker } from "./common/AdvancedColorPicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PricingConfigProps {
  element: any;
  onUpdate: (element: any) => void;
}

// Gradientes pré-definidos
const gradientPresets = [
  { id: 'blue-purple', name: 'Azul para Roxo', start: '#3B82F6', end: '#8B5CF6', direction: 'to right' },
  { id: 'green-blue', name: 'Verde para Azul', start: '#10B981', end: '#3B82F6', direction: 'to right' },
  { id: 'pink-orange', name: 'Rosa para Laranja', start: '#EC4899', end: '#F59E0B', direction: 'to right' },
  { id: 'indigo-cyan', name: 'Índigo para Ciano', start: '#6366F1', end: '#06B6D4', direction: 'to right' },
  { id: 'red-pink', name: 'Vermelho para Rosa', start: '#EF4444', end: '#EC4899', direction: 'to right' },
  { id: 'amber-orange', name: 'Âmbar para Laranja', start: '#F59E0B', end: '#F97316', direction: 'to right' },
  { id: 'lime-emerald', name: 'Lima para Esmeralda', start: '#84CC16', end: '#10B981', direction: 'to right' },
  { id: 'slate-gray', name: 'Cinza Elegante', start: '#475569', end: '#1E293B', direction: 'to right' },
];

const PricingConfig = ({ element, onUpdate }: PricingConfigProps) => {
  const [content, setContent] = useState<PricingContent>(element.content || {
    title: "Método Beauty",
    subtitle: "Tráfego Pago Estratégico",
    price: 127,
    originalPrice: 254,
    discount: 50,
    currency: "R$",
    discountLabel: "off",
    paymentType: "single",
    paymentPeriod: "onetime",
    paymentLabel: "à vista",
    buttonText: "Comprar Agora!",
    features: [
      "Modelo de Copy para Anúncios",
      "Aula Exclusiva",
      "Acesso a um Grupo VIP no WhatsApp",
      "Acesso a todas atualizações"
    ],
    backgroundColor: "#ffffff",
    textColor: "#333333",
    accentColor: "#2563eb",
    buttonColor: "#10b981",
    buttonTextColor: "#ffffff",
    borderRadius: 8,
    boxShadow: true,
    highlightTag: "",
    isHighlighted: false,
    style: "horizontal",
    alignment: "center",
    priceAlignment: "center",
    featuresAlignment: "left",
    useGradient: false,
    gradientStart: "#3B82F6",
    gradientEnd: "#8B5CF6",
    gradientDirection: "to right",
    navigation: {
      type: "next",
      stepId: "",
      url: "",
      openInNewTab: false
    }
  });

  // Referência para controlar o debounce das atualizações
  const updateTimeoutRef = useRef<number | null>(null);
  // Referência para evitar atualizações iniciais
  const initialRenderRef = useRef(true);
  // Referência para o conteúdo anterior
  const prevContentRef = useRef(element.content);

  // Função de atualização com debounce
  const debouncedUpdate = useCallback((newContent: PricingContent) => {
    // Limpar o timeout anterior se existir
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }

    // Verificar se houve mudança real no conteúdo
    if (JSON.stringify(newContent) === JSON.stringify(prevContentRef.current)) {
      return;
    }

    // Configurar um novo timeout para atualização
    updateTimeoutRef.current = window.setTimeout(() => {
      console.log("Aplicando atualização do Pricing após debounce");
      prevContentRef.current = newContent;
      onUpdate({
        ...element,
        content: newContent
      });
      updateTimeoutRef.current = null;
    }, 300); // 300ms de delay para debounce
  }, [element, onUpdate]);

  // Atualizar elemento quando o content mudar
  useEffect(() => {
    // Pular a primeira renderização
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    debouncedUpdate(content);
    
    // Cleanup ao desmontar o componente
    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [content, debouncedUpdate]);

  // Atualizar um valor no content
  const updateContent = (key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Atualizar um valor aninhado
  const updateNestedContent = (parentKey: string, key: string, value: any) => {
    setContent(prev => {
      const parentObj = prev[parentKey as keyof PricingContent] as Record<string, any> || {};
      return {
        ...prev,
        [parentKey]: {
          ...parentObj,
          [key]: value
        }
      };
    });
  };

  // Adicionar um novo item à lista de features
  const addFeature = () => {
    setContent(prev => ({
      ...prev,
      features: [...(prev.features || []), "Novo recurso"]
    }));
  };

  // Remover um item da lista de features
  const removeFeature = (index: number) => {
    setContent(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  // Atualizar um item da lista de features
  const updateFeature = (index: number, value: string) => {
    setContent(prev => {
      const updatedFeatures = [...(prev.features || [])];
      updatedFeatures[index] = value;
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };

  // Aplicar um gradiente predefinido
  const applyGradientPreset = (presetId: string) => {
    const preset = gradientPresets.find((p) => p.id === presetId);
    if (preset) {
      setContent(prev => ({
        ...prev,
        gradientStart: preset.start,
        gradientEnd: preset.end,
        gradientDirection: preset.direction as "to right" | "to bottom" | "to bottom right" | "to top right",
        gradientPreset: presetId
      }));
    }
  };

  const renderAlignmentButtons = (
    currentAlignment: string = "center", 
    onChange: (value: "left" | "center" | "right") => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex border rounded-md overflow-hidden">
        <button
          type="button"
          className={cn(
            "flex-1 p-2 flex justify-center items-center",
            currentAlignment === "left" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
          )}
          onClick={() => onChange("left")}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 p-2 flex justify-center items-center border-l border-r",
            currentAlignment === "center" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
          )}
          onClick={() => onChange("center")}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 p-2 flex justify-center items-center",
            currentAlignment === "right" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
          )}
          onClick={() => onChange("right")}
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="conteudo">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="estilo">Estilo</TabsTrigger>
          <TabsTrigger value="precos">Preços</TabsTrigger>
          <TabsTrigger value="botao">Botão</TabsTrigger>
        </TabsList>

        <TabsContent value="conteudo" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={content.title || ""}
              onChange={(e) => updateContent("title", e.target.value)}
              placeholder="Título do plano"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={content.subtitle || ""}
              onChange={(e) => updateContent("subtitle", e.target.value)}
              placeholder="Subtítulo do plano"
            />
          </div>

          <div className="space-y-2">
            <Label>Estilo do Pricing</Label>
            <Select
              value={content.style || "horizontal"}
              onValueChange={(value) => updateContent("style", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimalista</SelectItem>
                <SelectItem value="featured">Destaque</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alinhamento Geral</Label>
            <Select
              value={content.alignment || "center"}
              onValueChange={(value) => updateContent("alignment", value as "left" | "center" | "right")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha o alinhamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="features">Recursos</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(content.features || []).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Descrição do recurso"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="highlighted"
              checked={content.isHighlighted || false}
              onCheckedChange={(checked) => updateContent("isHighlighted", checked)}
            />
            <Label htmlFor="highlighted">Destacar este plano</Label>
          </div>

          {content.isHighlighted && (
            <div className="space-y-2">
              <Label htmlFor="highlightTag">Etiqueta de destaque</Label>
              <Input
                id="highlightTag"
                value={content.highlightTag || ""}
                onChange={(e) => updateContent("highlightTag", e.target.value)}
                placeholder="Ex: Mais popular"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="estilo" className="space-y-4 mt-4">
          <div className="space-y-2">
            {renderAlignmentButtons(
              content.priceAlignment || content.alignment || "center", 
              (value) => updateContent("priceAlignment", value),
              "Alinhamento do Preço"
            )}
          </div>
          
          <div className="space-y-2">
            {renderAlignmentButtons(
              content.featuresAlignment || "left", 
              (value) => updateContent("featuresAlignment", value),
              "Alinhamento dos Recursos"
            )}
          </div>
          
          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Cor de fundo</Label>
            <AdvancedColorPicker 
              value={content.backgroundColor || "#ffffff"} 
              onChange={(color) => updateContent("backgroundColor", color)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Cor do texto</Label>
            <AdvancedColorPicker 
              value={content.textColor || "#333333"} 
              onChange={(color) => updateContent("textColor", color)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Cor de destaque</Label>
            <AdvancedColorPicker 
              value={content.accentColor || "#2563eb"} 
              onChange={(color) => updateContent("accentColor", color)} 
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-3">
            <Switch
              id="useGradient"
              checked={content.useGradient || false}
              onCheckedChange={(checked) => updateContent("useGradient", checked)}
            />
            <Label htmlFor="useGradient">Usar gradiente</Label>
          </div>

          {content.useGradient && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradientStart">Cor inicial</Label>
                  <AdvancedColorPicker 
                    value={content.gradientStart || "#3B82F6"} 
                    onChange={(color) => updateContent("gradientStart", color)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradientEnd">Cor final</Label>
                  <AdvancedColorPicker 
                    value={content.gradientEnd || "#8B5CF6"} 
                    onChange={(color) => updateContent("gradientEnd", color)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Direção do gradiente</Label>
                <Select
                  value={content.gradientDirection || "to right"}
                  onValueChange={(value) => updateContent("gradientDirection", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to right">Da esquerda para direita</SelectItem>
                    <SelectItem value="to bottom">De cima para baixo</SelectItem>
                    <SelectItem value="to bottom right">Diagonal (↘)</SelectItem>
                    <SelectItem value="to top right">Diagonal (↗)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-3">
                <Switch
                  id="useButtonGradient"
                  checked={content.useButtonGradient !== false}
                  onCheckedChange={(checked) => updateContent("useButtonGradient", checked)}
                />
                <Label htmlFor="useButtonGradient">Aplicar gradiente ao botão</Label>
              </div>

              <div className="space-y-2">
                <Label>Presets de gradiente</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {gradientPresets.map((preset) => (
                    <div 
                      key={preset.id}
                      className={cn(
                        "h-10 rounded cursor-pointer border hover:opacity-80 transition-opacity",
                        content.gradientPreset === preset.id ? "ring-2 ring-blue-500" : ""
                      )}
                      style={{ 
                        background: `linear-gradient(${preset.direction}, ${preset.start}, ${preset.end})` 
                      }}
                      onClick={() => applyGradientPreset(preset.id)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="borderRadius">Arredondamento das bordas</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="borderRadius"
                min={0}
                max={24}
                step={1}
                value={[content.borderRadius || 8]}
                onValueChange={(value) => updateContent("borderRadius", value[0])}
                className="flex-1"
              />
              <span className="w-12 text-center">{content.borderRadius || 8}px</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="boxShadow"
              checked={content.boxShadow !== false}
              onCheckedChange={(checked) => updateContent("boxShadow", checked)}
            />
            <Label htmlFor="boxShadow">Sombra</Label>
          </div>
        </TabsContent>

        <TabsContent value="precos" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Input
                id="currency"
                value={content.currency || "R$"}
                onChange={(e) => updateContent("currency", e.target.value)}
                placeholder="R$"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                value={content.price || 0}
                onChange={(e) => updateContent("price", parseFloat(e.target.value) || 0)}
                placeholder="99.90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalPrice">Preço original (para mostrar desconto)</Label>
            <Input
              id="originalPrice"
              type="number"
              value={content.originalPrice || ""}
              onChange={(e) => updateContent("originalPrice", e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="199.90"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={content.discount || ""}
                onChange={(e) => updateContent("discount", e.target.value ? parseFloat(e.target.value) : "")}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountLabel">Etiqueta de desconto</Label>
              <Input
                id="discountLabel"
                value={content.discountLabel || "off"}
                onChange={(e) => updateContent("discountLabel", e.target.value)}
                placeholder="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentLabel">Informação adicional de pagamento</Label>
            <Input
              id="paymentLabel"
              value={content.paymentLabel || ""}
              onChange={(e) => updateContent("paymentLabel", e.target.value)}
              placeholder="Ex: à vista, por mês, etc."
            />
          </div>
        </TabsContent>

        <TabsContent value="botao" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="buttonText">Texto do botão</Label>
            <Input
              id="buttonText"
              value={content.buttonText || "Comprar Agora"}
              onChange={(e) => updateContent("buttonText", e.target.value)}
              placeholder="Comprar Agora"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonColor">Cor do botão</Label>
            <AdvancedColorPicker 
              value={content.buttonColor || "#10b981"} 
              onChange={(color) => updateContent("buttonColor", color)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonTextColor">Cor do texto do botão</Label>
            <AdvancedColorPicker 
              value={content.buttonTextColor || "#ffffff"} 
              onChange={(color) => updateContent("buttonTextColor", color)} 
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label>Ação do botão</Label>
            <Select
              value={content.navigation?.type || "next"}
              onValueChange={(value) => updateNestedContent("navigation", "type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha a ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Próximo passo</SelectItem>
                <SelectItem value="step">Ir para um passo específico</SelectItem>
                <SelectItem value="url">Abrir URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {content.navigation?.type === "step" && (
            <div className="space-y-2">
              <Label htmlFor="stepId">ID do passo</Label>
              <Input
                id="stepId"
                value={content.navigation?.stepId || ""}
                onChange={(e) => updateNestedContent("navigation", "stepId", e.target.value)}
                placeholder="ID do passo"
              />
            </div>
          )}

          {content.navigation?.type === "url" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={content.navigation?.url || ""}
                  onChange={(e) => updateNestedContent("navigation", "url", e.target.value)}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="openInNewTab"
                  checked={content.navigation?.openInNewTab || false}
                  onCheckedChange={(checked) => updateNestedContent("navigation", "openInNewTab", checked)}
                />
                <Label htmlFor="openInNewTab">Abrir em nova aba</Label>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingConfig; 