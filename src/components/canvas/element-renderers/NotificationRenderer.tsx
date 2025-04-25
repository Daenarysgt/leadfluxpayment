import React, { useState, useEffect, useRef, useCallback } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { NotificationContent } from "@/types/canvasTypes";
import ElementWrapper from "../ElementWrapper";

interface NotificationItem {
  id: number;
  isVisible: boolean;
  timeoutId?: NodeJS.Timeout;
}

const NotificationRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown, index, totalElements, previewMode } = props;
  const content = element.content as NotificationContent || {};
  
  // Valores padrão
  const {
    notificationTitle = "Venda realizada com o Pix",
    notificationText = "Sua comissão: R$34,90",
    notificationCode = "#P00000009",
    backgroundColor = "rgba(23, 23, 23, 0.95)", // Fundo escuro semi-transparente
    textColor = "#ffffff",
    accentColor = "#ff4d4d", // Cor de destaque (vermelho)
    showTime = true,
    timeText = "há 1h",
    displayDuration = 5,
    stackSize = 3, // Quantidade de notificações empilhadas
    soundEnabled = true,
    soundType = "sale",
    position = "bottom-right",
    enabled = true,
  } = content;

  // Estados
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isPublic] = useState(() => typeof window !== 'undefined' && (window.self !== window.top || previewMode));
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para criar uma nova notificação
  const createNotification = useCallback(() => {
    const newNotification: NotificationItem = {
      id: Date.now(),
      isVisible: true
    };

    setNotifications(prev => {
      // Remove notificações antigas se exceder o limite
      const updated = [newNotification, ...prev].slice(0, stackSize);
      return updated;
    });

    // Configura o timeout para remover a notificação
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, displayDuration * 1000);

    // Atualiza a notificação com o ID do timeout
    setNotifications(prev => 
      prev.map(n => n.id === newNotification.id ? { ...n, timeoutId } : n)
    );

    // Toca o som
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.warn('Erro ao tocar som:', err));
    }
  }, [stackSize, displayDuration, soundEnabled]);

  // Efeito para inicializar o áudio
  useEffect(() => {
    if (soundEnabled && isPublic) {
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audioRef.current = audio;

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [soundEnabled, soundType, isPublic]);

  // Efeito para inicializar o sistema de notificações
  useEffect(() => {
    if (!isInitialized && isPublic && enabled) {
      setIsInitialized(true);

      // Primeira notificação após 2 segundos
      const initialTimer = setTimeout(() => {
        createNotification();
      }, 2000);

      // Configura o intervalo para novas notificações
      intervalRef.current = setInterval(createNotification, 15000);

      return () => {
        clearTimeout(initialTimer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isPublic, enabled, isInitialized, createNotification]);

  // Limpa todas as notificações e timeouts quando o componente é desmontado
  useEffect(() => {
    return () => {
      notifications.forEach(notification => {
        if (notification.timeoutId) {
          clearTimeout(notification.timeoutId);
        }
      });
      setNotifications([]);
    };
  }, []);

  // Renderiza a visualização estática para o editor
  const renderEditorView = () => {
    if (isPublic) return null;

    return (
      <div className="w-full p-4 bg-zinc-900 rounded-lg">
        <div className="flex items-start gap-3 bg-zinc-800 p-4 rounded-lg">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <img src="/icons/pix-icon.png" alt="Pix" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">{notificationTitle}</h3>
              {showTime && <span className="text-zinc-400 text-sm">{timeText}</span>}
            </div>
            <p className="text-zinc-300 text-sm mt-1">
              {notificationText} - {notificationCode}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderiza as notificações flutuantes
  const renderFloatingNotifications = () => {
    if (!enabled || (!isPublic && !isSelected)) return null;

    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    };

    return (
      <div 
        className={`fixed ${positionClasses[position]} z-[9999] flex flex-col gap-2`}
        style={{ pointerEvents: 'none' }}
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg shadow-lg
              transform transition-all duration-500 ease-in-out
              ${notification.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{
              backgroundColor,
              maxWidth: '380px',
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <img src="/icons/pix-icon.png" alt="Pix" className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 style={{ color: textColor }} className="font-medium">
                  {notificationTitle}
                </h3>
                {showTime && (
                  <span style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
                    {timeText}
                  </span>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)' }} className="text-sm mt-1">
                {notificationText} - {notificationCode}
              </p>
            </div>
          </div>
        ))}
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
      {renderFloatingNotifications()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 