import { CanvasElement } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ElementRendererProps } from "@/types/canvasTypes";

const TextRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  
  const renderFormattedText = () => {
    // Se existir texto formatado em HTML, renderizamos ele diretamente
    if (element.content?.formattedText) {
      // Estilo personalizado para preservar cores, formatações e EXATAMENTE os espaçamentos
      const customStyles = `
        .text-content {
          display: block;
          width: 100%;
        }
        .text-content > div { 
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: inherit !important;
        }
        .text-content > p { 
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: inherit !important;
        }
        .text-content font[style*="background-color"] { 
          background-color: inherit !important;
          padding: 0 2px;
        }
        
        /* Preservar espaçamento vertical exato entre elementos */
        .text-content * {
          line-height: normal !important;
        }
        
        /* Garantir que quebras de linha sejam respeitadas exatamente */
        .text-content br {
          display: block !important;
          content: "" !important;
          margin-top: 0.5em !important;
        }
        
        /* Preservar margens originais de parágrafos exatamente como no editor */
        .text-content p {
          margin-block-start: 1em !important;
          margin-block-end: 1em !important;
        }
        
        /* Preservar a margem entre todos os elementos */
        .text-content > *:not(:first-child) {
          margin-top: 0.5em !important;
        }
      `;
      
      return (
        <>
          <style>{customStyles}</style>
          <div 
            className="prose max-w-none text-content exact-formatting"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize}px` : undefined,
              color: element.content?.fontColor,
              lineHeight: "normal", // Garantir line-height consistente
              display: "block", // Garantir display block consistente
              width: "100%", // Garantir largura total
            }}
            dangerouslySetInnerHTML={{ 
              __html: element.content.formattedText 
            }} 
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
            lineHeight: "normal", // Garantir line-height consistente
            margin: "0",
            padding: "0"
          }}
        >
          {element.content?.title || "Título aqui"}
        </h2>
        {element.content?.description && (
          <p 
            className="text-gray-600 text-center"
            style={{
              fontSize: element.content?.fontSize ? `${element.content.fontSize - 4}px` : undefined,
              color: element.content?.fontColor,
              marginTop: "0.5em", // Margem fixa acima
              lineHeight: "normal", // Garantir line-height consistente
              padding: "0"
            }}
          >
            {element.content.description}
          </p>
        )}
      </>
    );
  };
  
  // Calcular o estilo para margem superior
  const marginTopValue = element.content?.marginTop ? element.content.marginTop : 0;
  
  // Aplicar a margem superior como uma propriedade CSS personalizada para evitar sobrescritas
  const containerStyle = {
    '--element-margin-top': `${marginTopValue}px`,
  } as React.CSSProperties;
  
  // Adicionamos uma classe especial que aplica a margem usando a variável CSS
  // Removendo padding para garantir que os espaçamentos sejam exatamente como no editor
  return (
    <BaseElementRenderer {...props}>
      <div className="preserve-margin-top exact-spacing" style={containerStyle}>
        {renderFormattedText()}
      </div>
    </BaseElementRenderer>
  );
};

export default TextRenderer;
