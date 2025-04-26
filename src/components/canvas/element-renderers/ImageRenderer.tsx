import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo, useState, useEffect, useRef } from "react";

// Cache global para imagens já carregadas
const imageCache: Record<string, boolean> = {};

const ImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  
  // Carregamento de imagem com efeito
  useEffect(() => {
    if (!content?.imageUrl) {
      setIsLoading(false);
      setSrc(null);
      return;
    }
    
    const imageUrl = content.imageUrl;
    
    // Se a URL é a mesma da anterior, não precisamos recarregar
    if (imageUrlRef.current === imageUrl && src) {
      setIsLoading(false);
      return;
    }
    
    // Verificar se a imagem já foi carregada anteriormente (cache)
    if (imageCache[imageUrl]) {
      // Se já carregamos esta imagem antes, definimos o src diretamente sem mostrar loading
      setSrc(imageUrl);
      setIsLoading(false);
      imageUrlRef.current = imageUrl;
      return;
    }
    
    // Para novas imagens, verificamos se já estão no cache do navegador
    // tentando carregar a imagem de forma síncrona primeiro
    const img = new Image();
    img.src = imageUrl;
    
    if (img.complete) {
      // A imagem já está no cache do navegador
      setSrc(imageUrl);
      setIsLoading(false);
      imageCache[imageUrl] = true;
      imageUrlRef.current = imageUrl;
      return;
    }
    
    // Apenas mostrar loading para novas imagens que não estão em nenhum cache
    setIsLoading(true);
    setIsError(false);
    
    // Carregar a imagem em segundo plano
    img.onload = () => {
      setSrc(imageUrl);
      setIsLoading(false);
      // Adicionar ao cache para carregamentos futuros
      imageCache[imageUrl] = true;
      imageUrlRef.current = imageUrl;
    };
    
    img.onerror = () => {
      console.error("ImageRenderer - Erro ao carregar imagem:", imageUrl);
      setIsError(true);
      setIsLoading(false);
    };
    
    return () => {
      // Cancelar carregamento da imagem no cleanup
      if (img) {
        img.onload = null;
        img.onerror = null;
      }
    };
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
    width: content?.width ? `${content.width}px` : 'auto',
  };
  
  // Usar um espaço reservado invisível em vez de um skeleton
  // Isso mantém a altura consistente mas não mostra o skeleton
  const placeholderStyle = {
    height: content?.height ? `${content.height}px` : '150px',
    width: '100%',
    borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined,
    // Tornar o placeholder invisível, mas manter o espaço
    opacity: 0
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className={cn("relative w-full flex items-center", alignmentClass)} style={containerStyle}>
        {content?.imageUrl ? (
          <>
            {/* Estado de carregamento - usar placeholder invisível em vez de skeleton */}
            {isLoading && !src && (
              <div style={placeholderStyle}></div>
            )}
            
            {/* Imagem com erro */}
            {isError && !isLoading && (
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
            
            {/* Imagem carregada ou em cache - mostrar imediatamente */}
            {!isError && (src || imageCache[content.imageUrl]) && (
              <>
                {/* Se for um GIF animado, evitar usar AspectRatio para não quebrar a animação */}
                {content?.isAnimatedGif ? (
                  <img 
                    src={src || content.imageUrl} 
                    alt={content.altText || "Imagem"}
                    className="max-w-full object-contain"
                    style={imageStyle}
                  />
                ) : content?.aspectRatio && content.aspectRatio !== "original" && aspectRatio ? (
                  <div 
                    className="w-full max-w-full" 
                    style={{ 
                      borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                    }}
                  >
                    <AspectRatio ratio={aspectRatio}>
                      <img 
                        src={src || content.imageUrl} 
                        alt={content.altText || "Imagem"} 
                        className="w-full h-full object-cover"
                        style={{ 
                          borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                        }}
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <img 
                    src={src || content.imageUrl} 
                    alt={content.altText || "Imagem"} 
                    className="max-w-full object-contain"
                    style={imageStyle}
                  />
                )}
              </>
            )}
          </>
        ) : (
          // Fallback quando não há URL de imagem (sem animação/skeleton)
          <div className="h-40 w-full flex items-center justify-center bg-gray-50" style={{ borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined }}>
            <ImageIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default ImageRenderer;
