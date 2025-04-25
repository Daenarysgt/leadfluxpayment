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
  
  // Estados e Refs
  const [showToast, setShowToast] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPublicView = typeof window !== 'undefined' && window.self !== window.top;

  // Função para renderizar a notificação no canvas (apenas para editor)
  const renderCanvasPreview = () => {
    // No funil público, só mostramos o conteúdo estático se estiver selecionado
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

  // Função para renderizar o toast flutuante
  const renderToast = () => {
    if (!toastEnabled) return null;

    // Definir posição baseada na configuração
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const position = positionClasses[toastPosition as keyof typeof positionClasses];
    
    // Classes de animação para entrada/saída
    const visibilityClass = showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

    return (
      <div 
        className={`fixed ${position} z-[9999] flex items-center shadow-lg transition-all duration-300 ease-in-out ${visibilityClass}`}
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
          maxWidth: '320px',
          pointerEvents: 'none'
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

  // Tocar o som configurado
  const playSound = () => {
    if (!soundEnabled) return;
    
    try {
      console.log("Tentando tocar som:", soundType);
      
      // Criar elemento de áudio
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.volume = 1.0;
      
      // Função para tentar tocar o som
      const attemptPlay = () => {
        audio.play()
          .then(() => console.log("Som tocado com sucesso"))
          .catch(err => console.error("Erro ao tocar som:", err));
      };
      
      // Tentar tocar imediatamente
      attemptPlay();
      
      // Backup: tentar tocar após interação do usuário
      window.addEventListener('click', function playOnUserInteraction() {
        attemptPlay();
        window.removeEventListener('click', playOnUserInteraction);
      }, { once: true });
      
    } catch (error) {
      console.error("Erro ao configurar áudio:", error);
    }
  };

  // Efeito para mostrar a notificação no carregamento (em modo de preview ou no funil público)
  useEffect(() => {
    // Só executamos isso uma vez
    if (hasInitialized) return;
    
    // Verificamos se estamos em preview ou no funil público
    if (previewMode || isPublicView) {
      console.log("Inicializando notificação - isPublicView:", isPublicView, "previewMode:", previewMode);
      setHasInitialized(true);
      
      // Pequeno atraso para garantir que a página carregou
      const initialTimer = setTimeout(() => {
        console.log("Mostrando toast após atraso inicial");
        
        // Ativar a notificação
        setShowToast(true);
        
        // Tocar o som
        playSound();
        
        // Definir o temporizador para esconder
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          console.log(`Escondendo toast após ${toastDuration} segundos`);
          setShowToast(false);
        }, toastDuration * 1000);
      }, 1000);
      
      return () => {
        clearTimeout(initialTimer);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [previewMode, isPublicView, hasInitialized, toastDuration]);

  // Efeito para limpar recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Para depuração
  useEffect(() => {
    console.log("Estado showToast mudou para:", showToast);
  }, [showToast]);

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
      {/* Visualização estática no canvas/editor */}
      {renderCanvasPreview()}
      
      {/* Notificação temporária que aparece e desaparece */}
      {renderToast()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 