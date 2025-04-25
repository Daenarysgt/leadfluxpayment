import React from 'react';
import { ElementRendererProps, FeaturesCardContent } from '@/types/canvasTypes';
import BaseElementRenderer from './BaseElementRenderer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturesCardRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, isSelected, onSelect, onRemove, onUpdate, previewMode } = props;
  const content = element.content as FeaturesCardContent;

  // Default values for new elements
  const defaultContent: FeaturesCardContent = {
    title: 'Plano Mensal',
    subtitle: 'Plano básico com recursos essenciais',
    price: 'R$200',
    priceDescription: 'por mês, ilimitado',
    items: [
      { id: crypto.randomUUID(), text: 'Acesso a todos os recursos básicos' },
      { id: crypto.randomUUID(), text: 'Suporte por email' },
      { id: crypto.randomUUID(), text: 'Até 5 usuários' },
      { id: crypto.randomUUID(), text: '1GB de armazenamento' }
    ],
    showIcon: true,
    iconColor: '#22c55e',
    accentBarColor: '#4ade80',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderRadius: 8,
    alignment: 'left',
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowStrength: 'medium',
    borderEnabled: true,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    button: {
      text: 'Selecionar plano',
      enabled: true,
      variant: 'default',
      color: '#4ade80',
      textColor: '#ffffff',
      navigation: { type: 'next' }
    }
  };

  // Merge with defaults to handle partial/missing content
  const mergedContent = { ...defaultContent, ...content };

  // Shadow styles based on strength
  const getShadowClass = () => {
    if (!mergedContent.shadowEnabled) return '';
    
    switch (mergedContent.shadowStrength) {
      case 'light': return 'shadow-sm';
      case 'medium': return 'shadow-md';
      case 'strong': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    if (previewMode) return;
    
    const updatedItems = mergedContent.items.filter(item => item.id !== itemId);
    onUpdate?.({
      ...element,
      content: {
        ...mergedContent,
        items: updatedItems
      }
    });
  };

  // Handle item addition
  const handleAddItem = () => {
    if (previewMode) return;
    
    const newItem = { id: crypto.randomUUID(), text: 'Novo recurso' };
    onUpdate?.({
      ...element,
      content: {
        ...mergedContent,
        items: [...mergedContent.items, newItem]
      }
    });
  };

  // Handle item text update
  const handleItemTextChange = (itemId: string, newText: string) => {
    if (previewMode) return;
    
    const updatedItems = mergedContent.items.map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );
    
    onUpdate?.({
      ...element,
      content: {
        ...mergedContent,
        items: updatedItems
      }
    });
  };

  // Generate the component
  const renderContent = () => {
    return (
      <div 
        className={cn(
          'w-full relative overflow-hidden transition-all duration-300',
          'flex flex-col',
          getShadowClass(),
          mergedContent.borderEnabled ? 'border' : '',
          !previewMode && 'hover:ring-2 hover:ring-violet-200'
        )}
        style={{
          backgroundColor: mergedContent.backgroundColor || '#ffffff',
          color: mergedContent.textColor || '#333333',
          borderRadius: `${mergedContent.borderRadius || 8}px`,
          borderColor: mergedContent.borderEnabled ? mergedContent.borderColor : 'transparent',
          borderWidth: mergedContent.borderEnabled ? `${mergedContent.borderWidth}px` : '0',
          textAlign: mergedContent.alignment as any || 'left',
        }}
      >
        {/* Barra de acento lateral */}
        <div 
          className="absolute top-0 left-0 h-full w-2" 
          style={{ backgroundColor: mergedContent.accentBarColor || '#4ade80' }}
        />

        {/* Conteúdo do card com padding para acomodar a barra lateral */}
        <div className="p-6 pl-8">
          {/* Título e subtítulo */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{mergedContent.title}</h3>
            {mergedContent.subtitle && (
              <p className="text-gray-500 mt-1">{mergedContent.subtitle}</p>
            )}
          </div>

          {/* Preço */}
          {mergedContent.price && (
            <div className="mb-6">
              <span className="text-2xl font-bold">{mergedContent.price}</span>
              {mergedContent.priceDescription && (
                <span className="text-gray-500 ml-1">{mergedContent.priceDescription}</span>
              )}
            </div>
          )}

          {/* Lista de recursos */}
          <div className="space-y-3 mb-6">
            {mergedContent.items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start"
              >
                {mergedContent.showIcon && (
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <Check 
                      size={16} 
                      style={{ color: mergedContent.iconColor || '#22c55e' }} 
                    />
                  </div>
                )}
                
                <div className="flex-grow">
                  {previewMode ? (
                    <span>{item.text}</span>
                  ) : (
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-0"
                    />
                  )}
                </div>
                
                {!previewMode && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            {!previewMode && (
              <button
                onClick={handleAddItem}
                className="mt-2 text-violet-500 hover:text-violet-700 text-sm flex items-center"
              >
                + Adicionar recurso
              </button>
            )}
          </div>

          {/* Botão (se habilitado) */}
          {mergedContent.button?.enabled && (
            <Button
              className="mt-2 transition-all"
              variant={mergedContent.button.variant as any || 'default'}
              style={{
                backgroundColor: mergedContent.button.variant === 'default' ? mergedContent.button.color : 'transparent',
                color: mergedContent.button.textColor || '#ffffff',
                borderColor: mergedContent.button.variant !== 'default' && mergedContent.button.variant !== 'link' ? mergedContent.button.color : undefined,
              }}
            >
              {mergedContent.button.text}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <BaseElementRenderer {...props}>
      {renderContent()}
    </BaseElementRenderer>
  );
};

export default FeaturesCardRenderer; 