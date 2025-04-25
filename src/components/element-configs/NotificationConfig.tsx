import React, { useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Trash2, Volume2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NotificationContent } from "@/types/canvasTypes";
import { Slider } from "@/components/ui/slider";

interface NotificationConfigProps {
  element: CanvasElement;
  onUpdate: (updatedElement: CanvasElement) => void;
}

const NotificationConfig: React.FC<NotificationConfigProps> = ({
  element,
  onUpdate,
}) => {
  const { toast } = useToast();
  const content = element.content as NotificationContent || {};
  
  // Valores padrão
  const initialContent = {
    toastText: content.toastText || "Nova venda realizada!",
    toastEnabled: content.toastEnabled !== undefined ? content.toastEnabled : true,
    soundEnabled: content.soundEnabled !== undefined ? content.soundEnabled : true,
    soundType: content.soundType || "sale",
    toastColor: content.toastColor || "#4caf50",
    toastTextColor: content.toastTextColor || "#ffffff",
    toastDuration: content.toastDuration || 5,
    toastPosition: content.toastPosition || "top-right",
    showIcon: content.showIcon !== undefined ? content.showIcon : true,
    iconType: content.iconType || "success",
  };
  
  const [localContent, setLocalContent] = useState<NotificationContent>(initialContent);
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    // Atualiza o estado local quando o elemento muda
    setLocalContent({
      ...initialContent,
      ...content
    });
  }, [element.id]);
  
  const handleUpdate = (updatedContent: NotificationContent) => {
    const updatedElement = {
      ...element,
      content: updatedContent,
    };
    onUpdate(updatedElement);
  };
  
  const handleChange = (field: string, value: any) => {
    const updatedContent = {
      ...localContent,
      [field]: value,
    };
    
    setLocalContent(updatedContent);
    handleUpdate(updatedContent);
  };
  
  // Tocar som de teste
  const playSound = () => {
    if (localContent.soundEnabled) {
      const soundType = localContent.soundType || "sale";
      const soundPath = `/sounds/${soundType}.mp3`;
      const audio = new Audio(soundPath);
      
      try {
        audio.play().catch(error => {
          console.error("Erro ao reproduzir o som:", error);
          toast({
            title: "Erro",
            description: "Não foi possível reproduzir o som. Verifique se o arquivo existe.",
            variant: "destructive",
          });
        });
      } catch (error) {
        console.error("Erro ao reproduzir o som:", error);
        toast({
          title: "Erro",
          description: "Não foi possível reproduzir o som. Verifique se o arquivo existe.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Mostrar teste de toast
  const showTestToast = () => {
    if (localContent.toastEnabled) {
      toast({
        title: "Notificação",
        description: localContent.toastText || "Nova venda realizada!",
        variant: "default",
        style: {
          backgroundColor: localContent.toastColor,
          color: localContent.toastTextColor,
        },
      });
    }
  };
  
  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <Bell className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-medium">Configuração de Notificação</h2>
        </div>
      </div>
      
      <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="geral" className="flex-1">
            Geral
          </TabsTrigger>
          <TabsTrigger value="toast" className="flex-1">
            Toast
          </TabsTrigger>
          <TabsTrigger value="som" className="flex-1">
            Som
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="toastEnabled">Exibir Toast</Label>
                <Switch
                  id="toastEnabled"
                  checked={localContent.toastEnabled}
                  onCheckedChange={(checked) => handleChange("toastEnabled", checked)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Mostrar notificação visual
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="soundEnabled">Reproduzir Som</Label>
                <Switch
                  id="soundEnabled"
                  checked={localContent.soundEnabled}
                  onCheckedChange={(checked) => handleChange("soundEnabled", checked)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Reproduzir som de notificação
              </p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              showTestToast();
              playSound();
            }}
          >
            Testar Notificação
          </Button>
        </TabsContent>
        
        <TabsContent value="toast" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="toastText">Texto do Toast</Label>
              <Input
                id="toastText"
                value={localContent.toastText}
                onChange={(e) => handleChange("toastText", e.target.value)}
                disabled={!localContent.toastEnabled}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="toastPosition">Posição do Toast</Label>
              <Select
                value={localContent.toastPosition}
                onValueChange={(value) => handleChange("toastPosition", value)}
                disabled={!localContent.toastEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="top-right">Superior Direito</SelectItem>
                    <SelectItem value="top-left">Superior Esquerdo</SelectItem>
                    <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                    <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                    <SelectItem value="top-center">Superior Centro</SelectItem>
                    <SelectItem value="bottom-center">Inferior Centro</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="toastDuration">Duração (segundos)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="toastDuration"
                  value={[localContent.toastDuration || 5]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleChange("toastDuration", value[0])}
                  disabled={!localContent.toastEnabled}
                />
                <span className="w-10 text-right">{localContent.toastDuration || 5}s</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="toastColor">Cor de Fundo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="toastColor"
                  type="color"
                  value={localContent.toastColor}
                  onChange={(e) => handleChange("toastColor", e.target.value)}
                  className="w-10 h-10 p-1"
                  disabled={!localContent.toastEnabled}
                />
                <Input
                  value={localContent.toastColor}
                  onChange={(e) => handleChange("toastColor", e.target.value)}
                  className="flex-1"
                  disabled={!localContent.toastEnabled}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="toastTextColor">Cor do Texto</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="toastTextColor"
                  type="color"
                  value={localContent.toastTextColor}
                  onChange={(e) => handleChange("toastTextColor", e.target.value)}
                  className="w-10 h-10 p-1"
                  disabled={!localContent.toastEnabled}
                />
                <Input
                  value={localContent.toastTextColor}
                  onChange={(e) => handleChange("toastTextColor", e.target.value)}
                  className="flex-1"
                  disabled={!localContent.toastEnabled}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="showIcon">Mostrar Ícone</Label>
                <Switch
                  id="showIcon"
                  checked={localContent.showIcon}
                  onCheckedChange={(checked) => handleChange("showIcon", checked)}
                  disabled={!localContent.toastEnabled}
                />
              </div>
            </div>
            
            {localContent.showIcon && (
              <div className="space-y-1">
                <Label htmlFor="iconType">Tipo de Ícone</Label>
                <Select
                  value={localContent.iconType}
                  onValueChange={(value) => handleChange("iconType", value)}
                  disabled={!localContent.toastEnabled || !localContent.showIcon}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={showTestToast}
              disabled={!localContent.toastEnabled}
            >
              Testar Toast
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="som" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="soundType">Tipo de Som</Label>
              <Select
                value={localContent.soundType}
                onValueChange={(value) => handleChange("soundType", value)}
                disabled={!localContent.soundEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de som" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sale">Som de Venda</SelectItem>
                    <SelectItem value="success">Som de Sucesso</SelectItem>
                    <SelectItem value="alert">Som de Alerta</SelectItem>
                    <SelectItem value="notification">Som de Notificação</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={playSound}
              disabled={!localContent.soundEnabled}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Testar Som
            </Button>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
              <p>Nota: Certifique-se de que os arquivos de som necessários estejam disponíveis em public/sounds/ com nomes correspondentes (ex: sale.mp3, success.mp3).</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationConfig; 