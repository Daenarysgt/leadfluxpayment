import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CanvasElement } from '@/types/canvasTypes';

interface PricingConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const PricingConfig: React.FC<PricingConfigProps> = ({ element, onUpdate }) => {
  const content = element.content || {};

  const handleChange = (field: string, value: string) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4 p-4">
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
    </div>
  );
};

export default PricingConfig; 