
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
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CarouselConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const CarouselConfig = ({ element, onUpdate }: CarouselConfigProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  // Get or initialize options array
  const options = element.content?.options || [];
  const alignment = element.content?.alignment || "center";
  const aspectRatio = element.content?.aspectRatio || "16:9";
  const autoPlay = element.content?.autoPlay || false;
  const interval = element.content?.interval || 3;
  
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
    const newOptions = options.filter((opt: any) => opt.id !== id);
    
    onUpdate({
      content: {
        ...element.content,
        options: newOptions
      }
    });
  };
  
  const handleImageUpload = (file: File, optionId: string) => {
    setUploading(true);
    
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Find the option to update
    const newOptions = options.map((opt: any) => {
      if (opt.id === optionId) {
        return { ...opt, image: fileUrl };
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
    
    setUploading(false);
    
    toast({
      title: "Imagem carregada",
      description: `${file.name} foi adicionada ao carrossel`,
    });
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
  
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurar Carrossel</h3>
        <p className="text-sm text-muted-foreground">
          Adicione imagens ao seu carrossel.
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
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
                    size="icon"
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
                      <Button variant="outline" size="sm">
                        Trocar imagem
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Clique para enviar uma imagem
                      </p>
                      <Button variant="outline" size="sm">
                        Selecionar arquivo
                      </Button>
                    </>
                  )}
                </div>
                
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
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Configurações de exibição</h4>
        
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
      </div>
    </div>
  );
};

export default CarouselConfig;
