import React, { useState, useEffect, useRef } from "react";
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

  // Estado para controlar o tempo restante
  const [timeRemaining, setTimeRemaining] = useState(timeInSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousTimeInSeconds = useRef(timeInSeconds);

  // Calcular dias, horas, minutos e segundos
  const days = Math.floor(timeRemaining / (24 * 60 * 60));
  const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
  const seconds = Math.floor(timeRemaining % 60);

  // Efeito para detectar mudanças no timeInSeconds e resetar o timer
  useEffect(() => {
    // Verifica se o tempo configurado mudou
    if (timeInSeconds !== previousTimeInSeconds.current) {
      console.log(`Timer: tempo configurado mudou de ${previousTimeInSeconds.current} para ${timeInSeconds}`);
      
      // Atualiza o tempo restante para o novo valor
      setTimeRemaining(timeInSeconds);
      setIsExpired(false);
      
      // Salva o novo valor para comparação futura
      previousTimeInSeconds.current = timeInSeconds;
      
      // Se estiver em modo de preview e o timer já estiver rodando, reinicia
      if (previewMode && timerRef.current) {
        clearInterval(timerRef.current);
        startTimer();
      }
    }
  }, [timeInSeconds, previewMode]);

  // Função para iniciar o timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Efeito para iniciar/parar o timer
  useEffect(() => {
    // Apenas iniciar o timer em modo de preview
    if (previewMode) {
      startTimer();

      // Limpar ao desmontar
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      // Em modo de edição, apenas definir o tempo sem iniciar a contagem regressiva
      setTimeRemaining(timeInSeconds);
      setIsExpired(false);
    }
  }, [previewMode]);

  // Formatar número com zero à esquerda se necessário
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  // Renderizar um bloco de tempo de acordo com o estilo
  const renderTimeBlock = (value: number, label: string, show: boolean) => {
    if (!show) return null;

    if (style === "blocks") {
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
    } else if (style === "digital") {
      return (
        <div className="flex flex-col items-center mx-1">
          <div 
            className="font-mono"
            style={{
              color: fontColor,
              fontSize: `${fontSize}px`,
              fontFamily: "monospace",
            }}
          >
            {formatNumber(value)}
          </div>
          {showLabels && (
            <div 
              className={cn(
                "text-center text-xs",
                labelPosition === "top" ? "order-first mb-1" : "mt-1"
              )}
              style={{ color: labelColor }}
            >
              {label}
            </div>
          )}
        </div>
      );
    } else { // minimal
      return (
        <div className="flex flex-col items-center mx-1">
          <div 
            style={{
              color: fontColor,
              fontSize: `${fontSize}px`,
              fontFamily,
            }}
          >
            {formatNumber(value)}
          </div>
          {showLabels && (
            <div 
              className={cn(
                "text-center text-xs",
                labelPosition === "top" ? "order-first mb-1" : "mt-1"
              )}
              style={{ color: labelColor }}
            >
              {label}
            </div>
          )}
        </div>
      );
    }
  };

  // Renderizar o separador de acordo com o estilo
  const renderSeparator = () => {
    if (style === "blocks") {
      return <div className="text-xl mx-1" style={{ color: accentColor }}>:</div>;
    } else if (style === "digital") {
      return <div className="text-xl mx-0" style={{ color: fontColor }}>:</div>;
    } else { // minimal
      return <div className="text-xl mx-0" style={{ color: fontColor }}>:</div>;
    }
  };

  // Obter a classe de alinhamento
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