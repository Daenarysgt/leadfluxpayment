import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CanvasElement } from '@/types/canvasTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { AdvancedColorPicker } from './common/AdvancedColorPicker';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const PricingConfig: React.FC<PricingConfigProps> = ({ element, onUpdate }) => {
  const content = element.content || {};
  const [activeTab, setActiveTab] = useState('conteudo');

  // Atualiza uma propriedade específica do conteúdo
  const handleChange = (field: string, value: any) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  // Função para lidar com alterações nos valores de cores
  const handleColorChange = (field: string, color: string) => {
    handleChange(field, color);
  };

  // Função para lidar com o alinhamento
  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    handleChange('alignment', alignment);
  };

  // Função para lidar com o raio de borda
  const handleBorderRadiusChange = (value: number[]) => {
    handleChange('borderRadius', value[0]);
  };

  return (
    <div className="space-y-4 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="estilo">Estilo</TabsTrigger>
          <TabsTrigger value="cores">Cores</TabsTrigger>
        </TabsList>

        {/* Tab Conteúdo */}
        <TabsContent value="conteudo" className="space-y-4">
          <div className="space-y-2">
            <Label>Variante</Label>
            <Select
              value={content.variant || 'default'}
              onValueChange={(value) => handleChange('variant', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma variante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="featured">Destaque</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={content.layout || 'vertical'}
              onValueChange={(value) => handleChange('layout', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="compact">Compacto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={content.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Título do plano"
            />
          </div>

          <div className="space-y-2">
            <Label>Preço</Label>
            <Input
              value={content.price || ''}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={content.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do plano"
            />
          </div>

          <div className="space-y-2">
            <Label>Texto do Botão</Label>
            <Input
              value={content.buttonText || ''}
              onChange={(e) => handleChange('buttonText', e.target.value)}
              placeholder="Comprar Agora"
            />
          </div>

          <div className="space-y-2">
            <Label>Desconto</Label>
            <Input
              value={content.discount || ''}
              onChange={(e) => handleChange('discount', e.target.value)}
              placeholder="50% OFF"
            />
          </div>
        </TabsContent>

        {/* Tab Estilo */}
        <TabsContent value="estilo" className="space-y-4">
          <div className="space-y-2">
            <Label>Alinhamento</Label>
            <div className="flex border rounded-md p-1">
              <Button
                type="button"
                variant={content.alignment === "left" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleAlignmentChange("left")}
              >
                <AlignLeft className="h-4 w-4 mr-2" /> Esquerda
              </Button>
              <Button
                type="button"
                variant={!content.alignment || content.alignment === "center" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleAlignmentChange("center")}
              >
                <AlignCenter className="h-4 w-4 mr-2" /> Centro
              </Button>
              <Button
                type="button"
                variant={content.alignment === "right" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => handleAlignmentChange("right")}
              >
                <AlignRight className="h-4 w-4 mr-2" /> Direita
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="border-radius">Arredondamento das bordas</Label>
              <span className="text-xs text-muted-foreground">{content.borderRadius || 8}px</span>
            </div>
            <Slider
              id="border-radius"
              min={0}
              max={24}
              step={1}
              value={[content.borderRadius || 8]}
              onValueChange={handleBorderRadiusChange}
            />
          </div>
        </TabsContent>

        {/* Tab Cores */}
        <TabsContent value="cores" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Cor do Título</Label>
              <AdvancedColorPicker
                value={content.titleColor || '#000000'}
                onChange={(color) => handleColorChange('titleColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor do Preço</Label>
              <AdvancedColorPicker
                value={content.priceColor || '#000000'}
                onChange={(color) => handleColorChange('priceColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor da Descrição</Label>
              <AdvancedColorPicker
                value={content.descriptionColor || '#6B7280'}
                onChange={(color) => handleColorChange('descriptionColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor do Texto das Features</Label>
              <AdvancedColorPicker
                value={content.featureTextColor || '#000000'}
                onChange={(color) => handleColorChange('featureTextColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor do Ícone das Features</Label>
              <AdvancedColorPicker
                value={content.featureIconColor || '#10B981'}
                onChange={(color) => handleColorChange('featureIconColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor da Borda</Label>
              <AdvancedColorPicker
                value={content.borderColor || '#E5E7EB'}
                onChange={(color) => handleColorChange('borderColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor de Fundo</Label>
              <AdvancedColorPicker
                value={content.backgroundColor || '#FFFFFF'}
                onChange={(color) => handleColorChange('backgroundColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor do Botão</Label>
              <AdvancedColorPicker
                value={content.buttonColor || '#10B981'}
                onChange={(color) => handleColorChange('buttonColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor do Texto do Botão</Label>
              <AdvancedColorPicker
                value={content.buttonTextColor || '#FFFFFF'}
                onChange={(color) => handleColorChange('buttonTextColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor de Fundo do Desconto</Label>
              <AdvancedColorPicker
                value={content.discountBgColor || '#EF4444'}
                onChange={(color) => handleColorChange('discountBgColor', color)}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cor do Texto do Desconto</Label>
              <AdvancedColorPicker
                value={content.discountTextColor || '#FFFFFF'}
                onChange={(color) => handleColorChange('discountTextColor', color)}
                size="sm"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingConfig; 