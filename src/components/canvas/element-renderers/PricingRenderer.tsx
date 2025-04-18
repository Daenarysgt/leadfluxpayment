import React from 'react';
import { ElementRendererProps } from '@/types/canvasTypes';
import { Pricing } from '../elements/Pricing';
import BaseElementRenderer from './BaseElementRenderer';

export const PricingRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element } = props;

  return (
    <BaseElementRenderer {...props}>
      <Pricing
        variant={element.content?.variant}
        title={element.content?.title}
        price={element.content?.price}
        description={element.content?.description}
        features={element.content?.features}
        buttonText={element.content?.buttonText}
        discount={element.content?.discount}
      />
    </BaseElementRenderer>
  );
};

export default PricingRenderer; 