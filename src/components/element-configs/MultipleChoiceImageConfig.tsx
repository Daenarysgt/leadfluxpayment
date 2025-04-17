import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/utils/store";
import TitleInput from "./multiple-choice/TitleInput";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, Link, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MultipleChoiceImageConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const MultipleChoiceImageConfig = ({ element, onUpdate }: MultipleChoiceImageConfigProps) => {
  const { currentFunnel } = useStore();
  
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

  return (
    <div className="p-4 space-y-6">
      <TitleInput 
        title={element.content?.title || ""} 
        onChange={handleTitleChange} 
      />
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Opções</h4>
        
        <div className="space-y-4">
          {element.content?.options?.map((option: any) => (
            <div key={option.id} className="border rounded-md p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                  {option.image && (
                    <img src={option.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                  className="flex-1"
                  placeholder="Texto da opção"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={element.content.options.length <= 1}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URL da imagem</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={option.image || ""}
                      onChange={(e) => handleOptionImageChange(option.id, e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="upload">
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Arraste uma imagem ou clique para fazer upload
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // In a real implementation, this would upload the file
                          // For now, we'll just set a placeholder
                          handleOptionImageChange(option.id, URL.createObjectURL(file));
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      Selecionar arquivo
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="space-y-2">
                <Label htmlFor={`aspect-ratio-${option.id}`}>Proporção da imagem</Label>
                <RadioGroup 
                  defaultValue={option.style?.aspectRatio || "1:1"}
                  onValueChange={(value) => handleOptionAspectRatioChange(option.id, value as "1:1" | "16:9" | "9:16" | "4:3")}
                  className="grid grid-cols-4 gap-2"
                >
                  <div className="flex flex-col items-center">
                    <div className="border rounded p-2 mb-1 w-12 h-12 flex items-center justify-center">
                      <div className="bg-gray-200 w-10 h-10"></div>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="1:1" id={`aspect-1:1-${option.id}`} className="mr-1" />
                      <Label htmlFor={`aspect-1:1-${option.id}`} className="text-xs">1:1</Label>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="border rounded p-2 mb-1 w-12 h-12 flex items-center justify-center">
                      <div className="bg-gray-200 w-10 h-6"></div>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="16:9" id={`aspect-16:9-${option.id}`} className="mr-1" />
                      <Label htmlFor={`aspect-16:9-${option.id}`} className="text-xs">16:9</Label>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="border rounded p-2 mb-1 w-12 h-12 flex items-center justify-center">
                      <div className="bg-gray-200 w-6 h-10"></div>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="9:16" id={`aspect-9:16-${option.id}`} className="mr-1" />
                      <Label htmlFor={`aspect-9:16-${option.id}`} className="text-xs">9:16</Label>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="border rounded p-2 mb-1 w-12 h-12 flex items-center justify-center">
                      <div className="bg-gray-200 w-10 h-7.5"></div>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="4:3" id={`aspect-4:3-${option.id}`} className="mr-1" />
                      <Label htmlFor={`aspect-4:3-${option.id}`} className="text-xs">4:3</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`bg-color-${option.id}`}>Cor de fundo</Label>
                <div className="flex space-x-2">
                  <div 
                    className="h-10 w-10 rounded border"
                    style={{ backgroundColor: option.style?.backgroundColor || '#0F172A' }}
                  />
                  <Input
                    id={`bg-color-${option.id}`}
                    type="text"
                    value={option.style?.backgroundColor || '#0F172A'}
                    onChange={(e) => handleOptionBackgroundColorChange(option.id, e.target.value)}
                    placeholder="#0F172A"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Navegação</Label>
                <Select 
                  defaultValue={option.navigation?.type || "next"}
                  onValueChange={(value) => handleOptionNavigationTypeChange(option.id, value as "next" | "step" | "url" | "none")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        <span>Nenhum</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="next">Ir para próxima etapa</SelectItem>
                    <SelectItem value="step">Ir para etapa específica</SelectItem>
                    <SelectItem value="url">Abrir URL externa</SelectItem>
                  </SelectContent>
                </Select>
                
                {option.navigation?.type === "step" && (
                  <div className="pt-2">
                    <Select 
                      defaultValue={option.navigation?.stepId || ""}
                      onValueChange={(value) => handleOptionStepIdChange(option.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma etapa" />
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
                  <div className="pt-2">
                    <Input
                      type="url"
                      placeholder="https://www.example.com"
                      value={option.navigation?.url || ""}
                      onChange={(e) => handleOptionUrlChange(option.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="outline" 
          size="sm"
          onClick={handleAddOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar opção
        </Button>
      </div>
    </div>
  );
};

export default MultipleChoiceImageConfig;
