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

  // Refs para gerenciar recursos
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Verificação se estamos no funil público (iframe)
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  
  // EFEITO DE INICIALIZAÇÃO ÚNICO
  // Este efeito roda apenas uma vez na montagem do componente
  useEffect(() => {
    // Só queremos mostrar a notificação em preview ou no funil público
    if (isIframe || previewMode) {
      console.log('[Notification] Inicializando notificação', { isIframe, previewMode });
      
      // Forçamos um delay inicial para garantir que tudo carregou
      const initTimer = setTimeout(() => {
        console.log('[Notification] Mostrando notificação após delay inicial');
        setIsVisible(true);
        setDidInitialize(true);
        
        // Carregar e tentar tocar o som
        if (soundEnabled) {
          forcePlaySound();
        }
        
        // Configurar o timer para esconder a notificação
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(() => {
          console.log(`[Notification] Escondendo notificação após ${toastDuration}s`);
          setIsVisible(false);
        }, toastDuration * 1000);
      }, 1000);
      
      // Limpeza ao desmontar o componente
      return () => {
        clearTimeout(initTimer);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, []); // Dependência vazia significa que só executa na montagem
  
  // Função para forçar a reprodução do som de todas as formas possíveis
  const forcePlaySound = () => {
    try {
      const soundUrl = `/sounds/${soundType}.mp3`;
      console.log('[Notification] Tentando reproduzir som:', soundUrl);
      
      // Criar elementos de áudio
      const audio1 = new Audio(soundUrl);
      const audio2 = new Audio(soundUrl);
      audioRef.current = audio1;
      
      // Configurar volume máximo
      audio1.volume = 1.0;
      audio2.volume = 1.0;
      
      // MÉTODO 1: Reprodução direta e imediata
      const playPromise = audio1.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('[Notification] Som reproduzido com sucesso (método 1)'))
          .catch(err => {
            console.warn('[Notification] Método 1 falhou:', err);
            
            // MÉTODO 2: Forçar carga e tentar novamente com delay
            audio1.load();
            setTimeout(() => {
              audio1.play()
                .then(() => console.log('[Notification] Som reproduzido com sucesso (método 2)'))
                .catch(e => console.warn('[Notification] Método 2 falhou:', e));
            }, 500);
          });
      }
      
      // MÉTODO 3: Tentativa após interação do usuário
      const handleUserInteraction = () => {
        audio2.play()
          .then(() => console.log('[Notification] Som reproduzido após interação (método 3)'))
          .catch(e => console.warn('[Notification] Método 3 falhou:', e));
        
        // Remover listener após tentativa
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
      
      // Adicionar listeners para interação
      document.addEventListener('click', handleUserInteraction, { once: true });
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      
    } catch (error) {
      console.error('[Notification] Erro ao configurar áudio:', error);
    }
  };
  
  // Renderiza a visualização no builder/editor (estática)
  const renderEditorView = () => {
    // Se estivermos no funil público, não mostramos o elemento estático
    // exceto se ele estiver selecionado no editor
    if (isIframe && !isSelected) {
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
    if (!toastEnabled) return null;

    // Configurar as classes de posicionamento
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    // Definir posição e animação
    const position = positionClasses[toastPosition as keyof typeof positionClasses];
    const animation = isVisible 
      ? 'animate-in fade-in slide-in-from-bottom-5 duration-500' 
      : 'animate-out fade-out slide-out-to-bottom-5 duration-500';
    
    // Somente renderiza se estiver visível ou foi inicializado
    if (!isVisible && !didInitialize) return null;
    
    return (
      <div
        id="floating-notification"
        className={`fixed ${position} z-[9999] flex items-center shadow-lg ${animation}`}
        style={{
          backgroundColor: toastColor,
          color: toastTextColor,
          borderRadius: `${borderRadius}px`,
          maxWidth: '320px',
          transition: 'all 0.5s ease',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
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
      {/* Elemento estático para o editor */}
      {renderEditorView()}
      
      {/* Notificação temporária para o funil público/preview */}
      {renderFloatingNotification()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 