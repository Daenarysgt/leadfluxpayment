
import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  
  const commonColors = [
    "#8B5CF6", // Purple
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#EC4899", // Pink
    "#000000", // Black
    "#ffffff", // White
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    onChange(inputValue);
    setIsEditing(false);
  };
  
  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div
          className="h-8 w-8 rounded border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => setIsEditing(true)}
        />
        {isEditing ? (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="flex-1 border rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <div 
            className="flex-1 border rounded px-2 py-1 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {value}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-8 gap-2">
        {commonColors.map((color) => (
          <div
            key={color}
            className="h-6 w-6 rounded-full border cursor-pointer transform transition-transform hover:scale-110"
            style={{ 
              backgroundColor: color,
              border: color === '#ffffff' ? '1px solid #e5e7eb' : 'none'
            }}
            onClick={() => handleColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );
};
