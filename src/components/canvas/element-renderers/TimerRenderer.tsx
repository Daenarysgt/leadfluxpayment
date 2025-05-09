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
    showExpiredMessage = true,
    expiredMessageColor = "#ff0000",
    expiredMessageSize = "large",
    displayStyle = "modern-blue",
    offerText = "Limited-time offer! Sale ends in",
    offerEmoji = "⚡",
    offerTitle = "Special Offer 30% OFF",
    couponCode = "",
    couponPrefix = "Your coupon:",
    showDays = true,
    showHours = true,
    daysText = "Days",
    hoursText = "Hours",
    minutesText = "Minutes",
    secondsText = "Seconds",
    modernBlueColor = "#3b82f6",
    modernBlueTextColor = "#ffffff",
    modernBlueLabelColor = "#6b7280",
    offerBgColor = "#000000",
    offerTextColor = "#ffffff",
    offerYellowColor = "#eab308",
    offerDigitTextColor = "#000000",
    // Textos dos botões
    startButtonText = "Iniciar",
    restartButtonText = "Reiniciar",
    pauseButtonText = "Pausar",
    resumeButtonText = "Continuar",
    resetButtonText = "Resetar",
    // Cores dos botões
    startButtonColor = "#2563eb",
    pauseButtonColor = "#eab308",
    resumeButtonColor = "#22c55e", 
    resetButtonColor = "#6b7280",
    buttonTextColor = "#ffffff",
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

  // Função para determinar o tamanho da mensagem de tempo esgotado
  const getExpiredMessageSize = (): string => {
    switch (expiredMessageSize) {
      case "small":
        return "text-lg";
      case "medium":
        return "text-xl";
      case "large":
        return "text-2xl";
      case "xlarge":
        return "text-3xl";
      default:
        return "text-2xl";
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
  
  // Renderiza o timer estilo Modern Blue
  const renderModernBlueTimer = () => (
    <div className="w-full p-4 rounded-md flex flex-col items-center bg-white">
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
      
      <div className="text-center mb-4 flex items-center gap-2 justify-center">
        <span className="text-xl">{offerEmoji}</span>
        <span className="text-2xl font-medium">{offerText}</span>
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-4">
        {showDays && (
          <div className="flex flex-col items-center">
            <div className="flex gap-1">
              {daysDigits.map((digit, idx) => (
                <div 
                  key={`days-${idx}`} 
                  className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                  style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{daysText}</span>
          </div>
        )}
        
        {showHours && (
          <div className="flex flex-col items-center">
            <div className="flex gap-1">
              {hoursDigits.map((digit, idx) => (
                <div 
                  key={`hours-${idx}`} 
                  className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                  style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{hoursText}</span>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {minutesDigits.map((digit, idx) => (
              <div 
                key={`minutes-${idx}`} 
                className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{minutesText}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {secondsDigits.map((digit, idx) => (
              <div 
                key={`seconds-${idx}`} 
                className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{secondsText}</span>
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
    <div 
      className="w-full p-4 rounded-md flex flex-col items-center" 
      style={{ backgroundColor: offerBgColor, color: offerTextColor }}
    >
      {showTitle && title && (
        <h3 
          className="font-medium mb-2" 
          style={{ 
            textAlign: titleAlign as "left" | "center" | "right",
            marginBottom: showDescription ? "0.5rem" : "1rem",
            color: offerTextColor
          }}
        >
          {title}
        </h3>
      )}
      
      {showDescription && description && (
        <p 
          className="text-sm mb-4" 
          style={{ 
            textAlign: descriptionAlign as "left" | "center" | "right", 
            color: offerTextColor 
          }}
        >
          {description}
        </p>
      )}
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>{offerTitle}</span>
          <span>{offerEmoji}</span>
        </div>
        {couponCode && (
          <div className="mt-2 text-xl">
            {couponPrefix} <span className="font-bold">{couponCode}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-4">
        {showDays && (
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
              style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
            >
              {days.toString().padStart(2, '0')}
            </div>
            <span className="text-sm mt-1" style={{ color: offerTextColor }}>{daysText}</span>
          </div>
        )}
        
        {showHours && (
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
              style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
            >
              {hours.toString().padStart(2, '0')}
            </div>
            <span className="text-sm mt-1" style={{ color: offerTextColor }}>{hoursText}</span>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
            style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
          >
            {minutes.toString().padStart(2, '0')}
          </div>
          <span className="text-sm mt-1" style={{ color: offerTextColor }}>{minutesText}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
            style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
          >
            {seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-sm mt-1" style={{ color: offerTextColor }}>{secondsText}</span>
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
    <div className="flex mt-2 gap-2 justify-center">
      {!isActive ? (
        <button
          className="px-3 py-1 rounded-md text-sm"
          style={{ 
            backgroundColor: startButtonColor, 
            color: buttonTextColor 
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
        >
          {timeLeft === initialTime ? startButtonText : restartButtonText}
        </button>
      ) : (
        <>
          {!isPaused ? (
            <button
              className="px-3 py-1 rounded-md text-sm"
              style={{ 
                backgroundColor: pauseButtonColor, 
                color: buttonTextColor 
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
            >
              {pauseButtonText}
            </button>
          ) : (
            <button
              className="px-3 py-1 rounded-md text-sm"
              style={{ 
                backgroundColor: resumeButtonColor, 
                color: buttonTextColor 
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleResume();
              }}
            >
              {resumeButtonText}
            </button>
          )}
        </>
      )}
      
      <button
        className="px-3 py-1 rounded-md text-sm"
        style={{ 
          backgroundColor: resetButtonColor, 
          color: buttonTextColor 
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleReset();
        }}
      >
        {resetButtonText}
      </button>
    </div>
  );
  
  // Renderiza o estilo de timer expirado para o estilo Moderno Azul
  const renderExpiredModernBlue = () => (
    <div className="w-full p-4 rounded-md flex flex-col items-center bg-white">
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
      
      {showExpiredMessage !== false && (
        <div className="text-center mb-4 flex items-center gap-2 justify-center">
          <div className={`${getExpiredMessageSize()} font-bold text-center`} style={{ color: expiredMessageColor }}>
            {timerExpiredMessage}
          </div>
        </div>
      )}
      
      <div className="flex justify-center gap-2 sm:gap-4">
        {showDays && (
          <div className="flex flex-col items-center">
            <div className="flex gap-1">
              {['0', '0'].map((digit, idx) => (
                <div 
                  key={`days-${idx}`} 
                  className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                  style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{daysText}</span>
          </div>
        )}
        
        {showHours && (
          <div className="flex flex-col items-center">
            <div className="flex gap-1">
              {['0', '0'].map((digit, idx) => (
                <div 
                  key={`hours-${idx}`} 
                  className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                  style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{hoursText}</span>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {['0', '0'].map((digit, idx) => (
              <div 
                key={`minutes-${idx}`} 
                className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{minutesText}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {['0', '0'].map((digit, idx) => (
              <div 
                key={`seconds-${idx}`} 
                className="w-14 h-20 flex items-center justify-center rounded-md text-4xl font-bold"
                style={{ backgroundColor: modernBlueColor, color: modernBlueTextColor }}
              >
                {digit}
              </div>
            ))}
          </div>
          <span className="text-sm mt-1" style={{ color: modernBlueLabelColor }}>{secondsText}</span>
        </div>
      </div>
      
      {showControls && (
        <div className="mt-4">
          {renderControls()}
        </div>
      )}
    </div>
  );

  // Renderiza o estilo de timer expirado para o estilo Oferta Amarelo
  const renderExpiredOfferYellow = () => (
    <div 
      className="w-full p-4 rounded-md flex flex-col items-center" 
      style={{ backgroundColor: offerBgColor, color: offerTextColor }}
    >
      {showTitle && title && (
        <h3 
          className="font-medium mb-2" 
          style={{ 
            textAlign: titleAlign as "left" | "center" | "right",
            marginBottom: showDescription ? "0.5rem" : "1rem",
            color: offerTextColor
          }}
        >
          {title}
        </h3>
      )}
      
      {showDescription && description && (
        <p 
          className="text-sm mb-4" 
          style={{ 
            textAlign: descriptionAlign as "left" | "center" | "right", 
            color: offerTextColor 
          }}
        >
          {description}
        </p>
      )}
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>{offerTitle}</span>
          <span>{offerEmoji}</span>
        </div>
        {couponCode && (
          <div className="mt-2 text-xl">
            {couponPrefix} <span className="font-bold">{couponCode}</span>
          </div>
        )}
      </div>
      
      {showExpiredMessage !== false && (
        <div className="text-center mb-4">
          <div className={`${getExpiredMessageSize()} font-bold text-center`} style={{ color: expiredMessageColor }}>
            {timerExpiredMessage}
          </div>
        </div>
      )}
      
      <div className="flex justify-center gap-2 sm:gap-4">
        {showDays && (
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
              style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
            >
              00
            </div>
            <span className="text-sm mt-1" style={{ color: offerTextColor }}>{daysText}</span>
          </div>
        )}
        
        {showHours && (
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
              style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
            >
              00
            </div>
            <span className="text-sm mt-1" style={{ color: offerTextColor }}>{hoursText}</span>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
            style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
          >
            00
          </div>
          <span className="text-sm mt-1" style={{ color: offerTextColor }}>{minutesText}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-14 flex items-center justify-center rounded-md text-2xl font-bold"
            style={{ backgroundColor: offerYellowColor, color: offerDigitTextColor }}
          >
            00
          </div>
          <span className="text-sm mt-1" style={{ color: offerTextColor }}>{secondsText}</span>
        </div>
      </div>
      
      {showControls && (
        <div className="mt-4">
          {renderControls()}
        </div>
      )}
    </div>
  );
  
  // Renderiza o estilo de timer selecionado
  const renderSelectedTimerStyle = () => {
    if (hasExpired) {
      return displayStyle === "offer-yellow" 
        ? renderExpiredOfferYellow() 
        : renderExpiredModernBlue();
    }
    
    return displayStyle === "offer-yellow" 
      ? renderOfferYellowTimer() 
      : renderModernBlueTimer();
  };
  
  return (
    <BaseElementRenderer {...props}>
      {renderSelectedTimerStyle()}
    </BaseElementRenderer>
  );
};

export default TimerRenderer; 