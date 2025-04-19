import { ComponentType } from "@/utils/types";
import { CanvasElement } from "@/types/canvasTypes";
import TextConfig from '../element-configs/TextConfig';
import MultipleChoiceConfig from '../element-configs/MultipleChoiceConfig';
import MultipleChoiceImageConfig from '../element-configs/MultipleChoiceImageConfig';
import ButtonConfig from '../element-configs/ButtonConfig';
import ImageConfig from '../element-configs/ImageConfig';
import CarouselConfig from '../element-configs/CarouselConfig';
import HeightConfig from '../element-configs/HeightConfig';
import WeightConfig from '../element-configs/WeightConfig';
import RatingConfig from '../element-configs/RatingConfig';
import SpacerConfig from '../element-configs/SpacerConfig';
import ComparisonConfig from '../element-configs/ComparisonConfig';
import ArgumentsConfig from '../element-configs/ArgumentsConfig';
import GraphicsConfig from '../element-configs/GraphicsConfig';
import TestimonialsConfig from '../element-configs/TestimonialsConfig';
import LevelConfig from '../element-configs/LevelConfig';
import CaptureConfig from '../element-configs/CaptureConfig';
import LoadingConfig from '../element-configs/LoadingConfig';
import CartesianConfig from '../element-configs/CartesianConfig';
import VideoConfig from '../element-configs/VideoConfig';
import PricingConfig from '../element-configs/PricingConfig';
import GenericElementConfig from '../element-configs/GenericElementConfig';

interface ConfigPanelRendererProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const ConfigPanelRenderer = (props: ConfigPanelRendererProps) => {
  const { element } = props;
  const { type } = element;

  switch(type) {
    case ComponentType.Text:
      return <TextConfig {...props} />;
      
    case ComponentType.MultipleChoice:
      return <MultipleChoiceConfig {...props} />;
      
    case ComponentType.MultipleChoiceImage:
      return <MultipleChoiceImageConfig {...props} />;
      
    case ComponentType.Button:
      return <ButtonConfig {...props} />;
      
    case ComponentType.Image:
      return <ImageConfig {...props} />;
      
    case ComponentType.Carousel:
      return <CarouselConfig {...props} />;
      
    case ComponentType.Height:
      return <HeightConfig {...props} />;
      
    case ComponentType.Weight:
      return <WeightConfig {...props} />;
      
    case ComponentType.Rating:
      return <RatingConfig {...props} />;
      
    case ComponentType.Spacer:
      return <SpacerConfig {...props} />;
      
    case ComponentType.Comparison:
      return <ComparisonConfig {...props} />;
      
    case ComponentType.Arguments:
      return <ArgumentsConfig {...props} />;
      
    case ComponentType.Graphics:
      return <GraphicsConfig {...props} />;
      
    case ComponentType.Testimonials:
      return <TestimonialsConfig {...props} />;
      
    case ComponentType.Level:
      return <LevelConfig {...props} />;
      
    case ComponentType.Capture:
      return <CaptureConfig {...props} />;
      
    case ComponentType.Loading:
      return <LoadingConfig {...props} />;
      
    case ComponentType.Cartesian:
      return <CartesianConfig {...props} />;
      
    case ComponentType.Video:
      return <VideoConfig {...props} />;
      
    case ComponentType.Pricing:
      return <PricingConfig {...props} />;
      
    default:
      return <GenericElementConfig {...props} />;
  }
};

export default ConfigPanelRenderer; 