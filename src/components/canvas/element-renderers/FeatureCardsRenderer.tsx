import React from 'react';
import { FeatureCardsContent } from '@/utils/types';
import { ElementRendererProps } from '@/types/canvasTypes';
import { cn } from '@/lib/utils';

const FeatureCardsRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const content = element.content as FeatureCardsContent;
  
  console.log("FeatureCardsRenderer - Rendering with content:", JSON.stringify(content));
  
  // Se não houver conteúdo, exibir mensagem de placeholder
  if (!content) {
    console.log("FeatureCardsRenderer - No content provided");
    return (
      <div className="p-4 bg-violet-100 rounded-md text-center">
        <h3 className="text-lg font-medium text-violet-800">Cards de Recursos</h3>
        <p className="text-sm text-violet-600">Adicione cards no painel de configuração</p>
      </div>
    );
  }
  
  const {
    title,
    description,
    cards = [],
    style = {
      titleAlignment: 'center',
      descriptionAlignment: 'center',
      cardTitleAlignment: 'center',
      cardDescriptionAlignment: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      cardBackgroundColor: '#ffffff',
      cardTextColor: '#333333',
      cardShadow: 'md',
      imagePosition: 'top',
      columns: 2,
      gap: 24,
      animation: 'fade-in'
    }
  } = content;

  // Garantir pelo menos 2 colunas
  const columns = Math.max(2, style.columns || 2);
  
  // Mapear valores de sombra para classes do Tailwind
  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-xl'
  };

  // Mapear valores de animação para classes
  const animationClasses = {
    'none': '',
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up'
  };

  // Definir o grid de colunas com base no número especificado
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  
  // Se não houver cards, exibir mensagem
  if (!cards || cards.length === 0) {
    console.log("FeatureCardsRenderer - No cards in content");
    return (
      <div className="p-4 bg-violet-100 rounded-md text-center">
        <h3 className="text-lg font-medium text-violet-800">{title || "Cards de Recursos"}</h3>
        <p className="text-sm text-violet-600">{description || "Adicione cards no painel de configuração"}</p>
      </div>
    );
  }
  
  console.log("FeatureCardsRenderer - Rendering cards:", cards.length);
  
  return (
    <div 
      className="w-full overflow-hidden" 
      style={{ 
        backgroundColor: style.backgroundColor || 'transparent'
      }}
    >
      {/* Título e descrição */}
      {title && (
        <h2 
          className={cn(
            "text-2xl sm:text-3xl font-bold mb-3",
            {
              'text-left': style.titleAlignment === 'left',
              'text-center': style.titleAlignment === 'center',
              'text-right': style.titleAlignment === 'right'
            }
          )}
          style={{ color: style.cardTextColor }}
        >
          {title}
        </h2>
      )}
      
      {description && (
        <p 
          className={cn(
            "text-base sm:text-lg text-gray-600 mb-8",
            {
              'text-left': style.descriptionAlignment === 'left',
              'text-center': style.descriptionAlignment === 'center',
              'text-right': style.descriptionAlignment === 'right'
            }
          )}
          style={{ color: style.cardTextColor }}
        >
          {description}
        </p>
      )}
      
      {/* Grid de cards */}
      <div 
        className="grid gap-6 w-full"
        style={{ 
          gridTemplateColumns,
          gap: `${style.gap || 24}px` 
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "relative overflow-hidden rounded-lg transition-all duration-300 hover:translate-y-[-5px]",
              shadowClasses[style.cardShadow as keyof typeof shadowClasses],
              animationClasses[style.animation as keyof typeof animationClasses]
            )}
            style={{
              backgroundColor: style.cardBackgroundColor || '#ffffff',
              borderRadius: `${style.borderRadius || 8}px`,
              color: style.cardTextColor || '#333333'
            }}
          >
            {/* Imagem do card */}
            <div 
              className={cn(
                "w-full flex justify-center items-center p-4",
                {
                  'mx-auto': style.imagePosition === 'center'
                }
              )}
            >
              <img
                src={card.imageUrl || '/placeholder.svg'}
                alt={card.title}
                className="object-contain h-auto max-w-full"
                style={{ maxHeight: '150px' }}
              />
            </div>
            
            {/* Conteúdo do card */}
            <div className="p-5">
              <h3 
                className={cn(
                  "text-xl font-semibold mb-2",
                  {
                    'text-left': style.cardTitleAlignment === 'left',
                    'text-center': style.cardTitleAlignment === 'center',
                    'text-right': style.cardTitleAlignment === 'right'
                  }
                )}
              >
                {card.title}
              </h3>
              
              <p 
                className={cn(
                  "text-gray-600",
                  {
                    'text-left': style.cardDescriptionAlignment === 'left',
                    'text-center': style.cardDescriptionAlignment === 'center',
                    'text-right': style.cardDescriptionAlignment === 'right'
                  }
                )}
                style={{ 
                  color: style.cardTextColor ? `${style.cardTextColor}99` : '#33333399'
                }}
              >
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCardsRenderer; 