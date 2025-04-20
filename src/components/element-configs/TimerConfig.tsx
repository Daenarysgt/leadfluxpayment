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

  const displayStyle = localContent.displayStyle || "modern-blue";

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
                value={displayStyle}
                onValueChange={(value) => handleContentChange({ displayStyle: value })}
              >
                <SelectTrigger id="display-style">
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern-blue">Moderno Azul</SelectItem>
                  <SelectItem value="offer-yellow">Oferta (Amarelo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Configurações específicas para o estilo Moderno Azul */}
            {displayStyle === "modern-blue" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="offer-text">Texto da oferta</Label>
                  <Input
                    id="offer-text"
                    value={localContent.offerText || "Limited-time offer! Sale ends in"}
                    onChange={(e) => handleContentChange({ offerText: e.target.value })}
                    placeholder="Texto para mostrar acima do timer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offer-emoji">Emoji (opcional)</Label>
                  <Input
                    id="offer-emoji"
                    value={localContent.offerEmoji || "⚡"}
                    onChange={(e) => handleContentChange({ offerEmoji: e.target.value })}
                    placeholder="Emoji para exibir ao lado do texto (ex: ⚡, 🔥)"
                  />
                </div>
              </>
            )}

            {/* Configurações específicas para o estilo Oferta (Amarelo) */}
            {displayStyle === "offer-yellow" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="offer-title">Título da oferta</Label>
                  <Input
                    id="offer-title"
                    value={localContent.offerTitle || "Special Offer 30% OFF"}
                    onChange={(e) => handleContentChange({ offerTitle: e.target.value })}
                    placeholder="Título para mostrar no topo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon-code">Código de cupom (opcional)</Label>
                  <Input
                    id="coupon-code"
                    value={localContent.couponCode || ""}
                    onChange={(e) => handleContentChange({ couponCode: e.target.value })}
                    placeholder="Código de cupom para mostrar (ex: #SALE30)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offer-emoji">Emoji (opcional)</Label>
                  <Input
                    id="offer-emoji"
                    value={localContent.offerEmoji || "⚡"}
                    onChange={(e) => handleContentChange({ offerEmoji: e.target.value })}
                    placeholder="Emoji para exibir ao lado do texto (ex: ⚡, 🔥)"
                  />
                </div>
              </>
            )}

            {/* Controle de visibilidade das unidades de tempo - comum para ambos estilos */}
            <div className="p-3 bg-gray-50 rounded-md space-y-4">
              <h4 className="font-medium">Unidades de tempo</h4>
              
              <div className="space-y-2">
                <Label htmlFor="show-days">Mostrar dias</Label>
                <Switch
                  id="show-days"
                  checked={localContent.showDays !== false}
                  onCheckedChange={(checked) =>
                    handleContentChange({ showDays: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="show-hours">Mostrar horas</Label>
                <Switch
                  id="show-hours"
                  checked={localContent.showHours !== false}
                  onCheckedChange={(checked) =>
                    handleContentChange({ showHours: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Personalizar textos das unidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="days-text" className="text-xs">Texto dos dias</Label>
                    <Input
                      id="days-text"
                      value={localContent.daysText || "Days"}
                      onChange={(e) => handleContentChange({ daysText: e.target.value })}
                      placeholder="Days"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours-text" className="text-xs">Texto das horas</Label>
                    <Input
                      id="hours-text"
                      value={localContent.hoursText || "Hours"}
                      onChange={(e) => handleContentChange({ hoursText: e.target.value })}
                      placeholder="Hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minutes-text" className="text-xs">Texto dos minutos</Label>
                    <Input
                      id="minutes-text"
                      value={localContent.minutesText || "Minutes"}
                      onChange={(e) => handleContentChange({ minutesText: e.target.value })}
                      placeholder="Minutes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seconds-text" className="text-xs">Texto dos segundos</Label>
                    <Input
                      id="seconds-text"
                      value={localContent.secondsText || "Seconds"}
                      onChange={(e) => handleContentChange({ secondsText: e.target.value })}
                      placeholder="Seconds"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações comuns para título e descrição */}
            <div className="p-3 bg-gray-50 rounded-md space-y-4">
              <h4 className="font-medium">Título e descrição</h4>
              
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
            </div>

            {/* Configurações de tempo */}
            <div className="p-3 bg-gray-50 rounded-md space-y-4">
              <h4 className="font-medium">Configurações de tempo</h4>
              
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-expired-message">Mostrar mensagem de tempo esgotado</Label>
                  <Switch
                    id="show-expired-message"
                    checked={localContent.showExpiredMessage !== false}
                    onCheckedChange={(checked) =>
                      handleContentChange({ showExpiredMessage: checked })
                    }
                  />
                </div>
                
                {localContent.showExpiredMessage !== false && (
                  <>
                    <Input
                      id="timer-expired-message"
                      value={localContent.timerExpiredMessage || "Tempo esgotado!"}
                      onChange={(e) => handleContentChange({ timerExpiredMessage: e.target.value })}
                      placeholder="Mensagem quando o timer chegar a zero"
                    />
                    
                    <div className="mt-2">
                      <Label htmlFor="expired-message-color">Cor da mensagem de tempo esgotado</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="expired-message-color"
                          type="color"
                          value={localContent.expiredMessageColor || "#ff0000"}
                          onChange={(e) => handleContentChange({ expiredMessageColor: e.target.value })}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={localContent.expiredMessageColor || "#ff0000"}
                          onChange={(e) => handleContentChange({ expiredMessageColor: e.target.value })}
                          placeholder="#ff0000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <Label htmlFor="expired-message-size">Tamanho da fonte</Label>
                      <Select
                        value={localContent.expiredMessageSize || "large"}
                        onValueChange={(value) => handleContentChange({ expiredMessageSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequena</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                          <SelectItem value="xlarge">Extra Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
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
            </div>
          </div>
        </TabsContent>

        {/* Aba de estilo */}
        <TabsContent value="style" className="space-y-4 px-1">
          <div className="space-y-4">
            {/* Cores específicas para o estilo selecionado */}
            {displayStyle === "modern-blue" ? (
              <div className="p-3 bg-gray-50 rounded-md space-y-4">
                <h4 className="font-medium">Cores do estilo Moderno Azul</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="modern-blue-bg-color">Cor de fundo dos dígitos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="modern-blue-bg-color"
                      type="color"
                      value={localContent.modernBlueColor || "#3b82f6"}
                      onChange={(e) => handleContentChange({ modernBlueColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.modernBlueColor || "#3b82f6"}
                      onChange={(e) => handleContentChange({ modernBlueColor: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modern-blue-text-color">Cor do texto dos dígitos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="modern-blue-text-color"
                      type="color"
                      value={localContent.modernBlueTextColor || "#ffffff"}
                      onChange={(e) => handleContentChange({ modernBlueTextColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.modernBlueTextColor || "#ffffff"}
                      onChange={(e) => handleContentChange({ modernBlueTextColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modern-blue-label-color">Cor dos rótulos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="modern-blue-label-color"
                      type="color"
                      value={localContent.modernBlueLabelColor || "#6b7280"}
                      onChange={(e) => handleContentChange({ modernBlueLabelColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.modernBlueLabelColor || "#6b7280"}
                      onChange={(e) => handleContentChange({ modernBlueLabelColor: e.target.value })}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md space-y-4">
                <h4 className="font-medium">Cores do estilo Oferta (Amarelo)</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="offer-bg-color">Cor de fundo principal</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="offer-bg-color"
                      type="color"
                      value={localContent.offerBgColor || "#000000"}
                      onChange={(e) => handleContentChange({ offerBgColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.offerBgColor || "#000000"}
                      onChange={(e) => handleContentChange({ offerBgColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-text-color">Cor do texto principal</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="offer-text-color"
                      type="color"
                      value={localContent.offerTextColor || "#ffffff"}
                      onChange={(e) => handleContentChange({ offerTextColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.offerTextColor || "#ffffff"}
                      onChange={(e) => handleContentChange({ offerTextColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-yellow-color">Cor dos dígitos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="offer-yellow-color"
                      type="color"
                      value={localContent.offerYellowColor || "#eab308"}
                      onChange={(e) => handleContentChange({ offerYellowColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.offerYellowColor || "#eab308"}
                      onChange={(e) => handleContentChange({ offerYellowColor: e.target.value })}
                      placeholder="#eab308"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-digit-text-color">Cor do texto dos dígitos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="offer-digit-text-color"
                      type="color"
                      value={localContent.offerDigitTextColor || "#000000"}
                      onChange={(e) => handleContentChange({ offerDigitTextColor: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={localContent.offerDigitTextColor || "#000000"}
                      onChange={(e) => handleContentChange({ offerDigitTextColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
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