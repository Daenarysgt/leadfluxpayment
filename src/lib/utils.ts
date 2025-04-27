import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFontStyle(
  fontFamily?: string, 
  fontSize?: number | string, 
  fontWeight?: number | string, 
  fontStyle?: string, 
  textDecoration?: string, 
  textTransform?: string
) {
  return {
    fontFamily: fontFamily || 'inherit',
    fontSize: fontSize ? `${fontSize}px` : 'inherit',
    fontWeight: fontWeight || 'inherit',
    fontStyle: fontStyle || 'inherit',
    textDecoration: textDecoration || 'inherit',
    textTransform: textTransform || 'inherit',
  };
}
