import React, { useEffect } from 'react';

const Builder: React.FC = () => {
  useEffect(() => {
    // Adicionar styles para garantir que o zoom funcione em toda a aplicação
    const styleElement = document.createElement('style');
    styleElement.id = 'builder-zoom-styles';
    
    // CSS que garante o zoom de 90% e evita espaços vazios
    styleElement.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      
      #root {
        transform: scale(0.90);
        transform-origin: 0 0;
        width: 111.12vw !important;  /* 100/0.9 = ~111.11 */
        height: 111.12vh !important; /* 100/0.9 = ~111.11 */
        overflow: hidden !important;
      }
      
      /* Ajustes para resolver o espaço no rodapé */
      .flex.flex-col.h-screen {
        min-height: 111.12vh !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }
      
      /* Garantir que o conteúdo principal preencha todo o espaço disponível */
      .flex.flex-col.h-screen > div:nth-child(2) {
        flex: 1 !important;
        display: flex !important;
        min-height: calc(111.12vh - 64px) !important;
        height: calc(111.12vh - 64px) !important;
        overflow: hidden !important;
      }
      
      /* Garantir que apenas as áreas internas tenham scroll */
      .builder-sidebar {
        overflow-y: auto !important;
        height: 100% !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="builder-container">
      {/* Conteúdo do Builder será renderizado aqui */}
    </div>
  );
};

export default Builder; 