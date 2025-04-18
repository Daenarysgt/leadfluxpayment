import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { getElementMarginStyle } from "./index";

const GenericElementRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { type, content } = element;
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={getElementMarginStyle(content)}>
        <h2 className="text-lg font-medium text-center mb-3">
          {content?.title || type}
        </h2>
        <div className="h-20 bg-gray-100 rounded-md flex items-center justify-center">
          <span className="text-gray-500">Visualização de {type}</span>
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default GenericElementRenderer;
