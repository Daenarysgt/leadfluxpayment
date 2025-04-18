import React, { useState, useRef, useCallback, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";

interface ButtonProps {
  element: CanvasElement;
  onClick?: () => void;
  isEditor?: boolean;
}

export function Button({ element, onClick, isEditor }: ButtonProps) {
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [isVisible, setIsVisible] = useState(!element.content?.delayEnabled);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Extract content and properties with defaults
  const content = element.content || {};
  const buttonText = content.buttonText || "Continuar";
  const alignment = content.alignment || "center";
  const size = content.size || "default";
  const variant = content.variant || "default";
  const buttonColor = content.buttonColor || "#7c3aed"; // Default to violet-600
  const textColor = content.textColor || "#ffffff"; // Default text color
  const animationEnabled = Boolean(content.animationEnabled);
  const animationType = content.animationType || "none";
  const delayEnabled = Boolean(content.delayEnabled);
  const delayTime = content.delayTime || 0;
  const marginTop = content.marginTop || 0;

  // Handle navigation on click
  const handleClick = useCallback(() => {
    // Don't trigger navigation in editor
    if (isEditor) return;
    
    // For real user flow, trigger the onClick
    if (onClick) onClick();
  }, [onClick, isEditor]);

  // Show button after delay if delay is enabled
  useEffect(() => {
    if (delayEnabled && !isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delayTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [delayEnabled, delayTime, isVisible]);

  // Run animation effect
  useEffect(() => {
    if (animationEnabled && isVisible && !animationPlayed && buttonRef.current) {
      setAnimationPlayed(true);
      
      // Apply the animation based on the selected type
      if (animationType === "pulse") {
        buttonRef.current.classList.add("animate-pulse");
      } else if (animationType === "bounce") {
        buttonRef.current.classList.add("animate-bounce");
      } else if (animationType === "shake") {
        buttonRef.current.classList.add("animate-shake");
      }
    }
  }, [animationEnabled, isVisible, animationPlayed, animationType]);

  // Handle alignment styles
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Size classes
  const sizeClasses = {
    small: "py-1 px-3 text-sm rounded-md",
    default: "py-2 px-4 text-base rounded-lg",
    large: "py-3 px-6 text-lg rounded-lg",
  };

  // Style classes for the button based on the settings
  const buttonClasses = `
    w-full 
    font-medium
    transition-all 
    duration-200 
    ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default}
  `;

  // Inline styles for custom colors
  const buttonStyles = {
    backgroundColor: variant === "outline" ? "transparent" : buttonColor,
    color: variant === "outline" ? buttonColor : textColor,
    border: variant === "outline" ? `2px solid ${buttonColor}` : "none",
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`w-full ${alignmentClasses[alignment as keyof typeof alignmentClasses]}`}
      style={{ display: "flex", marginTop: `${marginTop}px` }}
    >
      <div
        ref={buttonRef}
        className={buttonClasses}
        style={buttonStyles}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {buttonText}
      </div>
    </div>
  );
} 