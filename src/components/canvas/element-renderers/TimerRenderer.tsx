import React, { useState, useEffect } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const TimerRenderer = (props: ElementRendererProps) => {
  const { element, previewMode } = props;
  const { content = {} } = element;

  // Obter propriedades do timer com valores padrão
  const title = content.title || "Oferta por tempo limitado";
  const timeInSeconds = content.timeInSeconds || 3600; // 1 hora padrão
  const showDays = content.showDays !== false;
  const showHours = content.showHours !== false;
  const showMinutes = content.showMinutes !== false;
  const showSeconds = content.showSeconds !== false;
  const expireText = content.expireText || "Oferta expirada!";
  const fontSize = content.fontSize || 24;
  const fontColor = content.fontColor || "#000000";
  const backgroundColor = content.backgroundColor || "#F5F5F5";
  const accentColor = content.accentColor || "#FF4136";
  const labelColor = content.labelColor || "#666666";
  const fontFamily = content.fontFamily || "Inter";
  const style = content.style || "blocks"; // blocks, digital, minimal
  const alignment = content.alignment || "center";
  const marginTop = content.marginTop || 0;
  const marginBottom = content.marginBottom || 0;
  const borderRadius = content.borderRadius || 8;
  const showBorder = content.showBorder !== false;
  const borderColor = content.borderColor || "#E2E8F0";
  const showLabels = content.showLabels !== false;
  const labelPosition = content.labelPosition || "bottom"; // bottom, top
  const showIcon = content.showIcon !== false;

  // Estados básicos do timer
  const [remaining, setRemaining] = useState(timeInSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Definir o tempo inicial baseado nas props
  useEffect(() => {
    if (!isActive || !previewMode) {
      // Reseta o timer quando o tempo muda ou não está ativo
      setRemaining(timeInSeconds);
      setIsExpired(false);
    }
  }, [timeInSeconds, previewMode, isActive]);

  // Efeito principal do timer - absolutamente simples
  useEffect(() => {
    // Apenas iniciar o timer em modo de preview
    if (!previewMode) {
      return;
    }

    // Iniciar o timer
    setIsActive(true);
    
    // Função simples que diminui o tempo a cada segundo
    const tick = () => {
      setRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    };
    
    // Criar timer com intervalo de 1 segundo
    const timerId = window.setInterval(tick, 1000);
    
    // Limpar o timer quando o componente desmontar
    return () => {
      window.clearInterval(timerId);
      setIsActive(false);
    };
  }, [previewMode]);

  // Calcular componentes de tempo
  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remaining % (60 * 60)) / 60);
  const seconds = Math.floor(remaining % 60);

  // Formatar número com zero à esquerda
  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  // Renderizar um bloco de tempo
  const renderTimeBlock = (value, label, show) => {
    if (!show) return null;

    return (
      <div className="flex flex-col items-center mx-2">
        <div 
          className={cn(
            "flex items-center justify-center p-3 rounded",
            showBorder ? "border" : ""
          )}
          style={{
            backgroundColor,
            color: fontColor,
            borderColor: borderColor,
            minWidth: "64px",
            minHeight: "64px",
            fontSize: `${fontSize}px`,
            fontFamily,
            borderRadius: `${borderRadius}px`
          }}
        >
          {formatNumber(value)}
        </div>
        {showLabels && (
          <div 
            className={cn(
              "text-center text-sm mt-1",
              labelPosition === "top" ? "order-first mb-1" : ""
            )}
            style={{ color: labelColor }}
          >
            {label}
          </div>
        )}
      </div>
    );
  };

  // Renderizar separador de tempo
  const renderSeparator = () => (
    <div className="text-xl mx-1" style={{ color: accentColor }}>:</div>
  );

  // Obter classe de alinhamento
  const getAlignmentClass = () => {
    switch (alignment) {
      case "left": return "justify-start";
      case "right": return "justify-end";
      default: return "justify-center";
    }
  };

  return (
    <BaseElementRenderer {...props}>
      <div 
        className="w-full"
        style={{
          marginTop: `${marginTop}px`,
          marginBottom: `${marginBottom}px`
        }}
      >
        {title && (
          <div 
            className={cn("w-full mb-3 text-center")}
            style={{
              color: fontColor,
              fontSize: `${fontSize * 0.8}px`,
              fontFamily
            }}
          >
            {title}
          </div>
        )}
        
        <div className={cn("flex w-full", getAlignmentClass())}>
          {showIcon && (
            <div className="mr-2 flex items-center">
              <Clock size={fontSize} color={accentColor} />
            </div>
          )}
          
          {isExpired ? (
            <div 
              className="text-center"
              style={{
                color: accentColor,
                fontSize: `${fontSize}px`,
                fontFamily
              }}
            >
              {expireText}
            </div>
          ) : (
            <div className="flex items-center">
              {showDays && renderTimeBlock(days, "dias", showDays)}
              {showDays && (showHours || showMinutes || showSeconds) && renderSeparator()}
              
              {showHours && renderTimeBlock(hours, "horas", showHours)}
              {showHours && (showMinutes || showSeconds) && renderSeparator()}
              
              {showMinutes && renderTimeBlock(minutes, "min", showMinutes)}
              {showMinutes && showSeconds && renderSeparator()}
              
              {showSeconds && renderTimeBlock(seconds, "seg", showSeconds)}
            </div>
          )}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default TimerRenderer; 