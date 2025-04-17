import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CanvasElement } from "@/types/canvasTypes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/utils/store";

interface ButtonConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const ButtonConfig = ({ element, onUpdate }: ButtonConfigProps) => {
  const { currentFunnel } = useStore();
  
  // Extract all necessary properties with defaults
  const content = element.content || {};
  const buttonText = content.buttonText || "Continuar";
  const alignment = content.alignment || "center";
  const size = content.size || "default";
  const variant = content.variant || "default";
  const buttonColor = content.buttonColor || "#7c3aed"; // Default violet-600
  const animationEnabled = Boolean(content.animationEnabled);
  const delayEnabled = Boolean(content.delayEnabled);
  const delayTime = content.delayTime || 0;
  const navigation = content.navigation || { type: "next" };
  
  const [activeTab, setActiveTab] = useState("style");
  
  // Get steps from current funnel for the step selector
  const steps = currentFunnel?.steps.map(step => ({
    id: step.id,
    title: step.title
  })) || [];
  
  // When element changes, reset state
  useEffect(() => {
    console.log("ButtonConfig - Element updated:", element);
  }, [element.id]);

  const handleStyleUpdate = (updates: Record<string, any>) => {
    console.log("ButtonConfig - Style update:", updates);
    
    onUpdate({
      content: {
        ...content,
        ...updates,
      },
    });
  };

  const handleNavigationUpdate = (updates: Record<string, any>) => {
    console.log("ButtonConfig - Navigation update:", updates);
    
    onUpdate({
      content: {
        ...content,
        navigation: {
          ...navigation,
          ...updates,
        },
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="action">Ação</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-6">
          {/* Button Text */}
          <div className="space-y-2">
            <Label htmlFor="button-text">Texto do Botão</Label>
            <Input
              id="button-text"
              value={buttonText}
              onChange={(e) => handleStyleUpdate({ buttonText: e.target.value })}
              placeholder="Continuar"
            />
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <Label htmlFor="button-alignment">Alinhamento</Label>
            <div className="flex gap-2">
              <Button
                variant={alignment === "left" ? "default" : "outline"}
                size="sm"
                className={alignment === "left" ? "bg-violet-600 hover:bg-violet-700" : ""}
                onClick={() => handleStyleUpdate({ alignment: "left" })}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={alignment === "center" ? "default" : "outline"}
                size="sm"
                className={alignment === "center" ? "bg-violet-600 hover:bg-violet-700" : ""}
                onClick={() => handleStyleUpdate({ alignment: "center" })}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={alignment === "right" ? "default" : "outline"}
                size="sm"
                className={alignment === "right" ? "bg-violet-600 hover:bg-violet-700" : ""}
                onClick={() => handleStyleUpdate({ alignment: "right" })}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="button-size">Tamanho</Label>
            <Select 
              value={size} 
              onValueChange={(value) => handleStyleUpdate({ size: value })}
            >
              <SelectTrigger id="button-size">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Pequeno</SelectItem>
                <SelectItem value="default">Médio</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
                <SelectItem value="full">Largura Total</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Button Style */}
          <div className="space-y-2">
            <Label htmlFor="button-variant">Estilo</Label>
            <Select 
              value={variant} 
              onValueChange={(value) => handleStyleUpdate({ variant: value })}
            >
              <SelectTrigger id="button-variant">
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="outline">Contorno</SelectItem>
                <SelectItem value="secondary">Secundário</SelectItem>
                <SelectItem value="ghost">Fantasma</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="button-color">Cor</Label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                id="button-color" 
                value={buttonColor}
                onChange={(e) => handleStyleUpdate({ buttonColor: e.target.value })}
                className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
              />
              <Input 
                value={buttonColor}
                onChange={(e) => handleStyleUpdate({ buttonColor: e.target.value })}
                className="w-32 uppercase"
              />
            </div>
          </div>

          {/* Animation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animation-toggle">Animação Suave</Label>
              <p className="text-sm text-muted-foreground">Adiciona uma transição suave ao botão</p>
            </div>
            <Switch
              id="animation-toggle"
              checked={animationEnabled}
              onCheckedChange={(checked) => handleStyleUpdate({ animationEnabled: checked })}
            />
          </div>

          {/* Delay */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="delay-toggle">Delay de Aparição</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>O botão só aparecerá após o tempo especificado</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">Define quanto tempo o botão levará para aparecer</p>
              </div>
              <Switch
                id="delay-toggle"
                checked={delayEnabled}
                onCheckedChange={(checked) => handleStyleUpdate({ delayEnabled: checked })}
              />
            </div>

            {delayEnabled && (
              <div className="space-y-2">
                <Label htmlFor="delay-input">Tempo de Delay (ms)</Label>
                <Input
                  id="delay-input"
                  type="number"
                  min="0"
                  step="100"
                  value={delayTime}
                  onChange={(e) => handleStyleUpdate({ delayTime: Number(e.target.value) })}
                  placeholder="1000"
                />
                <p className="text-xs text-muted-foreground">
                  1000ms = 1 segundo
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="action" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="navigation-type">Ação ao Clicar</Label>
            <Select 
              value={navigation.type} 
              onValueChange={(value: "next" | "step" | "url") => handleNavigationUpdate({ type: value })}
            >
              <SelectTrigger id="navigation-type">
                <SelectValue placeholder="Selecione a ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Próximo Passo</SelectItem>
                <SelectItem value="step">Ir para Passo Específico</SelectItem>
                <SelectItem value="url">Abrir URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Facebook Pixel Event */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="facebook-event">Evento do Facebook Pixel</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este evento será enviado para o Facebook Ads quando o botão for clicado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={content.facebookEvent || ""} 
              onValueChange={(value) => handleStyleUpdate({ facebookEvent: value })}
            >
              <SelectTrigger id="facebook-event">
                <SelectValue placeholder="Selecione um evento (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                <SelectItem value="InitiateCheckout">InitiateCheckout</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Contact">Contact</SelectItem>
                <SelectItem value="AddToCart">AddToCart</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Subscribe">Subscribe</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Este evento será enviado para o Facebook Ads quando o usuário clicar neste botão
            </p>
          </div>

          {navigation.type === "step" && steps.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="step-selector">Selecionar Passo</Label>
              <Select
                value={navigation.stepId || ""}
                onValueChange={(value) => handleNavigationUpdate({ stepId: value })}
              >
                <SelectTrigger id="step-selector">
                  <SelectValue placeholder="Escolha um passo" />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {navigation.type === "step" && steps.length === 0 && (
            <div className="text-sm text-amber-600 mt-2">
              Nenhum passo disponível. Adicione passos no funil primeiro.
            </div>
          )}

          {navigation.type === "url" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={navigation.url || ""}
                onChange={(e) => handleNavigationUpdate({ url: e.target.value })}
                placeholder="https://exemplo.com"
              />
              
              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  id="new-tab"
                  checked={navigation.openInNewTab || false}
                  onCheckedChange={(checked) => handleNavigationUpdate({ openInNewTab: checked })}
                />
                <Label htmlFor="new-tab">Abrir em nova aba</Label>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ButtonConfig;
