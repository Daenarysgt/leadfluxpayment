import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Play, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo, useState, useEffect, useRef } from "react";
import { getElementMarginStyle } from "./index";

// Componente de renderização de vídeo: suporta YouTube, URLs de vídeo direto, iframes e JavaScript embeds

const VideoRenderer = (props: ElementRendererProps) => {
  const { element, isDragging } = props;
  const { content = {} } = element;
  const [isHovering, setIsHovering] = useState(false);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const jsContainerRef = useRef<HTMLDivElement>(null);
  
  // Verificar se estamos no modo preview (visualização pública)
  const isPreviewMode = !!element.previewMode;
  
  // Detectar se qualquer elemento na página está sendo arrastado
  // Mas apenas se não estivermos no modo preview
  useEffect(() => {
    if (isPreviewMode) return; // Não instalar listeners no modo preview
    
    const handleDragStart = () => setIsDraggingGlobal(true);
    const handleDragEnd = () => {
      setIsDraggingGlobal(false);
      // Reset em um timeout para garantir que estados sejam limpos
      setTimeout(() => setIsDraggingGlobal(false), 100);
    };
    
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, [isPreviewMode]);
  
  // Hook para processar scripts JavaScript
  useEffect(() => {
    if (content.videoType === 'js' && content.embedCode && isPreviewMode) {
      if (!jsContainerRef.current) return;
      
      // Limpar conteúdo anterior
      jsContainerRef.current.innerHTML = '';
      
      // Criar um div para o conteúdo JavaScript
      const container = document.createElement('div');
      container.innerHTML = content.embedCode;
      
      // Processar scripts
      const scripts = container.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Copiar todos os atributos do script original
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copiar o conteúdo interno do script
        newScript.innerHTML = oldScript.innerHTML;
        
        // Substituir o script antigo pelo novo
        if (oldScript.parentNode) {
          jsContainerRef.current?.appendChild(newScript);
        }
      });
      
      // Adicionar o HTML restante
      const htmlContent = container.innerHTML.replace(/<script[\s\S]*?<\/script>/gi, '');
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      jsContainerRef.current?.appendChild(div);
    }
  }, [content.videoType, content.embedCode, isPreviewMode]);
  
  // Determine alignment class based on the content.alignment property
  const alignmentClass = useMemo(() => {
    return content?.alignment ? {
      'left': 'justify-start',
      'center': 'justify-center',
      'right': 'justify-end'
    }[content.alignment] : 'justify-center';
  }, [content?.alignment]);
  
  // Get aspect ratio value based on the content
  const aspectRatio = useMemo(() => {
    const getAspectRatioValue = (ratio?: string) => {
      switch (ratio) {
        case "1:1": return 1;
        case "16:9": return 16/9;
        case "9:16": return 9/16;
        case "4:3": return 4/3;
        case "original": return undefined; // Return undefined for original aspect ratio
        default: return 16/9; // Default to 16:9
      }
    };
    return getAspectRatioValue(content?.aspectRatio);
  }, [content?.aspectRatio]);

  // Get style properties for border and shadow
  const videoContainerStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    
    // Apply border styles
    if (content.borderWidth > 0) {
      style.borderWidth = `${content.borderWidth}px`;
      style.borderStyle = 'solid';
      style.borderColor = content.borderColor || '#000000';
      style.borderRadius = `${content.borderRadius || 0}px`;
    } else if (content.borderRadius > 0) {
      style.borderRadius = `${content.borderRadius}px`;
    }
    
    // Apply shadow
    if (content.shadowEnabled) {
      const offsetX = content.shadowOffsetX || 0;
      const offsetY = content.shadowOffsetY || 5;
      const blur = content.shadowBlur || 10;
      const color = content.shadowColor || 'rgba(0, 0, 0, 0.3)';
      style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    }
    
    return style;
  }, [
    content.borderWidth,
    content.borderColor,
    content.borderRadius,
    content.shadowEnabled,
    content.shadowOffsetX,
    content.shadowOffsetY,
    content.shadowBlur,
    content.shadowColor
  ]);

  // Detect YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url);
  };

  // Create YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    // youtu.be format
    if (url.includes('youtu.be')) {
      videoId = url.split('/').pop() || '';
    } 
    // youtube.com format
    else if (url.includes('youtube.com')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    }
    
    if (!videoId) return '';

    let embedUrl = `https://www.youtube.com/embed/${videoId}`;
    
    // Add parameters for autoplay, muted, controls, loop
    const params = new URLSearchParams();
    if (content.autoPlay) params.append('autoplay', '1');
    if (content.muted) params.append('mute', '1');
    if (!content.controls) params.append('controls', '0');
    if (content.loop) params.append('loop', '1');
    
    if (params.toString()) {
      embedUrl += `?${params.toString()}`;
    }
    
    return embedUrl;
  };

  // Função para renderizar o vídeo no modo preview (sem bloqueios)
  const renderPreviewVideo = () => {
    const { videoUrl, videoType, embedCode } = content;

    if (!videoUrl && !embedCode) {
      return (
        <div className="h-40 w-full flex flex-col items-center justify-center bg-gray-100 rounded-md">
          <VideoIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Vídeo não configurado</p>
        </div>
      );
    }

    // Para URLs de vídeo (mp4, webm, etc.)
    if (videoType === 'url') {
      // Tratamento especial para URLs do YouTube
      if (isYouTubeUrl(videoUrl)) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        return (
          <div className="w-full h-full overflow-hidden" style={videoContainerStyle}>
            <iframe 
              src={embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }

      // URLs de vídeo regulares
      return (
        <div className="w-full h-full overflow-hidden" style={videoContainerStyle}>
          <video 
            src={videoUrl}
            className="w-full h-full"
            controls={content.controls !== false}
            autoPlay={content.autoPlay || false}
            muted={content.muted || false}
            loop={content.loop || false}
            playsInline
          />
        </div>
      );
    }
    
    // Para embeds iframe
    if (videoType === 'iframe') {
      const iframeContent = embedCode || `<iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%;"></iframe>`;
      
      return (
        <div className="w-full h-full overflow-hidden" style={videoContainerStyle}>
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: iframeContent }}
          />
        </div>
      );
    }
    
    // Para embeds JavaScript
    if (videoType === 'js' && embedCode) {
      return (
        <div 
          ref={jsContainerRef}
          className="w-full h-full overflow-hidden"
          style={{
            ...videoContainerStyle,
            minHeight: '300px',
            display: 'block',
            position: 'relative'
          }}
        />
      );
    }
    
    // Fallback
    return (
      <div className="h-40 w-full flex items-center justify-center bg-gray-100 rounded-md">
        <VideoIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  };

  // Função para renderizar o vídeo no modo de edição (com bloqueios)
  const renderEditorVideo = () => {
    const { videoUrl, videoType, embedCode } = content;
    const shouldBlockInteraction = isDragging || isDraggingGlobal || isHovering;

    if (!videoUrl && !embedCode) {
      return (
        <div className="h-40 w-full flex flex-col items-center justify-center bg-gray-100 rounded-md">
          <VideoIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Adicione um URL de vídeo</p>
        </div>
      );
    }

    // Para URLs de vídeo (mp4, webm, etc.)
    if (videoType === 'url') {
      // Tratamento especial para URLs do YouTube
      if (isYouTubeUrl(videoUrl)) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        return (
          <div className="relative w-full h-full overflow-hidden" style={videoContainerStyle}>
            <div className={cn(
              "w-full h-full",
              shouldBlockInteraction && "pointer-events-none"
            )}>
              <iframe 
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: shouldBlockInteraction ? 'none' : 'auto' }}
              ></iframe>
            </div>
            
            {/* Overlay para bloquear eventos de mouse durante drag & hover */}
            <div 
              className={cn(
                "absolute inset-0 transition-opacity duration-200 z-50",
                shouldBlockInteraction ? "bg-black/10" : "pointer-events-none opacity-0"
              )}
            />
          </div>
        );
      }

      // URLs de vídeo regulares
      return (
        <div className="relative w-full h-full overflow-hidden" style={videoContainerStyle}>
          <div className={cn(
            "w-full h-full",
            shouldBlockInteraction && "pointer-events-none"
          )}>
            <video 
              src={videoUrl}
              className="w-full h-full"
              controls={content.controls !== false}
              autoPlay={content.autoPlay || false}
              muted={content.muted || false}
              loop={content.loop || false}
              playsInline
              style={{ pointerEvents: shouldBlockInteraction ? 'none' : 'auto' }}
            />
          </div>
          
          {/* Overlay para bloquear eventos de mouse durante drag & hover */}
          <div 
            className={cn(
              "absolute inset-0 transition-opacity duration-200 z-50",
              shouldBlockInteraction ? "bg-black/10" : "pointer-events-none opacity-0"
            )}
          />
        </div>
      );
    }
    
    // Para embeds iframe
    if (videoType === 'iframe') {
      const iframeContent = embedCode || `<iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%;"></iframe>`;
      
      return (
        <div className="relative w-full h-full overflow-hidden" style={videoContainerStyle}>
          <div 
            className={cn(
              "w-full h-full",
              shouldBlockInteraction && "pointer-events-none"
            )}
            dangerouslySetInnerHTML={{ __html: iframeContent }}
          />
          
          {/* Overlay para bloquear eventos de mouse durante drag & hover */}
          <div 
            className={cn(
              "absolute inset-0 transition-opacity duration-200 z-50",
              shouldBlockInteraction ? "bg-black/10" : "pointer-events-none opacity-0"
            )}
          />
        </div>
      );
    }
    
    // Para embeds JavaScript (apenas um placeholder no editor)
    if (videoType === 'js') {
      return (
        <div 
          className="h-full w-full flex flex-col items-center justify-center bg-gray-100"
          style={{
            ...videoContainerStyle,
            minHeight: '300px'
          }}
        >
          <Play className="h-12 w-12 text-gray-600 mb-2" />
          <p className="text-sm font-medium">Embed de vídeo com JavaScript</p>
          <p className="text-xs text-gray-500 mt-1">Será carregado na visualização final</p>
        </div>
      );
    }
    
    // Fallback
    return (
      <div className="h-40 w-full flex items-center justify-center bg-gray-100 rounded-md">
        <VideoIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  };
  
  // Escolher o renderizador baseado no modo
  const renderVideo = isPreviewMode ? renderPreviewVideo : renderEditorVideo;
  
  // Componente para modo de visualização (sem wrappers extras)
  if (isPreviewMode) {
    return (
      <BaseElementRenderer {...props}>
        <div 
          className={cn(
            "relative w-full flex items-center", 
            alignmentClass
          )}
        >
          {aspectRatio ? (
            <div className="w-full max-w-full">
              <AspectRatio ratio={aspectRatio}>
                {renderPreviewVideo()}
              </AspectRatio>
            </div>
          ) : (
            <div className="w-full">
              {renderPreviewVideo()}
            </div>
          )}
        </div>
        {content.title && <p className="text-center mt-2 text-sm">{content.title}</p>}
      </BaseElementRenderer>
    );
  }
  
  // Componente para modo de edição (com wrappers e proteções)
  return (
    <BaseElementRenderer {...props}>
      <div className="w-full" style={getElementMarginStyle(content)}>
        <div 
          className={cn(
            "relative w-full flex items-center", 
            alignmentClass,
            "video-renderer-container"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          draggable={false}
        >
          <div className={cn(
            "w-full relative",
            isDragging && "pointer-events-none",
            isDraggingGlobal && "pointer-events-none"
          )}>
            {aspectRatio ? (
              <div className="w-full max-w-full">
                <AspectRatio ratio={aspectRatio}>
                  {renderEditorVideo()}
                </AspectRatio>
              </div>
            ) : (
              <div className="w-full">
                {renderEditorVideo()}
              </div>
            )}
            
            {/* Camada extra para capturar eventos de hover e bloqueio */}
            <div 
              className={cn(
                "absolute inset-0",
                (isDragging || isDraggingGlobal) ? "z-50" : ""
              )}
              style={{
                background: 'transparent',
                cursor: 'default'
              }}
            />
          </div>
        </div>
        {content.title && <p className="text-center mt-2 text-sm">{content.title}</p>}
      </div>
    </BaseElementRenderer>
  );
};

export default VideoRenderer; 