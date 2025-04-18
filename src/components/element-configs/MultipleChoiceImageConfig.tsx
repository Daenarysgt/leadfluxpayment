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

interface MultipleChoiceImageConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const MultipleChoiceImageConfig = ({ element, onUpdate }: MultipleChoiceImageConfigProps) => {
  const { currentFunnel } = useStore();
  
  // Estado para armazenar a margem superior
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
  
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
  const resizeImage = (file: File, maxWidth = 800, maxHeight = 600): Promise<File> => {
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

  // Função para processar o upload de arquivo
  const handleFileUpload = async (optionId: string, file: File) => {
    try {
      // Redimensionar a imagem antes de converter para base64
      const resizedFile = await resizeImage(file);
      const base64Image = await convertToBase64(resizedFile);
      handleOptionImageChange(optionId, base64Image);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
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
      style: {
        backgroundColor: "#0F172A",
        aspectRatio: "1:1"
      },
      navigation: {
        type: "next" as "next" | "step" | "url"
      },
      value: "Nova opção"
    };
    
    onUpdate({
      content: {
        ...element.content,
        options: [...(element.content.options || []), newOption]
      }
    });
  };

  const handleDeleteOption = (optionId: string) => {
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
                    <div className="flex gap-2">
                      <Input
                        value={option.image || ""}
                        onChange={(e) => handleOptionImageChange(option.id, e.target.value)}
                        placeholder="/placeholder.svg"
                        className="flex-1"
                      />
                      <label 
                        htmlFor={`file-upload-${option.id}`}
                        className="cursor-pointer flex items-center justify-center px-3 py-2 bg-primary text-primary-foreground rounded-md"
                      >
                        <Upload className="h-4 w-4" />
                      </label>
                      <input
                        id={`file-upload-${option.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(option.id, e.target.files[0]);
                          }
                        }}
                      />
                    </div>
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
