import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { getElementMarginStyle } from "./index";

const ImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content = {} } = element;
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={getElementMarginStyle(content)}>
        {content?.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={content.imageUrl} 
              alt={content.alt || 'Image'}
              className="w-full h-auto object-cover"
              style={{
                maxHeight: content.maxHeight ? `${content.maxHeight}px` : undefined,
                borderRadius: content.borderRadius ? `${content.borderRadius}px` : undefined,
                border: content.border ? `${content.borderWidth || 1}px ${content.borderStyle || 'solid'} ${content.borderColor || '#e2e8f0'}` : undefined,
                boxShadow: content.shadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : undefined
              }}
            />
            {content.caption && (
              <div className="text-sm text-gray-500 text-center mt-2">
                {content.caption}
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 bg-gray-100 flex items-center justify-center rounded-lg">
            <span className="text-gray-400">Selecione uma imagem</span>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default ImageRenderer;
