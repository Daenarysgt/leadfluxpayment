import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Video as VideoIcon, 
  Link as LinkIcon, 
  Code, 
  Play, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Volume2,
  VolumeX,
  RefreshCw,
  Square,
  CircleIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VideoConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const VideoConfig = ({ element, onUpdate }: VideoConfigProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(element.content?.videoType || "url");
  const [videoUrl, setVideoUrl] = useState(element.content?.videoUrl || "");
  const [embedCode, setEmbedCode] = useState(element.content?.embedCode || "");
  const [title, setTitle] = useState(element.content?.title || "");
  const [aspectRatio, setAspectRatio] = useState(element.content?.aspectRatio || "16:9");
  const [alignment, setAlignment] = useState(element.content?.alignment || "center");
  const [autoPlay, setAutoPlay] = useState(element.content?.autoPlay || false);
  const [muted, setMuted] = useState(element.content?.muted ?? true);
  const [controls, setControls] = useState(element.content?.controls !== false);
  const [loop, setLoop] = useState(element.content?.loop || false);
  
  // Novas propriedades
  const [borderRadius, setBorderRadius] = useState(element.content?.borderRadius || 0);
  const [borderWidth, setBorderWidth] = useState(element.content?.borderWidth || 0);
  const [borderColor, setBorderColor] = useState(element.content?.borderColor || "#000000");
  const [shadowEnabled, setShadowEnabled] = useState(element.content?.shadowEnabled || false);
  const [shadowColor, setShadowColor] = useState(element.content?.shadowColor || "rgba(0, 0, 0, 0.3)");
  const [shadowBlur, setShadowBlur] = useState(element.content?.shadowBlur || 10);
  const [shadowOffsetX, setShadowOffsetX] = useState(element.content?.shadowOffsetX || 0);
  const [shadowOffsetY, setShadowOffsetY] = useState(element.content?.shadowOffsetY || 5);

  // Monitorar mudanças na prop element.content e atualizar o estado local
  useEffect(() => {
    if (element.content) {
      setVideoUrl(element.content.videoUrl || "");
      setEmbedCode(element.content.embedCode || "");
      setTitle(element.content.title || "");
      setAspectRatio(element.content.aspectRatio || "16:9");
      setAlignment(element.content.alignment || "center");
      setAutoPlay(element.content.autoPlay || false);
      setMuted(element.content.muted ?? true);
      setControls(element.content.controls !== false);
      setLoop(element.content.loop || false);
      setActiveTab(element.content.videoType || "url");
      
      // Carregar novas propriedades
      setBorderRadius(element.content.borderRadius || 0);
      setBorderWidth(element.content.borderWidth || 0);
      setBorderColor(element.content.borderColor || "#000000");
      setShadowEnabled(element.content.shadowEnabled || false);
      setShadowColor(element.content.shadowColor || "rgba(0, 0, 0, 0.3)");
      setShadowBlur(element.content.shadowBlur || 10);
      setShadowOffsetX(element.content.shadowOffsetX || 0);
      setShadowOffsetY(element.content.shadowOffsetY || 5);
    }
  }, [element.content]);

  // Update the element content when the form changes
  const updateContent = (updates: any) => {
    onUpdate({
      content: {
        ...element.content,
        ...updates,
      }
    });
  };

  // Handle URL input change
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    updateContent({ 
      videoUrl: url,
      videoType: 'url'
    });
  };

  // Handle iframe code input change
  const handleEmbedCodeChange = (code: string) => {
    setEmbedCode(code);
    
    // Try to extract src URL from iframe if it exists
    const srcMatch = code.match(/src=["'](.*?)["']/);
    const videoUrl = srcMatch ? srcMatch[1] : '';
    
    updateContent({
      embedCode: code,
      videoUrl,
      videoType: 'iframe'
    });

    // Mostrar confirmação quando o código é atualizado
    if (code.trim()) {
      toast({
        title: "Código atualizado",
        description: "O código iframe foi aplicado ao vídeo",
      });
    }
  };

  // Handle JS embed code input
  const handleJsCodeChange = (code: string) => {
    setEmbedCode(code);
    updateContent({
      embedCode: code,
      videoType: 'js'
    });

    // Mostrar confirmação quando o código é atualizado
    if (code.trim()) {
      toast({
        title: "Código atualizado",
        description: "O código JavaScript foi aplicado ao vídeo",
      });
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateContent({ videoType: value });
  };

  // Handle title change
  const handleTitleChange = (value: string) => {
    setTitle(value);
    updateContent({ title: value });
  };

  // Handle alignment change
  const handleAlignmentChange = (value: string) => {
    if (value) {
      setAlignment(value);
      updateContent({ alignment: value });
    }
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    updateContent({ aspectRatio: value });
  };

  // Handle autoplay toggle
  const handleAutoPlayChange = (checked: boolean) => {
    setAutoPlay(checked);
    updateContent({ autoPlay: checked });
  };

  // Handle muted toggle - corrigido para garantir que o estado visual seja atualizado
  const handleMutedChange = (checked: boolean) => {
    // Atualize o estado local para refletir a mudança visual
    setMuted(checked);
    // Depois atualize o conteúdo do elemento
    updateContent({ muted: checked });
  };

  // Handle controls toggle
  const handleControlsChange = (checked: boolean) => {
    setControls(checked);
    updateContent({ controls: checked });
  };

  // Handle loop toggle
  const handleLoopChange = (checked: boolean) => {
    setLoop(checked);
    updateContent({ loop: checked });
  };

  // Handlers para as novas propriedades
  const handleBorderRadiusChange = (value: number[]) => {
    const radius = value[0];
    setBorderRadius(radius);
    updateContent({ borderRadius: radius });
  };

  const handleBorderWidthChange = (value: number[]) => {
    const width = value[0];
    setBorderWidth(width);
    updateContent({ borderWidth: width });
  };

  const handleBorderColorChange = (color: string) => {
    setBorderColor(color);
    updateContent({ borderColor: color });
  };

  const handleShadowEnabledChange = (checked: boolean) => {
    setShadowEnabled(checked);
    updateContent({ shadowEnabled: checked });
  };

  const handleShadowColorChange = (color: string) => {
    setShadowColor(color);
    updateContent({ shadowColor: color });
  };

  const handleShadowBlurChange = (value: number[]) => {
    const blur = value[0];
    setShadowBlur(blur);
    updateContent({ shadowBlur: blur });
  };

  const handleShadowOffsetXChange = (value: number[]) => {
    const offset = value[0];
    setShadowOffsetX(offset);
    updateContent({ shadowOffsetX: offset });
  };

  const handleShadowOffsetYChange = (value: number[]) => {
    const offset = value[0];
    setShadowOffsetY(offset);
    updateContent({ shadowOffsetY: offset });
  };

  // Check if URL is a YouTube video
  const isYoutubeUrl = (url: string) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  return (
    <div className="p-4 space-y-6 pb-32">
      <div>
        <h3 className="text-lg font-medium">Configurar Vídeo</h3>
        <p className="text-sm text-muted-foreground">
          Adicione e configure um vídeo para o seu funil.
        </p>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url" className="flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" />
            <span>URL</span>
          </TabsTrigger>
          <TabsTrigger value="iframe" className="flex items-center gap-1">
            <Code className="h-3.5 w-3.5" />
            <span>iFrame</span>
          </TabsTrigger>
          <TabsTrigger value="js" className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 7-5 5 5 5"></path>
              <path d="M4 4h16v16H4z"></path>
            </svg>
            <span>JavaScript</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="video-url" className="block mb-2">
              URL do Vídeo <span className="text-xs text-muted-foreground">(YouTube ou arquivo MP4, WebM)</span>
            </Label>
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full"
            />
            {isYoutubeUrl(videoUrl) && (
              <p className="text-xs text-muted-foreground mt-1">
                ✓ URL do YouTube detectada
              </p>
            )}
          </div>
          
          {videoUrl && (
            <div className="mt-4 bg-muted/50 rounded-md p-4 flex justify-center">
              {isYoutubeUrl(videoUrl) ? (
                <div className="w-full max-w-md aspect-video bg-black/10 flex items-center justify-center rounded">
                  <Play className="h-10 w-10 text-muted-foreground" />
                  <span className="sr-only">Preview do vídeo</span>
                </div>
              ) : (
                <div className="w-full max-w-md aspect-video bg-black/10 flex items-center justify-center rounded">
                  <VideoIcon className="h-10 w-10 text-muted-foreground" />
                  <span className="sr-only">Preview do vídeo</span>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="iframe" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="iframe-code" className="block mb-2">
              Código do iframe
            </Label>
            <Textarea
              id="iframe-code"
              placeholder='<iframe src="https://www.youtube.com/embed/..." frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
              value={embedCode}
              onChange={(e) => handleEmbedCodeChange(e.target.value)}
              className="min-h-[150px] font-mono text-xs"
              style={{ lineHeight: 1.5 }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cole o código de incorporação do vídeo.
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                Após colar o código, clique em qualquer lugar fora da área de texto para aplicar as mudanças.
              </span>
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="js" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="js-code" className="block mb-2">
              Código JavaScript
            </Label>
            <Textarea
              id="js-code"
              placeholder="<script>...</script>"
              value={embedCode}
              onChange={(e) => handleJsCodeChange(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
              style={{ lineHeight: 1.5 }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cole o código JavaScript do player de vídeo.
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                O código JavaScript será exibido apenas na visualização final do funil, não durante a edição.
                <br />
                Após colar o código, clique em qualquer lugar fora da área de texto para aplicar as mudanças.
              </span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="block mb-2">
            Título (opcional)
          </Label>
          <Input
            id="title"
            placeholder="Título do vídeo"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="block">Alinhamento</Label>
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
          <Label htmlFor="aspect-ratio" className="block">Proporção</Label>
          <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
            <SelectTrigger id="aspect-ratio">
              <SelectValue placeholder="Selecione a proporção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Paisagem)</SelectItem>
              <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
              <SelectItem value="4:3">4:3 (Clássico)</SelectItem>
              <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
              <SelectItem value="original">Original</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        {/* Novas opções de estilo */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Estilo do vídeo</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="border-radius">Arredondamento das bordas</Label>
                <span className="text-xs text-muted-foreground">{borderRadius}px</span>
              </div>
              <Slider
                id="border-radius"
                min={0}
                max={30}
                step={1}
                value={[borderRadius]}
                onValueChange={handleBorderRadiusChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="border-width">Largura da borda</Label>
                <span className="text-xs text-muted-foreground">{borderWidth}px</span>
              </div>
              <Slider
                id="border-width"
                min={0}
                max={10}
                step={1}
                value={[borderWidth]}
                onValueChange={handleBorderWidthChange}
              />
            </div>
            
            {borderWidth > 0 && (
              <div className="space-y-2">
                <Label htmlFor="border-color">Cor da borda</Label>
                <div className="flex gap-2">
                  <div 
                    className="h-9 w-9 rounded border flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: borderColor }}
                    onClick={() => document.getElementById('border-color')?.click()}
                  >
                    <CircleIcon className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                  <Input
                    id="border-color"
                    type="color"
                    value={borderColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className="sr-only"
                  />
                  <Input
                    type="text"
                    value={borderColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="shadow-enabled" className="text-sm">Sombra</Label>
              <p className="text-xs text-muted-foreground">
                Adicionar sombra ao vídeo
              </p>
            </div>
            <Switch
              id="shadow-enabled"
              checked={shadowEnabled}
              onCheckedChange={handleShadowEnabledChange}
            />
          </div>
          
          {shadowEnabled && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="shadow-color">Cor da sombra</Label>
                <div className="flex gap-2">
                  <div 
                    className="h-9 w-9 rounded border flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: shadowColor }}
                    onClick={() => document.getElementById('shadow-color')?.click()}
                  >
                    <CircleIcon className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                  <Input
                    id="shadow-color"
                    type="color"
                    value={shadowColor.startsWith('rgba') ? '#000000' : shadowColor}
                    onChange={(e) => handleShadowColorChange(e.target.value)}
                    className="sr-only"
                  />
                  <Input
                    type="text"
                    value={shadowColor}
                    onChange={(e) => handleShadowColorChange(e.target.value)}
                    className="flex-1"
                    placeholder="rgba(0, 0, 0, 0.3)"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Utilize cores em formato HEX (#000000) ou RGBA (rgba(0, 0, 0, 0.3))
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="shadow-blur">Desfoque</Label>
                  <span className="text-xs text-muted-foreground">{shadowBlur}px</span>
                </div>
                <Slider
                  id="shadow-blur"
                  min={0}
                  max={30}
                  step={1}
                  value={[shadowBlur]}
                  onValueChange={handleShadowBlurChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="shadow-offset-x">Deslocamento horizontal</Label>
                  <span className="text-xs text-muted-foreground">{shadowOffsetX}px</span>
                </div>
                <Slider
                  id="shadow-offset-x"
                  min={-20}
                  max={20}
                  step={1}
                  value={[shadowOffsetX]}
                  onValueChange={handleShadowOffsetXChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="shadow-offset-y">Deslocamento vertical</Label>
                  <span className="text-xs text-muted-foreground">{shadowOffsetY}px</span>
                </div>
                <Slider
                  id="shadow-offset-y"
                  min={-20}
                  max={20}
                  step={1}
                  value={[shadowOffsetY]}
                  onValueChange={handleShadowOffsetYChange}
                />
              </div>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Configurações de reprodução</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoplay" className="text-sm">Reprodução automática</Label>
              <p className="text-xs text-muted-foreground">
                Iniciar o vídeo automaticamente
              </p>
            </div>
            <Switch
              id="autoplay"
              checked={autoPlay}
              onCheckedChange={handleAutoPlayChange}
              key={`autoplay-${autoPlay}`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="muted" className="text-sm">Mudo</Label>
              <p className="text-xs text-muted-foreground">
                Iniciar o vídeo sem áudio
              </p>
            </div>
            <Switch
              id="muted"
              checked={muted}
              onCheckedChange={handleMutedChange}
              key={`muted-${muted}`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="controls" className="text-sm">Controles</Label>
              <p className="text-xs text-muted-foreground">
                Mostrar controles de vídeo
              </p>
            </div>
            <Switch
              id="controls"
              checked={controls}
              onCheckedChange={handleControlsChange}
              key={`controls-${controls}`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="loop" className="text-sm">Repetir</Label>
              <p className="text-xs text-muted-foreground">
                Repetir o vídeo automaticamente
              </p>
            </div>
            <Switch
              id="loop"
              checked={loop}
              onCheckedChange={handleLoopChange}
              key={`loop-${loop}`}
            />
          </div>
        </div>
        
        {activeTab === "url" && isYoutubeUrl(videoUrl) && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                Para o YouTube, a reprodução automática normalmente só funciona quando o vídeo está mudo.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConfig; 