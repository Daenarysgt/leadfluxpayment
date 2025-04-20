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

// Cores de fundo pré-definidas
const BACKGROUND_COLORS = [
  "#F9F5FF", // Lilás claro
  "#FFEFEF", // Rosa claro
  "#EFFFEF", // Verde claro
  "#FFF9E6", // Amarelo claro
  "#E6F9FF", // Azul claro
  "#FCE7F3", // Rosa suave
  "#E6FFFA", // Verde-água
  "#FFFBEB", // Bege
  "#EFF6FF", // Azul céu
  "#F5F5F5", // Cinza claro
];

interface NotesConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const NotesConfig = ({ element, onUpdate }: NotesConfigProps) => {
  const { toast } = useToast();
  // Estado para armazenar conteúdo e estilos
  const [fontSize, setFontSize] = useState(element.content?.fontSize || 20);
  const [fontColor, setFontColor] = useState(element.content?.fontColor || "#000000");
  const [fontFamily, setFontFamily] = useState(element.content?.fontFamily || "Inter");
  const [marginTop, setMarginTop] = useState(element.content?.marginTop || 0);
  const [lineHeight, setLineHeight] = useState(element.content?.lineHeight || 1.5);
  const [letterSpacing, setLetterSpacing] = useState(element.content?.letterSpacing || 0);
  const [backgroundColor, setBackgroundColor] = useState(element.content?.backgroundColor || "#F9F5FF");
  const [backgroundOpacity, setBackgroundOpacity] = useState(element.content?.backgroundOpacity || 1);
  const [borderRadius, setBorderRadius] = useState(element.content?.borderRadius || 8);
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
      console.log("NotesConfig - Initializing editor with element ID:", element.id);
      
      let content = '';
      
      if (element.content?.formattedText) {
        console.log("NotesConfig - Using existing formatted text");
        content = element.content.formattedText;
      } else if (element.content?.title) {
        console.log("NotesConfig - Creating formatted text from title/description");
        content = `<div style="text-align: center; background-color: transparent;">${element.content.title}</div>`;
        if (element.content?.description) {
          content += `<div style="text-align: center; margin-top: 8px; background-color: transparent;">${element.content.description}</div>`;
        }
      }
      
      if (content) {
        console.log("NotesConfig - Setting initial content:", content);
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
      console.log("NotesConfig - Updating content buffer from element:", element.content.formattedText);
      contentBufferRef.current = element.content.formattedText;
      
      // Atualizar o editor se estamos na aba de conteúdo
      if (activeTab === "content" && editorRef.current && !isContentRestored) {
        console.log("NotesConfig - Updating editor from element formattedText");
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
      console.log("NotesConfig - Tab changed to content, restoring editor content");
      
      // Marcar como não restaurado para forçar uma atualização
      setIsContentRestored(false);
      
      // Aplicar com pequeno delay para garantir que o DOM esteja pronto
      setTimeout(() => {
        if (editorRef.current && contentBufferRef.current) {
          console.log("NotesConfig - Restoring content:", contentBufferRef.current);
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
      console.log("NotesConfig - Using buffered content for style update:", content);
    } else {
      // Para atualizações de conteúdo, capturar o conteúdo atual do editor
      content = captureEditorContent();
      console.log("NotesConfig - Captured new content from editor:", content);
      
      // Armazenar o conteúdo atual no buffer de referência apenas quando mudar o conteúdo
      // não quando estiver apenas atualizando estilos
      if (content) {
        contentBufferRef.current = content;
      }
    }
    
    if (!content) {
      console.warn("NotesConfig - No content to update");
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
        backgroundColor,
        backgroundOpacity,
        borderRadius,
        ...(options.extraStyles || {})
      }
    };
    
    console.log("NotesConfig - Preparing update with content:", updates);
    
    // Se for imediato ou de estilo, enviar agora
    if (options.immediate === true) {
      console.log("NotesConfig - Sending immediate update");
      onUpdate(updates);
      return;
    }
    
    // Limpar qualquer temporizador existente
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    // Definir novo temporizador para atualização
    updateTimerRef.current = setTimeout(() => {
      console.log("NotesConfig - Sending delayed update");
      onUpdate(updates);
      updateTimerRef.current = null;
    }, options.styleOnly ? 50 : 300);
  };

  // Atualização de conteúdo do texto quando o usuário edita
  const handleEditorInput = () => {
    // Atualizar o elemento com o conteúdo atual
    commitUpdate();
  };

  // Comandos de formatação para o editor
  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    
    // Focar o editor após executar o comando
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    // Capturar o conteúdo após a formatação e atualizar o elemento
    setTimeout(() => {
      commitUpdate();
    }, 50);
  };

  // Aplicar cor de texto
  const applyColor = (color: string) => {
    setFontColor(color);
    
    // Armazenar a seleção atual
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (range && !range.collapsed) {
      // Há texto selecionado, aplicar a cor a ele
      document.execCommand('foreColor', false, color);
    } else {
      // Não há texto selecionado, definir a cor padrão e atualizar o elemento
      handleDefaultColorChange(color);
    }
    
    // Capturar o conteúdo após a formatação
    commitUpdate();
  };

  // Aplicar destaque (highlight)
  const applyHighlight = (color: string) => {
    setHighlightColor(color);
    
    // Definir a cor de destaque como variável CSS
    if (editorRef.current) {
      editorRef.current.style.setProperty('--highlight-color', color);
    }
    
    // Aplicar a cor de fundo ao texto selecionado
    document.execCommand('backColor', false, color);
    
    // Capturar o conteúdo após a formatação
    commitUpdate();
  };

  // Lidar com a alteração no tamanho da fonte
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    
    // Atualizar o elemento com o novo tamanho de fonte
    commitUpdate({ 
      styleOnly: true, 
      extraStyles: { fontSize: newSize } 
    });
  };

  // Lidar com a alteração na margem superior
  const handleMarginTopChange = (value: number[]) => {
    const newMargin = value[0];
    setMarginTop(newMargin);
    
    // Atualizar o elemento com a nova margem
    commitUpdate({ 
      styleOnly: true, 
      extraStyles: { marginTop: newMargin } 
    });
  };

  // Lidar com a alteração na altura da linha
  const handleLineHeightChange = (value: number[]) => {
    const newLineHeight = value[0];
    setLineHeight(newLineHeight);
    
    // Aplicar diretamente ao editor
    if (editorRef.current) {
      editorRef.current.style.lineHeight = String(newLineHeight);
    }
    
    // Atualizar o elemento com a nova altura de linha
    commitUpdate({ 
      styleOnly: true, 
      extraStyles: { lineHeight: newLineHeight } 
    });
  };

  // Lidar com a alteração no espaçamento entre letras
  const handleLetterSpacingChange = (value: number[]) => {
    const newSpacing = value[0];
    setLetterSpacing(newSpacing);
    
    // Aplicar diretamente ao editor
    if (editorRef.current) {
      editorRef.current.style.letterSpacing = `${newSpacing}px`;
    }
    
    // Atualizar o elemento com o novo espaçamento
    commitUpdate({ 
      styleOnly: true, 
      extraStyles: { letterSpacing: newSpacing } 
    });
  };

  // Lidar com a alteração na cor de texto padrão
  const handleDefaultColorChange = (color: string) => {
    setFontColor(color);
    
    // Atualizar o elemento com a nova cor de texto
    commitUpdate({ 
      styleOnly: true, 
      extraStyles: { fontColor: color } 
    });
  };

  // Lidar com a alteração na família de fonte
  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    
    // Aplicar diretamente ao editor
    if (editorRef.current) {
      editorRef.current.style.fontFamily = value;
    }
    
    // Atualizar o elemento com a nova fonte
    commitUpdate({ 
      styleOnly: true, 
      extraStyles: { fontFamily: value } 
    });
  };

  // Lidar com alteração na cor de fundo
  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    
    // Atualizar o elemento com a nova cor de fundo
    commitUpdate({
      styleOnly: true,
      extraStyles: { backgroundColor: color }
    });
  };

  // Lidar com alteração no raio da borda
  const handleBorderRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setBorderRadius(newRadius);
    
    // Atualizar o elemento com o novo raio de borda
    commitUpdate({
      styleOnly: true,
      extraStyles: { borderRadius: newRadius }
    });
  };

  // Lidar com alteração na opacidade do fundo
  const handleBackgroundOpacityChange = (value: number[]) => {
    const newOpacity = value[0];
    setBackgroundOpacity(newOpacity);
    
    // Atualizar o elemento com a nova opacidade de fundo
    commitUpdate({
      styleOnly: true,
      extraStyles: { backgroundOpacity: newOpacity }
    });
  };

  return (
    <div className="p-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-2">
          <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="flex-1">Estilos</TabsTrigger>
          <TabsTrigger value="background" className="flex-1">Fundo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-2">
          <div className="flex flex-wrap gap-1 mb-2">
            <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{backgroundColor: fontColor}}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-5 gap-1">
                  {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#C0C0C0", "#808080", "#800000", "#808000", "#008000", "#800080", "#008080", "#000080", "#FFA500", "#A52A2A", "#FFC0CB", "#008B8B"].map(color => (
                    <Button 
                      key={color}
                      variant="outline" 
                      className="w-8 h-8 p-0" 
                      style={{backgroundColor: color}}
                      onClick={() => applyColor(color)}
                    />
                  ))}
                </div>
                <div className="mt-1">
                  <Input 
                    type="color" 
                    value={fontColor} 
                    onChange={(e) => applyColor(e.target.value)}
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            <ToggleGroup type="multiple" className="flex flex-wrap">
              <ToggleGroupItem value="bold" aria-label="Negrito" onClick={() => formatText('bold')} className="h-8 w-8 p-0">
                <Bold className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Itálico" onClick={() => formatText('italic')} className="h-8 w-8 p-0">
                <Italic className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Sublinhado" onClick={() => formatText('underline')} className="h-8 w-8 p-0">
                <Underline className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="strikethrough" aria-label="Tachado" onClick={() => formatText('strikeThrough')} className="h-8 w-8 p-0">
                <Strikethrough className="h-3 w-3" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <ToggleGroup type="single" className="flex flex-wrap">
              <ToggleGroupItem value="left" aria-label="Alinhar à esquerda" onClick={() => formatText('justifyLeft')} className="h-8 w-8 p-0">
                <AlignLeft className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Centralizar" onClick={() => formatText('justifyCenter')} className="h-8 w-8 p-0">
                <AlignCenter className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Alinhar à direita" onClick={() => formatText('justifyRight')} className="h-8 w-8 p-0">
                <AlignRight className="h-3 w-3" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Cor de destaque">
                  <Highlighter className="h-3 w-3" style={{color: highlightColor}} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-5 gap-1">
                  {["#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#A52A2A", "#FFC0CB", "#90EE90", "#ADD8E6", "#F5F5DC", "#E6E6FA"].map(color => (
                    <Button 
                      key={color}
                      variant="outline" 
                      className="w-8 h-8 p-0" 
                      style={{backgroundColor: color}}
                      onClick={() => applyHighlight(color)}
                    />
                  ))}
                </div>
                <div className="mt-1">
                  <Input 
                    type="color" 
                    value={highlightColor} 
                    onChange={(e) => applyHighlight(e.target.value)}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div
            ref={editorRef}
            className="min-h-[150px] border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              color: fontColor,
              lineHeight: String(lineHeight),
              letterSpacing: `${letterSpacing}px`,
              marginTop: `${marginTop}px`,
              backgroundColor: "transparent"
            }}
          />
        </TabsContent>
        
        <TabsContent value="style" className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Tamanho ({fontSize}px)</Label>
              <Slider
                value={[fontSize]}
                min={10}
                max={80}
                step={1}
                onValueChange={handleFontSizeChange}
                className="py-1"
              />
            </div>
            
            <div>
              <Label className="text-xs">Altura da linha ({lineHeight})</Label>
              <Slider
                value={[lineHeight]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={handleLineHeightChange}
                className="py-1"
              />
            </div>
            
            <div>
              <Label className="text-xs">Espacejamento ({letterSpacing}px)</Label>
              <Slider
                value={[letterSpacing]}
                min={0}
                max={10}
                step={0.5}
                onValueChange={handleLetterSpacingChange}
                className="py-1"
              />
            </div>
            
            <div>
              <Label className="text-xs">Margem superior ({marginTop}px)</Label>
              <Slider
                value={[marginTop]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleMarginTopChange}
                className="py-1"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="background" className="space-y-2 pt-1">
          <Label className="text-xs">Cor de fundo</Label>
          <div className="grid grid-cols-5 gap-1 mt-1">
            {BACKGROUND_COLORS.map(color => (
              <Button 
                key={color}
                variant="outline" 
                className={`w-8 h-8 p-0 ${backgroundColor === color ? 'ring-2 ring-violet-500' : ''}`}
                style={{backgroundColor: color}}
                onClick={() => handleBackgroundColorChange(color)}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-1 mt-2">
            <Input 
              type="color" 
              value={backgroundColor} 
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-10 h-8 p-0"
            />
            <Input 
              type="text" 
              value={backgroundColor} 
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="flex-1 h-8"
            />
          </div>
          
          <div className="mt-2">
            <Label className="text-xs">Opacidade ({Math.round(backgroundOpacity * 100)}%)</Label>
            <Slider
              value={[backgroundOpacity]}
              min={0.1}
              max={1}
              step={0.05}
              onValueChange={handleBackgroundOpacityChange}
              className="py-1"
            />
          </div>
          
          <div className="mt-2">
            <Label className="text-xs">Arredondamento ({borderRadius}px)</Label>
            <Slider
              value={[borderRadius]}
              min={0}
              max={32}
              step={1}
              onValueChange={handleBorderRadiusChange}
              className="py-1"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesConfig; 