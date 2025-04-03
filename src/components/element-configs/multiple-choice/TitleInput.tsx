import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useEffect, useCallback } from "react";

interface TitleInputProps {
  title: string;
  onChange: (value: string) => void;
}

const TitleInput = ({ title, onChange }: TitleInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle input change while preserving cursor position
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const newValue = input.value;
    const cursorPosition = input.selectionStart;
    
    onChange(newValue);
    
    // Preserve cursor position
    // We need to schedule this after React's state update
    requestAnimationFrame(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        try {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        } catch (e) {
          console.error("Failed to restore cursor position", e);
        }
      }
    });
  }, [onChange]);
  
  // When component mounts or title changes externally, ensure proper focus handling
  useEffect(() => {
    // Only attempt to adjust cursor if input is focused
    if (inputRef.current && document.activeElement === inputRef.current) {
      const length = title.length;
      const currentPosition = inputRef.current.selectionStart || 0;
      
      // If cursor is already at the end, keep it there, otherwise preserve position
      if (currentPosition === inputRef.current.value.length) {
        requestAnimationFrame(() => {
          if (inputRef.current && document.activeElement === inputRef.current) {
            try {
              inputRef.current.setSelectionRange(length, length);
            } catch (e) {
              console.error("Failed to position cursor at end", e);
            }
          }
        });
      }
    }
  }, [title]);
  
  return (
    <div>
      <Label htmlFor="question-title">Título da pergunta</Label>
      <Input
        id="question-title"
        ref={inputRef}
        value={title || ""}
        onChange={handleChange}
        className="mt-1"
      />
    </div>
  );
};

export default TitleInput;
