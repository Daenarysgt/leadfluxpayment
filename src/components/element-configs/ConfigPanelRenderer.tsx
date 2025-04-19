import { ComponentType } from "@/utils/types";
import { CanvasElement } from "@/types/canvasTypes";
import MultipleChoiceConfig from "./MultipleChoiceConfig";
import MultipleChoiceImageConfig from "./MultipleChoiceImageConfig";
import TextConfig from "./TextConfig";
import ImageConfig from "./ImageConfig";
import CarouselConfig from "./CarouselConfig";
import ButtonConfig from "./ButtonConfig";
import HeightConfig from "./HeightConfig";
import WeightConfig from "./WeightConfig";
import ComparisonConfig from "./ComparisonConfig";
import ArgumentsConfig from "./ArgumentsConfig";
import GraphicsConfig from "./GraphicsConfig";
import TestimonialsConfig from "./TestimonialsConfig";
import LevelConfig from "./LevelConfig";
import CaptureConfig from "./CaptureConfig";
import LoadingConfig from "./LoadingConfig";
import CartesianConfig from "./CartesianConfig";
import RatingConfig from "./RatingConfig";
import VideoConfig from "./VideoConfig";
import SpacerConfig from "./SpacerConfig";
import PriceConfig from "./PriceConfig";

interface ConfigPanelRendererProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const ConfigPanelRenderer = ({ element, onUpdate }: ConfigPanelRendererProps) => {
  // Use element ID as the stable key to preserve component identity
  const stableKey = `config-${element.id}`;
  
  switch (element.type) {
    case ComponentType.Text:
      return (
        <TextConfig 
          key={stableKey}
          element={element} 
          onUpdate={onUpdate} 
        />
      );
      
    case ComponentType.MultipleChoice:
      return (
        <MultipleChoiceConfig 
          key={stableKey}
          element={element} 
          onUpdate={onUpdate} 
        />
      );
    
    case ComponentType.MultipleChoiceImage:
      return (
        <MultipleChoiceImageConfig 
          key={stableKey}
          element={element} 
          onUpdate={onUpdate} 
        />
      );
    
    case ComponentType.Image:
      return (
        <ImageConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
    
    case ComponentType.Carousel:
      return (
        <CarouselConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
    
    case ComponentType.Button:
      return (
        <ButtonConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
    
    case ComponentType.Height:
      return (
        <HeightConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Weight:
      return (
        <WeightConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
    
    case ComponentType.Comparison:
      return (
        <ComparisonConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Arguments:
      return (
        <ArgumentsConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Graphics:
      return (
        <GraphicsConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
    
    case ComponentType.Testimonials:
      return (
        <TestimonialsConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Level:
      return (
        <LevelConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Capture:
      return (
        <CaptureConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Loading:
      return (
        <LoadingConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Cartesian:
      return (
        <CartesianConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Rating:
      return (
        <RatingConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Video:
      return (
        <VideoConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Spacer:
      return (
        <SpacerConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    case ComponentType.Price:
      return (
        <PriceConfig
          key={stableKey}
          element={element}
          onUpdate={onUpdate}
        />
      );
      
    default:
      console.warn(`No config panel for element type: ${element.type}`);
      return <div className="p-4">Configuração não disponível para este elemento.</div>;
  }
};

export default ConfigPanelRenderer;
