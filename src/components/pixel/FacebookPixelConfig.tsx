import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { isValidPixelId } from '@/utils/pixelUtils';
import { ExternalLink, Facebook, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FacebookPixelConfigProps {
  facebookPixelId?: string;
  pixelTracking?: {
    pageView?: boolean;
    completeRegistration?: boolean;
  };
  onUpdate: (field: string, value: any) => void;
}

/**
 * Componente para configuração do Facebook Pixel
 * 
 * Permite ao usuário:
 * - Inserir o ID do Pixel
 * - Configurar quais eventos serão rastreados automaticamente
 */
const FacebookPixelConfig = ({
  facebookPixelId,
  pixelTracking = {
    pageView: true,
    completeRegistration: true
  },
  onUpdate
}: FacebookPixelConfigProps) => {
  const { toast } = useToast();
  const [pixelId, setPixelId] = useState(facebookPixelId || '');
  const [isValidPixel, setIsValidPixel] = useState<boolean | null>(
    facebookPixelId ? isValidPixelId(facebookPixelId) : null
  );

  // Manipuladores de eventos
  const handlePixelIdChange = (value: string) => {
    setPixelId(value);
    setIsValidPixel(null); // Resetar validação ao digitar
  };

  const handleCheckboxChange = (field: 'pageView' | 'completeRegistration', checked: boolean) => {
    onUpdate('pixelTracking', {
      ...pixelTracking,
      [field]: checked
    });
  };

  const validateAndSavePixelId = () => {
    if (!pixelId) {
      onUpdate('facebookPixelId', '');
      setIsValidPixel(null);
      return;
    }

    const isValid = isValidPixelId(pixelId);
    setIsValidPixel(isValid);
    
    if (isValid) {
      onUpdate('facebookPixelId', pixelId);
      toast({
        title: "Pixel configurado com sucesso",
        description: "O Facebook Pixel foi configurado e está pronto para rastrear eventos.",
      });
    } else {
      toast({
        title: "ID do Pixel inválido",
        description: "O ID do Facebook Pixel deve conter 15-16 dígitos numéricos.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Facebook className="h-5 w-5 text-blue-600" />
          Facebook Pixel
        </CardTitle>
        <CardDescription>
          Configure o rastreamento de eventos do Facebook Ads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="pixel-id" className="text-sm font-medium">
            ID do Facebook Pixel
          </Label>
          <div className="flex gap-2">
            <Input
              id="pixel-id"
              value={pixelId}
              onChange={(e) => handlePixelIdChange(e.target.value)}
              placeholder="Digite o ID do seu Pixel (ex: 123456789012345)"
              className={`flex-1 ${isValidPixel === false ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
            />
            <Button onClick={validateAndSavePixelId}>
              Salvar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Obtenha seu Pixel ID no {' '}
            <a 
              href="https://www.facebook.com/events_manager/pixel/facebook_pixel" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center"
            >
              Gerenciador de Eventos do Facebook <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </p>
          
          {isValidPixel === false && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O ID do Pixel deve conter 15-16 dígitos numéricos.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {facebookPixelId && isValidPixelId(facebookPixelId) && (
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">
              Eventos rastreados automaticamente
            </Label>
            
            <div className="space-y-3 mt-1">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="track-pageview" 
                  checked={pixelTracking?.pageView !== false}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('pageView', checked as boolean)
                  }
                />
                <label
                  htmlFor="track-pageview"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  PageView
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Rastrear quando um usuário visualiza uma página do funil
              </p>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="track-complete" 
                  checked={pixelTracking?.completeRegistration !== false}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('completeRegistration', checked as boolean)
                  }
                />
                <label
                  htmlFor="track-complete"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  CompleteRegistration
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Rastrear quando um usuário completa o funil (última página)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacebookPixelConfig; 