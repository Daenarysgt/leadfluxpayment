import { toast } from '@/hooks/use-toast';

export interface NotificationSettings {
  soundEnabled?: boolean;
  soundChoice?: string;
  toastEnabled?: boolean;
  toastStyle?: 'default' | 'destructive';
  toastMessage?: string;
}

/**
 * Reproduz um som de acordo com as configurações definidas
 */
export const playSound = (soundName: string = 'hotmart') => {
  try {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    
    // Garantir que o áudio seja carregado antes de tentar reproduzir
    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(error => {
        console.error('Erro ao reproduzir som:', error);
      });
    });
    
    // Lidar com erros de carregamento
    audio.addEventListener('error', () => {
      console.error(`Erro ao carregar o arquivo de som: ${soundName}.mp3`);
    });
    
    // Iniciar o carregamento do áudio
    audio.load();
  } catch (error) {
    console.error('Erro ao criar objeto de áudio:', error);
  }
};

/**
 * Exibe um toast de notificação
 */
export const showToast = (
  message: string = 'Nova etapa iniciada!', 
  variant: 'default' | 'destructive' = 'default'
) => {
  toast({
    title: message,
    description: 'Você avançou para uma nova etapa.',
    variant: variant
  });
};

/**
 * Função para processar as notificações ao mudar de etapa
 */
export const processStepChangeNotifications = (notificationSettings?: NotificationSettings) => {
  if (!notificationSettings) return;
  
  // Reproduzir som
  if (notificationSettings.soundEnabled) {
    playSound(notificationSettings.soundChoice);
  }
  
  // Exibir toast
  if (notificationSettings.toastEnabled) {
    showToast(
      notificationSettings.toastMessage || 'Nova etapa iniciada!', 
      notificationSettings.toastStyle || 'default'
    );
  }
}; 