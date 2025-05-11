import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para converter Hex para HSL
export function hexToHSL(hex: string) {
  // Remove o # se existir
  hex = hex.replace('#', '');

  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return { h, s, l };
}

// Função para atualizar a variável CSS de tema
export function updateThemeColor(colorHex: string) {
  try {
    const hsl = hexToHSL(colorHex);
    // Atualizar variáveis CSS globais
    document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    console.log(`Atualizada variável CSS --primary para: ${hsl.h} ${hsl.s}% ${hsl.l}%`);
  } catch (error) {
    console.error('Erro ao atualizar cor do tema:', error);
  }
}
