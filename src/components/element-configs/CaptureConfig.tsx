import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, HelpCircle, ArrowUp, ArrowDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/utils/store";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface CaptureConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

interface CaptureField {
  id: string;
  type: string;
  placeholder: string;
}

const CaptureConfig = ({ element, onUpdate }: CaptureConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  const navigation = content.navigation || { type: "next" };
  
  // Obter os passos do funil para a navegação
  const { currentFunnel } = useStore();
  const steps = currentFunnel?.steps || [];
  
  // Ref para controlar se a migração já foi feita
  const migrationDoneRef = useRef(false);
  
  // Estado local para campos de captura
  const [captureFields, setCaptureFields] = useState<CaptureField[]>(() => {
    const fields = content.captureFields;
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      // Compatibilidade com versão anterior - migrar campo único para array
      return [{
        id: uuidv4(),
        type: content.captureType || 'email',
        placeholder: content.placeholder || 'Seu endereço de email'
      }];
    }
    return fields;
  });

  const [activeTab, setActiveTab] = useState("content");
  const [marginTop, setMarginTop] = useState(style.marginTop || 0);
  const [showButton, setShowButton] = useState(content.showButton !== false);
  
  // Efeito para migração de versão antiga para nova, executado apenas uma vez
  useEffect(() => {
    // Verificar se a migração é necessária e se ainda não foi feita
    if (!migrationDoneRef.current && 
        (!content.captureFields || !Array.isArray(content.captureFields) || content.captureFields.length === 0)) {
      
      // Marcar que a migração foi feita
      migrationDoneRef.current = true;
      
      // Atualizar o elemento com os novos campos
      onUpdate({
        ...element,
        content: {
          ...content,
          captureFields: captureFields
        }
      });
    }
  }, [element.id]); // Dependência apenas do ID do elemento para garantir execução única

  const handleContentChange = (key: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        [key]: value
      }
    });
  };
  
  const handleStyleChange = (key: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        style: {
          ...style,
          [key]: value
        }
      }
    });
  };

  const handleNavigationUpdate = (updates: Partial<any>) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        navigation: {
          ...navigation,
          ...updates
        }
      }
    });
  };

  const addCaptureField = () => {
    const newField: CaptureField = {
      id: uuidv4(),
      type: 'text',
      placeholder: 'Novo campo'
    };

    const updatedFields = [...captureFields, newField];
    setCaptureFields(updatedFields);

    onUpdate({
      ...element,
      content: {
        ...content,
        captureFields: updatedFields
      }
    });
  };

  const removeCaptureField = (id: string) => {
    // Não permitir remover se só tiver um campo
    if (captureFields.length <= 1) return;

    const updatedFields = captureFields.filter(field => field.id !== id);
    setCaptureFields(updatedFields);

    onUpdate({
      ...element,
      content: {
        ...content,
        captureFields: updatedFields
      }
    });
  };

  const updateCaptureField = (id: string, key: string, value: string) => {
    const updatedFields = captureFields.map(field => 
      field.id === id ? { ...field, [key]: value } : field
    );
    setCaptureFields(updatedFields);

    onUpdate({
      ...element,
      content: {
        ...content,
        captureFields: updatedFields
      }
    });
  };

  // Manipulador para mudanças na margem superior
  const handleMarginTopChange = (value: number[]) => {
    // Atualizar a margem superior no estado local
    setMarginTop(value[0]);
    
    // Atualizar o elemento
    handleStyleChange('marginTop', value[0]);
  };

  // Update element when debounced values change
  useEffect(() => {
    onUpdate({
      ...element,
      content: {
        ...content,
        style: {
          ...style,
          marginTop: marginTop
        }
      }
    });
  }, [marginTop, style, onUpdate, content]);

  return (
    <div className="space-y-4 p-1 pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
          <TabsTrigger value="action" className="flex-1">Ação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Título</ConfigLabel>
            <Input 
              value={content.title || ''} 
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Inscreva-se na nossa newsletter"
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Descrição</ConfigLabel>
            <Textarea 
              value={content.description || ''} 
              onChange={(e) => handleContentChange('description', e.target.value)}
              placeholder="Receba as últimas atualizações diretamente na sua caixa de entrada."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Campos de captura</ConfigLabel>
            <div className="space-y-3 border rounded-md p-3">
              {captureFields.map((field, index) => (
                <div key={field.id} className="space-y-2 pt-2 pb-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Campo {index + 1}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCaptureField(field.id)}
                      disabled={captureFields.length <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Tipo de campo</label>
                    <Select 
                      value={field.type} 
                      onValueChange={(value) => updateCaptureField(field.id, 'type', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Tipo de campo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Texto do placeholder</label>
                    <Input 
                      value={field.placeholder} 
                      onChange={(e) => updateCaptureField(field.id, 'placeholder', e.target.value)}
                      placeholder="Placeholder"
                      className="h-8"
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addCaptureField}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar campo
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Texto do botão</ConfigLabel>
            <Input 
              value={content.buttonText || ''} 
              onChange={(e) => handleContentChange('buttonText', e.target.value)}
              placeholder="Inscrever-se"
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Texto padrão do botão</ConfigLabel>
            <Input 
              value={content.defaultButtonText || ''} 
              onChange={(e) => handleContentChange('defaultButtonText', e.target.value)}
              placeholder="Inscrever-se"
            />
            <p className="text-xs text-muted-foreground">
              Este texto será usado como padrão quando o campo acima estiver vazio
            </p>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Mensagem de sucesso</ConfigLabel>
            <Input 
              value={content.successMessage || ''} 
              onChange={(e) => handleContentChange('successMessage', e.target.value)}
              placeholder="Obrigado por se inscrever!"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="show-button" className="cursor-pointer">Show Button</Label>
            <Switch
              id="show-button"
              checked={showButton}
              onCheckedChange={(value) => {
                setShowButton(value);
                handleContentChange('showButton', value);
              }}
            />
          </div>

          {showButton && (
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                placeholder="Subscribe"
                value={content.buttonText || ''}
                onChange={(e) => handleContentChange('buttonText', e.target.value)}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Cor principal</ConfigLabel>
            <ColorPicker 
              value={style.primaryColor || '#8B5CF6'} 
              onChange={(color) => handleStyleChange('primaryColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Alinhamento do título</ConfigLabel>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  type="button"
                  className={`border rounded p-2 ${style.titleAlignment === align ? 'bg-primary text-white' : 'bg-background'}`}
                  onClick={() => handleStyleChange('titleAlignment', align)}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Controle de Margem Superior */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <ConfigLabel htmlFor="margin-top">Margem superior</ConfigLabel>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{marginTop}px</span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop - 5])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop + 5])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Slider
              id="margin-top"
              min={-100}
              max={100}
              step={1}
              value={[marginTop]}
              onValueChange={handleMarginTopChange}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="action" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="navigation-type">Ação ao Enviar</Label>
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
                    <p>Este evento será enviado para o Facebook Ads quando o formulário for enviado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={content.facebookEvent || "none"} 
              onValueChange={(value) => {
                const eventValue = value === "none" ? "" : value;
                handleContentChange('facebookEvent', eventValue);
              }}
            >
              <SelectTrigger id="facebook-event">
                <SelectValue placeholder="Selecione um evento (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Contact">Contact</SelectItem>
                <SelectItem value="CompleteRegistration">CompleteRegistration</SelectItem>
                <SelectItem value="Subscribe">Subscribe</SelectItem>
                <SelectItem value="custom">Evento Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Este evento será enviado para o Facebook Ads quando o usuário enviar o formulário
            </p>
            
            {/* Input para evento personalizado */}
            {content.facebookEvent === "custom" && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="custom-event">Nome do evento personalizado</Label>
                <Input 
                  id="custom-event"
                  placeholder="Ex: MeuEventoPersonalizado"
                  value={content.facebookCustomEventName || ""}
                  onChange={(e) => handleContentChange('facebookCustomEventName', e.target.value)}
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
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-violet-700"
                    onClick={() => handleContentChange('facebookEventDebugMode', !content.facebookEventDebugMode)}
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">URL de destino</Label>
                <Input
                  id="url-input"
                  placeholder="https://exemplo.com.br"
                  value={navigation.url || ""}
                  onChange={(e) => handleNavigationUpdate({ url: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="open-new-tab"
                  checked={navigation.openInNewTab || false}
                  onChange={(e) => handleNavigationUpdate({ openInNewTab: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="open-new-tab" className="text-sm">
                  Abrir em nova aba
                </Label>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaptureConfig;
