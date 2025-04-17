import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";

const TextRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  const renderFormattedText = () => {
    // Se existir texto formatado em HTML, renderizamos ele diretamente
    if (element.content?.formattedText) {
      // Estilo personalizado para preservar cores e formatações
      const customStyles = `
        .text-content * { 
          background-color: initial !important;
        }
        .text-content span[style*="background-color"] { 
          background-color: inherit !important; 
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
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: element.content?.marginTop ? `${element.content.marginTop}px` : undefined
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {renderFormattedText()}
      </div>
    </BaseElementRenderer>
  );
};

export default TextRenderer;
