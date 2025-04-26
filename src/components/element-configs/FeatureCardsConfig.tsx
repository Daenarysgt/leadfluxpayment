import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusCircle, Trash2, Upload, ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { FeatureCardItem, FeatureCardsContent } from "@/utils/types";

interface FeatureCardsConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const FeatureCardsConfig = ({ element, onUpdate }: FeatureCardsConfigProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Inicializar o conteúdo do elemento se não existir
  const content = element.content as FeatureCardsContent || {
    title: "",
    description: "",
    cards: [],
    style: {
      borderRadius: 8,
      backgroundColor: "#ffffff",
      shadowStrength: 1,
      columnCount: 2,
      padding: 24,
      gap: 24,
      contentAlignment: "center",
      imageSize: 48,
      borderColor: "#e5e7eb",
      showBorder: true,
      titleColor: "#111827",
      subtitleColor: "#6b7280",
      descriptionColor: "#4b5563",
      darkMode: false
    }
  };
  
  // Extrair cards e estilos do conteúdo
  const cards = content.cards || [];
  const style = content.style || {};
  
  // Função para converter arquivo em base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para redimensionar imagem antes de fazer upload
  const resizeImage = (file: File, maxWidth = 1200, maxHeight = 1200): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // Calcular as novas dimensões mantendo a proporção
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Converter para blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao redimensionar imagem'));
              return;
            }
            
            // Criar novo arquivo a partir do blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          }, file.type);
        };
        img.onerror = () => {
          reject(new Error('Erro ao carregar imagem para redimensionamento'));
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para fazer upload para o Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `images/${fileName}`;
      
      console.log(`FeatureCardsConfig - Fazendo upload para ${filePath}`);
      
      // Upload do arquivo para o Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Obter a URL pública da imagem
      const { data: urlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);
      
      console.log(`FeatureCardsConfig - Upload bem-sucedido, URL: ${urlData.publicUrl}`);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("FeatureCardsConfig - Erro ao fazer upload da imagem:", error);
      throw error;
    }
  };

  // Remover imagem antiga do Storage
  const deleteOldImage = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.includes('supabase.co/storage/v1/object/public/images/')) return;
    
    try {
      // Extrair o caminho da imagem da URL
      const urlParts = imageUrl.split('/public/images/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      console.log(`FeatureCardsConfig - Removendo imagem antiga: ${filePath}`);
      
      // Excluir do Storage
      const { error } = await supabase
        .storage
        .from('images')
        .remove([filePath]);
        
      if (error) console.error("FeatureCardsConfig - Erro ao excluir imagem antiga:", error);
    } catch (error) {
      console.error("FeatureCardsConfig - Erro ao tentar excluir imagem antiga:", error);
    }
  };

  // Função para adicionar um novo card
  const handleAddCard = () => {
    const newCard: FeatureCardItem = {
      id: uuidv4(),
      title: "Novo Recurso",
      subtitle: "Subtítulo",
      description: "Descrição do recurso em até 2-3 linhas",
      imageAlignment: "center"
    };
    
    const updatedCards = [...cards, newCard];
    
    onUpdate({
      content: {
        ...content,
        cards: updatedCards
      }
    });
    
    // Selecionar o novo card para edição
    setActiveCardId(newCard.id);
    setActiveTab("cards");
  };

  // Função para remover um card
  const handleRemoveCard = (cardId: string) => {
    // Verificar se há uma imagem para remover do storage
    const cardToRemove = cards.find(card => card.id === cardId);
    if (cardToRemove?.image && cardToRemove.isStorageImage) {
      deleteOldImage(cardToRemove.image);
    }
    
    const updatedCards = cards.filter(card => card.id !== cardId);
    
    onUpdate({
      content: {
        ...content,
        cards: updatedCards
      }
    });
    
    // Se o card removido estava ativo, resetar o card ativo
    if (activeCardId === cardId) {
      setActiveCardId(updatedCards.length > 0 ? updatedCards[0].id : null);
    }
  };

  // Função para atualizar um card específico
  const updateCard = (cardId: string, updates: Partial<FeatureCardItem>) => {
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    );
    
    onUpdate({
      content: {
        ...content,
        cards: updatedCards
      }
    });
  };

  // Função para atualizar um estilo específico
  const updateStyle = (updates: Partial<FeatureCardsContent['style']>) => {
    onUpdate({
      content: {
        ...content,
        style: {
          ...style,
          ...updates
        }
      }
    });
  };

  // Função para lidar com upload de imagem para um card específico
  const handleImageUpload = async (cardId: string, file: File) => {
    setUploading(true);
    
    try {
      // Verificar se há uma imagem antiga para excluir
      const currentCard = cards.find(card => card.id === cardId);
      if (currentCard?.image && currentCard.isStorageImage) {
        await deleteOldImage(currentCard.image);
      }
      
      // Verificar se é um GIF
      const isGif = file.type === 'image/gif';
      
      // Redimensionar a imagem (exceto GIFs animados para preservar a animação)
      const processedFile = isGif ? file : await resizeImage(file);
      
      // Fazer upload para o Storage
      const imageUrl = await uploadImageToStorage(processedFile);
      
      // Atualizar o card com a nova imagem
      updateCard(cardId, {
        image: imageUrl,
        isStorageImage: true
      });
      
      toast({
        title: "Imagem carregada",
        description: "A imagem foi adicionada com sucesso."
      });
    } catch (error) {
      console.error("FeatureCardsConfig - Erro ao carregar imagem:", error);
      toast({
        title: "Erro ao carregar imagem",
        description: "Não foi possível carregar a imagem.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Função para lidar com mudança no input de arquivo
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, cardId: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(cardId, files[0]);
    }
    // Resetar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  // Função para lidar com entrada de URL de imagem
  const handleImageUrlChange = (cardId: string, url: string) => {
    // Verificar se há uma imagem antiga para excluir
    const currentCard = cards.find(card => card.id === cardId);
    if (currentCard?.image && currentCard.isStorageImage) {
      deleteOldImage(currentCard.image);
    }
    
    updateCard(cardId, {
      image: url,
      isStorageImage: false
    });
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <Tabs 
        defaultValue="general" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título Principal</Label>
            <Input 
              id="title" 
              value={content.title || ""}
              onChange={(e) => onUpdate({
                content: {
                  ...content,
                  title: e.target.value
                }
              })}
              placeholder="Título do componente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Principal</Label>
            <Textarea 
              id="description" 
              value={content.description || ""}
              onChange={(e) => onUpdate({
                content: {
                  ...content,
                  description: e.target.value
                }
              })}
              placeholder="Descrição do componente"
              rows={3}
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label>Cards</Label>
            <div className="grid grid-cols-1 gap-2">
              {cards.map((card, index) => (
                <div 
                  key={card.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-slate-50"
                >
                  <div>
                    <span className="font-medium">{card.title || `Card ${index + 1}`}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setActiveCardId(card.id);
                        setActiveTab("cards");
                      }}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveCard(card.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={handleAddCard}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Card
            </Button>
          </div>
        </TabsContent>
        
        {/* Configurações dos Cards Individuais */}
        <TabsContent value="cards" className="space-y-4">
          {activeCardId ? (
            <div className="space-y-4">
              {cards
                .filter(card => card.id === activeCardId)
                .map(card => (
                  <div key={card.id} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-title">Título do Card</Label>
                      <Input 
                        id="card-title" 
                        value={card.title}
                        onChange={(e) => updateCard(card.id, { title: e.target.value })}
                        placeholder="Título do card"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="card-subtitle">Subtítulo do Card (opcional)</Label>
                      <Input 
                        id="card-subtitle" 
                        value={card.subtitle || ""}
                        onChange={(e) => updateCard(card.id, { subtitle: e.target.value })}
                        placeholder="Subtítulo do card"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="card-description">Descrição do Card</Label>
                      <Textarea 
                        id="card-description" 
                        value={card.description}
                        onChange={(e) => updateCard(card.id, { description: e.target.value })}
                        placeholder="Descrição do card"
                        rows={3}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Imagem do Card</Label>
                      
                      <div className="space-y-4">
                        {card.image && (
                          <div className="mt-2 flex justify-center border rounded-md p-2 bg-slate-50">
                            <img 
                              src={card.image} 
                              alt={card.title} 
                              className="max-h-32 object-contain"
                            />
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Input 
                              value={card.image || ""} 
                              onChange={(e) => handleImageUrlChange(card.id, e.target.value)}
                              placeholder="URL da imagem"
                            />
                          </div>
                          <div>
                            <Button 
                              variant="outline" 
                              disabled={uploading}
                              onClick={() => {
                                const fileInput = document.getElementById(`file-upload-${card.id}`) as HTMLInputElement;
                                fileInput?.click();
                              }}
                            >
                              {uploading ? "Enviando..." : (
                                <>
                                  <Upload className="h-4 w-4 mr-1" /> Upload
                                </>
                              )}
                            </Button>
                            <input 
                              id={`file-upload-${card.id}`} 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileInputChange(e, card.id)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Alinhamento da Imagem</Label>
                          <ToggleGroup 
                            type="single" 
                            value={card.imageAlignment || "center"}
                            onValueChange={(value) => {
                              if (value) updateCard(card.id, { imageAlignment: value as 'left' | 'center' | 'right' | 'fill' });
                            }}
                            className="justify-start"
                          >
                            <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
                              <AlignLeft className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Centralizar">
                              <AlignCenter className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="right" aria-label="Alinhar à direita">
                              <AlignRight className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="fill" aria-label="Preencher">
                              <AlignJustify className="h-4 w-4" />
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Selecione um card para editar ou adicione um novo</p>
              <Button 
                variant="outline" 
                onClick={handleAddCard}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Card
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Configurações de Estilo */}
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="column-count">Número de Colunas</Label>
            <Select 
              value={String(style.columnCount || 2)}
              onValueChange={(value) => updateStyle({ columnCount: parseInt(value) as 2 | 3 | 4 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o número de colunas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 colunas</SelectItem>
                <SelectItem value="3">3 colunas</SelectItem>
                <SelectItem value="4">4 colunas</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Móbil sempre terá 2 colunas.</p>
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento do Conteúdo</Label>
            <ToggleGroup 
              type="single" 
              value={style.contentAlignment || "center"}
              onValueChange={(value) => {
                if (value) updateStyle({ contentAlignment: value as 'left' | 'center' | 'right' });
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Centralizar">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Alinhar à direita">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tamanho da Imagem (px)</Label>
              <Slider 
                value={[style.imageSize || 48]} 
                min={24} 
                max={128} 
                step={4}
                onValueChange={(values) => updateStyle({ imageSize: values[0] })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>24px</span>
                <span>{style.imageSize || 48}px</span>
                <span>128px</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Espaçamento entre Cards</Label>
              <Slider 
                value={[style.gap || 24]} 
                min={8} 
                max={48} 
                step={4}
                onValueChange={(values) => updateStyle({ gap: values[0] })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>8px</span>
                <span>{style.gap || 24}px</span>
                <span>48px</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Padding dentro dos Cards</Label>
              <Slider 
                value={[style.padding || 24]} 
                min={8} 
                max={48} 
                step={4}
                onValueChange={(values) => updateStyle({ padding: values[0] })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>8px</span>
                <span>{style.padding || 24}px</span>
                <span>48px</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Arredondamento de Bordas</Label>
              <Slider 
                value={[style.borderRadius || 8]} 
                min={0} 
                max={24} 
                step={2}
                onValueChange={(values) => updateStyle({ borderRadius: values[0] })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0px</span>
                <span>{style.borderRadius || 8}px</span>
                <span>24px</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Intensidade da Sombra</Label>
              <Slider 
                value={[style.shadowStrength || 1]} 
                min={0} 
                max={4} 
                step={1}
                onValueChange={(values) => updateStyle({ shadowStrength: values[0] })}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Nenhuma</span>
                <span>Leve</span>
                <span>Forte</span>
              </div>
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex-1">
                <Label htmlFor="show-border">Mostrar Bordas</Label>
              </div>
              <Switch 
                id="show-border" 
                checked={style.showBorder !== false}
                onCheckedChange={(checked) => updateStyle({ showBorder: checked })}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="background-color">Cor de Fundo</Label>
              <div className="flex space-x-2">
                <Input 
                  id="background-color" 
                  type="color" 
                  value={style.backgroundColor || "#ffffff"}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="w-12"
                />
                <Input 
                  value={style.backgroundColor || "#ffffff"}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="border-color">Cor da Borda</Label>
              <div className="flex space-x-2">
                <Input 
                  id="border-color" 
                  type="color" 
                  value={style.borderColor || "#e5e7eb"}
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                  className="w-12"
                />
                <Input 
                  value={style.borderColor || "#e5e7eb"}
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title-color">Cor do Título</Label>
              <div className="flex space-x-2">
                <Input 
                  id="title-color" 
                  type="color" 
                  value={style.titleColor || "#111827"}
                  onChange={(e) => updateStyle({ titleColor: e.target.value })}
                  className="w-12"
                />
                <Input 
                  value={style.titleColor || "#111827"}
                  onChange={(e) => updateStyle({ titleColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtitle-color">Cor do Subtítulo</Label>
              <div className="flex space-x-2">
                <Input 
                  id="subtitle-color" 
                  type="color" 
                  value={style.subtitleColor || "#6b7280"}
                  onChange={(e) => updateStyle({ subtitleColor: e.target.value })}
                  className="w-12"
                />
                <Input 
                  value={style.subtitleColor || "#6b7280"}
                  onChange={(e) => updateStyle({ subtitleColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description-color">Cor da Descrição</Label>
              <div className="flex space-x-2">
                <Input 
                  id="description-color" 
                  type="color" 
                  value={style.descriptionColor || "#4b5563"}
                  onChange={(e) => updateStyle({ descriptionColor: e.target.value })}
                  className="w-12"
                />
                <Input 
                  value={style.descriptionColor || "#4b5563"}
                  onChange={(e) => updateStyle({ descriptionColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex-1">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={style.darkMode || false}
                onCheckedChange={(checked) => updateStyle({ darkMode: checked })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureCardsConfig; 