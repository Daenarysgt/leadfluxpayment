import React from 'react';
import { CanvasElement, FeaturesCardContent } from '@/types/canvasTypes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { ColorPicker } from './common/ColorPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface FeaturesCardConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const FeaturesCardConfig: React.FC<FeaturesCardConfigProps> = ({ element, onUpdate }) => {
  const content = element.content as FeaturesCardContent;

  // Atualiza o conteúdo do elemento com novos valores
  const updateContent = (newContentValues: Partial<FeaturesCardContent>) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        ...newContentValues
      }
    });
  };

  // Adiciona um novo item à lista
  const addItem = () => {
    const newItems = [...(content.items || []), { 
      id: crypto.randomUUID(), 
      text: 'Novo recurso' 
    }];
    
    updateContent({ items: newItems });
  };

  // Remove um item da lista
  const removeItem = (itemId: string) => {
    const newItems = (content.items || []).filter(item => item.id !== itemId);
    updateContent({ items: newItems });
  };

  // Atualiza o texto de um item
  const updateItemText = (itemId: string, text: string) => {
    const newItems = (content.items || []).map(item => 
      item.id === itemId ? { ...item, text } : item
    );
    
    updateContent({ items: newItems });
  };

  // Atualiza as configurações do botão
  const updateButtonSettings = (buttonSettings: Partial<NonNullable<FeaturesCardContent['button']>>) => {
    updateContent({
      button: {
        ...(content.button || { 
          text: 'Selecionar plano', 
          enabled: false,
          variant: 'default',
          color: '#4ade80',
          textColor: '#ffffff',
          navigation: { type: 'next' }
        }),
        ...buttonSettings
      }
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="conteudo" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="estilo" className="flex-1">Estilo</TabsTrigger>
          <TabsTrigger value="botao" className="flex-1">Botão</TabsTrigger>
        </TabsList>

        {/* Tab Conteúdo */}
        <TabsContent value="conteudo" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={content.title || ''}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Título do card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={content.subtitle || ''}
              onChange={(e) => updateContent({ subtitle: e.target.value })}
              placeholder="Subtítulo do card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              value={content.price || ''}
              onChange={(e) => updateContent({ price: e.target.value })}
              placeholder="R$200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceDescription">Descrição do preço</Label>
            <Input
              id="priceDescription"
              value={content.priceDescription || ''}
              onChange={(e) => updateContent({ priceDescription: e.target.value })}
              placeholder="por mês, ilimitado"
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Recursos</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={addItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2 mt-2">
              {(content.items || []).map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    value={item.text}
                    onChange={(e) => updateItemText(item.id, e.target.value)}
                    placeholder={`Recurso ${index + 1}`}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8" 
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              {(content.items || []).length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
                  Clique em "Adicionar" para incluir recursos ao card
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Estilo */}
        <TabsContent value="estilo" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showIcon">Mostrar ícones</Label>
            <Switch
              id="showIcon"
              checked={content.showIcon || false}
              onCheckedChange={(checked) => updateContent({ showIcon: checked })}
            />
          </div>

          {content.showIcon && (
            <div className="space-y-2">
              <Label htmlFor="iconColor">Cor do ícone</Label>
              <ColorPicker
                value={content.iconColor || '#22c55e'}
                onChange={(color) => updateContent({ iconColor: color })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="accentBarColor">Cor da barra lateral</Label>
            <ColorPicker
              value={content.accentBarColor || '#4ade80'}
              onChange={(color) => updateContent({ accentBarColor: color })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Cor de fundo</Label>
            <ColorPicker
              value={content.backgroundColor || '#ffffff'}
              onChange={(color) => updateContent({ backgroundColor: color })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Cor do texto</Label>
            <ColorPicker
              value={content.textColor || '#333333'}
              onChange={(color) => updateContent({ textColor: color })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="borderRadius">Raio da borda: {content.borderRadius || 8}px</Label>
            </div>
            <Slider
              id="borderRadius"
              min={0}
              max={20}
              step={1}
              value={[content.borderRadius || 8]}
              onValueChange={([value]) => updateContent({ borderRadius: value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alignment">Alinhamento</Label>
            <Select
              value={content.alignment || 'left'}
              onValueChange={(value) => updateContent({ alignment: value as 'left' | 'center' | 'right' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o alinhamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shadowEnabled">Sombra</Label>
            <Switch
              id="shadowEnabled"
              checked={content.shadowEnabled || false}
              onCheckedChange={(checked) => updateContent({ shadowEnabled: checked })}
            />
          </div>

          {content.shadowEnabled && (
            <div className="space-y-2">
              <Label htmlFor="shadowStrength">Intensidade da sombra</Label>
              <Select
                value={content.shadowStrength || 'medium'}
                onValueChange={(value) => updateContent({ 
                  shadowStrength: value as 'light' | 'medium' | 'strong' 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Intensidade da sombra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Leve</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="strong">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="borderEnabled">Borda</Label>
            <Switch
              id="borderEnabled"
              checked={content.borderEnabled || false}
              onCheckedChange={(checked) => updateContent({ borderEnabled: checked })}
            />
          </div>

          {content.borderEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="borderColor">Cor da borda</Label>
                <ColorPicker
                  value={content.borderColor || '#e5e7eb'}
                  onChange={(color) => updateContent({ borderColor: color })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="borderWidth">Espessura da borda: {content.borderWidth || 1}px</Label>
                </div>
                <Slider
                  id="borderWidth"
                  min={1}
                  max={5}
                  step={1}
                  value={[content.borderWidth || 1]}
                  onValueChange={([value]) => updateContent({ borderWidth: value })}
                />
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab Botão */}
        <TabsContent value="botao" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="buttonEnabled">Mostrar botão</Label>
            <Switch
              id="buttonEnabled"
              checked={content.button?.enabled || false}
              onCheckedChange={(checked) => updateButtonSettings({ enabled: checked })}
            />
          </div>

          {content.button?.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Texto do botão</Label>
                <Input
                  id="buttonText"
                  value={content.button?.text || 'Selecionar plano'}
                  onChange={(e) => updateButtonSettings({ text: e.target.value })}
                  placeholder="Texto do botão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonVariant">Estilo do botão</Label>
                <Select
                  value={content.button?.variant || 'default'}
                  onValueChange={(value) => updateButtonSettings({ 
                    variant: value as 'default' | 'outline' | 'ghost' | 'link' 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="outline">Contorno</SelectItem>
                    <SelectItem value="ghost">Fantasma</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonColor">Cor do botão</Label>
                <ColorPicker
                  value={content.button?.color || '#4ade80'}
                  onChange={(color) => updateButtonSettings({ color })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonTextColor">Cor do texto do botão</Label>
                <ColorPicker
                  value={content.button?.textColor || '#ffffff'}
                  onChange={(color) => updateButtonSettings({ textColor: color })}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturesCardConfig; 