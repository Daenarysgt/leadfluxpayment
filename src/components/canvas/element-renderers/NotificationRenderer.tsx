import React, { useState, useEffect, useRef } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { Bell } from "lucide-react";
import { NotificationContent } from "@/types/canvasTypes";
import ElementWrapper from "../ElementWrapper";

const NotificationRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown, index, totalElements, previewMode } = props;
  const content = element.content as NotificationContent || {};
  
  // Valores padrão
  const {
    toastTitle = "Venda realizada com Pix",
    toastSubtitle = "Sua comissão: R$34,90 - #P00000009", 
    toastEnabled = true,
    soundEnabled = true,
    soundType = "sale",
    toastColor = "#FF5733",
    toastTextColor = "#ffffff",
    toastDuration = 5,
    toastPosition = "bottom-right",
    showImage = true,
    customImage = "",
    borderRadius = 8,
    titleFontSize = 14,
    subtitleFontSize = 12,
  } = content;
  
  // Estado para controlar visibilidade da notificação flutuante
  const [isVisible, setIsVisible] = useState(false);
  const [didInitialize, setDidInitialize] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Refs para gerenciar recursos
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Verificação se estamos no funil público (iframe)
  const isPublic = typeof window !== 'undefined' && (window.self !== window.top || previewMode);

  // Função para mostrar a notificação
  const showNotification = () => {
    console.log('[Notification] Mostrando notificação');
    setIsVisible(true);
    setDidInitialize(true);
    
    // Tocar o som se estiver carregado
    if (soundEnabled && audioRef.current && audioLoaded) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .catch(err => console.warn('[Notification] Erro ao tocar som:', err));
    }
    
    // Configurar timer para esconder
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log('[Notification] Escondendo notificação');
      setIsVisible(false);
    }, toastDuration * 1000);
  };

  // Efeito para inicializar o áudio
  useEffect(() => {
    if (soundEnabled && isPublic) {
      const soundUrl = `/sounds/${soundType}.mp3`;
      const audio = new Audio(soundUrl);
      
      audio.addEventListener('canplaythrough', () => {
        console.log('[Notification] Áudio carregado');
        setAudioLoaded(true);
      });
      
      audio.load();
      audioRef.current = audio;
      
      return () => {
        audio.removeEventListener('canplaythrough', () => {});
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [soundEnabled, soundType]);

  // Efeito para inicializar o sistema de repetição
  useEffect(() => {
    if (isPublic && toastEnabled) {
      console.log('[Notification] Iniciando sistema de repetição');
      
      // Primeira exibição após 2 segundos
      const initialTimer = setTimeout(() => {
        showNotification();
      }, 2000);

      // Configurar intervalo de repetição (a cada 20 segundos)
      intervalRef.current = setInterval(() => {
        showNotification();
      }, 20000);

      return () => {
        clearTimeout(initialTimer);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [isPublic, toastEnabled]);

  // Efeito para lidar com interação do usuário (necessário para som em alguns navegadores)
  useEffect(() => {
    if (isPublic && soundEnabled) {
      const handleUserInteraction = () => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => console.log('[Notification] Som ativado após interação'))
            .catch(err => console.warn('[Notification] Erro ao ativar som:', err));
        }
      };

      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);

      return () => {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, [isPublic, soundEnabled]);

  // Renderiza a visualização no builder/editor (estática)
  const renderEditorView = () => {
    // Se estivermos no funil público, não mostramos o elemento estático
    if (isPublic) {
      return null;
    }
    
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
          <div className="flex-shrink-0 p-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
            {customImage ? (
              <img src={customImage} alt="Notification" className="h-10 w-10" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full">
                <Bell className="h-6 w-6" style={{ color: toastColor }} />
              </div>
            )}
          </div>
        )}
        <div className="py-3 px-4">
          <div className="font-medium" style={{ fontSize: `${titleFontSize}px` }}>{toastTitle}</div>
          <div className="opacity-90" style={{ fontSize: `${subtitleFontSize}px` }}>{toastSubtitle}</div>
        </div>
      </div>
    );
  };
  
  // Renderiza a notificação flutuante temporária
  const renderFloatingNotification = () => {
    if (!toastEnabled || (!isPublic && !isSelected)) return null;

    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    const position = positionClasses[toastPosition as keyof typeof positionClasses];
    
    return (
      <div
        id="floating-notification"
        className={`fixed ${position} z-[9999] flex items-center shadow-lg transition-all duration-500 ease-in-out`}
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
          maxWidth: '320px',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: 'none',
        }}
      >
        {showImage && (
          <div className="flex-shrink-0 p-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
            {customImage ? (
              <img src={customImage} alt="Notification" className="h-10 w-10" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full">
                <Bell className="h-6 w-6" style={{ color: toastColor }} />
              </div>
            )}
          </div>
        )}
        <div className="py-3 px-4">
          <div className="font-medium" style={{ fontSize: `${titleFontSize}px` }}>{toastTitle}</div>
          <div className="opacity-90" style={{ fontSize: `${subtitleFontSize}px` }}>{toastSubtitle}</div>
        </div>
      </div>
    );
  };

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
      {renderEditorView()}
      {renderFloatingNotification()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 