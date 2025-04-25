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
  
  // Estados
  const [visible, setVisible] = useState(false);

  // Refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detectar se estamos em um iframe (funil público)
  const inIframe = () => {
    try {
      return window !== window.parent;
    } catch (e) {
      return true;
    }
  };

  const isPublicView = inIframe();

  // Lógica para mostrar e esconder a notificação
  useEffect(() => {
    // No editor normal (não preview), apenas mostramos o elemento estático
    if (!previewMode && !isPublicView) {
      return;
    }

    // Limpar qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Nos modos preview ou funil público, mostramos a notificação flutuante
    console.log("Ativando notificação - modo:", isPublicView ? "Funil Público" : "Preview Editor");

    // Mostrar a notificação após um pequeno delay
    const showTimer = setTimeout(() => {
      setVisible(true);
      console.log("Notificação visível");
      
      // Tentar tocar o som
      if (soundEnabled) {
        playSound();
      }
      
      // Configurar o timer para esconder
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        console.log("Notificação escondida após", toastDuration, "segundos");
      }, toastDuration * 1000);
    }, 1500);
    
    // Limpar timers quando o componente desmontar
    return () => {
      clearTimeout(showTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [previewMode, toastDuration, soundEnabled]);

  // Função para tocar som
  const playSound = () => {
    try {
      // Criar áudio e configurar
      const soundUrl = `/sounds/${soundType}.mp3`;
      console.log("Tentando tocar som:", soundUrl);
      
      const audio = new Audio(soundUrl);
      audio.volume = 1.0;
      audioRef.current = audio;
      
      // Tentar método 1: reprodução direta
      audio.play()
        .then(() => console.log("Som reproduzido com sucesso (método 1)"))
        .catch(err => {
          console.warn("Método 1 falhou:", err);
          
          // Método 2: tentar com carga manual
          audio.load();
          setTimeout(() => {
            audio.play()
              .then(() => console.log("Som reproduzido com sucesso (método 2)"))
              .catch(err => console.error("Todos os métodos falharam:", err));
          }, 300);
        });
      
      // Método 3: tentar tocar quando o usuário interagir
      const playOnInteraction = () => {
        const a = new Audio(soundUrl);
        a.play().catch(e => console.warn("Interação falhou:", e));
        document.removeEventListener('click', playOnInteraction);
      };
      
      document.addEventListener('click', playOnInteraction, { once: true });
      
    } catch (error) {
      console.error("Erro ao configurar áudio:", error);
    }
  };

  // Renderização do elemento estático para o editor
  const renderEditorView = () => {
    // No funil público, não mostrar o elemento estático
    if (isPublicView && !isSelected) {
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

  // Renderização da notificação flutuante
  const renderFloatingNotification = () => {
    if (!toastEnabled) return null;

    // Determinar posição
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    const position = positionClasses[toastPosition as keyof typeof positionClasses];
    
    // Transição para entrada/saída
    const visibilityClass = visible 
      ? 'opacity-100 transform translate-y-0'
      : 'opacity-0 transform translate-y-8';

    return (
      <div 
        className={`fixed ${position} z-[9999] flex items-center shadow-lg transition-all duration-500 ease-in-out ${visibilityClass}`}
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
          maxWidth: '320px',
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
      {/* Versão do editor */}
      {renderEditorView()}
      
      {/* Notificação flutuante */}
      {renderFloatingNotification()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 