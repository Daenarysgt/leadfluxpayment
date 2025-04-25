import React, { useState, useEffect, useRef } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { Bell, Volume2, VolumeX, XCircle, Image as ImageIcon } from "lucide-react";
import { NotificationContent } from "@/types/canvasTypes";
import ElementWrapper from "../ElementWrapper";

const NotificationRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown, index, totalElements, previewMode } = props;
  const content = element.content as NotificationContent || {};
  
  // Valores padrão
  const {
    toastText = "Nova venda realizada!",
    toastTitle = "Venda realizada com Pix",
    toastSubtitle = "Sua comissão: R$34,90 - #P00000009", 
    toastEnabled = true,
    soundEnabled = true,
    soundType = "sale",
    toastColor = "#FF5733",
    toastTextColor = "#ffffff",
    toastDuration = 5,
    toastPosition = "bottom-right",
    showIcon = true,
    iconType = "success",
    showImage = true,
    customImage = "",
    borderRadius = 8,
    titleFontSize = 14,
    subtitleFontSize = 12,
  } = content;
  
  const [showToast, setShowToast] = useState(false);
  const hasTriggeredRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Render da notificação no estilo correto para o canvas
  const renderNotification = () => {
    return (
      <div 
        className="flex items-center shadow-md w-full overflow-hidden"
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
        }}
      >
        {showImage && (
          <div className="flex-shrink-0 p-3" style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
            {customImage ? (
              <img src={customImage} alt="Notification" className="h-10 w-10" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full">
                <Bell className="h-6 w-6" style={{color: toastColor}} />
              </div>
            )}
          </div>
        )}
        <div className="py-3 px-4">
          <div className="font-medium" style={{fontSize: `${titleFontSize}px`}}>{toastTitle}</div>
          <div className="opacity-90" style={{fontSize: `${subtitleFontSize}px`}}>{toastSubtitle}</div>
        </div>
      </div>
    );
  };
  
  // Renderizar o toast para visualização na tela (quando em previewMode)
  const renderToast = () => {
    if (!toastEnabled) return null;
    
    // Determinar posição do toast
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    return (
      <div 
        className={`fixed ${positionClasses[toastPosition as keyof typeof positionClasses]} z-[9999] flex items-center shadow-lg transition-opacity ${showToast ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
          maxWidth: '320px',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        {showImage && (
          <div className="flex-shrink-0 p-3" style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
            {customImage ? (
              <img src={customImage} alt="Notification" className="h-10 w-10" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full">
                <Bell className="h-6 w-6" style={{color: toastColor}} />
              </div>
            )}
          </div>
        )}
        <div className="py-3 px-4">
          <div className="font-medium" style={{fontSize: `${titleFontSize}px`}}>{toastTitle}</div>
          <div className="opacity-90" style={{fontSize: `${subtitleFontSize}px`}}>{toastSubtitle}</div>
        </div>
      </div>
    );
  };
  
  const playSound = () => {
    if (soundEnabled) {
      try {
        // Usar o audioRef para garantir que temos apenas uma instância do áudio
        if (!audioRef.current) {
          const soundPath = `/sounds/${soundType}.mp3`;
          audioRef.current = new Audio(soundPath);
        }
        
        // Reiniciar o áudio se já estiver carregado
        if (audioRef.current.readyState > 0) {
          audioRef.current.currentTime = 0;
        }
        
        // Tocar o som com tratamento de erros adequado
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Erro ao reproduzir som:", error);
          });
        }
      } catch (error) {
        console.warn("Erro ao configurar o som:", error);
      }
    }
  };
  
  // Função para mostrar a notificação
  const showNotification = () => {
    if (hasTriggeredRef.current) return; // Evitar trigger múltiplo
    hasTriggeredRef.current = true;
    
    // Tocar o som
    if (soundEnabled) {
      playSound();
    }
    
    // Mostrar o toast
    if (toastEnabled) {
      setShowToast(true);
      
      // Esconder o toast após o tempo configurado
      setTimeout(() => {
        setShowToast(false);
      }, toastDuration * 1000);
    }
  };
  
  // Carregar o áudio quando o componente montar (para pré-carregar)
  useEffect(() => {
    if (soundEnabled) {
      const soundPath = `/sounds/${soundType}.mp3`;
      audioRef.current = new Audio(soundPath);
      
      // Preload do áudio
      audioRef.current.load();
    }
    
    // Limpar referência quando o componente desmontar
    return () => {
      audioRef.current = null;
      hasTriggeredRef.current = false;
    };
  }, [soundType, soundEnabled]);
  
  // Trigger da notificação quando em modo preview ou funil público
  useEffect(() => {
    // Detectar se estamos em um iframe (provável visualização pública)
    const isInIframe = window.self !== window.top;
    const shouldActivate = previewMode || isInIframe;
    
    if (shouldActivate && !hasTriggeredRef.current) {
      console.log("NotificationRenderer - Ativando notificação");
      
      // Pequeno delay para garantir que a página carregou completamente
      const timer = setTimeout(() => {
        showNotification();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [previewMode]);

  return (
    <ElementWrapper
      element={element}
      isSelected={isSelected}
      onSelect={onSelect}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      index={index}
      totalElements={totalElements}
    >
      {/* No canvas, mostrar a visualização da notificação mais bonita */}
      {renderNotification()}
      
      {/* Renderizar o toast que aparecerá na tela */}
      {renderToast()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 