import React from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

// Usando componente de classe para ter maior controle sobre o ciclo de vida
class TimerRenderer extends React.Component<ElementRendererProps> {
  private timer: number | null = null;
  private endTime: Date | null = null;
  
  state = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  };
  
  componentDidMount() {
    this.startTimer();
  }
  
  componentDidUpdate(prevProps: ElementRendererProps) {
    // Se o tempo configurado mudou, reiniciar o timer
    if (
      prevProps.element.content?.timeInSeconds !== this.props.element.content?.timeInSeconds ||
      prevProps.previewMode !== this.props.previewMode
    ) {
      this.stopTimer();
      this.startTimer();
    }
  }
  
  componentWillUnmount() {
    this.stopTimer();
  }
  
  startTimer = () => {
    const { element, previewMode } = this.props;
    const { content = {} } = element;
    const timeInSeconds = content.timeInSeconds || 3600;
    
    // Em modo de edição, apenas mostrar o tempo sem contagem regressiva
    if (!previewMode) {
      this.calculateAndUpdateTime(timeInSeconds);
      return;
    }
    
    // Definir tempo de término
    this.endTime = new Date();
    this.endTime.setSeconds(this.endTime.getSeconds() + timeInSeconds);
    
    // Iniciar o intervalo para atualizar o tempo
    this.timer = window.setInterval(() => {
      const now = new Date();
      
      // Se já passou do tempo de término
      if (this.endTime && now >= this.endTime) {
        this.setState({ isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
        this.stopTimer();
        return;
      }
      
      // Calcular tempo restante
      if (this.endTime) {
        const diff = Math.floor((this.endTime.getTime() - now.getTime()) / 1000);
        this.calculateAndUpdateTime(diff);
      }
    }, 1000);
    
    // Calcular tempo inicial
    this.calculateAndUpdateTime(timeInSeconds);
  };
  
  stopTimer = () => {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  };
  
  calculateAndUpdateTime = (timeInSeconds: number) => {
    // Calcular componentes de tempo
    const days = Math.floor(timeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((timeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    this.setState({ days, hours, minutes, seconds });
  };
  
  formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  
  render() {
    const { element } = this.props;
    const { content = {} } = element;
    
    // Obter propriedades do timer com valores padrão
    const title = content.title || "Oferta por tempo limitado";
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
    const alignment = content.alignment || "center";
    const marginTop = content.marginTop || 0;
    const marginBottom = content.marginBottom || 0;
    const borderRadius = content.borderRadius || 8;
    const showBorder = content.showBorder !== false;
    const borderColor = content.borderColor || "#E2E8F0";
    const showLabels = content.showLabels !== false;
    const labelPosition = content.labelPosition || "bottom"; // bottom, top
    const showIcon = content.showIcon !== false;
    
    // Obter valores do estado
    const { days, hours, minutes, seconds, isExpired } = this.state;
    
    // Renderizar um bloco de tempo
    const renderTimeBlock = (value: number, label: string, show: boolean) => {
      if (!show) return null;
      
      return (
        <div className="flex flex-col items-center mx-2" key={label}>
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
            {this.formatNumber(value)}
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
    const renderSeparator = (key: string) => (
      <div key={key} className="text-xl mx-1" style={{ color: accentColor }}>:</div>
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
      <BaseElementRenderer {...this.props}>
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
                {showDays && (showHours || showMinutes || showSeconds) && renderSeparator('sep1')}
                
                {showHours && renderTimeBlock(hours, "horas", showHours)}
                {showHours && (showMinutes || showSeconds) && renderSeparator('sep2')}
                
                {showMinutes && renderTimeBlock(minutes, "min", showMinutes)}
                {showMinutes && showSeconds && renderSeparator('sep3')}
                
                {showSeconds && renderTimeBlock(seconds, "seg", showSeconds)}
              </div>
            )}
          </div>
        </div>
      </BaseElementRenderer>
    );
  }
}

export default TimerRenderer; 