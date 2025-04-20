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

  // Simplificando a lógica do contador
  const [countdown, setCountdown] = useState(timeInSeconds);
  const [expired, setExpired] = useState(false);
  
  // Forçar a exibição do tempo configurado no modo de edição
  useEffect(() => {
    if (!previewMode) {
      setCountdown(timeInSeconds);
      setExpired(false);
    }
  }, [timeInSeconds, previewMode]);
  
  // Contagem regressiva simples quando em modo preview
  useEffect(() => {
    // Apenas iniciar o timer quando estiver em modo de preview
    if (!previewMode) return;
    
    console.log(`Timer iniciado com ${countdown} segundos restantes`);
    
    // Iniciar o intervalo de contagem regressiva
    const timerInterval = setInterval(() => {
      setCountdown(current => {
        // Quando chegar a zero, parar e exibir mensagem de expirado
        if (current <= 1) {
          clearInterval(timerInterval);
          setExpired(true);
          console.log("Timer expirado!");
          return 0;
        }
        // Decrementar normalmente
        return current - 1;
      });
    }, 1000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => {
      clearInterval(timerInterval);
      console.log("Timer limpo");
    };
  }, [previewMode]);
  
  // Efeito para reiniciar o timer quando o timeInSeconds mudar
  useEffect(() => {
    if (previewMode) {
      setCountdown(timeInSeconds);
      setExpired(false);
      console.log(`Timer reiniciado com ${timeInSeconds} segundos`);
    }
  }, [timeInSeconds, previewMode]);

  // Calcular componentes de tempo
  const days = Math.floor(countdown / (24 * 60 * 60));
  const hours = Math.floor((countdown % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((countdown % (60 * 60)) / 60);
  const seconds = Math.floor(countdown % 60);

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

  // Log para depuração
  useEffect(() => {
    if (previewMode && (countdown % 5 === 0 || countdown <= 5)) {
      console.log(`Timer: ${days}d:${hours}h:${minutes}m:${seconds}s`);
    }
  }, [countdown, previewMode, days, hours, minutes, seconds]);

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
          
          {expired ? (
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