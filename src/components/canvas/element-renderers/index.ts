import TextRenderer from "./TextRenderer";
import MultipleChoiceRenderer from "./MultipleChoiceRenderer";
import MultipleChoiceImageRenderer from "./MultipleChoiceImageRenderer";
import ButtonRenderer from "./ButtonRenderer";
import ImageRenderer from "./ImageRenderer";
import CarouselRenderer from "./CarouselRenderer";
import HeightRenderer from "./HeightRenderer";
import WeightRenderer from "./WeightRenderer";
import RatingRenderer from "./RatingRenderer";
import SpacerRenderer from "./SpacerRenderer";
import ComparisonRenderer from "./ComparisonRenderer";
import ArgumentsRenderer from "./ArgumentsRenderer";
import GraphicsRenderer from "./GraphicsRenderer";
import TestimonialsRenderer from "./TestimonialsRenderer";
import LevelRenderer from "./LevelRenderer";
import CaptureRenderer from "./CaptureRenderer";
import LoadingRenderer from "./LoadingRenderer";
import CartesianRenderer from "./CartesianRenderer";
import VideoRenderer from "./VideoRenderer";
import GenericElementRenderer from "./GenericElementRenderer";

// Função utilitária para aplicar margem superior a qualquer elemento
export const getElementMarginStyle = (content?: any) => {
  return {
    marginTop: content?.marginTop ? `${content.marginTop}px` : undefined
  };
};

export {
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
  GenericElementRenderer
}; 