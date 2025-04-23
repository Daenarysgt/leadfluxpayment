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
  
  // Estilos para títulos, respostas e ícones
  const getTitleStyle = (item: any) => ({
    color: item.titleColor || content?.defaultTitleColor || "#000000",
    fontWeight: item.titleBold ? "bold" : "normal",
    fontStyle: item.titleItalic ? "italic" : "normal",
    fontSize: `${item.titleSize || content?.defaultTitleSize || 16}px`,
  });
  
  const getContentStyle = (item: any) => ({
    color: item.contentColor || content?.defaultContentColor || "#666666",
    fontSize: `${item.contentSize || content?.defaultContentSize || 14}px`,
    lineHeight: 1.5
  });
  
  // Função para obter estilos de borda e fundo para itens
  const getItemContainerStyle = (item: any) => ({
    backgroundColor: item.backgroundColor || content?.defaultBackgroundColor || (content?.displayStyle === "faq" ? "transparent" : "#f9fafb"),
    borderColor: item.borderColor || content?.defaultBorderColor || "#e5e7eb",
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
  
  // Função para renderizar um ícone baseado em se o item está expandido ou não
  const renderIcon = (index: number) => {
    const isExpanded = expandedItems[index];
    const activeColor = content?.activeIconColor || "#3b82f6"; // Azul padrão quando expandido
    const inactiveColor = content?.inactiveIconColor || "#64748b"; // Cinza padrão quando não expandido
    
    return isExpanded ? (
      <ChevronUp color={activeColor} size={20} />
    ) : (
      <ChevronDown color={inactiveColor} size={20} />
    );
  };
  
  // Manipulador de clique específico para o ícone
  const handleIconClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Impede a propagação do evento
    toggleItem(index);
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div 
        className="w-full space-y-2"
        style={containerStyle}
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
            className={cn(
              "border rounded-md overflow-hidden",
              content?.displayStyle === "faq" ? "border-gray-200" : ""
            )}
            style={getItemContainerStyle(item)}
          >
            {/* Cabeçalho do item (sempre visível) */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer relative"
              onClick={() => toggleItem(index)}
            >
              <h4 style={getTitleStyle(item)}>
                {item.title || `Item ${index + 1}`}
              </h4>
              {/* Wrapper para o ícone com z-index elevado */}
              <div 
                className="relative z-10 cursor-pointer" 
                onClick={(e) => handleIconClick(e, index)}
              >
                {renderIcon(index)}
              </div>
            </div>
            
            {/* Conteúdo do item (visível apenas quando expandido) */}
            {expandedItems[index] && (
              <div 
                className={cn(
                  "p-4 transition-all duration-200",
                  content?.displayStyle === "faq" ? "border-t" : ""
                )}
                style={getContentStyle(item)}
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