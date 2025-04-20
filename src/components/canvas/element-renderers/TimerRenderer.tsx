import { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Clock, AlarmClock } from "lucide-react";

const TimerRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content = {} } = element;
  
  // Get timer settings from content or use defaults
  const title = content.title || "Conta Regressiva";
  const description = content.description || "Aproveite esta oferta especial por tempo limitado!";
  const initialHours = content.hours || 0;
  const initialMinutes = content.minutes || 30;
  const initialSeconds = content.seconds || 0;
  const showDays = content.showDays !== undefined ? content.showDays : false;
  const showHours = content.showHours !== undefined ? content.showHours : true;
  const showMinutes = content.showMinutes !== undefined ? content.showMinutes : true;
  const showSeconds = content.showSeconds !== undefined ? content.showSeconds : true;
  const expireText = content.expireText || "Oferta Expirada!";
  
  // Style options
  const style = content.style || {};
  const titleAlign = style.titleAlign || "center";
  const descriptionAlign = style.descriptionAlign || "center";
  const timerAlign = style.timerAlign || "center";
  const backgroundColor = style.backgroundColor || "#FFFFFF";
  const borderColor = style.borderColor || "#E5E7EB";
  const borderWidth = style.borderWidth || 1;
  const borderRadius = style.borderRadius || 8;
  const textColor = style.textColor || "#111827";
  const digitBackgroundColor = style.digitBackgroundColor || "#F3F4F6";
  const digitTextColor = style.digitTextColor || "#1F2937";
  const labelTextColor = style.labelTextColor || "#6B7280";
  const expireTextColor = style.expireTextColor || "#EF4444";
  const size = style.size || "medium";
  
  // Calculate total seconds
  const initialTotalSeconds = 
    (initialHours * 60 * 60) + 
    (initialMinutes * 60) + 
    initialSeconds;
  
  // State for timer
  const [timeLeft, setTimeLeft] = useState(initialTotalSeconds);
  const [isExpired, setIsExpired] = useState(false);
  
  // Calculate time units
  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
  const seconds = Math.floor(timeLeft % 60);
  
  // Size classes
  const sizeClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl",
  };
  
  const labelSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };
  
  const digitSizeClass = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium;
  const labelSizeClass = labelSizeClasses[size as keyof typeof labelSizeClasses] || labelSizeClasses.medium;
  
  // Countdown effect
  useEffect(() => {
    if (!element.previewMode) return;
    
    let interval: NodeJS.Timeout | null = null;
    
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsExpired(true);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      setIsExpired(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, element.previewMode]);
  
  // Render a digit block
  const renderDigit = (value: number, label: string, show: boolean) => {
    if (!show) return null;
    
    return (
      <div className="flex flex-col items-center mx-1 md:mx-2">
        <div 
          className={cn(
            "flex items-center justify-center font-mono font-bold rounded-md min-w-[2.5em] py-2 px-1",
            digitSizeClass
          )}
          style={{
            backgroundColor: digitBackgroundColor,
            color: digitTextColor,
          }}
        >
          {value.toString().padStart(2, '0')}
        </div>
        <span 
          className={cn("mt-1", labelSizeClass)}
          style={{ color: labelTextColor }}
        >
          {label}
        </span>
      </div>
    );
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div
        className={cn(
          "w-full p-4 flex flex-col overflow-hidden",
          element.previewMode ? "cursor-default" : ""
        )}
        style={{
          backgroundColor,
          borderColor,
          borderWidth: `${borderWidth}px`,
          borderStyle: "solid",
          borderRadius: `${borderRadius}px`,
          color: textColor,
        }}
      >
        {title && (
          <div 
            className={cn("font-bold mb-2", {
              "text-left": titleAlign === "left",
              "text-center": titleAlign === "center",
              "text-right": titleAlign === "right"
            })}
          >
            {title}
          </div>
        )}
        
        {description && (
          <div 
            className={cn("mb-4", {
              "text-left": descriptionAlign === "left",
              "text-center": descriptionAlign === "center",
              "text-right": descriptionAlign === "right"
            })}
          >
            {description}
          </div>
        )}
        
        <div 
          className={cn("flex items-center justify-center my-2", {
            "justify-start": timerAlign === "left",
            "justify-center": timerAlign === "center",
            "justify-end": timerAlign === "right"
          })}
        >
          {isExpired ? (
            <div 
              className="font-bold text-center py-2"
              style={{ color: expireTextColor }}
            >
              {expireText}
            </div>
          ) : (
            <>
              {renderDigit(days, "Dias", showDays)}
              {renderDigit(hours, "Horas", showHours)}
              {renderDigit(minutes, "Min", showMinutes)}
              {renderDigit(seconds, "Seg", showSeconds)}
            </>
          )}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default TimerRenderer; 