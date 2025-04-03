
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";

interface CaptureConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const CaptureConfig = ({ element, onUpdate }: CaptureConfigProps) => {
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
            <ConfigLabel>Tipo de captura</ConfigLabel>
            <Select 
              value={content.captureType || 'email'} 
              onValueChange={(value) => handleContentChange('captureType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de captura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <ConfigLabel>Texto do placeholder</ConfigLabel>
            <Input 
              value={content.placeholder || ''} 
              onChange={(e) => handleContentChange('placeholder', e.target.value)}
              placeholder="Seu endereço de email"
            />
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
            <ConfigLabel>Mensagem de sucesso</ConfigLabel>
            <Input 
              value={content.successMessage || ''} 
              onChange={(e) => handleContentChange('successMessage', e.target.value)}
              placeholder="Obrigado por se inscrever!"
            />
          </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaptureConfig;
