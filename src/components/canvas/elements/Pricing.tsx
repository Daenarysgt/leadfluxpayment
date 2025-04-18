import React from 'react';
import { cn } from '@/lib/utils';

export interface PricingProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'featured' | 'premium';
  title?: string;
  price?: string;
  description?: string;
  features?: string[];
  buttonText?: string;
  discount?: string;
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
  title = 'Plano Básico',
  price = 'R$ 127,00',
  description = 'Perfeito para começar',
  features = defaultFeatures,
  buttonText = 'Comprar Agora',
  discount = '50% OFF',
}) => {
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border p-6 shadow-md',
        variant === 'featured' && 'border-blue-500 bg-blue-50',
        variant === 'premium' && 'border-purple-500 bg-purple-50',
        className
      )}
      style={style}
    >
      {discount && (
        <span className="mb-2 inline-block rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
          {discount}
        </span>
      )}
      <h3 className="mb-2 text-2xl font-bold">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-gray-500"> à vista</span>
      </div>
      <p className="mb-6 text-gray-600">{description}</p>
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="mr-2 h-5 w-5 text-green-500"
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
            {feature}
          </li>
        ))}
      </ul>
      <button
        className={cn(
          'w-full rounded-lg px-4 py-2 font-semibold text-white transition-colors',
          variant === 'featured' && 'bg-blue-500 hover:bg-blue-600',
          variant === 'premium' && 'bg-purple-500 hover:bg-purple-600',
          variant === 'default' && 'bg-green-500 hover:bg-green-600'
        )}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default Pricing; 