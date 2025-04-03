
import { CanvasElement } from "@/types/canvasTypes";

/**
 * Deep clones an object to avoid reference issues
 */
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Updates a canvas element with new properties
 */
export const updateCanvasElement = (
  elements: CanvasElement[],
  selectedElementId: string,
  elementUpdates: Partial<CanvasElement>
): CanvasElement[] => {
  console.log("updateCanvasElement - updating element:", elementUpdates);

  if (!selectedElementId) {
    console.log("updateCanvasElement - No selected element ID provided");
    return elements;
  }

  // Check if we have an element to update
  const existingElementIndex = elements.findIndex(el => el.id === selectedElementId);
  if (existingElementIndex === -1) {
    console.log(`updateCanvasElement - No element found with ID: ${selectedElementId}`);
    return elements;
  }
  
  // Create a new array of elements to ensure React detects the change
  const updatedElements = [...elements];
  const existingElement = updatedElements[existingElementIndex];
  
  console.log(`updateCanvasElement - Found element with ID: ${selectedElementId}, updating...`);
  
  // Create a fresh copy of the element
  const updatedElement = deepClone(existingElement);
  
  // Handle content property updates
  if (elementUpdates.content) {
    // Make sure content object exists
    updatedElement.content = updatedElement.content || {};
    
    // Handle special cases like arrays and nested objects
    Object.keys(elementUpdates.content).forEach(key => {
      const updateValue = elementUpdates.content[key];
      
      // Arrays should be completely replaced
      if (Array.isArray(updateValue)) {
        updatedElement.content[key] = deepClone(updateValue);
      }
      // Special case for formattedText
      else if (key === 'formattedText') {
        updatedElement.content[key] = updateValue;
      }
      // Nested objects should be merged
      else if (typeof updateValue === 'object' && updateValue !== null) {
        updatedElement.content[key] = {
          ...(updatedElement.content[key] || {}),
          ...deepClone(updateValue)
        };
      }
      // Simple values should be directly replaced
      else {
        updatedElement.content[key] = updateValue;
      }
    });
  }
  
  // For all other top-level properties, copy them directly
  Object.keys(elementUpdates).forEach(key => {
    if (key !== 'content') {
      updatedElement[key] = elementUpdates[key];
    }
  });
  
  console.log("updateCanvasElement - Final updated element:", updatedElement);
  
  // Replace the element in the array
  updatedElements[existingElementIndex] = updatedElement;
  
  return updatedElements;
};
