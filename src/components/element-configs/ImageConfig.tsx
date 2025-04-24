import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Upload, Link as LinkIcon, ImageIcon, ZoomIn, ZoomOut, Maximize, AlignLeft, AlignCenter, AlignRight, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/lib/supabase";

interface ImageConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const ImageConfig = ({ element, onUpdate }: ImageConfigProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(element.content?.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imgDimensions, setImgDimensions] = useState({
    width: element.content?.width || 0,
    height: element.content?.height || 0,
    originalWidth: element.content?.width || 0,
    originalHeight: element.content?.height || 0
  });
  const [sizePercentage, setSizePercentage] = useState(100);
  const [alignment, setAlignment] = useState(element.content?.alignment || "center");
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
  const [borderRadius, setBorderRadius] = useState(element.content?.borderRadius || 0);
  
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
      
      console.log(`ImageConfig - Fazendo upload para ${filePath}`);
      
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
      
      console.log(`ImageConfig - Upload bem-sucedido, URL: ${urlData.publicUrl}`);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("ImageConfig - Erro ao fazer upload da imagem:", error);
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
      
      console.log(`ImageConfig - Removendo imagem antiga: ${filePath}`);
      
      // Excluir do Storage
      const { error } = await supabase
        .storage
        .from('images')
        .remove([filePath]);
        
      if (error) console.error("ImageConfig - Erro ao excluir imagem antiga:", error);
    } catch (error) {
      console.error("ImageConfig - Erro ao tentar excluir imagem antiga:", error);
    }
  };
  
  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    
    if (url) {
      // When setting a URL, try to get dimensions
      const img = new Image();
      img.onload = () => {
        const newDimensions = {
          width: img.width,
          height: img.height,
          originalWidth: img.width,
          originalHeight: img.height
        };
        
        setImgDimensions(newDimensions);
        setSizePercentage(100);
        
        // Update the element with the new image URL and dimensions
        onUpdate({
          content: {
            ...element.content,
            imageUrl: url,
            width: img.width,
            height: img.height
          }
        });
      };
      
      img.onerror = () => {
        toast({
          title: "Erro ao carregar imagem",
          description: "Não foi possível carregar a imagem da URL informada.",
          variant: "destructive",
        });
      };
      
      img.src = url;
    } else {
      // If URL is cleared, reset dimensions
      onUpdate({
        content: {
          ...element.content,
          imageUrl: "",
          width: undefined,
          height: undefined
        }
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setImageFile(file);
    
    try {
      // Verificar se há uma imagem antiga para excluir
      if (element.content?.imageUrl && element.content.imageUrl.includes('supabase.co/storage')) {
        await deleteOldImage(element.content.imageUrl);
      }
      
      // Verificar se é um GIF
      const isGif = file.type === 'image/gif';
      
      // Redimensionar a imagem (exceto GIFs animados para preservar a animação)
      const processedFile = isGif ? file : await resizeImage(file);
      
      // Fazer upload para o Storage
      const imageUrl = await uploadImageToStorage(processedFile);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        const newDimensions = {
          width: img.width,
          height: img.height,
          originalWidth: img.width,
          originalHeight: img.height
        };
        
        setImgDimensions(newDimensions);
        setSizePercentage(100);
        
        // Update element with image URL and dimensions
        onUpdate({
          content: {
            ...element.content,
            imageUrl: imageUrl,
            width: img.width,
            height: img.height,
            fileName: file.name,
            isAnimatedGif: isGif,
            isStorageImage: true // Indicar que esta imagem está no Storage
          }
        });
        
        setUploading(false);
        
        toast({
          title: "Imagem carregada",
          description: `${file.name} (${img.width}x${img.height})${isGif ? " - GIF animado" : ""}`,
        });
      };
      
      img.onerror = () => {
        setUploading(false);
        toast({
          title: "Erro ao carregar imagem",
          description: "Não foi possível carregar a imagem. Tente novamente.",
          variant: "destructive",
        });
      };
      
      img.src = imageUrl;
    } catch (error) {
      setUploading(false);
      toast({
        title: "Erro ao processar imagem",
        description: "Não foi possível processar a imagem. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao processar imagem:", error);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleImageUpload(file);
  };

  const handleSizeChange = (value: number[]) => {
    const percentage = value[0];
    setSizePercentage(percentage);
    
    if (imgDimensions.originalWidth && imgDimensions.originalHeight) {
      const newWidth = Math.round(imgDimensions.originalWidth * (percentage / 100));
      const newHeight = Math.round(imgDimensions.originalHeight * (percentage / 100));
      
      setImgDimensions({
        ...imgDimensions,
        width: newWidth,
        height: newHeight,
      });
      
      onUpdate({
        content: {
          ...element.content,
          width: newWidth,
          height: newHeight
        }
      });
    }
  };

  const resetSize = () => {
    setSizePercentage(100);
    
    if (imgDimensions.originalWidth && imgDimensions.originalHeight) {
      setImgDimensions({
        ...imgDimensions,
        width: imgDimensions.originalWidth,
        height: imgDimensions.originalHeight,
      });
      
      onUpdate({
        content: {
          ...element.content,
          width: imgDimensions.originalWidth,
          height: imgDimensions.originalHeight
        }
      });
    }
  };

  const handleAlignmentChange = (value: string) => {
    if (value) {
      setAlignment(value);
      onUpdate({
        content: {
          ...element.content,
          alignment: value
        }
      });
    }
  };

  // Manipulador para mudanças na margem superior
  const handleMarginTopChange = (value: number[]) => {
    const margin = value[0];
    setMarginTop(margin);
    onUpdate({
      content: {
        ...element.content,
        marginTop: margin
      }
    });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const radius = value[0];
    setBorderRadius(radius);
    onUpdate({
      content: {
        ...element.content,
        borderRadius: radius
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurar Imagem</h3>
        <p className="text-sm text-muted-foreground">
          Adicione uma imagem ao seu funil.
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4 pt-4">
          <div 
            className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => document.getElementById('image-upload')?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const files = e.dataTransfer.files;
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
              
              handleImageUpload(file);
            }}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
            
            {element.content?.imageUrl ? (
              <div className="space-y-4">
                <div className="mx-auto max-w-full max-h-[200px] overflow-hidden">
                  <img 
                    src={element.content.imageUrl} 
                    alt="Imagem carregada" 
                    className="max-h-[200px] mx-auto object-contain"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {element.content.fileName && <p>{element.content.fileName}</p>}
                  {element.content.width && element.content.height && (
                    <p>{element.content.width} x {element.content.height} pixels</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  type="button"
                  className="mt-2"
                >
                  Trocar imagem
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  Clique ou arraste uma imagem
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PNG, JPG, GIF até 10MB
                </p>
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={uploading}
                  className="mx-auto"
                >
                  {uploading ? "Carregando..." : "Selecionar arquivo"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL da imagem</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Insira o URL de uma imagem disponível na web
            </p>
          </div>
          
          {element.content?.imageUrl && (
            <div className="border rounded-md p-4 mt-4">
              <div className="mx-auto max-w-full max-h-[200px] overflow-hidden">
                <img 
                  src={element.content.imageUrl} 
                  alt="Imagem da URL" 
                  className="max-h-[200px] mx-auto object-contain"
                />
              </div>
              {element.content.width && element.content.height && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {element.content.width} x {element.content.height} pixels
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      {element.content?.imageUrl && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Tamanho da imagem ({sizePercentage}%)</Label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => handleSizeChange([Math.max(10, sizePercentage - 10)])}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => handleSizeChange([Math.min(200, sizePercentage + 10)])}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={resetSize}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Slider
              value={[sizePercentage]}
              min={10}
              max={200}
              step={1}
              onValueChange={handleSizeChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Menor (10%)</span>
              <span>Original (100%)</span>
              <span>Maior (200%)</span>
            </div>
            {imgDimensions.width && imgDimensions.height && (
              <p className="text-xs text-muted-foreground mt-1">
                Dimensões atuais: {imgDimensions.width} x {imgDimensions.height} pixels
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Alinhamento da imagem</Label>
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

          {/* Controle de Margem Superior */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="margin-top">Margem superior</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{marginTop}px</span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop - 5])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop + 5])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Slider
              id="margin-top"
              min={-100}
              max={100}
              step={1}
              value={[marginTop]}
              onValueChange={handleMarginTopChange}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Bordas Arredondadas (em pixels)</h4>
            <div className="flex items-center gap-3">
              <Slider
                defaultValue={[borderRadius]}
                max={50}
                step={1}
                onValueChange={handleBorderRadiusChange}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-[30px]">{borderRadius}</span>
            </div>
          </div>
        </div>
      )}
      
      <Separator />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="alt-text">Texto alternativo (Alt)</Label>
          <Input
            id="alt-text"
            placeholder="Descreva a imagem para acessibilidade"
            value={element.content?.altText || ""}
            onChange={(e) => onUpdate({
              content: {
                ...element.content,
                altText: e.target.value
              }
            })}
          />
          <p className="text-xs text-muted-foreground">
            Texto que descreve a imagem para tecnologias assistivas
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageConfig;
