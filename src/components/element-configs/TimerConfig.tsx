import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CanvasElement } from "@/types/canvasTypes";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Interface para os props do componente
interface TimerConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

// Componente de configuração para o Timer
const TimerConfig = ({ element, onUpdate }: TimerConfigProps) => {
  const [localContent, setLocalContent] = useState(element.content);

  useEffect(() => {
    setLocalContent(element.content);
  }, [element.content]);

  const handleContentChange = (changes: Record<string, any>) => {
    const updatedContent = {
      ...localContent,
      ...changes,
    };
    setLocalContent(updatedContent);
    onUpdate({ content: updatedContent });
  };

  const handleStyleChange = (changes: Record<string, any>) => {
    const updatedStyle = {
      ...localContent.style,
      ...changes,
    };
    handleContentChange({ style: updatedStyle });
  };

  return (
    <div className="space-y-6 pt-2 pb-16">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="content" className="flex-1">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1">
            Estilo
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Aba de conteúdo */}
        <TabsContent value="content" className="space-y-4 px-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-style">Estilo de visualização</Label>
              <Select
                value={localContent.displayStyle || "default"}
                onValueChange={(value) => handleContentChange({ displayStyle: value })}
              >
                <SelectTrigger id="display-style">
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="modern-blue">Moderno Azul</SelectItem>
                  <SelectItem value="offer-yellow">Oferta (Amarelo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(localContent.displayStyle === "modern-blue" || localContent.displayStyle === "offer-yellow") && (
              <div className="space-y-2">
                <Label htmlFor="offer-text">Texto da oferta</Label>
                <Input
                  id="offer-text"
                  value={localContent.offerText || "Limited-time offer! Sale ends in"}
                  onChange={(e) => handleContentChange({ offerText: e.target.value })}
                  placeholder="Texto para mostrar acima do timer"
                />
              </div>
            )}

            {(localContent.displayStyle === "modern-blue" || localContent.displayStyle === "offer-yellow") && (
              <div className="space-y-2">
                <Label htmlFor="offer-emoji">Emoji (opcional)</Label>
                <Input
                  id="offer-emoji"
                  value={localContent.offerEmoji || "⚡"}
                  onChange={(e) => handleContentChange({ offerEmoji: e.target.value })}
                  placeholder="Emoji para exibir ao lado do texto (ex: ⚡, 🔥)"
                />
              </div>
            )}

            {localContent.displayStyle === "offer-yellow" && (
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Código de cupom (opcional)</Label>
                <Input
                  id="coupon-code"
                  value={localContent.couponCode || ""}
                  onChange={(e) => handleContentChange({ couponCode: e.target.value })}
                  placeholder="Código de cupom para mostrar (ex: #SALE30)"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-title">Mostrar título</Label>
                <Switch
                  id="show-title"
                  checked={localContent.showTitle}
                  onCheckedChange={(checked) =>
                    handleContentChange({ showTitle: checked })
                  }
                />
              </div>
              
              {localContent.showTitle && (
                <Input
                  id="title"
                  value={localContent.title || ""}
                  onChange={(e) => handleContentChange({ title: e.target.value })}
                  placeholder="Título do timer"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-description">Mostrar descrição</Label>
                <Switch
                  id="show-description"
                  checked={localContent.showDescription}
                  onCheckedChange={(checked) =>
                    handleContentChange({ showDescription: checked })
                  }
                />
              </div>
              
              {localContent.showDescription && (
                <Textarea
                  id="description"
                  value={localContent.description || ""}
                  onChange={(e) => handleContentChange({ description: e.target.value })}
                  placeholder="Descrição do timer"
                  rows={3}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-time">Tempo inicial (segundos)</Label>
              <Input
                id="initial-time"
                type="number"
                min="1"
                value={localContent.initialTime || 60}
                onChange={(e) => handleContentChange({ initialTime: parseInt(e.target.value) || 60 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-format">Formato do timer</Label>
              <Select
                value={localContent.format || "mm:ss"}
                onValueChange={(value) => handleContentChange({ format: value })}
              >
                <SelectTrigger id="timer-format">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hh:mm:ss">Horas:Minutos:Segundos (hh:mm:ss)</SelectItem>
                  <SelectItem value="mm:ss">Minutos:Segundos (mm:ss)</SelectItem>
                  <SelectItem value="ss">Apenas segundos (ss)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-expired-message">Mensagem de tempo esgotado</Label>
              <Input
                id="timer-expired-message"
                value={localContent.timerExpiredMessage || "Tempo esgotado!"}
                onChange={(e) => handleContentChange({ timerExpiredMessage: e.target.value })}
                placeholder="Mensagem quando o timer chegar a zero"
              />
            </div>
          </div>
        </TabsContent>

        {/* Aba de estilo */}
        <TabsContent value="style" className="space-y-4 px-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-align">Alinhamento do título</Label>
              <Select
                value={localContent.style?.titleAlign || "center"}
                onValueChange={(value) => handleStyleChange({ titleAlign: value })}
              >
                <SelectTrigger id="title-align">
                  <SelectValue placeholder="Selecione o alinhamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-align">Alinhamento da descrição</Label>
              <Select
                value={localContent.style?.descriptionAlign || "center"}
                onValueChange={(value) => handleStyleChange({ descriptionAlign: value })}
              >
                <SelectTrigger id="description-align">
                  <SelectValue placeholder="Selecione o alinhamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-align">Alinhamento do timer</Label>
              <Select
                value={localContent.style?.timerAlign || "center"}
                onValueChange={(value) => handleStyleChange({ timerAlign: value })}
              >
                <SelectTrigger id="timer-align">
                  <SelectValue placeholder="Selecione o alinhamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-size">Tamanho do timer</Label>
              <Select
                value={localContent.style?.timerSize || "large"}
                onValueChange={(value) => handleStyleChange({ timerSize: value })}
              >
                <SelectTrigger id="timer-size">
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="xlarge">Extra Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer-color">Cor do timer</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="timer-color"
                  type="color"
                  value={localContent.style?.timerColor || "#4B5563"}
                  onChange={(e) => handleStyleChange({ timerColor: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={localContent.style?.timerColor || "#4B5563"}
                  onChange={(e) => handleStyleChange({ timerColor: e.target.value })}
                  placeholder="#4B5563"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background-color">Cor de fundo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="background-color"
                  type="color"
                  value={localContent.style?.backgroundColor || "#f3f4f6"}
                  onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={localContent.style?.backgroundColor || "#f3f4f6"}
                  onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                  placeholder="#f3f4f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="border-color">Cor da borda</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="border-color"
                  type="color"
                  value={localContent.style?.borderColor || "#e5e7eb"}
                  onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={localContent.style?.borderColor || "#e5e7eb"}
                  onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                  placeholder="#e5e7eb"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="border-radius">Raio da borda</Label>
              <Input
                id="border-radius"
                type="number"
                min="0"
                max="20"
                value={localContent.style?.borderRadius || 8}
                onChange={(e) => handleStyleChange({ borderRadius: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </TabsContent>

        {/* Aba de configurações */}
        <TabsContent value="settings" className="space-y-4 px-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-start">Iniciar automaticamente</Label>
              <Switch
                id="auto-start"
                checked={localContent.autoStart}
                onCheckedChange={(checked) =>
                  handleContentChange({ autoStart: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-controls">Mostrar controles</Label>
              <Switch
                id="show-controls"
                checked={localContent.showControls}
                onCheckedChange={(checked) =>
                  handleContentChange({ showControls: checked })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimerConfig; 