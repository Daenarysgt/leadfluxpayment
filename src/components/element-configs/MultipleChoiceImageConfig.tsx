import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/utils/store";
import TitleInput from "./multiple-choice/TitleInput";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, Link, X, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";

interface MultipleChoiceImageConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const MultipleChoiceImageConfig = ({ element, onUpdate }: MultipleChoiceImageConfigProps) => {
  const { currentFunnel, setCanvasElements, currentStep } = useStore();
  
  // Estado para armazenar a margem superior
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
  // Estado para controlar o carregamento de imagens
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  const steps = currentFunnel?.steps.map(step => ({
    id: step.id,
    title: step.title
  })) || [];

  const handleTitleChange = (title: string) => {
    onUpdate({
      content: {
        ...element.content,
        title
      }
    });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    const updatedOptions = element.content.options.map((option: any) => 
      option.id === optionId ? { ...option, text } : option
    );
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionImageChange = (optionId: string, image: string) => {
    const updatedOptions = element.content.options.map((option: any) => 
      option.id === optionId ? { ...option, image } : option
    );
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  // Função para converter arquivo em base64 (mantida para compatibilidade)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para redimensionar imagem antes do upload
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
          
          console.log(`MultipleChoiceImageConfig - Redimensionando imagem original: ${width}x${height}`);
          
          // Calcular as novas dimensões mantendo a proporção
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
          
          console.log(`MultipleChoiceImageConfig - Nova dimensão: ${width}x${height}`);
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Falha ao obter contexto do canvas'));
            return;
          }
          
          // Melhoria da qualidade de renderização
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Desenhar imagem no canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Determinar o tipo de saída com base no tipo original
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          
          // Converter para blob com qualidade adequada
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao redimensionar imagem'));
              return;
            }
            
            // Criar novo arquivo a partir do blob
            const resizedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            
            console.log(`MultipleChoiceImageConfig - Imagem redimensionada: ${resizedFile.size} bytes`);
            resolve(resizedFile);
          }, outputType, outputType === 'image/jpeg' ? 0.9 : undefined);
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
      const filePath = `options/${currentFunnel?.id || 'default'}/${fileName}`;
      
      console.log(`MultipleChoiceImageConfig - Fazendo upload para ${filePath}`);
      
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
      
      console.log(`MultipleChoiceImageConfig - Upload bem-sucedido, URL: ${urlData.publicUrl}`);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("MultipleChoiceImageConfig - Erro ao fazer upload da imagem:", error);
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
      
      console.log(`MultipleChoiceImageConfig - Removendo imagem antiga: ${filePath}`);
      
      // Excluir do Storage
      const { error } = await supabase
        .storage
        .from('images')
        .remove([filePath]);
        
      if (error) console.error("MultipleChoiceImageConfig - Erro ao excluir imagem antiga:", error);
    } catch (error) {
      console.error("MultipleChoiceImageConfig - Erro ao tentar excluir imagem antiga:", error);
    }
  };

  // Função para processar o upload de arquivo
  const handleFileUpload = async (optionId: string, file: File) => {
    try {
      // Marcar essa opção como em carregamento
      setUploadingImage(optionId);
      console.log(`MultipleChoiceImageConfig - Processando upload de imagem para opção ${optionId}`);
      
      // Buscar imagem antiga para remover após o upload ter sucesso
      const oldImage = element.content.options.find((option: any) => option.id === optionId)?.image;
      
      // Determinando o tipo de arquivo
      const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
      const isPng = file.type === 'image/png';
      const isGif = file.type === 'image/gif';
      
      // Redimensionar para tamanho adequado (mas manter qualidade alta)
      let resizedFile;
      if (isGif) {
        // Para GIFs, usar arquivo original para preservar animação
        resizedFile = file;
      } else {
        // Para outros tipos, redimensionar
        resizedFile = await resizeImage(file, 1200, 900);
      }
      
      // Fazer upload para o Storage e obter URL
      const imageUrl = await uploadImageToStorage(resizedFile, optionId);
      
      // Se havia uma imagem antiga do Supabase Storage, tente removê-la
      if (oldImage && oldImage.includes('supabase.co/storage')) {
        deleteOldImage(oldImage).catch(console.error);
      }
      
      // Atualizar option com a URL da imagem
      handleOptionImageChange(optionId, imageUrl);
      
      // Garantir a persistência imediatamente
      const updatedOptions = element.content.options.map((option: any) => 
        option.id === optionId ? { ...option, image: imageUrl } : option
      );
      
      // Atualizar todo o elemento com as opções atualizadas
      onUpdate({
        content: {
          ...element.content,
          options: updatedOptions
        }
      });
      
      // Forçar sincronização com o banco de dados
      forceCanvasSynchronization();
      
      console.log(`MultipleChoiceImageConfig - Imagem salva com sucesso para opção ${optionId}`);
    } catch (error) {
      console.error("MultipleChoiceImageConfig - Erro ao processar imagem:", error);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleOptionBackgroundColorChange = (optionId: string, backgroundColor: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            backgroundColor 
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionAspectRatioChange = (optionId: string, aspectRatio: "1:1" | "16:9" | "9:16" | "4:3") => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          style: { 
            ...(option.style || {}), 
            aspectRatio 
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionNavigationTypeChange = (optionId: string, type: "next" | "step" | "url" | "none") => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          navigation: { 
            ...(option.navigation || {}), 
            type
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionStepIdChange = (optionId: string, stepId: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          navigation: { 
            ...(option.navigation || {}), 
            type: "step",
            stepId
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleOptionUrlChange = (optionId: string, url: string) => {
    const updatedOptions = element.content.options.map((option: any) => {
      if (option.id === optionId) {
        return { 
          ...option, 
          navigation: { 
            ...(option.navigation || {}), 
            type: "url",
            url
          } 
        };
      }
      return option;
    });
    
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  const handleAddOption = () => {
    const newOption = {
      id: crypto.randomUUID(),
      text: "Nova opção",
      image: "/placeholder.svg",
      style: {
        backgroundColor: "#0F172A",
        aspectRatio: "1:1"
      },
      navigation: {
        type: "next" as "next" | "step" | "url"
      },
      value: "Nova opção"
    };
    
    console.log("MultipleChoiceImageConfig - Adicionando nova opção com imagem placeholder");
    
    onUpdate({
      content: {
        ...element.content,
        options: [...(element.content.options || []), newOption]
      }
    });
  };

  const handleDeleteOption = (optionId: string) => {
    // Buscar imagem antiga para remover
    const option = element.content.options.find((option: any) => option.id === optionId);
    if (option?.image && option.image.includes('supabase.co/storage')) {
      deleteOldImage(option.image).catch(console.error);
    }
    
    const updatedOptions = element.content.options.filter((option: any) => option.id !== optionId);
    onUpdate({
      content: {
        ...element.content,
        options: updatedOptions
      }
    });
  };

  // Manipulador para mudanças na margem superior
  const handleMarginTopChange = (value: number[]) => {
    // Atualizar a margem superior no estado local
    setMarginTop(value[0]);
    
    // Atualizar o elemento
    onUpdate({
      content: {
        ...element.content,
        marginTop: value[0]
      }
    });
  };

  // Função para forçar a sincronização com o banco de dados
  const forceCanvasSynchronization = () => {
    if (!currentFunnel || currentStep === undefined || currentStep < 0) return;
    
    const stepId = currentFunnel.steps[currentStep]?.id;
    if (!stepId) return;
    
    // Buscar todos os elementos atuais do canvas para o step atual
    setTimeout(() => {
      try {
        // Encontrar o elemento atualizado na lista de elementos do canvas
        const allCanvasElements = currentFunnel.steps[currentStep].canvasElements || [];
        
        // Encontrar o elemento atual que estamos editando
        const updatedElements = allCanvasElements.map(canvasEl => 
          canvasEl.id === element.id ? { ...canvasEl, content: element.content } : canvasEl
        );
        
        console.log(`MultipleChoiceImageConfig - Forçando sincronização do step ${stepId} com ${updatedElements.length} elementos`);
        
        // Forçar persistência no banco de dados
        setCanvasElements(stepId, updatedElements);
      } catch (error) {
        console.error("MultipleChoiceImageConfig - Erro ao forçar sincronização:", error);
      }
    }, 500); // Pequeno atraso para garantir que todas as atualizações foram processadas
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-4">
            <TitleInput
              title={element.content?.title || ""}
              onChange={handleTitleChange}
            />

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Opções</h3>
              
              {element.content?.options.map((option: any) => (
                <div key={option.id} className="space-y-2 border p-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`option-${option.id}`}>Texto da opção</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    id={`option-${option.id}`}
                    value={option.text || ""}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    placeholder="Texto da opção"
                  />

                  <div className="space-y-2">
                    <Label>URL da imagem</Label>
                    <div className="flex gap-2 relative">
                      <Input
                        value={option.image || ""}
                        onChange={(e) => handleOptionImageChange(option.id, e.target.value)}
                        placeholder="/placeholder.svg"
                        className="flex-1"
                      />
                      <label 
                        htmlFor={`file-upload-${option.id}`}
                        className={`cursor-pointer flex items-center justify-center px-3 py-2 bg-primary text-primary-foreground rounded-md ${uploadingImage === option.id ? 'opacity-50' : ''}`}
                      >
                        {uploadingImage === option.id ? (
                          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </label>
                      <input
                        id={`file-upload-${option.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage !== null}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(option.id, e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                    {option.image && option.image.includes('supabase.co') && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Imagem armazenada no Supabase Storage ✓
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Cor de fundo</Label>
                    <Input
                      type="color"
                      value={option.style?.backgroundColor || "#0F172A"}
                      onChange={(e) => handleOptionBackgroundColorChange(option.id, e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Proporção da imagem</Label>
                    <RadioGroup
                      value={option.style?.aspectRatio || "1:1"}
                      onValueChange={(value) => handleOptionAspectRatioChange(option.id, value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1:1" id={`aspect-1-1-${option.id}`} />
                        <Label htmlFor={`aspect-1-1-${option.id}`}>1:1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="16:9" id={`aspect-16-9-${option.id}`} />
                        <Label htmlFor={`aspect-16-9-${option.id}`}>16:9</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="9:16" id={`aspect-9-16-${option.id}`} />
                        <Label htmlFor={`aspect-9-16-${option.id}`}>9:16</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4:3" id={`aspect-4-3-${option.id}`} />
                        <Label htmlFor={`aspect-4-3-${option.id}`}>4:3</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Navegação ao clicar</Label>
                    <Select
                      value={option.navigation?.type || "next"}
                      onValueChange={(value) => handleOptionNavigationTypeChange(option.id, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a navegação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">Próximo passo</SelectItem>
                        <SelectItem value="step">Passo específico</SelectItem>
                        <SelectItem value="url">URL externa</SelectItem>
                        <SelectItem value="none">Nenhuma ação</SelectItem>
                      </SelectContent>
                    </Select>

                    {option.navigation?.type === "step" && (
                      <div className="space-y-2">
                        <Label>Selecione o passo</Label>
                        <Select
                          value={option.navigation?.stepId || ""}
                          onValueChange={(value) => handleOptionStepIdChange(option.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o passo" />
                          </SelectTrigger>
                          <SelectContent>
                            {steps.map((step) => (
                              <SelectItem key={step.id} value={step.id}>
                                {step.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {option.navigation?.type === "url" && (
                      <div className="space-y-2">
                        <Label>URL externa</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={option.navigation?.url || ""}
                            onChange={(e) => handleOptionUrlChange(option.id, e.target.value)}
                            placeholder="https://exemplo.com"
                            className="flex-1"
                          />
                          <Link className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style">
          <div className="space-y-4">
            {/* Seção de Margem Superior */}
            <div className="space-y-2">
              <Label htmlFor="margin-top">Margem superior</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarginTopChange([marginTop - 5])}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarginTopChange([marginTop + 5])}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Slider
                    id="margin-top"
                    min={-100}
                    max={100}
                    step={1}
                    value={[marginTop]}
                    onValueChange={handleMarginTopChange}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">{marginTop}px</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultipleChoiceImageConfig;
