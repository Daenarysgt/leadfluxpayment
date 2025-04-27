import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo, useState, useEffect, useRef } from "react";
import OptimizedImage from "@/components/ui/optimized-image";

// Cache global para imagens já carregadas
const imageCache: Record<string, boolean> = {};

const ImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  const [isError, setIsError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  
  // Verificar se precisamos pular o loading (no modo preview)
  // Usar operador opcional para evitar erro de tipagem
  const skipLoading = (element as any).skipLoading === true || (element as any).previewMode === true;
  const isPriority = skipLoading || (element as any).priority === true;
  
  // Configurar src da imagem
  useEffect(() => {
    if (!content?.imageUrl) {
      setSrc(null);
      return;
    }
    
    const imageUrl = content.imageUrl;
    
    // Se a URL é a mesma da anterior, não precisamos fazer nada
    if (imageUrlRef.current === imageUrl && src) {
      return;
    }
    
    // Definir o src
    setSrc(imageUrl);
    imageUrlRef.current = imageUrl;
    
    // Verificar se a imagem existe (para tratar erros)
    const checkImage = new Image();
    checkImage.onerror = () => {
      console.error("ImageRenderer - Erro ao carregar imagem:", imageUrl);
      setIsError(true);
    };
    checkImage.src = imageUrl;
    
  }, [content?.imageUrl, src]);
  
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
    width: content?.width ? `${content.width}px` : 'auto'
  };
  
  // Sempre usar a URL da imagem diretamente para evitar loading
  const imageUrl = content?.imageUrl || '';
  
  return (
    <BaseElementRenderer {...props}>
      <div className={cn("relative w-full flex items-center", alignmentClass)} style={containerStyle}>
        {imageUrl ? (
          <>
            {/* Imagem com erro */}
            {isError && (
              <div 
                className="w-full h-full rounded bg-gray-50 border border-gray-200 flex flex-col items-center justify-center"
                style={{ 
                  minHeight: content?.height ? `${content.height}px` : '150px',
                  borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                }}
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Falha ao carregar imagem</p>
              </div>
            )}
            
            {/* Imagem otimizada com lazy loading e carregamento progressivo */}
            {!isError && (
              <>
                {/* Se for um GIF animado, evitar usar AspectRatio */}
                {content?.isAnimatedGif ? (
                  <OptimizedImage
                    src={imageUrl}
                    alt={content?.altText || "Imagem"}
                    className="max-w-full"
                    objectFit="contain"
                    priority={isPriority}
                    width={content?.width || '100%'}
                    height={content?.height || 'auto'}
                  />
                ) : content?.aspectRatio && content.aspectRatio !== "original" && aspectRatio ? (
                  <div 
                    className="w-full max-w-full" 
                    style={{ 
                      borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                    }}
                  >
                    <AspectRatio ratio={aspectRatio}>
                      <OptimizedImage 
                        src={imageUrl} 
                        alt={content?.altText || "Imagem"} 
                        className="w-full h-full"
                        objectFit="cover"
                        priority={isPriority}
                        width="100%"
                        height="100%"
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <OptimizedImage
                    src={imageUrl}
                    alt={content?.altText || "Imagem"}
                    className="max-w-full"
                    objectFit="contain"
                    priority={isPriority}
                    width={content?.width || '100%'}
                    height={content?.height || 'auto'}
                  />
                )}
              </>
            )}
          </>
        ) : (
          // Fallback quando não há URL de imagem (sem animação)
          <div 
            className="h-40 w-full flex items-center justify-center bg-gray-50" 
            style={{ 
              borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined,
              opacity: 1
            }}
          >
            <ImageIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default ImageRenderer;
