import React from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Trash2, CopyIcon, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElementWrapperProps {
  element: CanvasElement;
  children: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  index: number;
  totalElements: number;
}

const ElementWrapper: React.FC<ElementWrapperProps> = ({
  element,
  children,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  index,
  totalElements,
}) => {
  // Determinar se o elemento está no modo de visualização
  const isPreviewMode = element.previewMode;

  // Se estiver no modo de visualização, renderize apenas o conteúdo
  if (isPreviewMode) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "relative group w-full mb-2",
        isSelected && "outline outline-2 outline-blue-500 rounded-md"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {children}

      {/* Controles de elemento - visíveis apenas quando selecionado ou em hover */}
      <div
        className={cn(
          "absolute top-0 right-0 flex bg-white border border-gray-200 rounded shadow-sm opacity-0 transition-opacity",
          (isSelected || "hover:opacity-100") && "opacity-100 group-hover:opacity-100"
        )}
      >
        {/* Botão de mover para cima */}
        {onMoveUp && index > 0 && (
          <button
            className="p-1 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(element.id);
            }}
            title="Mover para cima"
          >
            <ChevronUp className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Botão de mover para baixo */}
        {onMoveDown && index < totalElements - 1 && (
          <button
            className="p-1 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(element.id);
            }}
            title="Mover para baixo"
          >
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Botão de duplicar */}
        {onDuplicate && (
          <button
            className="p-1 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(element.id);
            }}
            title="Duplicar elemento"
          >
            <CopyIcon className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Botão de remover */}
        <button
          className="p-1 hover:bg-gray-100 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(element.id);
          }}
          title="Remover elemento"
        >
          <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default ElementWrapper; 