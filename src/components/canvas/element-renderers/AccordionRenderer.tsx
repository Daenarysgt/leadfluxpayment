import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const AccordionRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  // Estado local para controlar quais itens estão expandidos
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  
  // Obter os itens do accordion ou usar um array vazio se não existir
  const items = content?.items || [];
  
  // Estilo do container
  const containerStyle = {
    marginTop: content?.marginTop ? `${content.marginTop}px` : undefined,
  };
  
  // Estilos para títulos
  const getTitleStyle = (item: any) => ({
    color: item.titleColor || "#000000",
    fontWeight: item.titleBold ? "bold" : "normal",
    fontStyle: item.titleItalic ? "italic" : "normal",
    fontSize: `${item.titleSize || 16}px`,
  });
  
  // Estilos para conteúdos
  const getContentStyle = (item: any) => ({
    color: item.contentColor || "#666666",
    fontSize: `${item.contentSize || 14}px`,
    lineHeight: 1.5,
    backgroundColor: item.contentBackgroundColor || "transparent",
  });
  
  // Função para obter estilos de borda e fundo para cabeçalho do item
  const getItemContainerStyle = (item: any) => ({
    backgroundColor: item.backgroundColor || "#f9fafb",
    borderColor: item.borderColor || "#e5e7eb",
    borderRadius: content?.borderRadius ? `${content.borderRadius}px` : "0.375rem",
    overflow: "hidden",
  });
  
  // Função para alternar a expansão de um item
  const toggleItem = (index: number) => {
    // Se não permite múltiplos itens abertos, fechamos todos os outros
    if (!content?.allowMultiple) {
      const newState: Record<number, boolean> = {};
      newState[index] = !expandedItems[index];
      setExpandedItems(newState);
    } else {
      // Se permite múltiplos, apenas alteramos o estado do item clicado
      setExpandedItems(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    }
  };
  
  // Manipulador de clique específico para o ícone
  const handleIconClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Impede a propagação do evento
    toggleItem(index);
  };
  
  // Debug - Log das configurações
  console.log('Accordion content:', content);
  
  return (
    <BaseElementRenderer {...props}>
      <div 
        className="w-full space-y-2"
        style={containerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título do Accordion (opcional) */}
        {content?.title && (
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: content.titleColor || "#000000" }}
          >
            {content.title}
          </h3>
        )}
        
        {/* Itens do Accordion */}
        {items.map((item: any, index: number) => (
          <div 
            key={index} 
            className="border overflow-hidden"
            style={getItemContainerStyle(item)}
          >
            {/* Cabeçalho do item (sempre visível) */}
            <div 
              className="flex items-center justify-between p-3 cursor-pointer border-b"
              onClick={(e) => {
                // Evita que o clique cause seleção do elemento
                e.stopPropagation();
                // Alternância do accordion
                toggleItem(index);
              }}
              role="button"
              aria-expanded={!!expandedItems[index]}
              style={{
                backgroundColor: item.backgroundColor || "#f9fafb",
                borderColor: item.borderColor || "#e5e7eb"
              }}
            >
              <div 
                className="font-medium text-sm"
                style={getTitleStyle(item)}
              >
                {item.title}
              </div>
              <div 
                className="p-2 rounded-full hover:bg-gray-100 transition-all"
                style={{zIndex: 30}} 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(index);
                }}
              >
                {expandedItems[index] ? (
                  <ChevronUp 
                    className="h-4 w-4" 
                    style={{color: content?.corDoIconeExpandido || "#3b82f6"}}
                  />
                ) : (
                  <ChevronDown 
                    className="h-4 w-4" 
                    style={{color: content?.corDoIconeRecolhido || "#64748b"}}
                  />
                )}
              </div>
            </div>
            
            {/* Conteúdo do item (visível apenas quando expandido) */}
            {expandedItems[index] && (
              <div 
                className="p-4 transition-all duration-200"
                style={getContentStyle(item)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="prose max-w-none">
                  {item.content || "Conteúdo do item"}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Mensagem quando não há itens */}
        {items.length === 0 && (
          <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
            Adicione itens ao acordeão nas configurações
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default AccordionRenderer; 