import React from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { FeatureCardsContent, FeatureCardItem } from "@/utils/types";
import { cn } from "@/lib/utils";

const FeatureCardsRenderer = ({ element, isSelected, onSelect }: ElementRendererProps) => {
  const content = element.content as FeatureCardsContent;
  const cards = content.cards || [];
  const style = content.style || {};
  
  const {
    borderRadius = 8,
    backgroundColor = "#ffffff",
    shadowStrength = 1,
    columnCount = 2,
    padding = 24,
    gap = 24,
    contentAlignment = "center",
    imageSize = 80,
    borderColor = "#e5e7eb",
    showBorder = true,
    titleColor = "#111827",
    subtitleColor = "#6b7280",
    descriptionColor = "#4b5563",
    darkMode = false
  } = style;

  const getShadowClass = (strength: number) => {
    if (strength <= 0) return "shadow-none";
    if (strength === 1) return "shadow-sm";
    if (strength === 2) return "shadow";
    if (strength === 3) return "shadow-md";
    return "shadow-lg";
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case "left": return "text-left items-start";
      case "right": return "text-right items-end";
      default: return "text-center items-center";
    }
  };

  const getGridCols = (cols: number) => {
    // Sempre manter pelo menos 2 colunas, no máximo 4 colunas
    if (cols <= 2) return "grid-cols-2";
    if (cols === 3) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-4";
  };

  const getImageAlignmentClass = (alignment?: string) => {
    switch (alignment) {
      case "left": return "justify-start";
      case "right": return "justify-end";
      case "fill": return "w-full";
      default: return "justify-center";
    }
  };

  const applyDarkMode = darkMode ? {
    backgroundColor: "#1f2937",
    titleColor: "#f9fafb",
    subtitleColor: "#d1d5db",
    descriptionColor: "#9ca3af",
    borderColor: "#374151"
  } : {};

  const containerStyle = {
    borderRadius: `${borderRadius}px`,
    backgroundColor: applyDarkMode.backgroundColor || backgroundColor,
    padding: `${padding}px`,
    gap: `${gap}px`,
  };

  const cardStyle = {
    borderRadius: `${borderRadius}px`,
    borderColor: showBorder ? (applyDarkMode.borderColor || borderColor) : "transparent",
    padding: `${padding}px`,
  };

  const titleStyle = {
    color: applyDarkMode.titleColor || titleColor,
  };

  const subtitleStyle = {
    color: applyDarkMode.subtitleColor || subtitleColor,
  };

  const descriptionStyle = {
    color: applyDarkMode.descriptionColor || descriptionColor,
  };

  // Função para obter o estilo do container da imagem com base no alinhamento
  const getImageContainerStyle = (alignment?: string) => {
    return {
      width: alignment === "fill" ? "100%" : `${imageSize}px`,
      height: alignment === "fill" ? "160px" : `${imageSize}px`,
      overflow: "hidden",
      marginBottom: "16px"
    };
  };

  // Função para obter a classe CSS da imagem com base no alinhamento
  const getImageClass = (alignment?: string) => {
    return alignment === "fill" ? 
      "w-full h-full object-cover" : 
      "w-full h-full object-contain";
  };

  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      )}
      onClick={() => onSelect && onSelect(element.id)}
    >
      {/* Título e descrição principal do componente (opcional) */}
      {(content.title || content.description) && (
        <div className={`w-full mb-6 ${getAlignmentClass(contentAlignment)}`}>
          {content.title && (
            <h2 
              className="text-2xl font-bold mb-2" 
              style={titleStyle}
            >
              {content.title}
            </h2>
          )}
          {content.description && (
            <p 
              className="text-base" 
              style={descriptionStyle}
            >
              {content.description}
            </p>
          )}
        </div>
      )}

      {/* Grid de Feature Cards */}
      <div 
        className={`grid ${getGridCols(columnCount)} gap-${gap >= 16 ? Math.min(Math.floor(gap/4), 8) : 4}`}
        style={containerStyle}
      >
        {cards.map((card: FeatureCardItem) => (
          <div
            key={card.id}
            className={cn(
              "flex flex-col",
              getAlignmentClass(contentAlignment),
              getShadowClass(shadowStrength),
              showBorder ? "border" : ""
            )}
            style={cardStyle}
          >
            {/* Imagem/Ícone */}
            {card.image && (
              <div 
                className={`flex ${getImageAlignmentClass(card.imageAlignment)}`}
                style={getImageContainerStyle(card.imageAlignment)}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className={getImageClass(card.imageAlignment)}
                />
              </div>
            )}

            {/* Título do card */}
            <h3 
              className="text-lg font-semibold mb-1" 
              style={titleStyle}
            >
              {card.title}
            </h3>

            {/* Subtítulo opcional */}
            {card.subtitle && (
              <h4 
                className="text-sm font-medium mb-2"
                style={subtitleStyle}
              >
                {card.subtitle}
              </h4>
            )}

            {/* Descrição do card */}
            <p 
              className="text-sm line-clamp-3"
              style={descriptionStyle}
            >
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCardsRenderer; 