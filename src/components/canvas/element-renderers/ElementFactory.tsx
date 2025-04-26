import { ComponentType } from "@/utils/types";
import { ElementRendererProps } from "@/types/canvasTypes";
import {
  TextRenderer,
  MultipleChoiceRenderer,
  MultipleChoiceImageRenderer,
  ButtonRenderer,
  ImageRenderer,
  CarouselRenderer,
  HeightRenderer,
  WeightRenderer,
  RatingRenderer,
  SpacerRenderer,
  ComparisonRenderer,
  ArgumentsRenderer,
  GraphicsRenderer,
  TestimonialsRenderer,
  LevelRenderer,
  CaptureRenderer,
  LoadingRenderer,
  CartesianRenderer,
  VideoRenderer,
  GenericElementRenderer,
  PriceRenderer,
  NotesRenderer,
  TimerRenderer,
  AccordionRenderer,
  FeatureCardsRenderer
} from './index';
import { useState } from 'react';

// Componente para tratamento de fallback quando um elemento falha
const ElementErrorFallback = ({ element }: { element: any }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-2 my-2 border border-red-200 bg-red-50 rounded text-sm text-red-800">
      <p className="font-medium">Erro ao renderizar elemento</p>
      {expanded && (
        <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-[100px]">
          {JSON.stringify(element, null, 2)}
        </pre>
      )}
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="text-xs mt-1 text-red-600 hover:underline"
      >
        {expanded ? 'Esconder detalhes' : 'Mostrar detalhes'}
      </button>
    </div>
  );
};

const ElementFactory = (props: ElementRendererProps) => {
  // Verificações de segurança extras
  if (!props || !props.element) {
    console.error("ElementFactory - Props inválidas:", props);
    return <div className="p-2 text-red-500">Elemento inválido</div>;
  }
  
  const { element } = props;
  
  // Garantir que element.type existe
  if (!element.type) {
    console.error("ElementFactory - Elemento sem tipo:", element);
    return <div className="p-2 text-red-500">Elemento sem tipo</div>;
  }
  
  const { type } = element;
  
  // Remover logs em produção
  if (process.env.NODE_ENV !== 'production') {
    console.log("ElementFactory - Creating element of type:", type);
  }
  
  try {
    switch(type) {
      case ComponentType.Text:
        return <TextRenderer {...props} />;
        
      case ComponentType.MultipleChoice:
        return <MultipleChoiceRenderer {...props} />;
        
      case ComponentType.MultipleChoiceImage:
        return <MultipleChoiceImageRenderer {...props} />;
        
      case ComponentType.Button:
        if (process.env.NODE_ENV !== 'production') {
          console.log("ElementFactory - Creating ButtonRenderer with props:", JSON.stringify(element));
        }
        return <ButtonRenderer {...props} />;
      
      case ComponentType.Image:
        return <ImageRenderer {...props} />;
        
      case ComponentType.Carousel:
        return <CarouselRenderer {...props} />;
      
      case ComponentType.Height:
        return <HeightRenderer {...props} />;
      
      case ComponentType.Weight:
        return <WeightRenderer {...props} />;
      
      case ComponentType.Rating:
        return <RatingRenderer {...props} />;
      
      case ComponentType.Spacer:
        return <SpacerRenderer {...props} />;
        
      case ComponentType.Comparison:
        return <ComparisonRenderer {...props} />;
        
      case ComponentType.Arguments:
        return <ArgumentsRenderer {...props} />;
        
      case ComponentType.Graphics:
        return <GraphicsRenderer {...props} />;

      case ComponentType.Testimonials:
        return <TestimonialsRenderer {...props} />;
        
      case ComponentType.Level:
        return <LevelRenderer {...props} />;
        
      case ComponentType.Capture:
        return <CaptureRenderer {...props} />;
        
      case ComponentType.Loading:
        return <LoadingRenderer {...props} />;
        
      case ComponentType.Cartesian:
        return <CartesianRenderer {...props} />;
        
      case ComponentType.Video:
        return <VideoRenderer {...props} />;
        
      case ComponentType.Price:
        return <PriceRenderer {...props} />;
        
      case ComponentType.Notes:
        return <NotesRenderer {...props} />;
        
      case ComponentType.Timer:
        return <TimerRenderer {...props} />;
      
      case ComponentType.Accordion:
        return <AccordionRenderer {...props} />;
        
      case ComponentType.FeatureCards:
        return <FeatureCardsRenderer {...props} />;
        
      default:
        console.log("ElementFactory - Unknown element type:", type);
        return (
          <GenericElementRenderer {...props} />
        );
    }
  } catch (error) {
    console.error("ElementFactory - Erro crítico ao processar elemento:", error);
    return (
      <div className="p-2 border border-red-200 bg-red-50 rounded">
        <p className="text-sm text-red-800">Erro ao renderizar elemento</p>
        <p className="text-xs text-red-600 mt-1">{String(error)}</p>
      </div>
    );
  }
};

export default ElementFactory;
