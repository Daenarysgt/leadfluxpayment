import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";
import { getElementMarginStyle } from "./index";

const TextRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  const renderFormattedText = () => {
    // Se existir texto formatado em HTML, renderizamos ele diretamente
    if (element.content?.formattedText) {
      // Estilo personalizado para preservar cores e formatações
      const customStyles = `
        .text-content > div { 
          background-color: transparent !important;
        }
        .text-content > p { 
          background-color: transparent !important;
        }
        .text-content font[style*="background-color"] { 
          background-color: inherit !important;
          padding: 0 2px;
        }
      `;
      
      return (
        <>
          <style>{customStyles}</style>
          <div 
            className="prose max-w-none text-content"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize}px` : undefined,
              color: element.content?.fontColor
            }}
            dangerouslySetInnerHTML={{ __html: element.content.formattedText }} 
          />
        </>
      );
    }
    
    // Fallback para o estilo antigo se não tiver texto formatado
    return (
      <>
        <h2 
          className="text-xl font-semibold text-center"
          style={{
            fontSize: element.content?.fontSize ? `${element.content.fontSize}px` : undefined,
            color: element.content?.fontColor
          }}
        >
          {element.content?.title || "Título aqui"}
        </h2>
        {element.content?.description && (
          <p 
            className="text-gray-600 text-center mt-2"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize - 4}px` : undefined,
              color: element.content?.fontColor
            }}
          >
            {element.content.description}
          </p>
        )}
      </>
    );
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={getElementMarginStyle(element.content)}>
        {renderFormattedText()}
      </div>
    </BaseElementRenderer>
  );
};

export default TextRenderer;
