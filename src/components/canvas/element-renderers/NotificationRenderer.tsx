import React, { useState, useEffect, useRef } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { NotificationContent } from "@/types/canvasTypes";
import ElementWrapper from "../ElementWrapper";

const NotificationRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown, index, totalElements, previewMode } = props;
  const content = element.content as NotificationContent || {};
  
  // Valores padrão com novo estilo
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
  const [notifications, setNotifications] = useState<Array<{id: number, visible: boolean}>>([]);
  const [isPublic] = useState(typeof window !== 'undefined' && (window.self !== window.top || previewMode));
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Função para criar uma nova notificação
  const createNotification = () => {
    const newNotification = { id: Date.now(), visible: true };
    
    setNotifications(prev => {
      // Mantém apenas as últimas notificações baseado no stackSize
      const updated = [newNotification, ...prev].slice(0, stackSize);
      return updated;
    });

    // Remove a notificação após o tempo definido
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.id !== newNotification.id)
      );
    }, displayDuration * 1000);

    // Toca o som se habilitado
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.warn('Erro ao tocar som:', err));
    }
  };

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

  // Efeito para iniciar o sistema de notificações
  useEffect(() => {
    if (isPublic && enabled) {
      // Primeira notificação após 2 segundos
      const initialTimer = setTimeout(createNotification, 2000);
      
      // Cria novas notificações periodicamente
      intervalRef.current = setInterval(createNotification, 15000);

      return () => {
        clearTimeout(initialTimer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isPublic, enabled]);

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
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-4 rounded-lg shadow-lg transition-all duration-500"
            style={{
              backgroundColor,
              opacity: notification.visible ? 1 : 0,
              transform: `translateY(${notification.visible ? 0 : 20}px)`,
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