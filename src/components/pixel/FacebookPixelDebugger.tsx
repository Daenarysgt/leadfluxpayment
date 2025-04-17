import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PixelEvent {
  id: string;
  name: string;
  params: any;
  timestamp: number;
}

/**
 * Componente para depuração do Facebook Pixel
 * Exibe eventos disparados em tempo real e fornece ferramentas de diagnóstico
 */
const FacebookPixelDebugger = () => {
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'active' | 'not_found'>('loading');

  // Monitorar eventos do Facebook Pixel
  useEffect(() => {
    // Verificar se o Pixel está carregado
    const checkPixelStatus = setInterval(() => {
      if (window.fbq) {
        setPixelStatus('active');
        clearInterval(checkPixelStatus);
      }
    }, 500);

    // Timeout para considerar que não foi encontrado
    const pixelTimeout = setTimeout(() => {
      if (pixelStatus === 'loading') {
        setPixelStatus('not_found');
        clearInterval(checkPixelStatus);
      }
    }, 5000);

    // Função para interceptar eventos do Facebook Pixel
    const originalFbq = window.fbq;
    
    if (window.fbq) {
      window.fbq = function(...args: any[]) {
        // Passar para a implementação original
        originalFbq.apply(this, args);
        
        // Capturar apenas eventos do tipo 'track'
        if (args[0] === 'track' && args.length >= 2) {
          const eventName = args[1];
          const params = args[2] || {};
          
          // Adicionar evento à lista
          setEvents(prev => [
            {
              id: Math.random().toString(36).substring(2, 9),
              name: eventName,
              params,
              timestamp: Date.now()
            },
            ...prev
          ].slice(0, 20)); // Limitar a 20 eventos mais recentes
        }
      };
    }

    // Cleanup
    return () => {
      if (originalFbq) {
        window.fbq = originalFbq;
      }
      clearInterval(checkPixelStatus);
      clearTimeout(pixelTimeout);
    };
  }, [pixelStatus]);

  if (!isVisible) {
    return (
      <Button 
        className="fixed right-4 bottom-4 z-50 bg-blue-500 hover:bg-blue-600 p-2 rounded-full shadow-lg"
        onClick={() => setIsVisible(true)}
        size="sm"
      >
        <Info className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed right-4 bottom-4 w-96 shadow-xl z-50 max-h-[500px] flex flex-col">
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-600">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor" />
            </svg>
            Facebook Pixel Debugger
          </CardTitle>
          <CardDescription className="text-xs">
            Monitoramento de eventos em tempo real
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <div className="mb-2 px-2 py-1.5 flex items-center gap-2">
          <Badge variant={pixelStatus === 'active' ? 'success' : pixelStatus === 'loading' ? 'outline' : 'destructive'}>
            {pixelStatus === 'active' ? 'Pixel Ativo' : pixelStatus === 'loading' ? 'Verificando...' : 'Pixel Não Encontrado'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {events.length} eventos capturados
          </span>
        </div>
        
        <ScrollArea className="h-80 px-1">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Info className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">
                Nenhum evento capturado ainda. 
                Interaja com a página para gerar eventos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="border rounded-md p-2 text-sm bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-blue-500">
                      {event.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {Object.keys(event.params).length > 0 && (
                    <div className="mt-1 bg-black bg-opacity-5 p-1.5 rounded text-xs font-mono">
                      {JSON.stringify(event.params, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Adicionar estilos variantes para o Badge que não existem por padrão
declare module '@/components/ui/badge' {
  interface BadgeVariants {
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  }
}

export default FacebookPixelDebugger; 