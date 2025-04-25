import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bell, Volume2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/utils/notifications';

interface NotificationConfigProps {
  notifications?: {
    soundEnabled?: boolean;
    soundChoice?: string;
    toastEnabled?: boolean;
    toastStyle?: 'default' | 'destructive';
    toastMessage?: string;
  };
  onUpdate: (field: string, value: any) => void;
}

const NotificationConfig = ({ notifications = {}, onUpdate }: NotificationConfigProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate('notifications', {
      ...notifications,
      [field]: value
    });
  };

  const handleTestSound = () => {
    if (notifications.soundEnabled && notifications.soundChoice) {
      playSound(notifications.soundChoice);
    }
  };

  const handleTestToast = () => {
    if (notifications.toastEnabled) {
      toast({
        title: notifications.toastMessage || 'Nova etapa iniciada!',
        description: 'Este é um exemplo de notificação toast.',
        variant: notifications.toastStyle || 'default'
      });
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-orange-500" />
          Notificações
        </CardTitle>
        <CardDescription>
          Configure notificações sonoras e visuais para o funil
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-enabled" className="text-sm font-medium">Som ao mudar de etapa</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Tocar um som ao avançar para próxima etapa</p>
            </div>
            <Switch 
              id="sound-enabled" 
              checked={notifications.soundEnabled || false}
              onCheckedChange={(checked) => handleChange('soundEnabled', checked)}
            />
          </div>
          
          {notifications.soundEnabled && (
            <div className="ml-6 pl-4 border-l-2 border-orange-200">
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="sound-choice" className="text-sm font-medium">Escolha o som</Label>
                  <Select 
                    value={notifications.soundChoice || 'hotmart'} 
                    onValueChange={(value) => handleChange('soundChoice', value)}
                  >
                    <SelectTrigger id="sound-choice" className="mt-1.5">
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
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit mt-1"
                  onClick={handleTestSound}
                >
                  <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                  Testar som
                </Button>
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="toast-enabled" className="text-sm font-medium">Notificação visual</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Mostrar um toast ao avançar para próxima etapa</p>
            </div>
            <Switch 
              id="toast-enabled" 
              checked={notifications.toastEnabled || false}
              onCheckedChange={(checked) => handleChange('toastEnabled', checked)}
            />
          </div>
          
          {notifications.toastEnabled && (
            <div className="ml-6 pl-4 border-l-2 border-orange-200">
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="toast-style" className="text-sm font-medium">Estilo da notificação</Label>
                  <Select 
                    value={notifications.toastStyle || 'default'} 
                    onValueChange={(value) => handleChange('toastStyle', value as 'default' | 'destructive')}
                  >
                    <SelectTrigger id="toast-style" className="mt-1.5">
                      <SelectValue placeholder="Selecione um estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Simples</SelectItem>
                      <SelectItem value="destructive">Destacado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="toast-message" className="text-sm font-medium">Mensagem da notificação</Label>
                  <input
                    id="toast-message"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 mt-1.5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={notifications.toastMessage || 'Nova etapa iniciada!'}
                    onChange={(e) => handleChange('toastMessage', e.target.value)}
                    placeholder="Digite a mensagem do toast"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit mt-1"
                  onClick={handleTestToast}
                >
                  <Bell className="h-3.5 w-3.5 mr-1.5" />
                  Testar notificação
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationConfig; 