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
import MarginTopConfig from "./common/MarginTopConfig";

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
  const textColor = content.textColor || "#ffffff"; // Default text color
  const animationEnabled = Boolean(content.animationEnabled);
  const animationType = content.animationType || "none"; // Novo campo para tipo de animação
  const delayEnabled = Boolean(content.delayEnabled);
  const delayTime = content.delayTime || 0;
  const navigation = content.navigation || { type: "next" };
  const marginTop = content.marginTop || 0;
  
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

  const handleMarginTopChange = (value: number) => {
    handleStyleUpdate({ marginTop: value });
  };

  return (
    <div className="p-6 space-y-6 pb-32">
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
                <SelectItem value="gradient">Gradiente</SelectItem>
                <SelectItem value="3d">Efeito 3D</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
                <SelectItem value="rounded">Arredondado</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Preview do estilo selecionado */}
            <div className="mt-2 p-4 bg-gray-50 rounded-md flex justify-center">
              <Button 
                variant={variant as any} 
                size={size === "full" ? "default" : size as any}
                className={`${variant === "gradient" ? "bg-gradient-to-r from-purple-500 to-blue-500" : ""} 
                           ${variant === "3d" ? "shadow-lg transform active:translate-y-1" : ""}
                           ${variant === "neon" ? "shadow-[0_0_10px_rgba(124,58,237,0.7)]" : ""}
                           ${variant === "rounded" ? "rounded-full" : ""}`}
                style={{ 
                  backgroundColor: variant === "default" ? buttonColor : undefined,
                  borderColor: variant === "outline" ? buttonColor : undefined,
                  color: variant === "outline" || variant === "ghost" ? buttonColor : textColor
                }}
              >
                {buttonText || "Continuar"}
              </Button>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="button-color">Cor do Botão</Label>
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
          
          {/* Text Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="text-color">Cor do Texto</Label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                id="text-color" 
                value={textColor}
                onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
                className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
              />
              <Input 
                value={textColor}
                onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
                className="w-32 uppercase"
              />
            </div>
          </div>
          
          {/* Margin Top Config */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Espaçamento</h3>
            <MarginTopConfig
              value={marginTop}
              onChange={handleMarginTopChange}
            />
          </div>

          {/* Animation Type */}
          <div className="space-y-2">
            <Label htmlFor="animation-type">Tipo de Animação</Label>
            <Select 
              value={animationType} 
              onValueChange={(value) => handleStyleUpdate({ 
                animationType: value,
                animationEnabled: value !== "none"
              })}
            >
              <SelectTrigger id="animation-type">
                <SelectValue placeholder="Selecione o tipo de animação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem Animação</SelectItem>
                <SelectItem value="pulse">Pulsar</SelectItem>
                <SelectItem value="bounce">Quicar</SelectItem>
                <SelectItem value="shake">Tremer</SelectItem>
                <SelectItem value="glow">Brilhar</SelectItem>
                <SelectItem value="scale">Escalar</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Preview da animação selecionada */}
            {animationType !== "none" && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md flex justify-center">
                <Button 
                  variant={variant as any}
                  size={size === "full" ? "default" : size as any}
                  className={`
                    ${animationType === "pulse" ? "animate-pulse" : ""}
                    ${animationType === "bounce" ? "animate-bounce" : ""}
                    ${animationType === "shake" ? "animate-[wiggle_1s_ease-in-out_infinite]" : ""}
                    ${animationType === "glow" ? "animate-[glow_1.5s_ease-in-out_infinite]" : ""}
                    ${animationType === "scale" ? "animate-[scale_1.5s_ease-in-out_infinite]" : ""}
                    ${variant === "gradient" ? "bg-gradient-to-r from-purple-500 to-blue-500" : ""} 
                    ${variant === "3d" ? "shadow-lg transform active:translate-y-1" : ""}
                    ${variant === "neon" ? "shadow-[0_0_10px_rgba(124,58,237,0.7)]" : ""}
                    ${variant === "rounded" ? "rounded-full" : ""}
                  `}
                  style={{ 
                    backgroundColor: variant === "default" ? buttonColor : undefined,
                    borderColor: variant === "outline" ? buttonColor : undefined,
                    color: variant === "outline" || variant === "ghost" ? buttonColor : textColor
                  }}
                >
                  {buttonText || "Continuar"}
                </Button>
              </div>
            )}
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
              value={content.facebookEvent || "none"} 
              onValueChange={(value) => {
                // Se o valor for "none", salve como null ou vazio na configuração
                const eventValue = value === "none" ? "" : value;
                handleStyleUpdate({ facebookEvent: eventValue });
              }}
            >
              <SelectTrigger id="facebook-event">
                <SelectValue placeholder="Selecione um evento (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="InitiateCheckout">InitiateCheckout</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Contact">Contact</SelectItem>
                <SelectItem value="AddToCart">AddToCart</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Subscribe">Subscribe</SelectItem>
                <SelectItem value="custom">Evento Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Este evento será enviado para o Facebook Ads quando o usuário clicar neste botão
            </p>
            
            {/* Input para evento personalizado */}
            {content.facebookEvent === "custom" && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="custom-event">Nome do evento personalizado</Label>
                <Input 
                  id="custom-event"
                  placeholder="Ex: MeuEventoPersonalizado"
                  value={content.facebookCustomEventName || ""}
                  onChange={(e) => handleStyleUpdate({ facebookCustomEventName: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use apenas letras, números e sublinhados. Não use espaços.
                </p>
              </div>
            )}
            
            {/* Parâmetros avançados para eventos específicos do Facebook Pixel */}
            {content.facebookEvent && content.facebookEvent !== "none" && content.facebookEvent !== "" && (
              <div className="mt-4 space-y-4 rounded-md border p-4 bg-gray-50">
                <h4 className="text-sm font-medium">Parâmetros avançados do evento</h4>
                
                {(content.facebookEvent === "Purchase" || content.facebookEvent === "InitiateCheckout") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="event-value">Valor monetário</Label>
                      <Input 
                        id="event-value"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={content.facebookEventParams?.value || ""}
                        onChange={(e) => handleStyleUpdate({ 
                          facebookEventParams: {
                            ...content.facebookEventParams,
                            value: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Valor associado à transação (ex: 29.90)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="event-currency">Moeda</Label>
                      <Select
                        value={content.facebookEventParams?.currency || "BRL"}
                        onValueChange={(value) => handleStyleUpdate({ 
                          facebookEventParams: {
                            ...content.facebookEventParams,
                            currency: value
                          }
                        })}
                      >
                        <SelectTrigger id="event-currency">
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (BRL)</SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {content.facebookEvent === "Lead" && (
                  <div className="space-y-2">
                    <Label htmlFor="lead-type">Tipo de lead</Label>
                    <Input 
                      id="lead-type"
                      placeholder="Ex: quente, frio, newsletter"
                      value={content.facebookEventParams?.lead_type || ""}
                      onChange={(e) => handleStyleUpdate({ 
                        facebookEventParams: {
                          ...content.facebookEventParams,
                          lead_type: e.target.value
                        }
                      })}
                    />
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-violet-700"
                    onClick={() => handleStyleUpdate({ 
                      facebookEventDebugMode: !content.facebookEventDebugMode 
                    })}
                  >
                    {content.facebookEventDebugMode ? "Desativar" : "Ativar"} modo de teste
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    O modo de teste mostra no console os eventos enviados
                  </p>
                </div>
              </div>
            )}
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
