import React from 'react';
import { ElementRendererProps } from '@/types/canvasTypes';
import { useStore } from '@/utils/store';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing } from 'lucide-react';

const NotificationElement: React.FC<ElementRendererProps> = (props) => {
  const { element, previewMode, onUpdate } = props;
  const settings = element.content?.settings || {
    soundEnabled: true,
    soundChoice: 'hotmart',
    toastEnabled: true,
    toastStyle: 'default'
  };

  const handleSettingChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        ...element,
        content: {
          ...element.content,
          settings: {
            ...settings,
            [field]: value
          }
        }
      });
    }
  };

  if (previewMode) return null;

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base font-medium">
          <BellRing className="mr-2 h-4 w-4 text-orange-500" />
          Configuração de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sound-enabled" className="text-sm font-medium">Som ao mudar de etapa</Label>
            <p className="text-xs text-muted-foreground">Tocar um som ao avançar para próxima etapa</p>
          </div>
          <Switch 
            id="sound-enabled" 
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
          />
        </div>

        {settings.soundEnabled && (
          <div className="ml-2 border-l-2 border-orange-200 pl-3 pt-2">
            <Label htmlFor="sound-choice" className="text-sm font-medium mb-1.5 block">
              Escolha o som
            </Label>
            <Select 
              value={settings.soundChoice} 
              onValueChange={(value) => handleSettingChange('soundChoice', value)}
            >
              <SelectTrigger id="sound-choice" className="w-full">
                <SelectValue placeholder="Selecione um som" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotmart">Hotmart (Cha-ching)</SelectItem>
                <SelectItem value="cash">Caixa Registradora</SelectItem>
                <SelectItem value="ding">Sino (Ding)</SelectItem>
                <SelectItem value="success">Som de Sucesso</SelectItem>
                <SelectItem value="bell">Campainha</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-2">
              <button 
                className="text-xs text-orange-500 hover:text-orange-600 underline"
                onClick={() => {
                  const audio = new Audio(`/sounds/${settings.soundChoice}.mp3`);
                  audio.play();
                }}
              >
                Testar som
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div>
            <Label htmlFor="toast-enabled" className="text-sm font-medium">Notificação visual</Label>
            <p className="text-xs text-muted-foreground">Mostrar um toast ao avançar para próxima etapa</p>
          </div>
          <Switch 
            id="toast-enabled" 
            checked={settings.toastEnabled}
            onCheckedChange={(checked) => handleSettingChange('toastEnabled', checked)}
          />
        </div>

        {settings.toastEnabled && (
          <div className="ml-2 border-l-2 border-orange-200 pl-3 pt-2">
            <Label htmlFor="toast-style" className="text-sm font-medium mb-1.5 block">
              Estilo da notificação
            </Label>
            <Select 
              value={settings.toastStyle} 
              onValueChange={(value) => handleSettingChange('toastStyle', value)}
            >
              <SelectTrigger id="toast-style" className="w-full">
                <SelectValue placeholder="Selecione um estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Simples</SelectItem>
                <SelectItem value="destructive">Destacado</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-2">
              <button 
                className="text-xs text-orange-500 hover:text-orange-600 underline"
                onClick={() => {
                  // Importação dinâmica para evitar dependência circular
                  import('@/hooks/use-toast').then(({ toast }) => {
                    toast({
                      title: "Nova etapa iniciada!",
                      description: "Este é um exemplo de notificação toast.",
                      variant: settings.toastStyle
                    });
                  });
                }}
              >
                Testar notificação
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationElement; 