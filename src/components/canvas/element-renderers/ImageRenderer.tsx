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
  // Começar com isLoading como false para evitar skeleton em todas as situações
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  
  // Verificar se precisamos pular o loading (no modo preview)
  // Usar operador opcional para evitar erro de tipagem
  const skipLoading = (element as any).skipLoading === true || (element as any).previewMode === true;
  
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
    
    // Sempre definir o src imediatamente para evitar estado de loading
    setSrc(imageUrl);
    
    // Se estamos no modo de preview ou se skipLoading é true, nunca mostrar loading
    if (skipLoading) {
      setIsLoading(false);
      imageCache[imageUrl] = true;
      imageUrlRef.current = imageUrl;
      return;
    }
    
    // Verificar se a imagem já foi carregada anteriormente (cache)
    if (imageCache[imageUrl]) {
      // Se já carregamos esta imagem antes, definimos o src diretamente sem mostrar loading
      setIsLoading(false);
      imageUrlRef.current = imageUrl;
      return;
    }
    
    // Para novas imagens, verificamos se já estão no cache do navegador
    const img = new Image();
    img.src = imageUrl;
    
    if (img.complete) {
      // A imagem já está no cache do navegador
      setIsLoading(false);
      imageCache[imageUrl] = true;
      imageUrlRef.current = imageUrl;
      return;
    }
    
    // Apenas mostrar loading para novas imagens se não estivermos no modo de preview
    if (!(element as any).previewMode) {
      setIsLoading(true);
    }
    
    setIsError(false);
    
    // Carregar a imagem em segundo plano
    img.onload = () => {
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
  }, [content?.imageUrl, src, skipLoading, element]);
  
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
    opacity: 1, // Sempre visible
  };
  
  // Usar um espaço reservado invisível em vez de um skeleton
  const placeholderStyle = {
    height: content?.height ? `${content.height}px` : '150px',
    width: '100%',
    borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined,
    // Tornar o placeholder invisível, mas manter o espaço
    opacity: 0
  };
  
  // Sempre usar a URL da imagem diretamente para evitar loading
  const imageUrl = content?.imageUrl || '';
  
  return (
    <BaseElementRenderer {...props}>
      <div className={cn("relative w-full flex items-center", alignmentClass)} style={containerStyle}>
        {imageUrl ? (
          <>
            {/* Nunca mostrar estado de carregamento no modo preview */}
            {isLoading && !skipLoading && (
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
            
            {/* Imagem - sempre mostrar diretamente no modo preview */}
            {!isError && (
              <>
                {/* Se for um GIF animado, evitar usar AspectRatio */}
                {content?.isAnimatedGif ? (
                  <img 
                    src={imageUrl} 
                    alt={content?.altText || "Imagem"}
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
                        src={imageUrl} 
                        alt={content?.altText || "Imagem"} 
                        className="w-full h-full object-cover"
                        style={{ 
                          borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined
                        }}
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <img 
                    src={imageUrl} 
                    alt={content?.altText || "Imagem"} 
                    className="max-w-full object-contain"
                    style={imageStyle}
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
