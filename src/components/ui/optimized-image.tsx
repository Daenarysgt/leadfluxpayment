import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean; // Se true, não usa lazy loading
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

// Objeto de cache global para evitar recarregar imagens já carregadas
const imageCache: Record<string, boolean> = {};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  objectFit = 'cover',
  priority = false,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Se for prioritária, já considera em view
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Verificar se a imagem já foi carregada anteriormente
  useEffect(() => {
    if (src && imageCache[src]) {
      setIsLoaded(true);
      setIsInView(true);
    }
  }, [src]);
  
  // Configurar o IntersectionObserver para lazy loading
  useEffect(() => {
    if (!src || priority || isInView) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px 0px' } // Carregar imagens quando estiverem a 200px de entrar na tela
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority, isInView]);
  
  // Função para lidar com o carregamento bem-sucedido da imagem
  const handleImageLoad = () => {
    setIsLoaded(true);
    if (src) {
      imageCache[src] = true;
    }
  };
  
  // Determinar se devemos usar um placeholder
  const usePlaceholder = !isLoaded && !priority;
  
  // Estilo base para a div container
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: width || '100%',
    height: height || 'auto',
    background: '#f0f0f0', // Cor de fundo enquanto carrega
  };
  
  // Estilo comum para as imagens
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
  };
  
  return (
    <div style={containerStyle} className={className}>
      {/* Placeholder pulsante enquanto a imagem carrega */}
      {usePlaceholder && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ 
            opacity: isLoaded ? 0 : 0.7,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
      
      {/* Imagem real (visível quando carregada ou quando entra na viewport) */}
      {(isInView || priority) && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={onError}
          style={{
            ...imageStyle,
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage; 