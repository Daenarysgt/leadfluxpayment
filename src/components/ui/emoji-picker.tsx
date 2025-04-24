import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

// Lista de emojis no estilo Apple/iOS
const APPLE_STYLE_EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", 
  "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
  "😋", "😛", "😜", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
  "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌",
  "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
  "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐",
  "👋", "🤚", "🖐️", "✋", "🖖", "👌", "✌️", "🤞", "🤟", "🤘",
  "🤙", "👈", "👉", "👆", "🖕", "👇", "👍", "👎", "✊", "👊",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕"
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, selectedEmoji }) => {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 px-4 font-normal"
          size="sm"
        >
          {selectedEmoji ? (
            <span className="text-xl mr-2">{selectedEmoji}</span>
          ) : (
            <Smile className="h-4 w-4 mr-2" />
          )}
          Emoji
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="font-apple-emoji p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            .font-apple-emoji {
              font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
            }
            
            .emoji-grid {
              display: grid;
              grid-template-columns: repeat(8, 1fr);
              gap: 10px;
            }
            
            .emoji-item {
              font-size: 2rem;
              cursor: pointer;
              text-align: center;
              transition: transform 0.1s ease;
              user-select: none;
            }
            
            .emoji-item:hover {
              transform: scale(1.2);
              background-color: rgba(0, 0, 0, 0.05);
              border-radius: 6px;
            }
          `}} />
          
          <div className="mb-2 text-sm font-medium">
            Escolha um emoji estilo Apple/iOS:
          </div>
          
          <div className="emoji-grid">
            {APPLE_STYLE_EMOJIS.map((emoji, index) => (
              <div 
                key={index} 
                className="emoji-item"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Dica: Para sempre usar emojis com aparência iOS, considere instalar a fonte Apple Color Emoji no Windows.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker; 