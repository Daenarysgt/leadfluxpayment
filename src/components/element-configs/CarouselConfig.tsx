import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Upload, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { nanoid } from "nanoid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";

interface CarouselConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const CarouselConfig = ({ element, onUpdate }: CarouselConfigProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  
  // Get or initialize options array
  const options = element.content?.options || [];
  const alignment = element.content?.alignment || "center";
  const aspectRatio = element.content?.aspectRatio || "16:9";
  const autoPlay = element.content?.autoPlay || false;
  const interval = element.content?.interval || 3;
  const showNavigation = element.content?.showNavigation !== false; // Default to true if not specified
  const navigationType = element.content?.navigationType || "default";
  const showIndicators = element.content?.showIndicators !== false; // Default to true if not specified
  const indicatorColor = element.content?.indicatorColor || "#7c3aed";
  const indicatorInactiveColor = element.content?.indicatorInactiveColor || "#d1d5db";
  const captionBgColor = element.content?.captionBgColor || "rgba(0, 0, 0, 0.5)";
  const captionTextColor = element.content?.captionTextColor || "#ffffff";
  
  // Função para converter arquivo em base64 (mantida para compatibilidade)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para redimensionar imagem antes de fazer upload
  const resizeImage = (file: File, maxWidth = 1200, maxHeight = 900): Promise<File> => {
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
  const uploadImageToStorage = async (file: File, optionId: string): Promise<string> => {
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${optionId}.${fileExt}`;
      const filePath = `carousel/${fileName}`;
      
      console.log(`CarouselConfig - Fazendo upload para ${filePath}`);
      
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
      
      console.log(`CarouselConfig - Upload bem-sucedido, URL: ${urlData.publicUrl}`);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("CarouselConfig - Erro ao fazer upload da imagem:", error);
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
      
      console.log(`CarouselConfig - Removendo imagem antiga: ${filePath}`);
      
      // Excluir do Storage
      const { error } = await supabase
        .storage
        .from('images')
        .remove([filePath]);
        
      if (error) console.error("CarouselConfig - Erro ao excluir imagem antiga:", error);
    } catch (error) {
      console.error("CarouselConfig - Erro ao tentar excluir imagem antiga:", error);
    }
  };
  
  const handleAddImage = () => {
    if (options.length >= 10) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 10 imagens ao carrossel.",
        variant: "destructive",
      });
      return;
    }
    
    const newOption = {
      id: nanoid(),
      text: `Slide ${options.length + 1}`,
      image: ""
    };
    
    const newOptions = [...options, newOption];
    
    onUpdate({
      content: {
        ...element.content,
        options: newOptions
      }
    });
  };
  
  const handleRemoveImage = (id: string) => {
    // Buscar a opção para verificar se tem imagem no Storage
    const option = options.find((opt: any) => opt.id === id);
    if (option?.image && option.image.includes('supabase.co/storage')) {
      deleteOldImage(option.image).catch(console.error);
    }
    
    const newOptions = options.filter((opt: any) => opt.id !== id);
    
    onUpdate({
      content: {
        ...element.content,
        options: newOptions
      }
    });
  };
  
  const handleImageUpload = async (file: File, optionId: string) => {
    setUploading(true);
    setUploadingSlideId(optionId);
    
    try {
      // Buscar a opção para verificar se tem imagem no Storage
      const option = options.find((opt: any) => opt.id === optionId);
      if (option?.image && option.image.includes('supabase.co/storage')) {
        await deleteOldImage(option.image);
      }
      
      // Redimensionar a imagem
      const resizedFile = await resizeImage(file);
      
      // Fazer upload para o Storage
      const imageUrl = await uploadImageToStorage(resizedFile, optionId);
      
      // Find the option to update
      const newOptions = options.map((opt: any) => {
        if (opt.id === optionId) {
          return { 
            ...opt, 
            image: imageUrl,
            fileName: file.name,
            isStorageImage: true // Indicar que esta imagem está no Storage
          };
        }
        return opt;
      });
      
      // Update the element
      onUpdate({
        content: {
          ...element.content,
          options: newOptions
        }
      });
      
      toast({
        title: "Imagem carregada",
        description: `${file.name} foi adicionada ao carrossel`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar imagem",
        description: "Não foi possível processar a imagem. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao processar imagem:", error);
    } finally {
      setUploading(false);
      setUploadingSlideId(null);
    }
  };
  
  const handleTextChange = (value: string, optionId: string) => {
    const newOptions = options.map((opt: any) => {
      if (opt.id === optionId) {
        return { ...opt, text: value };
      }
      return opt;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: newOptions
      }
    });
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, optionId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, envie apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }
    
    handleImageUpload(file, optionId);
  };
  
  const handleAlignmentChange = (value: string) => {
    if (value) {
      onUpdate({
        content: {
          ...element.content,
          alignment: value
        }
      });
    }
  };
  
  const handleAspectRatioChange = (value: string) => {
    onUpdate({
      content: {
        ...element.content,
        aspectRatio: value
      }
    });
  };
  
  const handleAutoPlayChange = (checked: boolean) => {
    onUpdate({
      content: {
        ...element.content,
        autoPlay: checked
      }
    });
  };
  
  const handleIntervalChange = (value: number[]) => {
    onUpdate({
      content: {
        ...element.content,
        interval: value[0]
      }
    });
  };

  const handleShowNavigationChange = (checked: boolean) => {
    onUpdate({
      content: {
        ...element.content,
        showNavigation: checked
      }
    });
  };

  const handleNavigationTypeChange = (value: string) => {
    onUpdate({
      content: {
        ...element.content,
        navigationType: value
      }
    });
  };

  const handleShowIndicatorsChange = (checked: boolean) => {
    onUpdate({
      content: {
        ...element.content,
        showIndicators: checked
      }
    });
  };

  const handleIndicatorColorChange = (value: string) => {
    onUpdate({
      content: {
        ...element.content,
        indicatorColor: value
      }
    });
  };

  const handleIndicatorInactiveColorChange = (value: string) => {
    onUpdate({
      content: {
        ...element.content,
        indicatorInactiveColor: value
      }
    });
  };

  const handleCaptionBgColorChange = (value: string) => {
    onUpdate({
      content: {
        ...element.content,
        captionBgColor: value
      }
    });
  };

  const handleCaptionTextColorChange = (value: string) => {
    onUpdate({
      content: {
        ...element.content,
        captionTextColor: value
      }
    });
  };
  
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurar Carrossel</h3>
        <p className="text-sm text-muted-foreground">
          Adicione imagens ao seu carrossel.
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="images">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="display">Exibição</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Imagens ({options.length}/10)</h4>
            <Button 
              size="sm" 
              onClick={handleAddImage}
              disabled={options.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar imagem
            </Button>
          </div>
          
          {options.length === 0 ? (
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Nenhuma imagem adicionada
              </p>
              <Button onClick={handleAddImage}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar imagem
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {options.map((option: any, index: number) => (
                <div 
                  key={option.id} 
                  className="border rounded-md p-3 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">Slide {index + 1}</h5>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveImage(option.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => document.getElementById(`image-upload-${option.id}`)?.click()}
                  >
                    <input
                      id={`image-upload-${option.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, option.id)}
                      disabled={uploading}
                    />
                    
                    {option.image ? (
                      <>
                        <div className="mx-auto max-w-full max-h-[120px] overflow-hidden mb-2">
                          <img 
                            src={option.image} 
                            alt={option.text || `Slide ${index + 1}`} 
                            className="max-h-[120px] mx-auto object-contain"
                          />
                        </div>
                        {uploadingSlideId === option.id ? (
                          <div className="flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2"></div>
                            <span className="text-sm">Carregando...</span>
                          </div>
                        ) : (
                          <>
                            <Button variant="outline" size="sm">
                              Trocar imagem
                            </Button>
                            {option.isStorageImage && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Imagem armazenada no Storage ✓
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Clique para enviar uma imagem
                        </p>
                        {uploadingSlideId === option.id ? (
                          <div className="flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2"></div>
                            <span className="text-sm">Carregando...</span>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm">
                            Selecionar arquivo
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`slide-text-${option.id}`} className="text-xs mb-1 block">
                        Legenda (opcional)
                      </Label>
                      <Input
                        id={`slide-text-${option.id}`}
                        placeholder="Legenda para esta imagem"
                        value={option.text || ""}
                        onChange={(e) => handleTextChange(e.target.value, option.id)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Cores da legenda</Label>
                      <div className="flex space-x-2 items-center">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Fundo</span>
                          <input 
                            type="color" 
                            value={captionBgColor.replace('rgba(', '').replace(')', '').split(',').slice(0, 3).join(',').replace(/,/g, '')}
                            onChange={(e) => {
                              const hex = e.target.value;
                              const rgba = `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, 0.5)`;
                              handleCaptionBgColorChange(rgba);
                            }}
                            className="block w-8 h-8 rounded cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Texto</span>
                          <input 
                            type="color" 
                            value={captionTextColor}
                            onChange={(e) => handleCaptionTextColorChange(e.target.value)}
                            className="block w-8 h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="display" className="space-y-4">
          <div className="space-y-2">
            <Label>Alinhamento do carrossel</Label>
            <ToggleGroup type="single" value={alignment} onValueChange={handleAlignmentChange} className="justify-start">
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
          
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Proporção</Label>
            <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue placeholder="Selecione a proporção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="16:9">16:9 (Paisagem)</SelectItem>
                <SelectItem value="9:16">9:16 (Retrato)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-4">
            <h4 className="font-medium">Navegação</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-navigation">Mostrar botões de navegação</Label>
                <Switch
                  id="show-navigation"
                  checked={showNavigation}
                  onCheckedChange={handleShowNavigationChange}
                />
              </div>
            </div>
            
            {showNavigation && (
              <div className="space-y-2">
                <Label htmlFor="navigation-type">Estilo dos botões</Label>
                <Select value={navigationType} onValueChange={handleNavigationTypeChange}>
                  <SelectTrigger id="navigation-type">
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão (Chevron)</SelectItem>
                    <SelectItem value="arrows">Setas</SelectItem>
                    <SelectItem value="circles">Círculos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <h4 className="font-medium">Indicadores</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-indicators">Mostrar indicadores (bolinhas)</Label>
                <Switch
                  id="show-indicators"
                  checked={showIndicators}
                  onCheckedChange={handleShowIndicatorsChange}
                />
              </div>
            </div>
            
            {showIndicators && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Cor do indicador ativo</Label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={indicatorColor}
                      onChange={(e) => handleIndicatorColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <Input 
                      value={indicatorColor}
                      onChange={(e) => handleIndicatorColorChange(e.target.value)}
                      className="w-24 uppercase"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label>Cor dos indicadores inativos</Label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={indicatorInactiveColor}
                      onChange={(e) => handleIndicatorInactiveColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <Input 
                      value={indicatorInactiveColor}
                      onChange={(e) => handleIndicatorInactiveColorChange(e.target.value)}
                      className="w-24 uppercase"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-play">Navegação automática</Label>
              <Switch
                id="auto-play"
                checked={autoPlay}
                onCheckedChange={handleAutoPlayChange}
              />
            </div>
            
            {autoPlay && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="interval">Intervalo entre slides</Label>
                  <span className="text-sm text-gray-500">{interval} segundos</span>
                </div>
                <Slider
                  id="interval"
                  min={1}
                  max={10}
                  step={1}
                  value={[interval]}
                  onValueChange={handleIntervalChange}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarouselConfig;
