import React, { useState, useRef, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Paintbrush,
  ArrowUp,
  ArrowDown,
  Highlighter,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { value: "Lato", label: "Lato" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Courier New", label: "Courier New" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Segoe UI", label: "Segoe UI" }
];

interface TextConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const TextConfig = ({ element, onUpdate }: TextConfigProps) => {
  const { toast } = useToast();
  // Estado para armazenar conteúdo e estilos
  const [fontSize, setFontSize] = useState(element.content?.fontSize || 20);
  const [fontColor, setFontColor] = useState(element.content?.fontColor || "#000000");
  const [fontFamily, setFontFamily] = useState(element.content?.fontFamily || "Inter");
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
  const [lineHeight, setLineHeight] = useState(element.content?.lineHeight || 1.5);
  const [letterSpacing, setLetterSpacing] = useState(element.content?.letterSpacing || 0);
  const [currentContent, setCurrentContent] = useState<string>(""); // Controle do conteúdo atual
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [isContentRestored, setIsContentRestored] = useState(false);
  const [highlightColor, setHighlightColor] = useState("#ffff00"); // Cor padrão do destaque (amarelo)
  
  // Referências para o editor e timers
  const editorRef = useRef<HTMLDivElement>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentBufferRef = useRef<string | null>(null);
  
  // Inicializar editor com conteúdo existente
  useEffect(() => {
    if (editorRef.current && !isInitialized && element.id) {
      console.log("TextConfig - Initializing editor with element ID:", element.id);
      
      let content = '';
      
      if (element.content?.formattedText) {
        console.log("TextConfig - Using existing formatted text");
        content = element.content.formattedText;
      } else if (element.content?.title) {
        console.log("TextConfig - Creating formatted text from title/description");
        content = `<div style="text-align: center; background-color: transparent;">${element.content.title}</div>`;
        if (element.content?.description) {
          content += `<div style="text-align: center; margin-top: 8px; background-color: transparent;">${element.content.description}</div>`;
        }
      }
      
      if (content) {
        console.log("TextConfig - Setting initial content:", content);
        editorRef.current.innerHTML = content;
        setCurrentContent(content);
        contentBufferRef.current = content;
        setIsInitialized(true);
        setIsContentRestored(true);
      }
      
      // Inicializar a variável CSS com a cor de destaque atual
      editorRef.current.style.setProperty('--highlight-color', highlightColor);
      
      // Garantir que todos os elementos no editor tenham fundo transparente
      forceTransparentBackground();
    }
  }, [element.id, isInitialized, highlightColor]);

  // Aplicar a família de fonte ao editor quando ela mudar
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = fontFamily;
    }
  }, [fontFamily]);

  // Aplicar espaçamento entre linhas e letras quando mudarem
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.lineHeight = String(lineHeight);
      editorRef.current.style.letterSpacing = `${letterSpacing}px`;
    }
  }, [lineHeight, letterSpacing]);

  // Sincronizar o contentBufferRef com qualquer mudança nos dados do elemento
  useEffect(() => {
    if (element.content?.formattedText && element.content.formattedText !== contentBufferRef.current) {
      console.log("TextConfig - Updating content buffer from element:", element.content.formattedText);
      contentBufferRef.current = element.content.formattedText;
      
      // Atualizar o editor se estamos na aba de conteúdo
      if (activeTab === "content" && editorRef.current && !isContentRestored) {
        console.log("TextConfig - Updating editor from element formattedText");
        editorRef.current.innerHTML = element.content.formattedText;
        setCurrentContent(element.content.formattedText);
        // NÃO forçar fundo transparente aqui para preservar destaque
        setIsContentRestored(true);
      }
    }
  }, [element.content?.formattedText, activeTab, isContentRestored]);

  // Atualizar o conteúdo do editor quando alternar entre abas
  useEffect(() => {
    if (activeTab === "content") {
      console.log("TextConfig - Tab changed to content, restoring editor content");
      
      // Marcar como não restaurado para forçar uma atualização
      setIsContentRestored(false);
      
      // Aplicar com pequeno delay para garantir que o DOM esteja pronto
      setTimeout(() => {
        if (editorRef.current && contentBufferRef.current) {
          console.log("TextConfig - Restoring content:", contentBufferRef.current);
          editorRef.current.innerHTML = contentBufferRef.current;
          setCurrentContent(contentBufferRef.current);
          // NÃO forçar fundo transparente aqui para preservar destaque
          setIsContentRestored(true);
        }
      }, 50);
    }
  }, [activeTab]);

  // Função para garantir que todos os elementos no editor tenham fundo transparente
  const forceTransparentBackground = () => {
    if (!editorRef.current) return;
    
    // Usar um seletor muito específico para garantir que não afetem spans que têm backgroundColor
    const allElements = editorRef.current.querySelectorAll('div:not([style*="background"]), p:not([style*="background"])');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.backgroundColor = 'transparent';
      }
    });
  };

  // Função para capturar o conteúdo atual do editor
  const captureEditorContent = () => {
    if (!editorRef.current) return null;
    
    // Capturar conteúdo atual sem forçar transparência
    const content = editorRef.current.innerHTML;
    return content;
  };

  // Função para atualizar o elemento com o conteúdo atual e estilos
  const commitUpdate = (options: { immediate?: boolean, styleOnly?: boolean, extraStyles?: Record<string, any> } = {}) => {
    let content: string | null;
    
    if (options.styleOnly) {
      // Para atualizações de estilo, usar o buffer existente ou o estado atual
      content = contentBufferRef.current || currentContent;
      console.log("TextConfig - Using buffered content for style update:", content);
    } else {
      // Para atualizações de conteúdo, capturar o conteúdo atual do editor
      content = captureEditorContent();
      console.log("TextConfig - Captured new content from editor:", content);
      
      // Armazenar o conteúdo atual no buffer de referência apenas quando mudar o conteúdo
      // não quando estiver apenas atualizando estilos
      if (content) {
        contentBufferRef.current = content;
      }
    }
    
    if (!content) {
      console.warn("TextConfig - No content to update");
      return;
    }
    
    // Atualizar o estado local do conteúdo se não for apenas estilo
    if (!options.styleOnly) {
      setCurrentContent(content);
    }
    
    // Preparar a atualização com o conteúdo e estilos
    const updates = {
      content: {
        ...element.content,
        formattedText: content,
        fontSize,
        fontColor,
        fontFamily,
        marginTop,
        lineHeight,
        letterSpacing,
        ...(options.extraStyles || {})
      }
    };
    
    console.log("TextConfig - Preparing update with content:", updates);
    
    // Se for imediato ou de estilo, enviar agora
    if (options.immediate === true) {
      console.log("TextConfig - Sending immediate update");
      onUpdate(updates);
      return;
    }
    
    // Limpar qualquer temporizador existente
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    // Definir novo temporizador para atualização
    updateTimerRef.current = setTimeout(() => {
      console.log("TextConfig - Sending delayed update");
      onUpdate(updates);
      updateTimerRef.current = null;
    }, options.styleOnly ? 50 : 300);
  };

  // Atualização de conteúdo do texto quando o usuário edita
  const handleEditorInput = () => {
    commitUpdate();
  };

  // Função para aplicar formatação de texto
  const formatText = (command: string, value: string = "") => {
    // Capturar o conteúdo atual antes de formatar
    const content = captureEditorContent();
    if (content) {
      contentBufferRef.current = content;
    }
    
    // Aplicar comando de formatação
    document.execCommand(command, false, value);
    
    // NÃO chamar forceTransparentBackground para preservar destaques
    
    // Focar o editor novamente
    editorRef.current?.focus();
    
    // Enviar atualização após um breve atraso
    setTimeout(() => {
      handleEditorInput();
    }, 50);
  };

  // Função para aplicar cor ao texto
  const applyColor = (color: string) => {
    // Capturar o conteúdo atual antes de aplicar cor
    const content = captureEditorContent();
    if (content) {
      contentBufferRef.current = content;
    }
    
    // Aplicar cor
    document.execCommand('foreColor', false, color);
    
    // NÃO chamar forceTransparentBackground para preservar destaques
    
    // Focar o editor novamente
    editorRef.current?.focus();
    
    // Enviar atualização após um breve atraso
    setTimeout(() => {
      handleEditorInput();
    }, 50);
  };
  
  // Função para aplicar destaque (highlight) ao texto
  const applyHighlight = (color: string) => {
    // Capturar o conteúdo atual antes de aplicar destaque
    const content = captureEditorContent();
    if (content) {
      contentBufferRef.current = content;
    }
    
    // Atualizar a cor de destaque no estado
    setHighlightColor(color);
    
    // Aplicar cor de fundo usando execCommand
    try {
      // Primeiro tentar com backColor
      document.execCommand('backColor', false, color);
      
      // Se o texto selecionado não mudou de cor, tentar com hiliteColor
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        document.execCommand('hiliteColor', false, color);
      }
    } catch (error) {
      console.error('Error applying highlight:', error);
    }
    
    // Focar o editor novamente
    editorRef.current?.focus();
    
    // Enviar atualização após um breve atraso
    setTimeout(() => {
      handleEditorInput();
    }, 50);
  };

  // Manipulador para mudanças no tamanho da fonte
  const handleFontSizeChange = (value: number[]) => {
    // Atualizar o tamanho da fonte no estado local sem capturar o conteúdo atual
    setFontSize(value[0]);
    
    // Aplicar ao editor para visualização imediata
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${value[0]}px`;
    }
    
    // Enviar atualização com o conteúdo preservado e o novo tamanho
    commitUpdate({ styleOnly: true, immediate: true });
    
    // Adicionar um toast para confirmar a mudança
    toast({
      title: "Tamanho da fonte atualizado",
      description: `Fonte definida para ${value[0]}px`,
      duration: 2000
    });
  };

  // Manipulador para mudanças na margem superior
  const handleMarginTopChange = (value: number[]) => {
    // Atualizar a margem superior no estado local sem capturar o conteúdo atual
    setMarginTop(value[0]);
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ styleOnly: true, immediate: true });
  };

  // Manipulador para mudanças no espaçamento entre linhas
  const handleLineHeightChange = (value: number[]) => {
    // Atualizar o espaçamento entre linhas no estado local sem capturar o conteúdo atual
    setLineHeight(value[0]);
    
    // Aplicar ao editor para visualização imediata
    if (editorRef.current) {
      editorRef.current.style.lineHeight = String(value[0]);
    }
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ styleOnly: true, immediate: true });
  };

  // Manipulador para mudanças no espaçamento entre letras
  const handleLetterSpacingChange = (value: number[]) => {
    // Atualizar o espaçamento entre letras no estado local sem capturar o conteúdo atual
    setLetterSpacing(value[0]);
    
    // Aplicar ao editor para visualização imediata
    if (editorRef.current) {
      editorRef.current.style.letterSpacing = `${value[0]}px`;
    }
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ styleOnly: true, immediate: true });
  };

  // Manipulador para mudanças na cor do texto
  const handleDefaultColorChange = (color: string) => {
    // Atualizar a cor no estado local sem capturar o conteúdo atual
    setFontColor(color);
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ styleOnly: true, immediate: true });
  };

  // Manipulador para mudanças na família de fonte
  const handleFontFamilyChange = (value: string) => {
    // Atualizar a fonte no estado local sem capturar o conteúdo atual
    setFontFamily(value);
    
    // Aplicar a fonte no editor para visualização imediata
    if (editorRef.current) {
      editorRef.current.style.fontFamily = value;
    }
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ 
      styleOnly: true, 
      immediate: true,
      extraStyles: { fontFamily: value }
    });
    
    // Adicionar um toast para confirmar a mudança
    toast({
      title: "Fonte atualizada",
      description: `Fonte alterada para ${value}`,
      duration: 2000
    });
  };

  const colorOptions = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
    "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"
  ];
  
  const highlightOptions = [
    // Cores básicas vibrantes primeiro
    "#FF0000", "#0000FF", "#FFFF00", "#00FF00", "#000000", "#FFFFFF",
    // Depois as cores existentes
    "#ffff00", "#00ffff", "#ff9900", "#ff00ff", "#FF5A5A", "#7DF9FF", "#FDFD96", "#CCCCFF", "#FFD1DC", "#CDB5CD",
    "#C9A9A6", "#B0E0E6", "#D3FFCE", "#DCDCDC", "#FFF8DC", "#E0FFFF", "#FEDFC9", "#E8D0A9", "#FDE1DF", "#FFB6C1"
  ];

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Toggle 
              size="sm" 
              onClick={() => formatText('bold')}
              aria-label="Negrito"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              size="sm" 
              onClick={() => formatText('italic')}
              aria-label="Itálico"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              size="sm" 
              onClick={() => formatText('underline')}
              aria-label="Sublinhado"
            >
              <Underline className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              size="sm" 
              onClick={() => formatText('strikeThrough')}
              aria-label="Tachado"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 px-2">
                  <Paintbrush className="h-4 w-4" />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: fontColor }}></span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-10 gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyColor(color)}
                      className="w-5 h-5 rounded hover:ring-2 hover:ring-offset-1"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Novo botão de destaque (highlight) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1 px-2"
                  title="Selecione um texto e clique aqui para destacá-lo com cor de fundo"
                >
                  <Highlighter className="h-4 w-4" />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: highlightColor }}></span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="pb-2">
                  <Label className="text-xs font-medium">Cor de destaque</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione o texto primeiro e depois escolha uma cor para destacá-lo.
                  </p>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {highlightOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyHighlight(color)}
                      className="w-5 h-5 rounded hover:ring-2 hover:ring-offset-1"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <ToggleGroup type="single" defaultValue="left" size="sm">
              <ToggleGroupItem value="left" onClick={() => formatText('justifyLeft')}>
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" onClick={() => formatText('justifyCenter')}>
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" onClick={() => formatText('justifyRight')}>
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[150px] border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-violet-400 transition-colors bg-transparent"
            onInput={handleEditorInput}
            onBlur={() => {
              const content = captureEditorContent();
              if (content && content !== currentContent) {
                console.log("TextConfig - Content changed on blur, committing update");
                commitUpdate({ immediate: true });
              }
            }}
            onKeyDown={(e) => {
              // Permitir que o comportamento padrão de Ctrl+Z e Ctrl+Y funcione dentro do editor
              // Não fazemos nada aqui, apenas garantimos que o evento não é propagado para o document
              if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z' || e.key === 'y' || e.key === 'Y')) {
                // Não fazer nada, deixar o navegador lidar com isso
                // Stopamos a propagação para que o listener global não intercepte
                e.stopPropagation();
              }
            }}
            style={{ 
              fontSize: `${fontSize}px`, 
              color: fontColor, 
              backgroundColor: 'transparent',
              lineHeight: String(lineHeight),
              letterSpacing: `${letterSpacing}px`,
              fontFamily
            }}
            data-transparent-text="true"
            role="textbox"
          />
          <div className="text-xs text-gray-500 mt-1">
            Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+Z</kbd> para desfazer alterações dentro do editor
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-6 pt-4">
          {/* Seletor de família de fonte */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="font-family">Família de Fonte</Label>
              <span className="text-sm text-muted-foreground font-medium" style={{ fontFamily }}>
                {fontFamily}
              </span>
            </div>
            <Select 
              value={fontFamily}
              onValueChange={handleFontFamilyChange}
            >
              <SelectTrigger id="font-family" className="w-full">
                <SelectValue placeholder="Selecione uma fonte" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="font-size">Tamanho da fonte</Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              id="font-size"
              min={10}
              max={72}
              step={1}
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
            />
          </div>
          
          {/* Novo controle para espaçamento entre linhas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="line-height">Espaçamento entre linhas</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{lineHeight.toFixed(1)}x</span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleLineHeightChange([Math.max(0.5, lineHeight - 0.1)])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleLineHeightChange([Math.min(3, lineHeight + 0.1)])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Slider
              id="line-height"
              min={0.5}
              max={3}
              step={0.1}
              value={[lineHeight]}
              onValueChange={handleLineHeightChange}
            />
          </div>
          
          {/* Novo controle para espaçamento entre letras */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="letter-spacing">Espaçamento entre letras</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{letterSpacing}px</span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleLetterSpacingChange([Math.max(-5, letterSpacing - 0.5)])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleLetterSpacingChange([Math.min(20, letterSpacing + 0.5)])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Slider
              id="letter-spacing"
              min={-5}
              max={20}
              step={0.5}
              value={[letterSpacing]}
              onValueChange={handleLetterSpacingChange}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="margin-top">Margem superior</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{marginTop}px</span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop - 5])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop + 5])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Slider
              id="margin-top"
              min={-100}
              max={100}
              step={1}
              value={[marginTop]}
              onValueChange={handleMarginTopChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font-color">Cor padrão do texto</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Clique duas vezes na cor desejada para selecioná-la.
            </p>
            <div className="grid grid-cols-10 gap-1 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleDefaultColorChange(color)}
                  className={`w-5 h-5 rounded hover:ring-2 hover:ring-offset-1 ${
                    fontColor === color ? 'ring-2 ring-offset-1 ring-black' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextConfig;
