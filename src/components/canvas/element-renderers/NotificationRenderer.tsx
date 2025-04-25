import React from 'react';
import { ElementRendererProps } from '@/types/canvasTypes';
import { Bell } from 'lucide-react';

// Este componente vai ser invisível no modo de visualização, pois ele só atua como um elemento de configuração
const NotificationRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, previewMode } = props;
  
  // No modo de preview, não renderizamos nada
  if (previewMode) return null;

  return (
    <div className="flex items-center justify-center p-4 border-2 border-dashed border-orange-300 rounded-md bg-orange-50">
      <Bell className="h-5 w-5 text-orange-500 mr-2" />
      <span className="text-sm text-orange-700 font-medium">
        Notificação configurada
      </span>
    </div>
  );
};

export default NotificationRenderer; 