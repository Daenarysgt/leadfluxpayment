import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo, useState, useEffect } from "react";

const ImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  // Carregamento de imagem com efeito
  useEffect(() => {
    if (!content?.imageUrl) {
      setIsLoading(false);
      return;
    }
    
    // Reset state quando a URL mudar
    setIsLoading(true);
    setIsError(false);
    
    // Tempo limite para o carregamento da imagem
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("ImageRenderer - Tempo limite de carregamento excedido:", content.imageUrl);
      }
    }, 5000); // 5 segundos de tempo limite
    
    // Carregar a imagem em segundo plano
    const img = new Image();
    
    img.onload = () => {
      setSrc(content.imageUrl);
      setIsLoading(false);
      clearTimeout(timeoutId);
    };
    
    img.onerror = () => {
      console.error("ImageRenderer - Erro ao carregar imagem:", content.imageUrl);
      setIsError(true);
      setIsLoading(false);
      clearTimeout(timeoutId);
    };
    
    img.src = content.imageUrl;
    
    return () => {
      // Limpar o timeout se o componente for desmontado
      clearTimeout(timeoutId);
      // Cancelar carregamento da imagem
      img.src = '';
    };
  }, [content?.imageUrl]);
  
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
    // Para GIFs animados, não aplicamos aspect ratio para manter a animação intacta
    if (content?.isAnimatedGif) {
      return undefined;
    }
    
    const getAspectRatioValue = (ratio?: string) => {
      switch (ratio) {
        case "1:1": return 1;
        case "16:9": return 16/9;
        case "9:16": return 9/16;
        case "4:3": return 4/3;
        case "original": return undefined; // Return undefined for original aspect ratio
        default: return undefined;
      }
    };
    return getAspectRatioValue(content?.aspectRatio);
  }, [content?.aspectRatio, content?.isAnimatedGif]);
  
  // Calcular o estilo para margem superior e bordas arredondadas
  const containerStyle = {
    marginTop: content?.marginTop ? `${content.marginTop}px` : undefined
  };
  
  // Estilo para bordas arredondadas
  const imageStyle = {
    borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined,
    maxHeight: content?.height ? `${content.height}px` : 'auto',
    width: content?.width ? `${content.width}px` : 'auto',
    transition: 'opacity 0.2s ease-in-out',
    opacity: isLoading ? 0 : 1, // Fade in quando a imagem estiver carregada
  };
  
  // Altura do placeholder baseado na altura configurada ou valor padrão
  const placeholderHeight = content?.height ? `${content.height}px` : '150px';
  
  return (
    <BaseElementRenderer {...props}>
      <div className={cn("relative w-full flex items-center", alignmentClass)} style={containerStyle}>
        {content?.imageUrl ? (
          <>
            {/* Estado de carregamento - mostrar esqueleto */}
            {isLoading && (
              <div 
                className="w-full h-full rounded bg-gray-100 animate-pulse flex items-center justify-center"
                style={{ 
                  minHeight: placeholderHeight,
                  borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                }}
              >
                <ImageIcon className="h-8 w-8 text-gray-300" />
              </div>
            )}
            
            {/* Imagem com erro */}
            {isError && !isLoading && (
              <div 
                className="w-full h-full rounded bg-gray-50 border border-gray-200 flex flex-col items-center justify-center"
                style={{ 
                  minHeight: placeholderHeight,
                  borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                }}
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Falha ao carregar imagem</p>
              </div>
            )}
            
            {/* Imagem carregada - mostrar com fade in */}
            {!isError && src && (
              <>
                {/* Se for um GIF animado, evitar usar AspectRatio para não quebrar a animação */}
                {content?.isAnimatedGif ? (
                  <img 
                    src={src} 
                    alt={content.altText || "Imagem"}
                    className="max-w-full object-contain"
                    style={imageStyle}
                  />
                ) : content?.aspectRatio && content.aspectRatio !== "original" && aspectRatio ? (
                  <div 
                    className="w-full max-w-full" 
                    style={{ 
                      borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined,
                      display: isLoading ? 'none' : 'block'
                    }}
                  >
                    <AspectRatio ratio={aspectRatio}>
                      <img 
                        src={src} 
                        alt={content.altText || "Imagem"} 
                        className="w-full h-full object-cover"
                        style={{ 
                          borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined,
                          opacity: isLoading ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <img 
                    src={src} 
                    alt={content.altText || "Imagem"} 
                    className="max-w-full object-contain"
                    style={imageStyle}
                  />
                )}
              </>
            )}
          </>
        ) : (
          // Fallback quando não há URL de imagem
          <div className="h-40 w-full flex items-center justify-center bg-gray-100" style={{ borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined }}>
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default ImageRenderer;
