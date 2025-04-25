import React, { useState, useEffect } from "react";
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

  // Renderizar o toast no estilo da imagem de referência
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
        className={`fixed ${positionClasses[toastPosition as keyof typeof positionClasses]} z-50 flex items-center shadow-lg transition-opacity ${showToast ? 'opacity-100' : 'opacity-0'}`}
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
  
  // Indicador de som
  const renderSoundIndicator = () => {
    if (!previewMode) return null;
    
    return (
      <div className="absolute top-0 right-0 bg-gray-200 rounded-full p-1 m-2">
        {soundEnabled ? (
          <Volume2 className="h-4 w-4 text-gray-700" />
        ) : (
          <VolumeX className="h-4 w-4 text-gray-700" />
        )}
      </div>
    );
  };
  
  // Mostrar toast e tocar som quando em modo preview
  useEffect(() => {
    if (previewMode) {
      // Exibir toast se ativado - sempre que entrar na etapa
      if (toastEnabled) {
        setShowToast(true);
        
        // Esconder o toast após o tempo configurado
        const timer = setTimeout(() => {
          setShowToast(false);
        }, toastDuration * 1000);
        
        return () => clearTimeout(timer);
      }
      
      // Tocar som se ativado
      if (soundEnabled) {
        // Caminho do arquivo de som baseado no tipo selecionado
        const soundPath = `/sounds/${soundType}.mp3`;
        const audio = new Audio(soundPath);
        
        // Reproduzir o som
        try {
          audio.play().catch(error => {
            console.error("Erro ao reproduzir o som:", error);
          });
        } catch (error) {
          console.error("Erro ao reproduzir o som:", error);
        }
      }
    }
  }, [previewMode, toastEnabled, soundEnabled, soundType, toastDuration]);

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
      <div className="w-full p-4 border border-dashed border-gray-300 rounded-md bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Notificação</h3>
              <p className="text-xs text-gray-500">
                {toastEnabled && soundEnabled ? 'Toast e Som' : 
                 toastEnabled ? 'Apenas Toast' : 
                 soundEnabled ? 'Apenas Som' : 'Desativado'}
              </p>
            </div>
          </div>
          
          {renderSoundIndicator()}
        </div>
        
        {toastEnabled && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <div><strong>Título:</strong> {toastTitle}</div>
            <div><strong>Subtítulo:</strong> {toastSubtitle}</div>
          </div>
        )}
      </div>
      
      {renderToast()}
    </ElementWrapper>
  );
};

export default NotificationRenderer; 