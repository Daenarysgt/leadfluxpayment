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
  
  // Converter a cor de fundo com opacidade para formato rgba
  const getBackgroundColorWithOpacity = () => {
    const color = element.content?.backgroundColor || '#F9F5FF';
    const opacity = element.content?.backgroundOpacity !== undefined ? element.content.backgroundOpacity : 1;
    
    // Se a cor estiver em formato hexadecimal
    if (color.startsWith('#')) {
      let r = 0, g = 0, b = 0;
      
      // #RGB ou #RGBA
      if (color.length === 4 || color.length === 5) {
        r = parseInt(color[1] + color[1], 16);
        g = parseInt(color[2] + color[2], 16);
        b = parseInt(color[3] + color[3], 16);
      } 
      // #RRGGBB ou #RRGGBBAA
      else if (color.length === 7 || color.length === 9) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
      }
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Se já for em formato rgba, apenas retornar
    if (color.startsWith('rgba')) {
      return color;
    }
    
    // Se for em formato rgb, converter para rgba
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    
    return color;
  };
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: element.content?.marginTop ? `${element.content.marginTop}px` : undefined,
    backgroundColor: getBackgroundColorWithOpacity(),
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