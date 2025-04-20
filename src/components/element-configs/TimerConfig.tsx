import React, { useState, useEffect, useRef } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lista de fontes disponíveis
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Poppins", label: "Poppins" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" }
];

// Estilos de timer
const TIMER_STYLES = [
  { value: "blocks", label: "Blocos" },
  { value: "digital", label: "Digital" },
  { value: "minimal", label: "Minimalista" }
];

// Posições dos rótulos
const LABEL_POSITIONS = [
  { value: "bottom", label: "Abaixo" },
  { value: "top", label: "Acima" }
];

interface TimerConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const TimerConfig = ({ element, onUpdate }: TimerConfigProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("conteudo");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para controlar as propriedades do timer
  const [title, setTitle] = useState(element.content?.title || "Oferta por tempo limitado");
  const [timeHours, setTimeHours] = useState(Math.floor((element.content?.timeInSeconds || 3600) / 3600));
  const [timeMinutes, setTimeMinutes] = useState(Math.floor(((element.content?.timeInSeconds || 3600) % 3600) / 60));
  const [timeSeconds, setTimeSeconds] = useState(Math.floor((element.content?.timeInSeconds || 3600) % 60));
  const [showDays, setShowDays] = useState(element.content?.showDays !== false);
  const [showHours, setShowHours] = useState(element.content?.showHours !== false);
  const [showMinutes, setShowMinutes] = useState(element.content?.showMinutes !== false);
  const [showSeconds, setShowSeconds] = useState(element.content?.showSeconds !== false);
  const [expireText, setExpireText] = useState(element.content?.expireText || "Oferta expirada!");
  const [fontSize, setFontSize] = useState(element.content?.fontSize || 24);
  const [fontColor, setFontColor] = useState(element.content?.fontColor || "#000000");
  const [backgroundColor, setBackgroundColor] = useState(element.content?.backgroundColor || "#F5F5F5");
  const [accentColor, setAccentColor] = useState(element.content?.accentColor || "#FF4136");
  const [labelColor, setLabelColor] = useState(element.content?.labelColor || "#666666");
  const [fontFamily, setFontFamily] = useState(element.content?.fontFamily || "Inter");
  const [style, setStyle] = useState(element.content?.style || "blocks");
  const [alignment, setAlignment] = useState(element.content?.alignment || "center");
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
  const [marginBottom, setMarginBottom] = useState(element.content?.marginBottom || 0);
  const [borderRadius, setBorderRadius] = useState(element.content?.borderRadius || 8);
  const [showBorder, setShowBorder] = useState(element.content?.showBorder !== false);
  const [borderColor, setBorderColor] = useState(element.content?.borderColor || "#E2E8F0");
  const [showLabels, setShowLabels] = useState(element.content?.showLabels !== false);
  const [labelPosition, setLabelPosition] = useState(element.content?.labelPosition || "bottom");
  const [showIcon, setShowIcon] = useState(element.content?.showIcon !== false);

  // Função para atualizar o tempo
  const updateTimer = () => {
    // Calcular o tempo total em segundos
    const totalSeconds = timeHours * 3600 + timeMinutes * 60 + timeSeconds;
    
    console.log(`TimerConfig: Atualizando timer para ${timeHours}h:${timeMinutes}m:${timeSeconds}s (${totalSeconds}s total)`);
    
    // Atualizar o elemento com o novo tempo
    handleUpdateTimer({ 
      timeInSeconds: totalSeconds
    });
  };

  // Efeito para atualizar o tempo ao mudar horas, minutos ou segundos
  useEffect(() => {
    // Limpar qualquer timeout existente
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Aplicar a atualização após um curto delay para evitar atualizações em excesso
    updateTimeoutRef.current = setTimeout(() => {
      updateTimer();
    }, 300);
    
    // Limpar o timeout ao desmontar
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [timeHours, timeMinutes, timeSeconds]);

  // Função para validar entradas numéricas
  const validateNumberInput = (value: string, min: number, max: number, setter: (value: number) => void) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      setter(numValue);
    }
  };

  // Função para atualizar o elemento
  const handleUpdateTimer = (updates: Record<string, any>) => {
    const updatedContent = {
      ...element.content,
      title,
      showDays,
      showHours,
      showMinutes,
      showSeconds,
      expireText,
      fontSize,
      fontColor,
      backgroundColor,
      accentColor,
      labelColor,
      fontFamily,
      style,
      alignment,
      marginTop,
      marginBottom,
      borderRadius,
      showBorder,
      borderColor,
      showLabels,
      labelPosition,
      showIcon,
      ...updates
    };

    onUpdate({
      content: updatedContent
    });
  };

  // Resetar o timer para o valor padrão
  const handleResetTimer = () => {
    setTimeHours(1);
    setTimeMinutes(0);
    setTimeSeconds(0);
    
    // Atualizar explicitamente o timeInSeconds para 3600 (1 hora)
    // Usando timeout para garantir que os estados sejam atualizados primeiro
    setTimeout(() => {
      handleUpdateTimer({ 
        timeInSeconds: 3600
      });
      
      toast({
        title: "Timer resetado",
        description: "O timer foi resetado para 1 hora",
        variant: "default"
      });
    }, 50);
  };

  return (
    <div className="px-1 py-2">
      <Tabs defaultValue="conteudo" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="conteudo" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="estilo" className="flex-1">Estilo</TabsTrigger>
          <TabsTrigger value="avancado" className="flex-1">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="conteudo" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                placeholder="Título do timer"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleUpdateTimer({ title: e.target.value });
                }}
              />
            </div>

            <div>
              <Label>Tempo (HH:MM:SS)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={timeHours}
                  onChange={(e) => validateNumberInput(e.target.value, 0, 99, setTimeHours)}
                  className="w-20"
                />
                <span className="flex items-center">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={timeMinutes}
                  onChange={(e) => validateNumberInput(e.target.value, 0, 59, setTimeMinutes)}
                  className="w-20"
                />
                <span className="flex items-center">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={timeSeconds}
                  onChange={(e) => validateNumberInput(e.target.value, 0, 59, setTimeSeconds)}
                  className="w-20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleResetTimer}
                  className="ml-1"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>

            <div>
              <Label>Mostrar unidades</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={showDays}
                    onCheckedChange={(checked) => {
                      setShowDays(checked);
                      handleUpdateTimer({ showDays: checked });
                    }}
                  />
                  <Label>Dias</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={showHours}
                    onCheckedChange={(checked) => {
                      setShowHours(checked);
                      handleUpdateTimer({ showHours: checked });
                    }}
                  />
                  <Label>Horas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={showMinutes}
                    onCheckedChange={(checked) => {
                      setShowMinutes(checked);
                      handleUpdateTimer({ showMinutes: checked });
                    }}
                  />
                  <Label>Minutos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={showSeconds}
                    onCheckedChange={(checked) => {
                      setShowSeconds(checked);
                      handleUpdateTimer({ showSeconds: checked });
                    }}
                  />
                  <Label>Segundos</Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Texto de expiração</Label>
              <Input
                placeholder="Texto quando o timer expirar"
                value={expireText}
                onChange={(e) => {
                  setExpireText(e.target.value);
                  handleUpdateTimer({ expireText: e.target.value });
                }}
              />
            </div>

            <div>
              <Label>Estilo do timer</Label>
              <Select
                value={style}
                onValueChange={(value) => {
                  setStyle(value);
                  handleUpdateTimer({ style: value });
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  {TIMER_STYLES.map((styleOption) => (
                    <SelectItem key={styleOption.value} value={styleOption.value}>
                      {styleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="estilo" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Tamanho da fonte</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Slider
                  value={[fontSize]}
                  min={12}
                  max={48}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    setFontSize(value[0]);
                    handleUpdateTimer({ fontSize: value[0] });
                  }}
                />
                <div className="w-12 text-center">
                  {fontSize}px
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cor do texto</Label>
                <div className="flex mt-1.5">
                  <Input
                    type="color"
                    value={fontColor}
                    onChange={(e) => {
                      setFontColor(e.target.value);
                      handleUpdateTimer({ fontColor: e.target.value });
                    }}
                    className="w-12 p-1 h-8"
                  />
                  <Input
                    value={fontColor}
                    onChange={(e) => {
                      setFontColor(e.target.value);
                      handleUpdateTimer({ fontColor: e.target.value });
                    }}
                    className="flex-1 ml-2"
                  />
                </div>
              </div>

              <div>
                <Label>Cor de destaque</Label>
                <div className="flex mt-1.5">
                  <Input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      handleUpdateTimer({ accentColor: e.target.value });
                    }}
                    className="w-12 p-1 h-8"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      handleUpdateTimer({ accentColor: e.target.value });
                    }}
                    className="flex-1 ml-2"
                  />
                </div>
              </div>

              <div>
                <Label>Cor do fundo</Label>
                <div className="flex mt-1.5">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      handleUpdateTimer({ backgroundColor: e.target.value });
                    }}
                    className="w-12 p-1 h-8"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      handleUpdateTimer({ backgroundColor: e.target.value });
                    }}
                    className="flex-1 ml-2"
                  />
                </div>
              </div>

              <div>
                <Label>Cor dos rótulos</Label>
                <div className="flex mt-1.5">
                  <Input
                    type="color"
                    value={labelColor}
                    onChange={(e) => {
                      setLabelColor(e.target.value);
                      handleUpdateTimer({ labelColor: e.target.value });
                    }}
                    className="w-12 p-1 h-8"
                  />
                  <Input
                    value={labelColor}
                    onChange={(e) => {
                      setLabelColor(e.target.value);
                      handleUpdateTimer({ labelColor: e.target.value });
                    }}
                    className="flex-1 ml-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Família da fonte</Label>
              <Select
                value={fontFamily}
                onValueChange={(value) => {
                  setFontFamily(value);
                  handleUpdateTimer({ fontFamily: value });
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione a fonte" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alinhamento</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Button
                  type="button"
                  variant={alignment === "left" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAlignment("left");
                    handleUpdateTimer({ alignment: "left" });
                  }}
                >
                  <AlignLeft size={16} />
                </Button>
                <Button
                  type="button"
                  variant={alignment === "center" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAlignment("center");
                    handleUpdateTimer({ alignment: "center" });
                  }}
                >
                  <AlignCenter size={16} />
                </Button>
                <Button
                  type="button"
                  variant={alignment === "right" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAlignment("right");
                    handleUpdateTimer({ alignment: "right" });
                  }}
                >
                  <AlignRight size={16} />
                </Button>
              </div>
            </div>

            <div>
              <Label>Raio da borda</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Slider
                  value={[borderRadius]}
                  min={0}
                  max={20}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    setBorderRadius(value[0]);
                    handleUpdateTimer({ borderRadius: value[0] });
                  }}
                />
                <div className="w-12 text-center">
                  {borderRadius}px
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="avancado" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Margem superior</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Slider
                  value={[marginTop]}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    setMarginTop(value[0]);
                    handleUpdateTimer({ marginTop: value[0] });
                  }}
                />
                <div className="w-12 text-center">
                  {marginTop}px
                </div>
              </div>
            </div>

            <div>
              <Label>Margem inferior</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Slider
                  value={[marginBottom]}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    setMarginBottom(value[0]);
                    handleUpdateTimer({ marginBottom: value[0] });
                  }}
                />
                <div className="w-12 text-center">
                  {marginBottom}px
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showBorder}
                  onCheckedChange={(checked) => {
                    setShowBorder(checked);
                    handleUpdateTimer({ showBorder: checked });
                  }}
                />
                <Label>Mostrar borda</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showLabels}
                  onCheckedChange={(checked) => {
                    setShowLabels(checked);
                    handleUpdateTimer({ showLabels: checked });
                  }}
                />
                <Label>Mostrar rótulos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showIcon}
                  onCheckedChange={(checked) => {
                    setShowIcon(checked);
                    handleUpdateTimer({ showIcon: checked });
                  }}
                />
                <Label>Mostrar ícone</Label>
              </div>
            </div>

            {showBorder && (
              <div>
                <Label>Cor da borda</Label>
                <div className="flex mt-1.5">
                  <Input
                    type="color"
                    value={borderColor}
                    onChange={(e) => {
                      setBorderColor(e.target.value);
                      handleUpdateTimer({ borderColor: e.target.value });
                    }}
                    className="w-12 p-1 h-8"
                  />
                  <Input
                    value={borderColor}
                    onChange={(e) => {
                      setBorderColor(e.target.value);
                      handleUpdateTimer({ borderColor: e.target.value });
                    }}
                    className="flex-1 ml-2"
                  />
                </div>
              </div>
            )}

            {showLabels && (
              <div>
                <Label>Posição dos rótulos</Label>
                <Select
                  value={labelPosition}
                  onValueChange={(value) => {
                    setLabelPosition(value);
                    handleUpdateTimer({ labelPosition: value });
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    {LABEL_POSITIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimerConfig; 