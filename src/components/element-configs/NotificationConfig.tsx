import { CanvasElement } from "@/types/canvasTypes";
import NotificationElement from "../canvas/element-renderers/NotificationElement";

interface NotificationConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const NotificationConfig = ({ element, onUpdate }: NotificationConfigProps) => {
  return (
    <div className="p-3">
      <NotificationElement
        element={element}
        isSelected={false}
        onSelect={() => {}}
        onRemove={() => {}}
        onUpdate={onUpdate}
        index={0}
        totalElements={1}
      />
    </div>
  );
};

export default NotificationConfig; 