import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Play, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo, useState, useEffect } from "react";

// Componente de renderização de vídeo: suporta YouTube, URLs de vídeo direto, iframes e JavaScript embeds

const VideoRenderer = (props: ElementRendererProps) => {
  const { element, isDragging } = props;
  const { content = {} } = element;
  const [isHovering, setIsHovering] = useState(false);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  
  // Detectar se qualquer elemento na página está sendo arrastado
  useEffect(() => {
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
  }, []);
  
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

  // Verificar se deve bloquear interações com o vídeo
  const shouldBlockInteraction = isDragging || isDraggingGlobal || isHovering;
  
  // Verificar se estamos no modo de visualização pública ou preview
  const isPreviewMode = element.previewMode === true;

  // No modo de preview/public, não devemos bloquear a interação
  const effectiveBlockInteraction = isPreviewMode ? false : shouldBlockInteraction;

  // Render based on video type (url, iframe, js)
  const renderVideo = () => {
    const { videoUrl, videoType } = content;

    if (!videoUrl) {
      return (
        <div className="h-40 w-full flex flex-col items-center justify-center bg-gray-100 rounded-md">
          <VideoIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Adicione um URL de vídeo</p>
        </div>
      );
    }

    // For standard video URLs (mp4, webm, etc.)
    if (videoType === 'url') {
      // Handle YouTube URLs specially
      if (isYouTubeUrl(videoUrl)) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        return (
          <div className="relative w-full h-full overflow-hidden">
            <div className={cn(
              "w-full h-full",
              effectiveBlockInteraction && "pointer-events-none"
            )}>
              <iframe 
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: effectiveBlockInteraction ? 'none' : 'auto' }}
              ></iframe>
            </div>
            
            {/* Overlay para bloquear eventos de mouse durante drag & hover - agora com z-index alto */}
            <div 
              className={cn(
                "absolute inset-0 transition-opacity duration-200 z-50",
                effectiveBlockInteraction ? "bg-black/10" : "pointer-events-none opacity-0"
              )}
            />
          </div>
        );
      }

      // Regular video file URL
      return (
        <div className="relative w-full h-full overflow-hidden">
          <div className={cn(
            "w-full h-full",
            effectiveBlockInteraction && "pointer-events-none"
          )}>
            <video 
              src={videoUrl}
              className="w-full h-full"
              controls={content.controls !== false}
              autoPlay={content.autoPlay || false}
              muted={content.muted || false}
              loop={content.loop || false}
              playsInline
              style={{ pointerEvents: effectiveBlockInteraction ? 'none' : 'auto' }}
            />
          </div>
          
          {/* Overlay para bloquear eventos de mouse durante drag & hover */}
          <div 
            className={cn(
              "absolute inset-0 transition-opacity duration-200 z-50",
              effectiveBlockInteraction ? "bg-black/10" : "pointer-events-none opacity-0"
            )}
          />
        </div>
      );
    }
    
    // For iframe embeds
    if (videoType === 'iframe') {
      return (
        <div className="relative w-full h-full overflow-hidden">
          <div className={cn(
            "w-full h-full",
            effectiveBlockInteraction && "pointer-events-none"
          )}>
            <iframe 
              src={videoUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: effectiveBlockInteraction ? 'none' : 'auto' }}
            ></iframe>
          </div>
          
          {/* Overlay para bloquear eventos de mouse durante drag & hover */}
          <div 
            className={cn(
              "absolute inset-0 transition-opacity duration-200 z-50",
              effectiveBlockInteraction ? "bg-black/10" : "pointer-events-none opacity-0"
            )}
          />
        </div>
      );
    }
    
    // For JavaScript embeds (just show a preview placeholder in builder)
    if (videoType === 'js') {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
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
  
  return (
    <BaseElementRenderer {...props}>
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
          isDragging && "pointer-events-none", // Desabilitar interação com o vídeo durante drag
          isDraggingGlobal && "pointer-events-none" // Também desabilitar quando qualquer elemento estiver sendo arrastado
        )}>
          {aspectRatio ? (
            <div className="w-full max-w-full">
              <AspectRatio ratio={aspectRatio}>
                {renderVideo()}
              </AspectRatio>
            </div>
          ) : (
            <div className="w-full">
              {renderVideo()}
            </div>
          )}
          
          {/* Camada extra para capturar eventos de hover e bloqueio */}
          <div 
            className={cn(
              "absolute inset-0",
              (isDragging || isDraggingGlobal) && !isPreviewMode ? "z-50" : ""
            )}
            style={{
              background: 'transparent',
              cursor: 'default'
            }}
          />
        </div>
      </div>
      {content.title && <p className="text-center mt-2 text-sm">{content.title}</p>}
    </BaseElementRenderer>
  );
};

export default VideoRenderer; 