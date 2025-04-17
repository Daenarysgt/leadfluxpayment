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
  Highlighter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface TextConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const TextConfig = ({ element, onUpdate }: TextConfigProps) => {
  const { toast } = useToast();
  // Estado para armazenar conteúdo e estilos
  const [fontSize, setFontSize] = useState(element.content?.fontSize || 20);
  const [fontColor, setFontColor] = useState(element.content?.fontColor || "#000000");
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
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
      
      // Garantir que todos os elementos no editor tenham fundo transparente
      forceTransparentBackground();
    }
  }, [element.id, isInitialized]);

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
        forceTransparentBackground();
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
          forceTransparentBackground();
          setIsContentRestored(true);
        }
      }, 50);
    }
  }, [activeTab]);

  // Função para garantir que todos os elementos no editor tenham fundo transparente
  const forceTransparentBackground = () => {
    if (!editorRef.current) return;
    
    const allElements = editorRef.current.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.backgroundColor = 'transparent';
      }
    });
  };

  // Função para capturar o conteúdo atual do editor
  const captureEditorContent = () => {
    if (!editorRef.current) return null;
    
    // Garantir fundo transparente antes de capturar
    forceTransparentBackground();
    
    // Capturar conteúdo atual
    const content = editorRef.current.innerHTML;
    return content;
  };

  // Função para atualizar o elemento com o conteúdo atual e estilos
  const commitUpdate = (options: { immediate?: boolean, styleOnly?: boolean } = {}) => {
    let content: string | null;
    
    if (options.styleOnly) {
      // Para atualizações de estilo, usar o buffer existente ou o estado atual
      content = contentBufferRef.current || currentContent;
      console.log("TextConfig - Using buffered content for style update:", content);
    } else {
      // Para atualizações de conteúdo, capturar o conteúdo atual do editor
      content = captureEditorContent();
      console.log("TextConfig - Captured new content from editor:", content);
    }
    
    if (!content) {
      console.warn("TextConfig - No content to update");
      return;
    }
    
    // Armazenar o conteúdo atual no buffer de referência
    contentBufferRef.current = content;
    
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
        marginTop
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
    
    // Garantir fundo transparente após formatação
    setTimeout(forceTransparentBackground, 0);
    
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
    
    // Garantir fundo transparente após aplicar cor
    setTimeout(forceTransparentBackground, 0);
    
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
    
    // Aplicar cor de fundo ao texto selecionado
    document.execCommand('backColor', false, color);
    
    // Focar o editor novamente
    editorRef.current?.focus();
    
    // Enviar atualização após um breve atraso
    setTimeout(() => {
      handleEditorInput();
    }, 50);
  };

  // Manipulador para mudanças no tamanho da fonte
  const handleFontSizeChange = (value: number[]) => {
    // Primeiro capturar o conteúdo atual
    const currentContent = captureEditorContent();
    if (currentContent) {
      contentBufferRef.current = currentContent;
      console.log("TextConfig - Saved content before font size change:", contentBufferRef.current);
    }
    
    // Atualizar o tamanho da fonte no estado local
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
    // Capturar o conteúdo atual antes de mudar margem
    const content = captureEditorContent();
    if (content) {
      contentBufferRef.current = content;
    }
    
    // Atualizar a margem superior no estado local
    setMarginTop(value[0]);
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ styleOnly: true, immediate: true });
  };

  // Manipulador para mudanças na cor do texto
  const handleDefaultColorChange = (color: string) => {
    // Capturar o conteúdo atual antes de mudar cor
    const content = captureEditorContent();
    if (content) {
      contentBufferRef.current = content;
    }
    
    // Atualizar a cor no estado local
    setFontColor(color);
    
    // Enviar atualização com o conteúdo preservado
    commitUpdate({ styleOnly: true, immediate: true });
  };

  const colorOptions = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
    "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"
  ];
  
  const highlightOptions = [
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
                <Button variant="outline" size="sm" className="h-8 gap-1 px-2">
                  <Highlighter className="h-4 w-4" />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: highlightColor }}></span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="pb-2">
                  <Label className="text-xs font-medium">Cor de destaque</Label>
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
            style={{ fontSize: `${fontSize}px`, color: fontColor, backgroundColor: 'transparent' }}
            data-transparent-text="true"
          />
        </TabsContent>
        
        <TabsContent value="style" className="space-y-6 pt-4">
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
