import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";

const TextRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  const renderFormattedText = () => {
    // Se existir texto formatado em HTML, renderizamos ele diretamente
    if (element.content?.formattedText) {
      // Estilo personalizado para preservar os destaques coloridos
      const customStyles = `
        [data-highlight="true"] {
          background-color: attr(style) !important;
        }
        span[style*="background-color:"] {
          background-color: inherit !important;
        }
      `;
      
      return (
        <>
          <style>{customStyles}</style>
          <div 
            className="prose max-w-none bg-transparent"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize}px` : undefined,
              color: element.content?.fontColor,
              backgroundColor: 'transparent', // Forçando fundo transparente
            }}
            data-transparent-text="true"
            dangerouslySetInnerHTML={{ __html: element.content.formattedText }} 
          />
        </>
      );
    }
    
    // Fallback para o estilo antigo se não tiver texto formatado
    return (
      <>
        <h2 
          className="text-xl font-semibold text-center bg-transparent"
          style={{
            fontSize: element.content?.fontSize ? `${element.content.fontSize}px` : undefined,
            color: element.content?.fontColor,
            backgroundColor: 'transparent' // Forçando fundo transparente
          }}
        >
          {element.content?.title || "Título aqui"}
        </h2>
        {element.content?.description && (
          <p 
            className="text-gray-600 text-center mt-2 bg-transparent"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize - 4}px` : undefined,
              color: element.content?.fontColor,
              backgroundColor: 'transparent' // Forçando fundo transparente
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
    marginTop: element.content?.marginTop ? `${element.content.marginTop}px` : undefined,
    backgroundColor: 'transparent' // Forçando fundo transparente no container
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 bg-transparent" style={containerStyle}>
        {renderFormattedText()}
      </div>
    </BaseElementRenderer>
  );
};

export default TextRenderer;
