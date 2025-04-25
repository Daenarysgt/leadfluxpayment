import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";

const NotesRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  // Obter as configurações globais do funil, se disponíveis
  const funnelSettings = element.previewProps?.funnel?.settings || {};
  
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
            className="prose max-w-none notes-content"
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
          {element.content?.title || "Nota"}
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
  
  // Calcular o estilo para margem superior e usar as configurações globais para propriedades de layout
  const borderRadiusValue = element.content?.borderRadius 
    ? element.content.borderRadius 
    : (funnelSettings.borderRadius ? parseInt(funnelSettings.borderRadius) : 8);
    
  const containerStyle = {
    marginTop: element.content?.marginTop ? `${element.content.marginTop}px` : undefined,
    backgroundColor: getBackgroundColorWithOpacity(),
    borderRadius: `${borderRadiusValue}px`
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className={`px-4 ${element.previewMode ? 'pt-0 pb-4' : 'p-4'}`} style={containerStyle}>
        {renderFormattedText()}
      </div>
    </BaseElementRenderer>
  );
};

export default NotesRenderer; 