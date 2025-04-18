import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/types/canvasTypes";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

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
  
  // Detectar e migrar de versão antiga para nova
  let captureFields = content.captureFields;
  
  if (!captureFields || !Array.isArray(captureFields) || captureFields.length === 0) {
    // Compatibilidade com versão anterior - migrar campo único para array
    captureFields = [{
      id: uuidv4(),
      type: content.captureType || 'email',
      placeholder: content.placeholder || 'Seu endereço de email'
    }];
    
    // Atualiza o elemento para o novo formato
    setTimeout(() => {
      onUpdate({
        ...element,
        content: {
          ...content,
          captureFields: captureFields
        }
      });
    }, 0);
  }

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

  const addCaptureField = () => {
    const newField: CaptureField = {
      id: uuidv4(),
      type: 'text',
      placeholder: 'Novo campo'
    };

    onUpdate({
      ...element,
      content: {
        ...content,
        captureFields: [...captureFields, newField]
      }
    });
  };

  const removeCaptureField = (id: string) => {
    // Não permitir remover se só tiver um campo
    if (captureFields.length <= 1) return;

    onUpdate({
      ...element,
      content: {
        ...content,
        captureFields: captureFields.filter(field => field.id !== id)
      }
    });
  };

  const updateCaptureField = (id: string, key: string, value: string) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        captureFields: captureFields.map(field => 
          field.id === id ? { ...field, [key]: value } : field
        )
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
