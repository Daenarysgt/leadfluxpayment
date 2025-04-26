import React, { useState, useRef, useEffect } from 'react';
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
import { PlusCircle, Trash2, MoveVertical, Image, Upload, Plus, GripVertical } from 'lucide-react';
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { ImageIcon, PlusIcon, TrashIcon, MoveUp, MoveDown } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

// Componente para o seletor de cores avançado
const AdvancedColorPicker = ({ value, onChange }: { value: string, onChange: (color: string) => void }) => {
  return (
    <div className="flex space-x-2 items-center">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-md cursor-pointer"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};

// Componente simples para substituir DragHandleIcon
const DragHandleIcon = () => <GripVertical className="h-4 w-4 text-gray-400" />;

// Componente para upload de arquivos
const UploadButton = ({ onUpload, loading, accept }: { 
  onUpload: (file: File) => void, 
  loading?: boolean, 
  accept?: string 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>
    </>
  );
};

interface FeatureCardsConfigProps {
  element: CanvasElement;
  onUpdate: (updatedElement: CanvasElement) => void;
}

const FeatureCardsConfig = ({ element, onUpdate }: FeatureCardsConfigProps) => {
  const [activeTab, setActiveTab] = useState('content');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  const defaultContent: FeatureCardsContent = {
    title: 'Recursos Incríveis',
    description: 'Explore todos os recursos incrívies que oferecemos para você',
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
  
  const content = element.content as FeatureCardsContent || defaultContent;
  
  useEffect(() => {
    if (!element.content) {
      updateElementContent(element.id, {
        ...content,
        title: '',
        description: '',
        cards: [],
        style: {
          titleAlignment: 'center',
          descriptionAlignment: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          cardBackgroundColor: '#ffffff',
          cardTextColor: '#333333',
          cardShadow: 'md',
          cardTitleAlignment: 'center',
          cardDescriptionAlignment: 'center',
          columns: 3,
          gap: 24,
          animation: 'fade-in'
        }
      });
    }
    
    if (element.content?.cards) {
      const allCardsHaveIds = element.content.cards.every(card => card.id);
      if (!allCardsHaveIds) {
        const updatedCards = element.content.cards.map(card => {
          if (!card.id) {
            return { ...card, id: uuidv4() };
          }
          return card;
        });
        
        updateElementContent(element.id, {
          ...element.content,
          cards: updatedCards
        });
      }
    }
  }, [element]);
  
  const updateElementContent = (elementId: string, newContent: any) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };
  
  const addCard = () => {
    const newCards = [
      ...(content.cards || []),
      {
        id: uuidv4(),
        title: 'Novo Recurso',
        description: 'Descreva o recurso aqui...',
        imageUrl: ''
      }
    ];
    
    updateElementContent(element.id, {
      ...content,
      cards: newCards
    });
  };
  
  const removeCard = (cardId: string) => {
    const newCards = (content.cards || []).filter(card => card.id !== cardId);
    
    updateElementContent(element.id, {
      ...content,
      cards: newCards
    });
  };
  
  const updateCard = (cardId: string, field: string, value: string) => {
    const newCards = (content.cards || []).map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          [field]: value
        };
      }
      return card;
    });
    
    updateElementContent(element.id, {
      ...content,
      cards: newCards
    });
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(content.cards || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updateElementContent(element.id, {
      ...content,
      cards: items
    });
  };
  
  const handleImageUpload = async (cardId: string, file: File) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadingImage(cardId);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Atualiza temporariamente com a versão base64
        updateCard(cardId, 'imageUrl', base64);
        
        // Aqui em um app real, você faria upload para o storage
        // Como não temos acesso ao supabase, vamos apenas usar o base64
        
        // Simulando um atraso de upload
        setTimeout(() => {
          // Em um cenário real, você usaria a URL pública do storage
          updateCard(cardId, 'imageUrl', base64);
          setUploadingImage(null);
          setIsUploading(false);
          
          toast("Imagem carregada com sucesso");
        }, 1000);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setIsUploading(false);
      setUploadingImage(null);
      toast("Erro ao carregar imagem");
    }
  };

  const moveCard = (sourceIndex: number, destinationIndex: number) => {
    if (!content.cards) return;
    
    const cards = [...content.cards];
    const [movedCard] = cards.splice(sourceIndex, 1);
    cards.splice(destinationIndex, 0, movedCard);
    
    updateElementContent(element.id, {
      ...content,
      cards
    });
  };
  
  const moveCardUp = (index: number) => {
    if (index === 0) return;
    moveCard(index, index - 1);
  };
  
  const moveCardDown = (index: number) => {
    if (!content.cards || index === content.cards.length - 1) return;
    moveCard(index, index + 1);
  };

  const updateStyle = (field: string, value: any) => {
    updateElementContent(element.id, {
      ...content,
      style: {
        ...content.style,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4 pb-8">
      <Tabs 
        defaultValue="content" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input 
                placeholder="Título da seção" 
                value={content.title || ''}
                onChange={(e) => updateElementContent(element.id, {
                  ...content,
                  title: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea 
                placeholder="Descrição da seção" 
                value={content.description || ''}
                onChange={(e) => updateElementContent(element.id, {
                  ...content,
                  description: e.target.value
                })}
                rows={2}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Cards</Label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addCard}
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                Adicionar Card
              </Button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="cards">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {(content.cards || []).map((card, index) => (
                      <Draggable 
                        key={card.id} 
                        draggableId={card.id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-md p-3 bg-white"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-move"
                              >
                                <DragHandleIcon />
                              </div>
                              
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCardUp(index)}
                                  disabled={index === 0}
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCardDown(index)}
                                  disabled={!content.cards || index === content.cards.length - 1}
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => removeCard(card.id)}
                                >
                                  <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs">Título do Card</Label>
                                <Input 
                                  placeholder="Título do recurso" 
                                  value={card.title || ''}
                                  onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs">Descrição do Card</Label>
                                <Textarea 
                                  placeholder="Descrição do recurso" 
                                  value={card.description || ''}
                                  onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                                  rows={2}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs">Imagem</Label>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="h-10 w-10 border rounded flex items-center justify-center bg-gray-100"
                                  >
                                    {card.imageUrl ? (
                                      <img 
                                        src={card.imageUrl} 
                                        alt={card.title}
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <ImageIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <Input 
                                      placeholder="URL da imagem" 
                                      value={card.imageUrl || ''}
                                      onChange={(e) => updateCard(card.id, 'imageUrl', e.target.value)}
                                    />
                                  </div>
                                  
                                  <UploadButton
                                    onUpload={(file) => handleImageUpload(card.id, file)}
                                    loading={isUploading && uploadingImage === card.id}
                                    accept="image/*"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {content.cards?.length === 0 && (
              <div className="text-center py-6 border rounded-md bg-gray-50">
                <p className="text-gray-500">Nenhum card adicionado ainda</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={addCard}
                  className="mt-2"
                >
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Adicionar Card
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label>Alinhamento do Título</Label>
              <Select
                value={content.style?.titleAlignment || 'center'}
                onValueChange={(value) => updateStyle('titleAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centralizado</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Alinhamento da Descrição</Label>
              <Select
                value={content.style?.descriptionAlignment || 'center'}
                onValueChange={(value) => updateStyle('descriptionAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centralizado</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Cor de Fundo</Label>
              <AdvancedColorPicker
                value={content.style?.backgroundColor || '#ffffff'}
                onChange={(color) => updateStyle('backgroundColor', color)}
              />
            </div>
            
            <div>
              <Label>Colunas</Label>
              <Slider
                min={1}
                max={4}
                step={1}
                value={[content.style?.columns || 2]}
                onValueChange={(value) => updateStyle('columns', value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>
            
            <div>
              <Label>Espaçamento entre Cards</Label>
              <Slider
                min={8}
                max={48}
                step={4}
                value={[content.style?.gap || 24]}
                onValueChange={(value) => updateStyle('gap', value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Pequeno</span>
                <span>Médio</span>
                <span>Grande</span>
              </div>
            </div>
            
            <div>
              <Label>Animação</Label>
              <Select
                value={content.style?.animation || 'fade-in'}
                onValueChange={(value) => updateStyle('animation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="fade-in">Fade In</SelectItem>
                  <SelectItem value="slide-up">Slide Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Estilo dos Cards</h3>
            
            <div>
              <Label>Cor de Fundo dos Cards</Label>
              <AdvancedColorPicker
                value={content.style?.cardBackgroundColor || '#ffffff'}
                onChange={(color) => updateStyle('cardBackgroundColor', color)}
              />
            </div>
            
            <div>
              <Label>Cor do Texto dos Cards</Label>
              <AdvancedColorPicker
                value={content.style?.cardTextColor || '#333333'}
                onChange={(color) => updateStyle('cardTextColor', color)}
              />
            </div>
            
            <div>
              <Label>Raio da Borda</Label>
              <Slider
                min={0}
                max={24}
                step={2}
                value={[content.style?.borderRadius || 8]}
                onValueChange={(value) => updateStyle('borderRadius', value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>12px</span>
                <span>24px</span>
              </div>
            </div>
            
            <div>
              <Label>Sombra</Label>
              <Select
                value={content.style?.cardShadow || 'md'}
                onValueChange={(value) => updateStyle('cardShadow', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="sm">Pequena</SelectItem>
                  <SelectItem value="md">Média</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Alinhamento do Título do Card</Label>
              <Select
                value={content.style?.cardTitleAlignment || 'center'}
                onValueChange={(value) => updateStyle('cardTitleAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centralizado</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Alinhamento da Descrição do Card</Label>
              <Select
                value={content.style?.cardDescriptionAlignment || 'center'}
                onValueChange={(value) => updateStyle('cardDescriptionAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centralizado</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureCardsConfig; 