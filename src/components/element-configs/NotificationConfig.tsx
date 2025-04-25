import React from "react";
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
import { Volume2, Settings } from "lucide-react";
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
    notificationTitle: content.notificationTitle || "Venda realizada com o Pix",
    notificationText: content.notificationText || "Sua comissão: R$34,90",
    notificationCode: content.notificationCode || "#P00000009",
    backgroundColor: content.backgroundColor || "rgba(23, 23, 23, 0.95)",
    textColor: content.textColor || "#ffffff",
    accentColor: content.accentColor || "#ff4d4d",
    showTime: content.showTime !== undefined ? content.showTime : true,
    timeText: content.timeText || "há 1h",
    displayDuration: content.displayDuration || 5,
    stackSize: content.stackSize || 3,
    soundEnabled: content.soundEnabled !== undefined ? content.soundEnabled : true,
    soundType: content.soundType || "sale",
    position: content.position || "bottom-right",
    enabled: content.enabled !== undefined ? content.enabled : true,
  };
  
  const [localContent, setLocalContent] = React.useState<NotificationContent>(initialContent);
  const [activeTab, setActiveTab] = React.useState("geral");

  React.useEffect(() => {
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
      const audio = new Audio(`/sounds/${localContent.soundType}.mp3`);
      audio.play().catch(error => {
        console.error("Erro ao reproduzir o som:", error);
        toast({
          title: "Erro",
          description: "Não foi possível reproduzir o som. Verifique se o arquivo existe.",
          variant: "destructive",
        });
      });
    }
  };
  
  // Mostrar teste de notificação
  const showTestNotification = () => {
    if (localContent.enabled) {
      toast({
        title: localContent.notificationTitle,
        description: `${localContent.notificationText} - ${localContent.notificationCode}`,
        style: {
          backgroundColor: localContent.backgroundColor,
          color: localContent.textColor,
        },
      });
    }
  };
  
  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-medium">Configuração de Notificação</h2>
        </div>
      </div>
      
      <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="geral" className="flex-1">
            Geral
          </TabsTrigger>
          <TabsTrigger value="estilo" className="flex-1">
            Estilo
          </TabsTrigger>
          <TabsTrigger value="som" className="flex-1">
            Som
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Ativar Notificações</Label>
                <Switch
                  id="enabled"
                  checked={localContent.enabled}
                  onCheckedChange={(checked) => handleChange("enabled", checked)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Ativar/desativar todas as notificações
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTime">Mostrar Tempo</Label>
                <Switch
                  id="showTime"
                  checked={localContent.showTime}
                  onCheckedChange={(checked) => handleChange("showTime", checked)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Exibir indicador de tempo
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="notificationTitle">Título da Notificação</Label>
              <Input
                id="notificationTitle"
                value={localContent.notificationTitle}
                onChange={(e) => handleChange("notificationTitle", e.target.value)}
                disabled={!localContent.enabled}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notificationText">Texto da Notificação</Label>
              <Input
                id="notificationText"
                value={localContent.notificationText}
                onChange={(e) => handleChange("notificationText", e.target.value)}
                disabled={!localContent.enabled}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notificationCode">Código da Notificação</Label>
              <Input
                id="notificationCode"
                value={localContent.notificationCode}
                onChange={(e) => handleChange("notificationCode", e.target.value)}
                disabled={!localContent.enabled}
              />
            </div>
            
            {localContent.showTime && (
              <div className="space-y-1">
                <Label htmlFor="timeText">Texto do Tempo</Label>
                <Input
                  id="timeText"
                  value={localContent.timeText}
                  onChange={(e) => handleChange("timeText", e.target.value)}
                  disabled={!localContent.enabled}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="position">Posição das Notificações</Label>
              <Select
                value={localContent.position}
                onValueChange={(value) => handleChange("position", value)}
                disabled={!localContent.enabled}
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
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="displayDuration">Duração da Exibição (segundos)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="displayDuration"
                  value={[localContent.displayDuration || 5]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleChange("displayDuration", value[0])}
                  disabled={!localContent.enabled}
                />
                <span className="w-10 text-right">{localContent.displayDuration || 5}s</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="stackSize">Quantidade de Notificações</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="stackSize"
                  value={[localContent.stackSize || 3]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => handleChange("stackSize", value[0])}
                  disabled={!localContent.enabled}
                />
                <span className="w-10 text-right">{localContent.stackSize || 3}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="estilo" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="backgroundColor">Cor de Fundo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={localContent.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="w-10 h-10 p-1"
                  disabled={!localContent.enabled}
                />
                <Input
                  value={localContent.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="flex-1"
                  disabled={!localContent.enabled}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="textColor">Cor do Texto</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="textColor"
                  type="color"
                  value={localContent.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="w-10 h-10 p-1"
                  disabled={!localContent.enabled}
                />
                <Input
                  value={localContent.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="flex-1"
                  disabled={!localContent.enabled}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={localContent.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-10 h-10 p-1"
                  disabled={!localContent.enabled}
                />
                <Input
                  value={localContent.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="flex-1"
                  disabled={!localContent.enabled}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="som" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="soundEnabled">Ativar Som</Label>
                <Switch
                  id="soundEnabled"
                  checked={localContent.soundEnabled}
                  onCheckedChange={(checked) => handleChange("soundEnabled", checked)}
                  disabled={!localContent.enabled}
                />
              </div>
              <p className="text-xs text-gray-500">
                Reproduzir som ao mostrar notificação
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="soundType">Tipo de Som</Label>
              <Select
                value={localContent.soundType}
                onValueChange={(value) => handleChange("soundType", value)}
                disabled={!localContent.enabled || !localContent.soundEnabled}
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
              disabled={!localContent.enabled || !localContent.soundEnabled}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Testar Som
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-4" />
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          showTestNotification();
          if (localContent.soundEnabled) playSound();
        }}
        disabled={!localContent.enabled}
      >
        Testar Notificação
      </Button>
    </div>
  );
};

export default NotificationConfig; 