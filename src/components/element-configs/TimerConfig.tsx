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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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

  // Section para configurações específicas do estilo Oferta (Amarelo)
  const renderOfferYellowSection = () => (
    <>
      <div className="mb-4">
        <Label htmlFor="offerTitle">
          Título da oferta
        </Label>
        <Input
          id="offerTitle"
          value={localContent.offerTitle || "Special Offer 30% OFF"}
          onChange={(e) => handleContentChange({ offerTitle: e.target.value })}
          placeholder="Título da oferta"
        />
      </div>

      {/* Configuração do código de cupom */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <Label htmlFor="couponCode">
            Código de cupom (opcional)
          </Label>
          <Input
            id="couponCode"
            value={localContent.couponCode || ""}
            onChange={(e) => handleContentChange({ couponCode: e.target.value })}
            placeholder="Ex: USE10OFF"
          />
        </div>
        <div>
          <Label htmlFor="couponPrefix">
            Texto antes do cupom
          </Label>
          <Input
            id="couponPrefix"
            value={localContent.couponPrefix || "Your coupon:"}
            onChange={(e) => handleContentChange({ couponPrefix: e.target.value })}
            placeholder="Ex: Seu cupom:"
          />
        </div>
      </div>
    </>
  );

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
                <SelectTrigger>
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
            {displayStyle === "offer-yellow" && renderOfferYellowSection()}

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
                          type="color"
                          value={localContent.expiredMessageColor || "#ff0000"}
                          onChange={(e) => handleContentChange({ expiredMessageColor: e.target.value })}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          id="expiredMessageColor"
                          value={localContent.expiredMessageColor || "#ff0000"}
                          onChange={(e) => handleContentChange({ expiredMessageColor: e.target.value })}
                          className="w-24"
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
                  <SelectTrigger>
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

            <div className="space-y-2">
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
              
              {localContent.showControls && (
                <div className="p-3 bg-gray-50 rounded-md space-y-4 mt-2">
                  <h4 className="font-medium">Personalizar controles</h4>
                  
                  {/* Textos dos botões */}
                  <div className="space-y-2">
                    <Label>Textos dos botões</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="start-button-text" className="text-xs">Botão iniciar</Label>
                        <Input
                          id="start-button-text"
                          value={localContent.startButtonText || "Iniciar"}
                          onChange={(e) => handleContentChange({ startButtonText: e.target.value })}
                          placeholder="Iniciar"
                        />
                      </div>
                      <div>
                        <Label htmlFor="restart-button-text" className="text-xs">Botão reiniciar</Label>
                        <Input
                          id="restart-button-text"
                          value={localContent.restartButtonText || "Reiniciar"}
                          onChange={(e) => handleContentChange({ restartButtonText: e.target.value })}
                          placeholder="Reiniciar"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pause-button-text" className="text-xs">Botão pausar</Label>
                        <Input
                          id="pause-button-text"
                          value={localContent.pauseButtonText || "Pausar"}
                          onChange={(e) => handleContentChange({ pauseButtonText: e.target.value })}
                          placeholder="Pausar"
                        />
                      </div>
                      <div>
                        <Label htmlFor="resume-button-text" className="text-xs">Botão continuar</Label>
                        <Input
                          id="resume-button-text"
                          value={localContent.resumeButtonText || "Continuar"}
                          onChange={(e) => handleContentChange({ resumeButtonText: e.target.value })}
                          placeholder="Continuar"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="reset-button-text" className="text-xs">Botão resetar</Label>
                        <Input
                          id="reset-button-text"
                          value={localContent.resetButtonText || "Resetar"}
                          onChange={(e) => handleContentChange({ resetButtonText: e.target.value })}
                          placeholder="Resetar"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Cores dos botões */}
                  <div className="space-y-2">
                    <Label>Cores dos botões</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="start-button-color" className="text-xs">Cor do botão Iniciar/Reiniciar</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={localContent.startButtonColor || "#2563eb"}
                            onChange={(e) => handleContentChange({ startButtonColor: e.target.value })}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            id="start-button-color"
                            value={localContent.startButtonColor || "#2563eb"}
                            onChange={(e) => handleContentChange({ startButtonColor: e.target.value })}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="pause-button-color" className="text-xs">Cor do botão Pausar</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={localContent.pauseButtonColor || "#eab308"}
                            onChange={(e) => handleContentChange({ pauseButtonColor: e.target.value })}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            id="pause-button-color"
                            value={localContent.pauseButtonColor || "#eab308"}
                            onChange={(e) => handleContentChange({ pauseButtonColor: e.target.value })}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="resume-button-color" className="text-xs">Cor do botão Continuar</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={localContent.resumeButtonColor || "#22c55e"}
                            onChange={(e) => handleContentChange({ resumeButtonColor: e.target.value })}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            id="resume-button-color"
                            value={localContent.resumeButtonColor || "#22c55e"}
                            onChange={(e) => handleContentChange({ resumeButtonColor: e.target.value })}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reset-button-color" className="text-xs">Cor do botão Resetar</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={localContent.resetButtonColor || "#6b7280"}
                            onChange={(e) => handleContentChange({ resetButtonColor: e.target.value })}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            id="reset-button-color"
                            value={localContent.resetButtonColor || "#6b7280"}
                            onChange={(e) => handleContentChange({ resetButtonColor: e.target.value })}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="button-text-color" className="text-xs">Cor do texto dos botões</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={localContent.buttonTextColor || "#ffffff"}
                            onChange={(e) => handleContentChange({ buttonTextColor: e.target.value })}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            id="button-text-color"
                            value={localContent.buttonTextColor || "#ffffff"}
                            onChange={(e) => handleContentChange({ buttonTextColor: e.target.value })}
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Configurações avançadas */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-settings">
                <AccordionTrigger>
                  Configurações avançadas
                </AccordionTrigger>
                <AccordionContent>
                  {/* Configurações de controles */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="showControls">
                        Mostrar controles
                      </Label>
                      <Switch
                        id="showControls"
                        checked={localContent.showControls}
                        onCheckedChange={(checked) => handleContentChange({ showControls: checked })}
                      />
                    </div>
                    
                    {localContent.showControls && (
                      <div className="mt-2 border-l-2 border-gray-200 pl-4 space-y-3">
                        <h4 className="text-sm font-medium mb-2">Texto dos botões</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="startButtonText">
                              Botão iniciar
                            </Label>
                            <Input
                              id="startButtonText"
                              value={localContent.startButtonText || "Iniciar"}
                              onChange={(e) => handleContentChange({ startButtonText: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="restartButtonText">
                              Botão reiniciar
                            </Label>
                            <Input
                              id="restartButtonText"
                              value={localContent.restartButtonText || "Reiniciar"}
                              onChange={(e) => handleContentChange({ restartButtonText: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pauseButtonText">
                              Botão pausar
                            </Label>
                            <Input
                              id="pauseButtonText"
                              value={localContent.pauseButtonText || "Pausar"}
                              onChange={(e) => handleContentChange({ pauseButtonText: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="resumeButtonText">
                              Botão continuar
                            </Label>
                            <Input
                              id="resumeButtonText"
                              value={localContent.resumeButtonText || "Continuar"}
                              onChange={(e) => handleContentChange({ resumeButtonText: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="resetButtonText">
                              Botão resetar
                            </Label>
                            <Input
                              id="resetButtonText"
                              value={localContent.resetButtonText || "Resetar"}
                              onChange={(e) => handleContentChange({ resetButtonText: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-medium mb-2 mt-4">Cores dos botões</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="startButtonColor">
                              Cor do botão iniciar
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                value={localContent.startButtonColor || "#2563eb"}
                                onChange={(e) => handleContentChange({ startButtonColor: e.target.value })}
                                className="w-12 h-8 p-1"
                              />
                              <Input
                                id="startButtonColor"
                                value={localContent.startButtonColor || "#2563eb"}
                                onChange={(e) => handleContentChange({ startButtonColor: e.target.value })}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="pauseButtonColor">
                              Cor do botão pausar
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                value={localContent.pauseButtonColor || "#eab308"}
                                onChange={(e) => handleContentChange({ pauseButtonColor: e.target.value })}
                                className="w-12 h-8 p-1"
                              />
                              <Input
                                id="pauseButtonColor"
                                value={localContent.pauseButtonColor || "#eab308"}
                                onChange={(e) => handleContentChange({ pauseButtonColor: e.target.value })}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="resumeButtonColor">
                              Cor do botão continuar
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                value={localContent.resumeButtonColor || "#22c55e"}
                                onChange={(e) => handleContentChange({ resumeButtonColor: e.target.value })}
                                className="w-12 h-8 p-1"
                              />
                              <Input
                                id="resumeButtonColor"
                                value={localContent.resumeButtonColor || "#22c55e"}
                                onChange={(e) => handleContentChange({ resumeButtonColor: e.target.value })}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="resetButtonColor">
                              Cor do botão resetar
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                value={localContent.resetButtonColor || "#6b7280"}
                                onChange={(e) => handleContentChange({ resetButtonColor: e.target.value })}
                                className="w-12 h-8 p-1"
                              />
                              <Input
                                id="resetButtonColor"
                                value={localContent.resetButtonColor || "#6b7280"}
                                onChange={(e) => handleContentChange({ resetButtonColor: e.target.value })}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="buttonTextColor">
                              Cor do texto dos botões
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                value={localContent.buttonTextColor || "#ffffff"}
                                onChange={(e) => handleContentChange({ buttonTextColor: e.target.value })}
                                className="w-12 h-8 p-1"
                              />
                              <Input
                                id="buttonTextColor"
                                value={localContent.buttonTextColor || "#ffffff"}
                                onChange={(e) => handleContentChange({ buttonTextColor: e.target.value })}
                                className="w-24"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Configurações de mensagem expirada */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="showExpiredMessage">
                        Mostrar mensagem de tempo esgotado
                      </Label>
                      <Switch
                        id="showExpiredMessage"
                        checked={localContent.showExpiredMessage !== false}
                        onCheckedChange={(checked) => handleContentChange({ showExpiredMessage: checked })}
                      />
                    </div>
                    
                    {localContent.showExpiredMessage !== false && (
                      <div className="mt-2 border-l-2 border-gray-200 pl-4 space-y-3">
                        <div>
                          <Label htmlFor="timerExpiredMessage">
                            Mensagem de tempo esgotado
                          </Label>
                          <Input
                            id="timerExpiredMessage"
                            value={localContent.timerExpiredMessage || "Tempo esgotado!"}
                            onChange={(e) => handleContentChange({ timerExpiredMessage: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiredMessageColor">
                            Cor da mensagem
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="color"
                              value={localContent.expiredMessageColor || "#ff0000"}
                              onChange={(e) => handleContentChange({ expiredMessageColor: e.target.value })}
                              className="w-12 h-8 p-1"
                            />
                            <Input
                              id="expiredMessageColor"
                              value={localContent.expiredMessageColor || "#ff0000"}
                              onChange={(e) => handleContentChange({ expiredMessageColor: e.target.value })}
                              className="w-24"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expiredMessageSize">
                            Tamanho da mensagem
                          </Label>
                          <Select
                            value={localContent.expiredMessageSize || "large"}
                            onValueChange={(value) => handleContentChange({ expiredMessageSize: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tamanho da mensagem" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Pequeno</SelectItem>
                              <SelectItem value="medium">Médio</SelectItem>
                              <SelectItem value="large">Grande</SelectItem>
                              <SelectItem value="xlarge">Extra grande</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimerConfig; 