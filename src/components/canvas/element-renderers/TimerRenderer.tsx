import { useState, useEffect, useRef } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";

const formatTime = (seconds: number, format: string): string => {
  if (seconds <= 0) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  switch (format) {
    case "hh:mm:ss":
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    case "mm:ss":
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    case "ss":
      return remainingSeconds.toString().padStart(2, '0');
    default:
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

// Função para separar os dígitos de um valor para display individual
const getDigits = (value: number): string[] => {
  return value.toString().padStart(2, '0').split('');
};

const TimerRenderer = (props: ElementRendererProps) => {
  const { element, isSelected, onSelect } = props;
  const { content } = element;
  
  // Valores padrão caso não estejam definidos no content
  const {
    title = "Timer Personalizado",
    description = "Contagem regressiva",
    initialTime = 60,
    format = "mm:ss",
    showTitle = true,
    showDescription = true,
    showControls = true,
    autoStart = false,
    timerExpiredMessage = "Tempo esgotado!",
    displayStyle = "default",
    offerText = "Limited-time offer! Sale ends in",
    offerEmoji = "⚡",
    couponCode = "",
    style = {}
  } = content || {};
  
  const {
    titleAlign = "center",
    descriptionAlign = "center",
    timerAlign = "center",
    timerSize = "large",
    timerColor = "#4B5563",
    backgroundColor = "#f3f4f6",
    borderColor = "#e5e7eb",
    borderRadius = 8
  } = style || {};
  
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Função para determinar o tamanho do timer com base na configuração
  const getTimerSize = (): string => {
    switch (timerSize) {
      case "small":
        return "text-2xl";
      case "medium":
        return "text-3xl";
      case "large":
        return "text-4xl";
      case "xlarge":
        return "text-5xl";
      default:
        return "text-4xl";
    }
  };
  
  // Iniciar ou parar o timer com base no estado isActive
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setHasExpired(true);
            setIsActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft]);
  
  // Reset timer when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
    setHasExpired(false);
    if (autoStart) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsActive(false);
    }
  }, [initialTime, autoStart]);
  
  const handleStart = () => {
    if (timeLeft === 0) {
      // Reiniciar se o timer chegou a zero
      setTimeLeft(initialTime);
      setHasExpired(false);
    }
    setIsActive(true);
    setIsPaused(false);
  };
  
  const handlePause = () => {
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handleReset = () => {
    setTimeLeft(initialTime);
    setIsActive(false);
    setIsPaused(false);
    setHasExpired(false);
  };

  // Cálculos para valores de dias, horas, minutos e segundos para os novos estilos
  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Dígitos separados para estilos modernos
  const daysDigits = getDigits(days);
  const hoursDigits = getDigits(hours);
  const minutesDigits = getDigits(minutes);
  const secondsDigits = getDigits(seconds);
  
  // Renderiza o timer padrão
  const renderDefaultTimer = () => (
    <div 
      className="w-full p-4 rounded-md flex flex-col"
      style={{ 
        backgroundColor,
        borderColor,
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: `${borderRadius}px`
      }}
      onClick={onSelect ? () => onSelect(element.id) : undefined}
    >
      {showTitle && title && (
        <h3 
          className="font-medium mb-2" 
          style={{ 
            textAlign: titleAlign as "left" | "center" | "right",
            marginBottom: showDescription ? "0.5rem" : "1rem"
          }}
        >
          {title}
        </h3>
      )}
      
      {showDescription && description && (
        <p 
          className="text-sm mb-4 text-gray-600" 
          style={{ textAlign: descriptionAlign as "left" | "center" | "right" }}
        >
          {description}
        </p>
      )}
      
      <div 
        className="my-4 font-mono font-bold" 
        style={{ 
          textAlign: timerAlign as "left" | "center" | "right",
          color: timerColor
        }}
      >
        {hasExpired ? (
          <div className={`${getTimerSize()} font-bold`}>
            {timerExpiredMessage}
          </div>
        ) : (
          <div className={`${getTimerSize()} font-bold`}>
            {formatTime(timeLeft, format)}
          </div>
        )}
      </div>
      
      {showControls && renderControls()}
    </div>
  );

  // Renderiza o timer estilo Modern Blue
  const renderModernBlueTimer = () => (
    <div className="w-full p-4 rounded-md flex flex-col items-center bg-white">
      <div className="text-center mb-4 flex items-center gap-2 justify-center">
        <span className="text-xl">{offerEmoji}</span>
        <span className="text-2xl font-medium">{offerText}</span>
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-4 text-white">
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {daysDigits.map((digit, idx) => (
              <div 
                key={`days-${idx}`} 
                className="w-14 h-20 flex items-center justify-center bg-blue-500 rounded-md text-4xl font-bold"
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600 mt-1">Days</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {hoursDigits.map((digit, idx) => (
              <div 
                key={`hours-${idx}`} 
                className="w-14 h-20 flex items-center justify-center bg-blue-500 rounded-md text-4xl font-bold"
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600 mt-1">Hours</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {minutesDigits.map((digit, idx) => (
              <div 
                key={`minutes-${idx}`} 
                className="w-14 h-20 flex items-center justify-center bg-blue-500 rounded-md text-4xl font-bold"
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600 mt-1">Minutes</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {secondsDigits.map((digit, idx) => (
              <div 
                key={`seconds-${idx}`} 
                className="w-14 h-20 flex items-center justify-center bg-blue-500 rounded-md text-4xl font-bold"
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600 mt-1">Seconds</span>
        </div>
      </div>
      
      {showControls && (
        <div className="mt-4">
          {renderControls()}
        </div>
      )}
    </div>
  );

  // Renderiza o timer estilo Offer Yellow
  const renderOfferYellowTimer = () => (
    <div className="w-full p-4 rounded-md flex flex-col items-center bg-black text-white">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>Special Offer 30% OFF</span>
          <span>🔥</span>
        </div>
        {couponCode && (
          <div className="mt-2 text-xl">
            Your coupon: <span className="font-bold">{couponCode}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-4">
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center bg-yellow-400 rounded-md text-2xl font-bold text-black"
          >
            {days.toString().padStart(2, '0')}
          </div>
          <span className="text-sm mt-1">Days</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center bg-yellow-400 rounded-md text-2xl font-bold text-black"
          >
            {hours.toString().padStart(2, '0')}
          </div>
          <span className="text-sm mt-1">Hours</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center bg-yellow-400 rounded-md text-2xl font-bold text-black"
          >
            {minutes.toString().padStart(2, '0')}
          </div>
          <span className="text-sm mt-1">Minutes</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center bg-yellow-400 rounded-md text-2xl font-bold text-black"
          >
            {seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-sm mt-1">Seconds</span>
        </div>
      </div>
      
      {showControls && (
        <div className="mt-4">
          {renderControls()}
        </div>
      )}
    </div>
  );

  // Renderização dos controles do timer
  const renderControls = () => (
    <div className={`flex mt-2 gap-2 ${displayStyle === "default" ? `justify-${timerAlign}` : "justify-center"}`}>
      {!isActive ? (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
        >
          {timeLeft === initialTime ? "Iniciar" : "Reiniciar"}
        </button>
      ) : (
        <>
          {!isPaused ? (
            <button
              className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600"
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
            >
              Pausar
            </button>
          ) : (
            <button
              className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
              onClick={(e) => {
                e.stopPropagation();
                handleResume();
              }}
            >
              Continuar
            </button>
          )}
        </>
      )}
      
      <button
        className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          handleReset();
        }}
      >
        Resetar
      </button>
    </div>
  );
  
  // Renderiza o estilo de timer selecionado
  const renderSelectedTimerStyle = () => {
    if (hasExpired) {
      return (
        <div className="w-full p-4 rounded-md flex flex-col items-center">
          <div className={`${getTimerSize()} font-bold text-center`}>
            {timerExpiredMessage}
          </div>
          {showControls && renderControls()}
        </div>
      );
    }
    
    switch(displayStyle) {
      case "modern-blue":
        return renderModernBlueTimer();
      case "offer-yellow":
        return renderOfferYellowTimer();
      default:
        return renderDefaultTimer();
    }
  };
  
  return (
    <BaseElementRenderer {...props}>
      {renderSelectedTimerStyle()}
    </BaseElementRenderer>
  );
};

export default TimerRenderer; 