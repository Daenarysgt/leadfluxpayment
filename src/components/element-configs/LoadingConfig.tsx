import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/utils/store";

interface LoadingConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const LoadingConfig = ({ element, onUpdate }: LoadingConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  const navigation = content.navigation || {};
  
  const [activeTab, setActiveTab] = useState("content");
  const { currentFunnel } = useStore();
  const [funnelSteps, setFunnelSteps] = useState<any[]>([]);
  
  // Carregar as etapas do funil atual
  useEffect(() => {
    try {
      if (currentFunnel && currentFunnel.steps && currentFunnel.steps.length > 0) {
        // Ordenar as etapas por ordem
        const sortedSteps = [...currentFunnel.steps].sort((a, b) => {
          const orderA = a.order_index ?? 0;
          const orderB = b.order_index ?? 0;
          return orderA - orderB;
        });
        
        setFunnelSteps(sortedSteps);
        console.log("Etapas do funil carregadas:", sortedSteps.length);
      } else {
        console.log("Nenhuma etapa disponível no funil atual");
        setFunnelSteps([]);
      }
    } catch (error) {
      console.error("Erro ao carregar etapas do funil:", error);
      setFunnelSteps([]);
    }
  }, [currentFunnel]);
  
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

  const handleNavigationChange = (key: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        navigation: {
          ...navigation,
          [key]: value
        }
      }
    });
  };

  return (
    <div className="space-y-4 p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
          <TabsTrigger value="navigation" className="flex-1">Navegação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Título</ConfigLabel>
            <Input 
              value={content.title || ''} 
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Carregando..."
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Descrição</ConfigLabel>
            <Textarea 
              value={content.description || ''} 
              onChange={(e) => handleContentChange('description', e.target.value)}
              placeholder="Por favor, aguarde enquanto processamos sua solicitação."
              rows={3}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <ConfigLabel>Estilo de carregamento</ConfigLabel>
            <Select 
              value={style.loadingStyle || 'spinner'} 
              onValueChange={(value) => handleStyleChange('loadingStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estilo de carregamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spinner">Spinner</SelectItem>
                <SelectItem value="dots">Pontos</SelectItem>
                <SelectItem value="progress">Barra de progresso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Cor principal</ConfigLabel>
            <ColorPicker 
              value={style.primaryColor || '#8B5CF6'} 
              onChange={(color) => handleStyleChange('primaryColor', color)}
            />
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Tamanho</ConfigLabel>
            <Select 
              value={style.size || 'medium'} 
              onValueChange={(value) => handleStyleChange('size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
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
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <ConfigLabel>Redirecionamento automático</ConfigLabel>
              <Switch 
                checked={navigation.autoRedirect || false} 
                onCheckedChange={(checked) => handleNavigationChange('autoRedirect', checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Redireciona automaticamente após o tempo definido
            </p>
          </div>

          {navigation.autoRedirect && (
            <>
              <div className="space-y-2">
                <ConfigLabel>Tempo (em segundos)</ConfigLabel>
                <div className="flex space-x-2 items-center">
                  <Slider 
                    value={[navigation.redirectDelay || 3]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => handleNavigationChange('redirectDelay', value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{navigation.redirectDelay || 3}s</span>
                </div>
              </div>

              <div className="space-y-2">
                <ConfigLabel>Tipo de redirecionamento</ConfigLabel>
                <Select 
                  value={navigation.type || 'next'} 
                  onValueChange={(value) => handleNavigationChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de redirecionamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">Próxima etapa</SelectItem>
                    <SelectItem value="step">Etapa específica</SelectItem>
                    <SelectItem value="url">URL externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4">
                <ConfigLabel>Mostrar texto de contagem regressiva</ConfigLabel>
                <Switch 
                  checked={navigation.showRedirectText !== false} 
                  onCheckedChange={(checked) => handleNavigationChange('showRedirectText', checked)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Exibe o texto "Redirecionando em X segundos..." abaixo do elemento de carregamento
              </p>

              {navigation.type === 'step' && (
                <div className="space-y-2">
                  <ConfigLabel>Etapa de destino</ConfigLabel>
                  <Select 
                    value={navigation.stepId || ''} 
                    onValueChange={(value) => handleNavigationChange('stepId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {funnelSteps.length > 0 ? (
                        funnelSteps.map((step) => (
                          <SelectItem key={step.id} value={step.id}>
                            {step.title || `Etapa ${step.order_index || 0}`}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="step-1">Etapa 1</SelectItem>
                          <SelectItem value="step-2">Etapa 2</SelectItem>
                          <SelectItem value="step-3">Etapa 3</SelectItem>
                          <SelectItem value="step-4">Etapa 4</SelectItem>
                          <SelectItem value="step-5">Etapa 5</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {navigation.type === 'url' && (
                <>
                  <div className="space-y-2">
                    <ConfigLabel>URL de destino</ConfigLabel>
                    <Input 
                      value={navigation.url || ''} 
                      onChange={(e) => handleNavigationChange('url', e.target.value)}
                      placeholder="https://exemplo.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="newTab"
                      checked={navigation.openInNewTab || false} 
                      onCheckedChange={(checked) => handleNavigationChange('openInNewTab', checked)}
                    />
                    <label htmlFor="newTab" className="text-sm">
                      Abrir em nova aba
                    </label>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingConfig;
