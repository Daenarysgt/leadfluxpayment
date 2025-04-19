import { ComponentType } from "@/utils/types";
import PricingRenderer from "./element-renderers/PricingRenderer";
import PricingConfig from "../element-configs/PricingConfig";

export const getElementRenderer = (type: ComponentType) => {
  switch (type) {
    case ComponentType.Pricing:
      return PricingRenderer;
    default:
      return null;
  }
};

export const getElementConfig = (type: ComponentType) => {
  switch (type) {
    case ComponentType.Pricing:
      return PricingConfig;
    default:
      return null;
  }
}; 