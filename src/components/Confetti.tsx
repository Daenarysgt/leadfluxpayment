import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

export interface ConfettiProps {
  duration?: number; // duração em milissegundos
}

export const Confetti: React.FC<ConfettiProps> = ({ duration = 5000 }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Atualizar tamanho da janela se for redimensionada
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Esconder confete após a duração especificada
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, duration);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [duration]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.3}
    />
  );
};

export default Confetti; 