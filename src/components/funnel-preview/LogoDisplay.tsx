import React, { useEffect } from 'react';

interface LogoDisplayProps {
  logo?: string;
  className?: string;
}

/**
 * Componente responsável por exibir o logotipo do funil
 * Verifica se o logo está em um formato válido e tenta corrigir formatos comuns
 */
const LogoDisplay = ({ logo, className = 'max-h-14' }: LogoDisplayProps) => {
  // Logs de depuração para rastrear o ciclo de vida
  useEffect(() => {
    if (logo) {
      console.log("LogoDisplay - Componente montado com logo:", typeof logo);
      console.log("LogoDisplay - Primeiros 20 caracteres:", logo.substring(0, 20));
      
      if (!logo.startsWith('data:image/')) {
        console.log("LogoDisplay - Logo não tem prefixo data:image/");
        
        if (logo.startsWith('/9j/')) {
          console.log("LogoDisplay - Logo parece ser JPEG base64 sem prefixo");
        } else if (logo.startsWith('iVBOR')) {
          console.log("LogoDisplay - Logo parece ser PNG base64 sem prefixo");
        }
      }
    } else {
      console.log("LogoDisplay - Componente montado sem logo");
    }
  }, [logo]);

  if (!logo) {
    console.log("LogoDisplay - Sem logo para exibir");
    return null;
  }
  
  // Verificar se o logo é uma string base64 válida
  let validLogo = logo;
  if (typeof logo === 'string' && !logo.startsWith('data:image/')) {
    console.log("LogoDisplay - Logo não é uma string base64 válida com prefixo");
    
    // Tentar corrigir formatos comuns de base64 sem o prefixo
    if (logo.startsWith('/9j/')) {
      console.log("LogoDisplay - Tentando corrigir formato do logo JPEG");
      validLogo = `data:image/jpeg;base64,${logo}`;
    } else if (logo.startsWith('iVBOR')) {
      console.log("LogoDisplay - Tentando corrigir formato do logo PNG");
      validLogo = `data:image/png;base64,${logo}`;
    } else {
      console.log("LogoDisplay - Formato não reconhecido, tentando como JPEG");
      validLogo = `data:image/jpeg;base64,${logo}`;
    }
  }

  return (
    <div className="w-full flex justify-center py-4 mb-2">
      <img 
        src={validLogo} 
        alt="Logo" 
        className={`object-contain ${className}`}
        onError={(e) => {
          console.error("LogoDisplay - Erro ao carregar logo:", e);
          console.log("LogoDisplay - URL do logo problemático:", validLogo.substring(0, 30) + "...");
          // Esconder o elemento em caso de erro
          e.currentTarget.style.display = 'none';
        }}
        onLoad={() => {
          console.log("LogoDisplay - Logo carregado com sucesso");
        }}
      />
    </div>
  );
};

export default LogoDisplay; 