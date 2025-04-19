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
  PricingRenderer,
  GenericElementRenderer
} from './index';

const ElementFactory = (props: ElementRendererProps) => {
  const { element } = props;
  const { type } = element;
  
  console.log("ElementFactory - Creating element of type:", type, "with props:", JSON.stringify(element));
  
  switch(type) {
    case ComponentType.Text:
      return <TextRenderer {...props} />;
      
    case ComponentType.MultipleChoice:
      return <MultipleChoiceRenderer {...props} />;
      
    case ComponentType.MultipleChoiceImage:
      return <MultipleChoiceImageRenderer {...props} />;
      
    case ComponentType.Button:
      console.log("ElementFactory - Creating ButtonRenderer with props:", JSON.stringify(element));
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
      
    case ComponentType.Pricing:
      return <PricingRenderer {...props} />;
      
    default:
      console.log("ElementFactory - Unknown element type:", type);
      return (
        <GenericElementRenderer {...props} />
      );
  }
};

export default ElementFactory;
