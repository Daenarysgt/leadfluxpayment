import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";

const NotesRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  const renderFormattedText = () => {
    // Se existir texto formatado em HTML, renderizamos ele diretamente
    if (element.content?.formattedText) {
      // Estilo personalizado para preservar cores e formatações
      const customStyles = `
        .notes-content > div { 
          background-color: transparent !important;
        }
        .notes-content > p { 
          background-color: transparent !important;
        }
        .notes-content font[style*="background-color"] { 
          background-color: inherit !important;
          padding: 0 2px;
        }
      `;
      
      return (
        <>
          <style>{customStyles}</style>
          <div 
            className="prose max-w-none notes-content"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize}px` : undefined,
              color: element.content?.fontColor,
              fontFamily: element.content?.fontFamily || 'Inter',
              lineHeight: element.content?.lineHeight !== undefined ? String(element.content.lineHeight) : undefined,
              letterSpacing: element.content?.letterSpacing !== undefined ? `${element.content.letterSpacing}px` : undefined
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
            color: element.content?.fontColor,
            fontFamily: element.content?.fontFamily || 'Inter',
            lineHeight: element.content?.lineHeight !== undefined ? String(element.content.lineHeight) : undefined,
            letterSpacing: element.content?.letterSpacing !== undefined ? `${element.content.letterSpacing}px` : undefined
          }}
        >
          {element.content?.title || "Nota"}
        </h2>
        {element.content?.description && (
          <p 
            className="text-gray-600 text-center mt-2"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize - 4}px` : undefined,
              color: element.content?.fontColor,
              fontFamily: element.content?.fontFamily || 'Inter',
              lineHeight: element.content?.lineHeight !== undefined ? String(element.content.lineHeight) : undefined,
              letterSpacing: element.content?.letterSpacing !== undefined ? `${element.content.letterSpacing}px` : undefined
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
    backgroundColor: element.content?.backgroundColor || '#F9F5FF',
    borderRadius: element.content?.borderRadius ? `${element.content.borderRadius}px` : '8px'
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {renderFormattedText()}
      </div>
    </BaseElementRenderer>
  );
};

export default NotesRenderer; 