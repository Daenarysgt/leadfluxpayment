import React from 'react';
import { cn } from '@/lib/utils';

export interface PricingProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'featured' | 'premium';
  layout?: 'vertical' | 'horizontal' | 'compact';
  title?: string;
  price?: string;
  description?: string;
  features?: string[];
  buttonText?: string;
  discount?: string;
  alignment?: 'left' | 'center' | 'right';
  borderRadius?: number;
  // Cores personalizáveis
  titleColor?: string;
  priceColor?: string;
  descriptionColor?: string;
  featureTextColor?: string;
  featureIconColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  discountBgColor?: string;
  discountTextColor?: string;
}

const defaultFeatures = [
  'Acesso a todos os módulos',
  'Suporte via WhatsApp',
  'Atualizações gratuitas',
  'Certificado de conclusão',
];

export const Pricing: React.FC<PricingProps> = ({
  className,
  style,
  variant = 'default',
  layout = 'vertical',
  title = 'Plano Básico',
  price = 'R$ 127,00',
  description = 'Perfeito para começar',
  features = defaultFeatures,
  buttonText = 'Comprar Agora',
  discount = '50% OFF',
  alignment = 'center',
  borderRadius = 8,
  // Cores personalizáveis com valores padrão baseados na variante
  titleColor,
  priceColor,
  descriptionColor,
  featureTextColor,
  featureIconColor,
  borderColor,
  backgroundColor,
  buttonColor,
  buttonTextColor,
  discountBgColor = '#EF4444',
  discountTextColor = '#FFFFFF',
}) => {
  // Define cores padrão baseadas na variante
  const getDefaultColors = () => {
    switch (variant) {
      case 'featured':
        return {
          borderColor: borderColor || '#3B82F6',
          backgroundColor: backgroundColor || '#EBF5FF',
          buttonColor: buttonColor || '#3B82F6',
          featureIconColor: featureIconColor || '#3B82F6',
        };
      case 'premium':
        return {
          borderColor: borderColor || '#8B5CF6',
          backgroundColor: backgroundColor || '#F3F0FF',
          buttonColor: buttonColor || '#8B5CF6',
          featureIconColor: featureIconColor || '#8B5CF6',
        };
      default:
        return {
          borderColor: borderColor || '#E5E7EB',
          backgroundColor: backgroundColor || '#FFFFFF',
          buttonColor: buttonColor || '#10B981',
          featureIconColor: featureIconColor || '#10B981',
        };
    }
  };

  const colors = getDefaultColors();

  // Estilos baseados no alinhamento
  const alignmentStyles = {
    textAlign: alignment,
    justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
  };

  // Estilos específicos para o layout horizontal
  const isHorizontal = layout === 'horizontal';
  const isCompact = layout === 'compact';

  // Componente de feature que funciona em todos os layouts
  const FeatureItem = ({ feature }: { feature: string }) => (
    <li className={`flex ${isHorizontal ? 'items-center' : ''}`}>
      <svg
        className={cn(
          "mr-2 h-5 w-5 shrink-0",
          featureIconColor ? 'text-current' : ''
        )}
        style={{ color: featureIconColor || colors.featureIconColor }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span style={{ color: featureTextColor || 'inherit' }}>{feature}</span>
    </li>
  );

  const wrapperStyles = {
    ...style,
    borderRadius: `${borderRadius}px`,
    borderColor: colors.borderColor,
    backgroundColor: colors.backgroundColor,
  };

  if (isHorizontal) {
    return (
      <div
        className={cn(
          'w-full rounded-lg border p-6 shadow-md flex',
          className
        )}
        style={wrapperStyles}
      >
        <div className="flex-1">
          <div className={`text-${alignment}`}>
            {discount && (
              <span
                className="mb-2 inline-block rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: discountBgColor, color: discountTextColor }}
              >
                {discount}
              </span>
            )}
            <h3 className="mb-2 text-2xl font-bold" style={{ color: titleColor || 'inherit' }}>
              {title}
            </h3>
            <p className="mb-4 text-gray-600" style={{ color: descriptionColor || 'inherit' }}>
              {description}
            </p>
          </div>

          <ul className={`space-y-2 mb-0 flex-1 text-${alignment}`}>
            {features.slice(0, 2).map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </ul>
        </div>

        <div className={cn("flex flex-col justify-between items-center ml-4", 
          alignment === 'left' ? 'items-start' : 
          alignment === 'right' ? 'items-end' : 'items-center'
        )}>
          <div className={`mb-4 text-${alignment}`}>
            <span className="text-3xl font-bold" style={{ color: priceColor || 'inherit' }}>
              {price}
            </span>
            <span className="text-gray-500"> à vista</span>
          </div>

          <button
            className={cn(
              'rounded-lg px-4 py-2 font-semibold text-white transition-colors'
            )}
            style={{
              backgroundColor: buttonColor || colors.buttonColor,
              color: buttonTextColor || 'white',
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div
        className={cn(
          'w-full rounded-lg border shadow-md',
          className
        )}
        style={wrapperStyles}
      >
        <div className="p-4 border-b" style={{ textAlign: alignment as any }}>
          {discount && (
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-sm font-semibold"
              style={{ backgroundColor: discountBgColor, color: discountTextColor }}
            >
              {discount}
            </span>
          )}
          <h3 className="text-xl font-bold" style={{ color: titleColor || 'inherit' }}>
            {title}
          </h3>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold" style={{ color: priceColor || 'inherit' }}>
              {price}
            </span>
            <span className="text-gray-500"> à vista</span>
          </div>
          
          <button
            className="rounded-lg px-4 py-2 font-semibold text-white transition-colors"
            style={{
              backgroundColor: buttonColor || colors.buttonColor,
              color: buttonTextColor || 'white',
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }

  // Layout vertical (padrão)
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border p-6 shadow-md',
        className
      )}
      style={wrapperStyles}
    >
      <div style={{ textAlign: alignment as any }}>
        {discount && (
          <span
            className="mb-2 inline-block rounded-full px-3 py-1 text-sm font-semibold"
            style={{ backgroundColor: discountBgColor, color: discountTextColor }}
          >
            {discount}
          </span>
        )}
        <h3 className="mb-2 text-2xl font-bold" style={{ color: titleColor || 'inherit' }}>
          {title}
        </h3>
        <div className="mb-4">
          <span className="text-3xl font-bold" style={{ color: priceColor || 'inherit' }}>
            {price}
          </span>
          <span className="text-gray-500"> à vista</span>
        </div>
        <p className="mb-6 text-gray-600" style={{ color: descriptionColor || 'inherit' }}>
          {description}
        </p>
      </div>

      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <FeatureItem key={index} feature={feature} />
        ))}
      </ul>

      <div style={{ textAlign: alignment as any }}>
        <button
          className={cn(
            'w-full rounded-lg px-4 py-2 font-semibold text-white transition-colors'
          )}
          style={{
            backgroundColor: buttonColor || colors.buttonColor,
            color: buttonTextColor || 'white',
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Pricing; 