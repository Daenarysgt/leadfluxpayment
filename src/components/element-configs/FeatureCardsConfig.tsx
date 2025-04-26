import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { PlusCircle, Trash2, MoveVertical, Image, Upload } from 'lucide-react';
import { CanvasElement } from '@/types/canvasTypes';
import { FeatureCard, FeatureCardsContent } from '@/utils/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/element-configs/common/ColorPicker';
import { cn } from '@/lib/utils';

// Componente UploadButton simples
interface UploadButtonProps {
  onUpload: (url: string) => void;
  size?: 'sm' | 'default' | 'lg';
}

const UploadButton = ({ onUpload, size = 'default' }: UploadButtonProps) => {
  const handleClick = () => {
    // Simulando upload usando um placeholder
    onUpload('/placeholder.svg');
  };

  return (
    <Button 
      onClick={handleClick}
      variant="outline" 
      size={size}
      className="flex items-center gap-1"
    >
      <Upload className="h-4 w-4" />
      <span>Upload</span>
    </Button>
  );
};

interface FeatureCardsConfigProps {
  element: CanvasElement;
  onUpdate: (updatedElement: CanvasElement) => void;
}

const FeatureCardsConfig = ({ element, onUpdate }: FeatureCardsConfigProps) => {
  const [activeTab, setActiveTab] = useState('content');
  const content = element.content as FeatureCardsContent || {
    title: '',
    description: '',
    cards: [],
    style: {
      titleAlignment: 'center',
      descriptionAlignment: 'center',
      cardTitleAlignment: 'center',
      cardDescriptionAlignment: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      cardBackgroundColor: '#ffffff',
      cardTextColor: '#333333',
      cardShadow: 'md',
      imagePosition: 'top',
      columns: 2,
      gap: 24,
      animation: 'fade-in'
    }
  };
  
  // Handler para adicionar um novo card
  const handleAddCard = () => {
    const newCard: FeatureCard = {
      id: crypto.randomUUID(),
      title: 'Novo Recurso',
      description: 'Descrição do novo recurso.',
      imageUrl: '/placeholder.svg'
    };
    
    const updatedCards = [...(content.cards || []), newCard];
    
    onUpdate({
      ...element,
      content: {
        ...content,
        cards: updatedCards
      }
    });
  };
  
  // Handler para remover um card
  const handleRemoveCard = (cardId: string) => {
    const updatedCards = (content.cards || []).filter(card => card.id !== cardId);
    
    onUpdate({
      ...element,
      content: {
        ...content,
        cards: updatedCards
      }
    });
  };
  
  // Handler para atualizar um card
  const handleUpdateCard = (cardId: string, field: keyof FeatureCard, value: string) => {
    const updatedCards = (content.cards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, [field]: value };
      }
      return card;
    });
    
    onUpdate({
      ...element,
      content: {
        ...content,
        cards: updatedCards
      }
    });
  };
  
  // Handler para atualizar campos de texto principais
  const handleTextUpdate = (field: string, value: string) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        [field]: value
      }
    });
  };

  // Handler para atualizar o estilo
  const handleStyleUpdate = (styleField: string, value: any) => {
    onUpdate({
      ...element,
      content: {
        ...content,
        style: {
          ...(content.style || {}),
          [styleField]: value
        }
      }
    });
  };

  // Handler para atualizar a imagem de um card
  const handleImageUpdate = (cardId: string, imageUrl: string) => {
    const updatedCards = (content.cards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, imageUrl };
      }
      return card;
    });
    
    onUpdate({
      ...element,
      content: {
        ...content,
        cards: updatedCards
      }
    });
  };
  
  return (
    <div className="space-y-4 py-2">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={content.title || ''}
                onChange={(e) => handleTextUpdate('title', e.target.value)}
                placeholder="Recursos Principais"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={content.description || ''}
                onChange={(e) => handleTextUpdate('description', e.target.value)}
                placeholder="Conheça os principais recursos da nossa solução"
                rows={3}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Cards de Recursos</Label>
                <Button 
                  onClick={handleAddCard} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Adicionar</span>
                </Button>
              </div>
              
              {(content.cards || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum card adicionado.</p>
                  <p className="text-sm">Clique em "Adicionar" para criar um novo card.</p>
                </div>
              )}
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {(content.cards || []).map((card, index) => (
                  <div 
                    key={card.id} 
                    className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Card {index + 1}</Label>
                      <Button
                        onClick={() => handleRemoveCard(card.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`card-title-${card.id}`} className="text-xs">Título do Card</Label>
                      <Input
                        id={`card-title-${card.id}`}
                        value={card.title}
                        onChange={(e) => handleUpdateCard(card.id, 'title', e.target.value)}
                        placeholder="Título do recurso"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`card-description-${card.id}`} className="text-xs">Descrição do Card</Label>
                      <Textarea
                        id={`card-description-${card.id}`}
                        value={card.description}
                        onChange={(e) => handleUpdateCard(card.id, 'description', e.target.value)}
                        placeholder="Descrição do recurso"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Imagem do Card</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-16 w-16 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden"
                        >
                          {card.imageUrl ? (
                            <img 
                              src={card.imageUrl} 
                              alt={card.title} 
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Image className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <Input
                            value={card.imageUrl}
                            onChange={(e) => handleUpdateCard(card.id, 'imageUrl', e.target.value)}
                            placeholder="URL da imagem"
                            className="mb-1"
                          />
                          <UploadButton
                            onUpload={(url) => handleImageUpdate(card.id, url)}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alinhamento do Título</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={content.style?.titleAlignment === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('titleAlignment', 'left')}
                >
                  Esquerda
                </Button>
                <Button 
                  variant={content.style?.titleAlignment === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('titleAlignment', 'center')}
                >
                  Centro
                </Button>
                <Button 
                  variant={content.style?.titleAlignment === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('titleAlignment', 'right')}
                >
                  Direita
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Alinhamento da Descrição</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={content.style?.descriptionAlignment === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('descriptionAlignment', 'left')}
                >
                  Esquerda
                </Button>
                <Button 
                  variant={content.style?.descriptionAlignment === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('descriptionAlignment', 'center')}
                >
                  Centro
                </Button>
                <Button 
                  variant={content.style?.descriptionAlignment === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('descriptionAlignment', 'right')}
                >
                  Direita
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label>Alinhamento do Título do Card</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={content.style?.cardTitleAlignment === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('cardTitleAlignment', 'left')}
                >
                  Esquerda
                </Button>
                <Button 
                  variant={content.style?.cardTitleAlignment === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('cardTitleAlignment', 'center')}
                >
                  Centro
                </Button>
                <Button 
                  variant={content.style?.cardTitleAlignment === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('cardTitleAlignment', 'right')}
                >
                  Direita
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Alinhamento da Descrição do Card</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={content.style?.cardDescriptionAlignment === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('cardDescriptionAlignment', 'left')}
                >
                  Esquerda
                </Button>
                <Button 
                  variant={content.style?.cardDescriptionAlignment === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('cardDescriptionAlignment', 'center')}
                >
                  Centro
                </Button>
                <Button 
                  variant={content.style?.cardDescriptionAlignment === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('cardDescriptionAlignment', 'right')}
                >
                  Direita
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Posição da Imagem</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={content.style?.imagePosition === 'top' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('imagePosition', 'top')}
                >
                  Topo
                </Button>
                <Button 
                  variant={content.style?.imagePosition === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStyleUpdate('imagePosition', 'center')}
                >
                  Centralizada
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label>Número de Colunas</Label>
              <Select
                value={String(content.style?.columns || 2)}
                onValueChange={(value) => handleStyleUpdate('columns', Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o número de colunas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 colunas</SelectItem>
                  <SelectItem value="3">3 colunas</SelectItem>
                  <SelectItem value="4">4 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Espaçamento entre Cards</Label>
                <span className="text-sm text-gray-500">{content.style?.gap || 24}px</span>
              </div>
              <Slider
                min={8}
                max={48}
                step={4}
                value={[content.style?.gap || 24]}
                onValueChange={([value]) => handleStyleUpdate('gap', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Arredondamento</Label>
                <span className="text-sm text-gray-500">{content.style?.borderRadius || 8}px</span>
              </div>
              <Slider
                min={0}
                max={20}
                step={1}
                value={[content.style?.borderRadius || 8]}
                onValueChange={([value]) => handleStyleUpdate('borderRadius', value)}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label>Sombra dos Cards</Label>
              <Select
                value={content.style?.cardShadow || 'md'}
                onValueChange={(value) => handleStyleUpdate('cardShadow', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de sombra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="sm">Leve</SelectItem>
                  <SelectItem value="md">Média</SelectItem>
                  <SelectItem value="lg">Intensa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Animação</Label>
              <Select
                value={content.style?.animation || 'fade-in'}
                onValueChange={(value) => handleStyleUpdate('animation', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de animação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="fade-in">Fade In</SelectItem>
                  <SelectItem value="slide-up">Slide Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label>Cor de Fundo Principal</Label>
              <ColorPicker
                value={content.style?.backgroundColor || '#ffffff'}
                onChange={(color) => handleStyleUpdate('backgroundColor', color)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cor de Fundo dos Cards</Label>
              <ColorPicker
                value={content.style?.cardBackgroundColor || '#ffffff'}
                onChange={(color) => handleStyleUpdate('cardBackgroundColor', color)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cor do Texto</Label>
              <ColorPicker
                value={content.style?.cardTextColor || '#333333'}
                onChange={(color) => handleStyleUpdate('cardTextColor', color)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureCardsConfig; 