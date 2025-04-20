import React from 'react';
import './BuilderScale.css';

interface BuilderScaleWrapperProps {
  children: React.ReactNode;
  scaleEnabled?: boolean;
}

const BuilderScaleWrapper: React.FC<BuilderScaleWrapperProps> = ({ 
  children, 
  scaleEnabled = true // Por padrão, a escala está ativada
}) => {
  // Se a escala não estiver ativada, apenas renderiza as crianças sem wrapper
  if (!scaleEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="builder-scale-container">
      <div className="builder-scale-wrapper">
        {children}
      </div>
    </div>
  );
};

export default BuilderScaleWrapper; 