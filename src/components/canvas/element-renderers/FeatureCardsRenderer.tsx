import React from 'react';
import { cn } from '@/lib/utils';
import { ElementRendererProps } from "@/types/canvasTypes";
import { FeatureCardsContent } from '@/utils/types';
import BaseElementRenderer from './BaseElementRenderer';

// Definição de classes para sombras
const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg'
};

// Definição de classes para animações
const animationClasses = {
  none: '',
  'fade-in': 'animate-fade-in',
  'slide-up': 'animate-slide-up'
};

const EmptyState = ({ title, description, className }: { title: string; description: string; className?: string }) => (
  <div className={cn("flex flex-col items-center justify-center text-center", className)}>
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <span className="text-2xl">📦</span>
    </div>
    <h3 className="font-medium text-base mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

const FeatureCardsRenderer = (props: ElementRendererProps) => {
  const { element, isSelected, previewMode, onSelect } = props;
  
  // Determinar quando estamos editando (não em modo de preview)
  const isEditing = !previewMode;
  
  // Garantir conteúdo válido
  const content = element.content as FeatureCardsContent || {
    title: '',
    description: '',
    cards: [],
    style: {
      titleAlignment: 'center',
      descriptionAlignment: 'center',
      backgroundColor: '#ffffff',
      cardBackgroundColor: '#ffffff',
      cardTextColor: '#333333',
      cardShadow: 'md',
      cardTitleAlignment: 'center',
      cardDescriptionAlignment: 'center',
      columns: 3,
      gap: 24,
      borderRadius: 8,
      animation: 'fade-in'
    }
  };
  
  // Extrair estilos
  const {
    titleAlignment = 'center',
    descriptionAlignment = 'center',
    backgroundColor = '#ffffff',
    cardBackgroundColor = '#ffffff',
    cardTextColor = '#333333',
    cardShadow = 'md',
    cardTitleAlignment = 'center',
    cardDescriptionAlignment = 'center',
    columns = 3,
    gap = 24,
    borderRadius = 8,
    animation = 'fade-in'
  } = content.style || {};
  
  // Placeholder para quando estiver no modo de edição e não houver cards
  if (isEditing && (!content.cards || content.cards.length === 0)) {
    return (
      <BaseElementRenderer {...props}>
        <div className="w-full p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <EmptyState
            title="Sem cards"
            description="Adicione cards no painel de configuração"
            className="h-48"
          />
        </div>
      </BaseElementRenderer>
    );
  }
  
  // Logging para debug no modo de edição
  if (isEditing) {
    console.log('Rendering FeatureCards with content:', content);
  }
  
  // Determinar o número de colunas baseado na largura e no valor de 'columns'
  // Garantir pelo menos duas colunas
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }[Math.min(Math.max(columns, 1), 4)];

  // Handler para selecionar o elemento
  const handleClick = (e: React.MouseEvent) => {
    if (onSelect && !previewMode) {
      e.stopPropagation();
      onSelect(element.id);
    }
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div
        className={cn("w-full py-8 pb-16", isSelected && "outline-dashed outline-2 outline-blue-500")} 
        style={{ backgroundColor }}
        data-element-id={element.id}
        onClick={handleClick}
      >
        <div className="container mx-auto px-4">
          {content.title && (
            <h2 
              className={cn(
                "text-3xl font-bold mb-3",
                {
                  'text-left': titleAlignment === 'left',
                  'text-center': titleAlignment === 'center',
                  'text-right': titleAlignment === 'right'
                }
              )}
            >
              {content.title}
            </h2>
          )}
          
          {content.description && (
            <p 
              className={cn(
                "text-lg text-gray-600 mb-8",
                {
                  'text-left': descriptionAlignment === 'left',
                  'text-center': descriptionAlignment === 'center',
                  'text-right': descriptionAlignment === 'right'
                }
              )}
            >
              {content.description}
            </p>
          )}
          
          <div 
            className={cn(
              "grid gap-6", 
              colsClass,
              animation && animationClasses[animation]
            )}
            style={{ gap: `${gap}px` }}
          >
            {content.cards?.map((card, index) => (
              <div
                key={card.id || index}
                className={cn(
                  "rounded-lg overflow-hidden flex flex-col",
                  shadowClasses[cardShadow as keyof typeof shadowClasses]
                )}
                style={{ 
                  backgroundColor: cardBackgroundColor,
                  borderRadius: `${borderRadius}px`,
                  color: cardTextColor,
                  maxHeight: '350px', // Reduzindo mais a altura máxima para cards mais quadrados
                  height: 'auto' // Altura automática baseada no conteúdo
                }}
              >
                {card.imageUrl && (
                  <div className="relative w-full h-40 overflow-hidden"> {/* Reduzindo a altura da imagem */}
                    <img
                      src={card.imageUrl}
                      alt={card.title || `Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback para quando a imagem não carregar
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 
                    className={cn(
                      "text-xl font-semibold mb-2",
                      {
                        'text-left': cardTitleAlignment === 'left',
                        'text-center': cardTitleAlignment === 'center',
                        'text-right': cardTitleAlignment === 'right'
                      }
                    )}
                  >
                    {card.title}
                  </h3>
                  
                  {card.description && (
                    <p 
                      className={cn(
                        "line-clamp-3 flex-1", // Limitar a 3 linhas para cards mais compactos
                        {
                          'text-left': cardDescriptionAlignment === 'left',
                          'text-center': cardDescriptionAlignment === 'center',
                          'text-right': cardDescriptionAlignment === 'right'
                        }
                      )}
                    >
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default FeatureCardsRenderer; 