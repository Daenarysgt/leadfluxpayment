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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determinar se estamos no modo de visualização pública (iframe)
  const isPublicView = useRef(window.self !== window.top);

  // Render da notificação no estilo correto para o canvas
  // Esta versão só aparece no builder, não no funil público
  const renderCanvasVersion = () => {
    // No modo de visualização pública, não mostramos o elemento estático
    if (isPublicView.current && !isSelected) {
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
  
  // Renderizar o toast para visualização na tela (como notificação flutuante)
  const renderToastNotification = () => {
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
    
    // Classes para animação
    const opacityClass = showToast ? 'opacity-100' : 'opacity-0';
    const transitionClass = 'transition-opacity duration-300 ease-in-out';
    
    return (
      <div 
        className={`fixed ${positionClasses[toastPosition as keyof typeof positionClasses]} z-[9999] flex items-center shadow-lg ${transitionClass} ${opacityClass}`}
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
          maxWidth: '320px',
          overflow: 'hidden',
          pointerEvents: 'none',
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
  
  // Função para tocar o som com tratamento de erro
  const playSound = () => {
    if (!soundEnabled) return;
    
    // 1. Verificar se temos permissão para tocar áudio
    // 2. Carregar o som específico
    // 3. Tocar com tratamento de erros
    
    try {
      console.log("Tentando tocar som:", soundType);
      
      // Cria uma nova instância de áudio toda vez
      const soundPath = `/sounds/${soundType}.mp3`;
      const audio = new Audio(soundPath);
      
      // Configurar para volume alto
      audio.volume = 1.0;
      
      // Força o carregamento
      audio.load();
      
      // Usa a API de reprodução com interação do usuário
      document.addEventListener('click', function playOnce() {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Som reproduzido com sucesso");
              document.removeEventListener('click', playOnce);
            })
            .catch(e => {
              console.error("Erro ao reproduzir som:", e);
              
              // Tentar reproduzir novamente após interação do usuário
              document.addEventListener('click', function retryOnce() {
                audio.play().then(() => {
                  document.removeEventListener('click', retryOnce);
                }).catch(e => console.error("Falha na segunda tentativa:", e));
              }, { once: true });
            });
        }
      }, { once: true });
      
      // Tenta reproduzir diretamente também
      audio.play().catch(e => console.log("Tentativa inicial falhou:", e));
    } catch (error) {
      console.error("Erro ao configurar áudio:", error);
    }
  };
  
  // Função para mostrar a notificação temporária
  const showNotification = () => {
    console.log("showNotification chamado, hasTriggered:", hasTriggeredRef.current);
    
    if (hasTriggeredRef.current) return; // Evitar disparos múltiplos
    hasTriggeredRef.current = true;
    
    // Limpar qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Mostrar o toast
    if (toastEnabled) {
      setShowToast(true);
      
      // Esconder após o tempo configurado
      timeoutRef.current = setTimeout(() => {
        setShowToast(false);
        console.log("Toast escondido após:", toastDuration, "segundos");
      }, toastDuration * 1000);
    }
    
    // Tocar o som
    if (soundEnabled) {
      playSound();
    }
  };
  
  // Trigger quando o componente é montado (única vez)
  useEffect(() => {
    // Pré-carregar o áudio para evitar atrasos
    if (soundEnabled) {
      const audioElement = new Audio(`/sounds/${soundType}.mp3`);
      audioElement.preload = "auto";
      audioRef.current = audioElement;
    }
    
    // Verificar se estamos no funil público (iframe) ou em modo preview
    const shouldTrigger = isPublicView.current || previewMode;
    console.log("shouldTrigger:", shouldTrigger, "isPublicView:", isPublicView.current, "previewMode:", previewMode);
    
    if (shouldTrigger) {
      console.log("Ativando notificação na montagem do componente");
      
      // Atraso para garantir que a página carregou
      const timer = setTimeout(() => {
        showNotification();
      }, 800);
      
      return () => {
        clearTimeout(timer);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, []);
  
  // Trigger quando o modo preview muda (builder)
  useEffect(() => {
    if (previewMode && !hasTriggeredRef.current) {
      console.log("Ativando notificação por mudança no previewMode");
      showNotification();
    }
  }, [previewMode]);
  
  // Limpar quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      hasTriggeredRef.current = false;
    };
  }, []);

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
      {/* Versão do canvas (apenas para o builder) */}
      {renderCanvasVersion()}
      
      {/* Notificação flutuante (para preview e funil público) */}
      {renderToastNotification()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 