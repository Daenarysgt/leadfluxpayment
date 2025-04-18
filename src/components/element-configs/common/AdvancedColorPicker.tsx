import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AdvancedColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AdvancedColorPicker = ({ value, onChange, size = 'md' }: AdvancedColorPickerProps) => {
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState(value || '#000000');
  const [isDragging, setIsDragging] = useState(false);
  const [isMovingSlider, setIsMovingSlider] = useState(false);
  
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Tamanhos disponíveis
  const sizes = {
    'sm': { picker: 'h-6 w-6', popover: 'w-64' },
    'md': { picker: 'h-8 w-8', popover: 'w-72' },
    'lg': { picker: 'h-10 w-10', popover: 'w-80' },
  };

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
  
  // Funções de conversão de cores
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  };
  
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;
    
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s, v };
  };
  
  const hsvToRgb = (h: number, s: number, v: number) => {
    h /= 360;
    let r = 0, g = 0, b = 0;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return { 
      r: Math.round(r * 255), 
      g: Math.round(g * 255), 
      b: Math.round(b * 255) 
    };
  };
  
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
  };
  
  // Inicializar valores baseados no hex inicial
  useEffect(() => {
    try {
      if (!value || !value.startsWith('#')) return;
      
      const rgb = hexToRgb(value);
      setRgb(rgb);
      setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
      setHex(value.toUpperCase());
    } catch (err) {
      console.error("Erro ao converter cor:", err);
    }
  }, [value]);
  
  // Quando o HSV mudar, atualizar RGB e HEX
  useEffect(() => {
    const newRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
  }, [hsv]);
  
  // Detectar cliques e movimentos do mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!colorPickerRef.current) return;
    
    setIsDragging(true);
    
    const rect = colorPickerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    setHsv({
      ...hsv,
      s: x,
      v: 1 - y
    });
  };
  
  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    setIsMovingSlider(true);
    
    const rect = sliderRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    setHsv({
      ...hsv,
      h: y * 360
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && colorPickerRef.current) {
      const rect = colorPickerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      
      setHsv({
        ...hsv,
        s: x,
        v: 1 - y
      });
    } else if (isMovingSlider && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      
      setHsv({
        ...hsv,
        h: y * 360
      });
    }
  };
  
  const handleMouseUp = () => {
    if (isDragging || isMovingSlider) {
      setIsDragging(false);
      setIsMovingSlider(false);
      onChange(hex);
    }
  };
  
  // Adicionar e remover listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMovingSlider, hsv]);
  
  // Atualizar quando o input de hex mudar
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    if (!/^#?([0-9A-Fa-f]{0,6})$/.test(newHex)) return;
    
    setHex(newHex.startsWith('#') ? newHex : `#${newHex}`);
    
    if (newHex.length === 7 || (newHex.length === 6 && !newHex.startsWith('#'))) {
      const validHex = newHex.startsWith('#') ? newHex : `#${newHex}`;
      const newRgb = hexToRgb(validHex);
      setRgb(newRgb);
      setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
      onChange(validHex);
    }
  };
  
  // Atualizar quando os inputs RGB mudarem
  const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const numValue = parseInt(value) || 0;
    const validValue = Math.max(0, Math.min(255, numValue));
    
    const newRgb = { ...rgb, [component]: validValue };
    setRgb(newRgb);
    
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHsv(newHsv);
    
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
    onChange(newHex);
  };
  
  // Função para selecionar cores pré-definidas
  const handlePresetClick = (color: string) => {
    setHex(color);
    const newRgb = hexToRgb(color);
    setRgb(newRgb);
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    onChange(color);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`${sizes[size].picker} rounded cursor-pointer border shadow-sm transition-all hover:scale-105`}
          style={{ backgroundColor: hex }}
        />
      </PopoverTrigger>
      <PopoverContent 
        className={`p-4 ${sizes[size].popover}`}
        align="start"
        sideOffset={5}
      >
        <div className="flex flex-col space-y-4">
          {/* Área principal do seletor de cores */}
          <div className="flex space-x-3">
            {/* Área de saturação e valor */}
            <div 
              ref={colorPickerRef}
              className="relative w-full h-40 rounded cursor-crosshair" 
              style={{
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                backgroundImage: 'linear-gradient(to right, white, transparent), linear-gradient(to bottom, transparent, black)'
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Cursor de seleção */}
              <div 
                className="absolute h-3 w-3 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-md"
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                }}
              />
            </div>
            
            {/* Controle deslizante de matiz */}
            <div 
              ref={sliderRef}
              className="relative w-5 h-40 rounded cursor-pointer"
              style={{
                background: 'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
              onMouseDown={handleSliderMouseDown}
            >
              {/* Marcador de matiz */}
              <div 
                className="absolute w-7 h-3 bg-white rounded-sm border transform -translate-x-1 -translate-y-1/2 left-0 pointer-events-none shadow-sm"
                style={{
                  top: `${(hsv.h / 360) * 100}%`,
                }}
              />
            </div>
          </div>
          
          {/* Campo hexadecimal */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium w-8">#</span>
            <input
              type="text"
              value={hex.replace('#', '')}
              onChange={handleHexChange}
              className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary focus:outline-none"
              maxLength={6}
            />
          </div>
          
          {/* Campos RGB */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs">R</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs">G</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs">B</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          
          {/* Cores pré-definidas */}
          <div className="grid grid-cols-8 gap-1 mt-2">
            {commonColors.map((color) => (
              <div
                key={color}
                className="h-5 w-5 rounded-full cursor-pointer transform transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: color,
                  border: color === '#ffffff' ? '1px solid #e5e7eb' : 'none',
                  boxShadow: hex.toLowerCase() === color.toLowerCase() ? '0 0 0 2px #000' : 'none'
                }}
                onClick={() => handlePresetClick(color)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 