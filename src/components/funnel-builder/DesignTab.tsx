import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Funnel } from "@/utils/types";
import { useStore } from "@/utils/store";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateThemeColor } from "@/lib/utils";

interface DesignTabProps {
  funnel: Funnel;
}

const DesignTab = ({ funnel }: DesignTabProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Aplicar a cor do tema quando o componente montar
  useEffect(() => {
    if (funnel?.settings?.primaryColor) {
      updateThemeColor(funnel.settings.primaryColor);
    }
  }, [funnel?.id]);

  // Função para converter arquivo em base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para redimensionar imagem antes de converter para base64
  const resizeImage = (file: File, maxWidth = 300, maxHeight = 100): Promise<File> => {
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
          
          // Definir qualidade menor para JPEG para garantir que o tamanho seja adequado
          const quality = 0.7; // 70% de qualidade para reduzir tamanho
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          
          // Converter para blob com qualidade reduzida
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao redimensionar imagem'));
              return;
            }
            
            console.log("DesignTab - Tamanho do blob após redimensionamento:", blob.size, "bytes");
            
            // Criar novo arquivo a partir do blob
            const resizedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          }, outputType, quality);
        };
        img.onerror = () => {
          reject(new Error('Erro ao carregar imagem para redimensionamento'));
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, envie apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      console.log("DesignTab - Iniciando processamento de imagem:", file.name, file.type, file.size);
      
      // Redimensionar logo antes de converter para base64
      const resizedFile = await resizeImage(file);
      console.log("DesignTab - Imagem redimensionada com sucesso");
      
      const base64Logo = await convertToBase64(resizedFile);
      console.log("DesignTab - Imagem convertida para base64, tamanho:", base64Logo.length);
      
      // Atualizar funnel com o novo logo
      const updatedFunnel = {
        ...funnel,
        settings: {
          ...funnel.settings,
          logo: base64Logo,
        },
      };
      
      console.log("DesignTab - Atualizando funnel com novo logo", !!updatedFunnel.settings.logo);
      
      useStore.getState().updateFunnel(updatedFunnel);
      
      toast({
        title: "Logotipo atualizado",
        description: "O logotipo foi atualizado com sucesso.",
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
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleLogoUpload(file);
  };

  const removeLogo = () => {
    const updatedFunnel = {
      ...funnel,
      settings: {
        ...funnel.settings,
        logo: undefined,
      },
    };
    
    useStore.getState().updateFunnel(updatedFunnel);
    
    toast({
      title: "Logotipo removido",
      description: "O logotipo foi removido com sucesso.",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto mt-0 p-4">
      <h2 className="text-lg font-medium mb-4">Design Options</h2>
      <p className="text-muted-foreground">Customize the look and feel of your funnel</p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logotipo</Label>
              <p className="text-sm text-muted-foreground mb-2">
                O logotipo aparecerá em todas as páginas do funil, acima da barra de progresso.
              </p>
              
              {funnel.settings.logo ? (
                <div className="space-y-3">
                  <div className="border rounded-md p-4 flex items-center justify-between">
                    <div className="max-w-[200px] max-h-[60px] overflow-hidden">
                      <img
                        src={funnel.settings.logo}
                        alt="Logotipo"
                        className="max-h-[60px] object-contain"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeLogo}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Enviando..." : "Trocar logotipo"}
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">
                    Clique para fazer upload do logotipo
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PNG, JPG, SVG (tamanho recomendado: 300x80px)
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={uploading}
                  >
                    {uploading ? "Enviando..." : "Selecionar arquivo"}
                  </Button>
                </div>
              )}
              
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="color" 
                  id="primary-color" 
                  value={funnel.settings.primaryColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        primaryColor: e.target.value,
                      },
                    };
                    updateThemeColor(e.target.value);
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                />
                <Input 
                  value={funnel.settings.primaryColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        primaryColor: e.target.value,
                      },
                    };
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      updateThemeColor(e.target.value);
                    }
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-32"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="color" 
                  id="background-color" 
                  value={funnel.settings.backgroundColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        backgroundColor: e.target.value,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                />
                <Input 
                  value={funnel.settings.backgroundColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        backgroundColor: e.target.value,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignTab;
