import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";

const TextRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  // Obter as configurações globais do funil, se disponíveis
  const funnelSettings = element.previewProps?.funnel?.settings || {};
  
  // Verificar se estamos em modo de preview
  const isPreviewMode = element.previewMode;
  
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
      
      // Usar configurações específicas do elemento ou cair para as configurações globais
      const fontFamily = element.content?.fontFamily || funnelSettings.fontFamily || 'Inter';
      const fontSize = element.content?.fontSize 
        ? element.content.fontSize 
        : (funnelSettings.bodySize ? parseInt(funnelSettings.bodySize) : 16);
      const fontColor = element.content?.fontColor || undefined;
      const lineHeight = element.content?.lineHeight !== undefined 
        ? element.content.lineHeight 
        : (funnelSettings.lineHeight ? parseFloat(funnelSettings.lineHeight) : 1.5);
      const letterSpacing = element.content?.letterSpacing !== undefined 
        ? element.content.letterSpacing 
        : 0;
        
      // Calcular estilos de texto adicionais com base nas configurações globais
      const fontStyle = funnelSettings.textItalic ? 'italic' : 'normal';
      const fontWeight = funnelSettings.textBold ? 'bold' : 'normal';
      const textDecoration = funnelSettings.textUnderline ? 'underline' : 'none';
      const textTransform = funnelSettings.textUppercase ? 'uppercase' : 'none';
      
      return (
        <>
          <style>{customStyles}</style>
          <div 
            className="prose max-w-none text-content"
            style={{
              fontSize: `${fontSize}px`,
              color: fontColor,
              fontFamily,
              lineHeight: String(lineHeight),
              letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
              fontStyle,
              fontWeight,
              textDecoration,
              textTransform
            }}
            dangerouslySetInnerHTML={{ __html: element.content.formattedText }} 
          />
        </>
      );
    }
    
    // Fallback para o estilo antigo se não tiver texto formatado
    // Usar configurações específicas do elemento ou cair para as configurações globais
    const titleFontFamily = element.content?.fontFamily || funnelSettings.fontFamily || 'Inter';
    const titleFontSize = element.content?.fontSize 
      ? element.content.fontSize 
      : (funnelSettings.headingSize ? parseInt(funnelSettings.headingSize) : 32);
    const bodyFontSize = element.content?.fontSize 
      ? (element.content.fontSize - 4) 
      : (funnelSettings.bodySize ? parseInt(funnelSettings.bodySize) : 16);
    const fontColor = element.content?.fontColor || undefined;
    const lineHeight = element.content?.lineHeight !== undefined 
      ? element.content.lineHeight 
      : (funnelSettings.lineHeight ? parseFloat(funnelSettings.lineHeight) : 1.5);
    const letterSpacing = element.content?.letterSpacing !== undefined 
      ? element.content.letterSpacing 
      : 0;
      
    // Calcular estilos de texto adicionais com base nas configurações globais
    const fontStyle = funnelSettings.textItalic ? 'italic' : 'normal';
    const fontWeight = funnelSettings.textBold ? 'bold' : 'normal';
    const textDecoration = funnelSettings.textUnderline ? 'underline' : 'none';
    const textTransform = funnelSettings.textUppercase ? 'uppercase' : 'none';
    
    return (
      <>
        <h2 
          className="text-xl font-semibold text-center"
          style={{
            fontSize: `${titleFontSize}px`,
            color: fontColor,
            fontFamily: titleFontFamily,
            lineHeight: String(lineHeight),
            letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
            fontStyle,
            fontWeight,
            textDecoration,
            textTransform
          }}
        >
          {element.content?.title || "Título aqui"}
        </h2>
        {element.content?.description && (
          <p 
            className="text-gray-600 text-center mt-2"
            style={{
              fontSize: `${bodyFontSize}px`,
              color: fontColor,
              fontFamily: titleFontFamily,
              lineHeight: String(lineHeight),
              letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
              fontStyle,
              fontWeight,
              textDecoration,
              textTransform
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
