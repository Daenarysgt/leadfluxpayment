import { ComponentType } from "@/utils/types";
import {
  TextRenderer,
  ButtonRenderer,
  ImageRenderer,
  ArgumentsRenderer,
  GraphicsRenderer,
  TestimonialsRenderer,
  LevelRenderer,
  CaptureRenderer,
  LoadingRenderer,
  CartesianRenderer,
  SpacerRenderer,
  MultipleChoiceRenderer,
  MultipleChoiceImageRenderer,
  CarouselRenderer,
  HeightRenderer,
  WeightRenderer,
  ComparisonRenderer,
  RatingRenderer,
  VideoRenderer,
  PricingRenderer,
} from "./element-renderers";

import TextConfig from "../element-configs/TextConfig";
import ButtonConfig from "../element-configs/ButtonConfig";
import ImageConfig from "../element-configs/ImageConfig";
import ArgumentsConfig from "../element-configs/ArgumentsConfig";
import GraphicsConfig from "../element-configs/GraphicsConfig";
import TestimonialsConfig from "../element-configs/TestimonialsConfig";
import LevelConfig from "../element-configs/LevelConfig";
import CaptureConfig from "../element-configs/CaptureConfig";
import LoadingConfig from "../element-configs/LoadingConfig";
import CartesianConfig from "../element-configs/CartesianConfig";
import SpacerConfig from "../element-configs/SpacerConfig";
import MultipleChoiceConfig from "../element-configs/MultipleChoiceConfig";
import MultipleChoiceImageConfig from "../element-configs/MultipleChoiceImageConfig";
import CarouselConfig from "../element-configs/CarouselConfig";
import HeightConfig from "../element-configs/HeightConfig";
import WeightConfig from "../element-configs/WeightConfig";
import ComparisonConfig from "../element-configs/ComparisonConfig";
import RatingConfig from "../element-configs/RatingConfig";
import VideoConfig from "../element-configs/VideoConfig";
import PricingConfig from "../element-configs/PricingConfig";

export const getElementRenderer = (type: ComponentType) => {
  switch (type) {
    case ComponentType.Text:
      return TextRenderer;
    case ComponentType.Button:
      return ButtonRenderer;
    case ComponentType.Image:
      return ImageRenderer;
    case ComponentType.Arguments:
      return ArgumentsRenderer;
    case ComponentType.Graphics:
      return GraphicsRenderer;
    case ComponentType.Testimonials:
      return TestimonialsRenderer;
    case ComponentType.Level:
      return LevelRenderer;
    case ComponentType.Capture:
      return CaptureRenderer;
    case ComponentType.Loading:
      return LoadingRenderer;
    case ComponentType.Cartesian:
      return CartesianRenderer;
    case ComponentType.Spacer:
      return SpacerRenderer;
    case ComponentType.MultipleChoice:
      return MultipleChoiceRenderer;
    case ComponentType.MultipleChoiceImage:
      return MultipleChoiceImageRenderer;
    case ComponentType.Carousel:
      return CarouselRenderer;
    case ComponentType.Height:
      return HeightRenderer;
    case ComponentType.Weight:
      return WeightRenderer;
    case ComponentType.Comparison:
      return ComparisonRenderer;
    case ComponentType.Rating:
      return RatingRenderer;
    case ComponentType.Video:
      return VideoRenderer;
    case ComponentType.Pricing:
      return PricingRenderer;
    default:
      return null;
  }
};

export const getElementConfig = (type: ComponentType) => {
  switch (type) {
    case ComponentType.Text:
      return TextConfig;
    case ComponentType.Button:
      return ButtonConfig;
    case ComponentType.Image:
      return ImageConfig;
    case ComponentType.Arguments:
      return ArgumentsConfig;
    case ComponentType.Graphics:
      return GraphicsConfig;
    case ComponentType.Testimonials:
      return TestimonialsConfig;
    case ComponentType.Level:
      return LevelConfig;
    case ComponentType.Capture:
      return CaptureConfig;
    case ComponentType.Loading:
      return LoadingConfig;
    case ComponentType.Cartesian:
      return CartesianConfig;
    case ComponentType.Spacer:
      return SpacerConfig;
    case ComponentType.MultipleChoice:
      return MultipleChoiceConfig;
    case ComponentType.MultipleChoiceImage:
      return MultipleChoiceImageConfig;
    case ComponentType.Carousel:
      return CarouselConfig;
    case ComponentType.Height:
      return HeightConfig;
    case ComponentType.Weight:
      return WeightConfig;
    case ComponentType.Comparison:
      return ComparisonConfig;
    case ComponentType.Rating:
      return RatingConfig;
    case ComponentType.Video:
      return VideoConfig;
    case ComponentType.Pricing:
      return PricingConfig;
    default:
      return null;
  }
}; 