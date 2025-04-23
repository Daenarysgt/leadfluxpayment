import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo } from "react";

const ImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
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
  
  return (
    <BaseElementRenderer {...props}>
      <div className={cn("relative w-full flex items-center", alignmentClass)} style={containerStyle}>
        {content?.imageUrl ? (
          // Se for um GIF animado, evitar usar AspectRatio para não quebrar a animação
          content?.isAnimatedGif ? (
            <img 
              src={content.imageUrl} 
              alt={content.altText || "Imagem"}
              className="max-w-full object-contain"
              style={imageStyle}
            />
          ) : content?.aspectRatio && content.aspectRatio !== "original" && aspectRatio ? (
            <div className="w-full max-w-full" style={{ borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined }}>
              <AspectRatio ratio={aspectRatio}>
                <img 
                  src={content.imageUrl} 
                  alt={content.altText || "Imagem"} 
                  className="w-full h-full object-cover"
                  style={{ borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined }}
                />
              </AspectRatio>
            </div>
          ) : (
            <img 
              src={content.imageUrl} 
              alt={content.altText || "Imagem"} 
              className="max-w-full object-contain"
              style={imageStyle}
            />
          )
        ) : (
          <div className="h-40 w-full flex items-center justify-center bg-gray-100" style={{ borderRadius: content?.borderRadius ? `${content.borderRadius}px` : undefined }}>
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default ImageRenderer;
