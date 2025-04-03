
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";

interface LoadingConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const LoadingConfig = ({ element, onUpdate }: LoadingConfigProps) => {
  const content = element.content || {};
  const style = content.style || {};
  
  const [activeTab, setActiveTab] = useState("content");
  
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

  return (
    <div className="space-y-4 p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default LoadingConfig;
