
import React, { memo, useEffect, useRef } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import ElementFactory from "./element-renderers/ElementFactory";

// Enhanced comparison function to determine if props changed
const areEqual = (prevProps: ElementRendererProps, nextProps: ElementRendererProps) => {
  // Always re-render when element is selected or deselected
  if (prevProps.isSelected !== nextProps.isSelected) {
    return false;
  }
  
  // Always re-render when dragging state changes
  if (prevProps.isDragging !== nextProps.isDragging) {
    return false;
  }
  
  // Always re-render when the element ID changes
  if (prevProps.element.id !== nextProps.element.id) {
    return false;
  }
  
  // Deep comparison of content properties to detect any changes
  const prevContent = JSON.stringify(prevProps.element.content);
  const nextContent = JSON.stringify(nextProps.element.content);
  
  if (prevContent !== nextContent) {
    return false;
  }
  
  // Compare any other properties that might have changed
  if (prevProps.element.type !== nextProps.element.type) {
    return false;
  }
  
  // Also check for previewMode changes
  if (prevProps.element.previewMode !== nextProps.element.previewMode) {
    return false;
  }
  
  return true;
};

const CanvasElementRenderer = (props: ElementRendererProps) => {
  const { element, onDragStart, onDragEnd } = props;
  const prevElement = useRef(element);
  
  // Use element ID as key instead of dynamic key to maintain component identity
  const stableKey = `element-${element.id}`;
  
  // Log when the component receives different content
  useEffect(() => {
    if (prevElement.current && prevElement.current.id === element.id) {
      const prevContent = JSON.stringify(prevElement.current.content);
      const currentContent = JSON.stringify(element.content);
      
      if (prevContent !== currentContent) {
        console.log(`CanvasElementRenderer - Element ${element.id} content changed`);
      }
    }
    
    prevElement.current = {...element};
  }, [element]);
  
  console.log(`CanvasElementRenderer - Rendering element: ${element.id}, type: ${element.type}`);
  
  return (
    <div className="w-full">
      <ElementFactory 
        key={stableKey} 
        {...props}
      />
    </div>
  );
};

export default memo(CanvasElementRenderer, areEqual);
