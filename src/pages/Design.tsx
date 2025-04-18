import { useStore } from "@/utils/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChevronLeft, Palette, Save, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link, useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { persistenceService } from "@/services/persistenceService";
import { operationQueueService } from "@/services/operationQueueService";

const Design = () => {
  const { toast } = useToast();
  const { currentFunnel, updateFunnel, setCurrentFunnel } = useStore();
  const { funnelId } = useParams<{ funnelId: string }>();
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (funnelId && (!currentFunnel || currentFunnel.id !== funnelId)) {
      setCurrentFunnel(funnelId);
    } else if (currentFunnel && (!currentFunnel.settings || Object.keys(currentFunnel.settings).length === 0)) {
      // Inicializar configurações padrão se não existirem
      const defaultSettings = {
        // Propriedades obrigatórias (NUNCA remover ou tornar opcional)
        primaryColor: '#0066ff',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter',
        showProgressBar: true,
        collectLeadData: true,
        // Propriedades opcionais de design
        bodySize: '16',
        headingSize: '32',
        lineHeight: '1.5',
        borderRadius: '8',
        borderWidth: '1',
        containerWidth: '600',
        spacingVertical: '16',
        spacingHorizontal: '16',
        shadowStrength: '1',
        textBold: false,
        textItalic: false,
        textUnderline: false,
        textUppercase: false
      };
      
      // Preservar steps explicitamente
      const originalSteps = [...(currentFunnel.steps || [])];
      
      const updatedFunnel = {
        ...currentFunnel,
        settings: defaultSettings,
        steps: originalSteps
      };
      
      console.log('Inicializando configurações padrão de design');
      updateFunnel(updatedFunnel);
    }
  }, [funnelId, currentFunnel, setCurrentFunnel, updateFunnel]);

  // Recarregar o funil quando houver alterações 
  // useEffect(() => {
  //   // A cada 2 segundos, recarregamos o funil para garantir que as alterações feitas sejam refletidas
  //   const intervalId = setInterval(() => {
  //     if (funnelId && currentFunnel) {
  //       console.log("Recarregando funil para atualizar configurações...");
  //       setCurrentFunnel(funnelId);
  //     }
  //   }, 2000);
    
  //   return () => clearInterval(intervalId);
  // }, [funnelId, currentFunnel?.id, setCurrentFunnel]);

  if (!currentFunnel) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-[400px] p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Nenhum funil selecionado</h2>
          <p className="text-muted-foreground mb-4">
            Volte para a página inicial e selecione ou crie um funil para começar.
          </p>
          <Button className="w-full" onClick={() => window.location.href = "/"}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!currentFunnel) return;
    
    setSaving(true);
    
    // Preservar os steps originais
    const originalSteps = [...(currentFunnel.steps || [])];
    
    // Campos obrigatórios de configuração
    const requiredDefaults = {
      primaryColor: '#0066ff',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      showProgressBar: true,
      collectLeadData: true
    };
    
    // Usar spread operator em vez de JSON.parse/stringify para evitar perder referências
    const settingsUpdate = {
      ...currentFunnel,
      settings: {
        ...requiredDefaults,
        ...(currentFunnel.settings || {})
      },
      steps: originalSteps
    };
    
    console.log('Salvando configurações de design...', {
      funnelId: settingsUpdate.id,
      stepsCount: originalSteps?.length || 0
    });
    
    // Atualizar o funil no servidor usando persistenceService diretamente
    persistenceService.saveFunnelSettings(settingsUpdate)
      .then((result) => {
        if (!result.success) {
          throw new Error('Falha ao salvar configurações');
        }
        
        console.log('Configurações de design salvas com sucesso', {
          returnedStepsCount: result.data.steps?.length || 0
        });
        
        // Garantir que o estado final tenha os steps preservados
        const finalFunnel = {
          ...result.data,
          steps: originalSteps || result.data.steps || []
        };
        
        // Atualizar o estado com o resultado mas preservando os steps
        updateFunnel(finalFunnel);
        setSaving(false);
        
        toast({
          title: "Design salvo",
          description: "Todas as configurações foram salvas com sucesso.",
          duration: 2000,
        });
      })
      .catch(error => {
        console.error('Erro ao salvar configurações:', error);
        setSaving(false);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as configurações. Tente novamente mais tarde.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  const handleColorChange = (field: string, value: string | boolean) => {
    if (!currentFunnel) return;
    
    // Evitar atualização quando o valor não mudou
    if (currentFunnel.settings && currentFunnel.settings[field] === value) {
      console.log(`Valor não mudou para ${field}, ignorando atualização`);
      return;
    }
    
    console.log(`Antes da atualização - ${field}:`, currentFunnel.settings?.[field]);
    console.log(`Novo valor - ${field}:`, value);
    
    // Garantir que todos os campos obrigatórios estejam definidos
    const requiredDefaults = {
      primaryColor: '#0066ff',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      showProgressBar: true,
      collectLeadData: true
    };
    
    // Mesclar configurações existentes, campos obrigatórios e nova alteração
    const updatedSettings = {
      ...requiredDefaults,
      ...(currentFunnel.settings || {}),
      [field]: value
    };
    
    // Criar uma cópia do funil mantendo a estrutura original
    // IMPORTANTE: NÃO use JSON.parse(JSON.stringify()) para evitar perder referências dos steps
    const updatedFunnel = {
      ...currentFunnel,
      settings: updatedSettings
    };
    
    // Armazenar explicitamente os steps originais
    const originalSteps = [...(currentFunnel.steps || [])];
    
    // Atualizar o estado local imediatamente para feedback rápido
    updateFunnel(updatedFunnel);
    
    // Mostrar indicador de loading
    setSaving(true);
    
    // Preparar objeto para persistência que contém APENAS settings
    // para evitar enviar steps para o backend
    const settingsOnlyFunnel = {
      ...currentFunnel,
      settings: updatedSettings,
      // Incluir explicitamente os steps para persistenceService
      steps: originalSteps
    };
    
    // Enfileirar a operação com recuperação automática
    operationQueueService.enqueue(
      async (funnel) => {
        // Usamos saveFunnelSettings para atualizar apenas as configurações
        const result = await persistenceService.saveFunnelSettings(funnel);
        if (!result.success) {
          throw result.error;
        }
        
        // Garantir que o resultado mantenha os steps originais
        result.data.steps = originalSteps;
        return result.data;
      },
      settingsOnlyFunnel,
      {
        description: `Atualizar configuração ${field} do funil ${settingsOnlyFunnel.id}`,
        onSuccess: (updatedFunnelData) => {
          console.log(`Configuração ${field} atualizada com sucesso`);
          setSaving(false);
          
          toast({
            title: "Configuração atualizada",
            description: `A configuração foi alterada com sucesso.`,
            duration: 1500,
          });
        },
        onError: (error) => {
          console.error(`Erro ao atualizar configuração ${field}:`, error);
          setSaving(false);
          
          toast({
            title: "Erro ao atualizar",
            description: "Não foi possível salvar a configuração. Tentando novamente automaticamente.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b py-3 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100" onClick={() => window.location.href = "/"}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-violet-700">LeadFlux</h1>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <span className="text-sm text-gray-600">{currentFunnel.name}</span>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to={`/builder/${currentFunnel.id}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Builder
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to={`/design/${currentFunnel.id}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle({
                  className: "bg-violet-100 text-violet-800"
                })}>
                  <Palette className="h-4 w-4 mr-1.5" />
                  Design
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to={`/settings/${currentFunnel.id}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Configurações
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to={`/leads/${currentFunnel.id}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Leads
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            className="h-9 bg-violet-600 hover:bg-violet-700 gap-1.5 px-4 shadow-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Salvando...
              </>
            ) : (
              <>
            <Save className="h-4 w-4" />
            Salvar
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Design do Funil</h1>
            <p className="text-gray-500 mt-1">Personalize a aparência do seu funil de vendas</p>
          </div>
        </div>
        
        <div className="w-full">
          <Tabs defaultValue="cores" className="w-full">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <TabsList className="w-full grid grid-cols-3 bg-gray-100">
                  <TabsTrigger value="cores" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm">
                    Cores
                  </TabsTrigger>
                  <TabsTrigger value="tipografia" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm">
                    Tipografia
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm">
                    Layout
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="cores" className="space-y-6 mt-0">
                  <div className="grid gap-5">
                    {/* Logo Upload Section */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Logotipo</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        O logotipo aparecerá em todas as páginas do funil, acima da barra de progresso.
                      </p>
                      
                      {currentFunnel.settings?.logo ? (
                        <div className="space-y-3 mt-3">
                          <div className="border rounded-md p-4 flex items-center justify-between">
                            <div className="max-w-[200px] max-h-[60px] overflow-hidden">
                              <img
                                src={currentFunnel.settings.logo}
                                alt="Logotipo"
                                className="max-h-[60px] object-contain"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedFunnel = {
                                  ...currentFunnel,
                                  settings: {
                                    ...currentFunnel.settings,
                                    logo: undefined,
                                  },
                                };
                                updateFunnel(updatedFunnel);
                                
                                toast({
                                  title: "Logotipo removido",
                                  description: "O logotipo foi removido com sucesso.",
                                });
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            Trocar logotipo
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors mt-3"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium mb-1">
                            Clique para fazer upload do logotipo
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            PNG, JPG, SVG (tamanho recomendado: 300x80px)
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Selecionar arquivo
                          </Button>
                        </div>
                      )}
                      
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          
                          const file = files[0];
                          
                          if (!file.type.startsWith('image/')) {
                            toast({
                              title: "Formato não suportado",
                              description: "Por favor, envie apenas arquivos de imagem.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          setSaving(true);
                          
                          try {
                            console.log("Design - Processando logotipo:", file.name, file.type, file.size);
                            
                            // Redimensionar imagem para um tamanho menor
                            const canvas = document.createElement('canvas');
                            const maxWidth = 300;
                            const maxHeight = 100;
                            
                            const img = new Image();
                            
                            img.onload = async () => {
                              let width = img.width;
                              let height = img.height;
                              
                              // Redimensionar mantendo proporção
                              if (width > maxWidth) {
                                height = Math.round(height * (maxWidth / width));
                                width = maxWidth;
                              }
                              
                              if (height > maxHeight) {
                                width = Math.round(width * (maxHeight / height));
                                height = maxHeight;
                              }
                              
                              canvas.width = width;
                              canvas.height = height;
                              
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              
                              // Converter para base64 com qualidade reduzida
                              let base64Logo = canvas.toDataURL('image/jpeg', 0.8);
                              
                              console.log("Design - Logo processado, tamanho:", base64Logo.length);
                              
                              // Verificar se o logo não é grande demais para armazenamento
                              if (base64Logo.length > 500000) { // 500KB
                                console.warn("Design - Logo muito grande, tentando reduzir mais");
                                // Tentar reduzir ainda mais a qualidade
                                base64Logo = canvas.toDataURL('image/jpeg', 0.6);
                                console.log("Design - Logo reduzido novamente, novo tamanho:", base64Logo.length);
                              }
                              
                              // Atualizar funil com o logo
                              const updatedFunnel = {
                                ...currentFunnel,
                                settings: {
                                  ...currentFunnel.settings,
                                  logo: base64Logo
                                }
                              };
                              
                              // Atualizar estado local para feedback visual imediato
                              updateFunnel(updatedFunnel);
                              
                              // Persistir alteração no banco de dados
                              try {
                                console.log("Design - Persistindo logo no banco de dados");
                                await persistenceService.saveFunnelSettings(updatedFunnel);
                                console.log("Design - Logo persistido com sucesso");
                                
                                toast({
                                  title: "Logotipo atualizado",
                                  description: "O logotipo foi atualizado com sucesso."
                                });
                              } catch (saveError) {
                                console.error("Design - Erro ao persistir logo:", saveError);
                                toast({
                                  title: "Erro ao salvar",
                                  description: "O logotipo foi atualizado localmente, mas não foi possível salvar no servidor.",
                                  variant: "destructive"
                                });
                              }
                              
                              setSaving(false);
                            };
                            
                            img.onerror = () => {
                              console.error("Design - Erro ao carregar imagem");
                              toast({
                                title: "Erro ao processar imagem",
                                description: "Não foi possível carregar a imagem.",
                                variant: "destructive"
                              });
                              setSaving(false);
                            };
                            
                            // Carregar a imagem
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              img.src = e.target?.result as string;
                            };
                            reader.onerror = () => {
                              console.error("Design - Erro ao ler arquivo");
                              setSaving(false);
                            };
                            reader.readAsDataURL(file);
                            
                          } catch (error) {
                            console.error("Design - Erro ao processar imagem:", error);
                            toast({
                              title: "Erro ao processar imagem",
                              description: "Não foi possível processar a imagem. Tente novamente.",
                              variant: "destructive"
                            });
                            setSaving(false);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="primary-color" className="text-sm font-medium">Cor Primária</Label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="relative w-12 h-12 border rounded-md overflow-hidden">
                          <div 
                            style={{ backgroundColor: currentFunnel.settings?.primaryColor || "#0066ff" }} 
                            className="absolute inset-0"
                          />
                          <input 
                            type="color" 
                            id="primary-color" 
                            value={currentFunnel.settings?.primaryColor || "#0066ff"} 
                            onChange={(e) => {
                              const newColor = e.target.value;
                              console.log("Novo valor de cor primária selecionado:", newColor);
                              handleColorChange('primaryColor', newColor);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center flex-1">
                          <Input 
                            value={currentFunnel.settings?.primaryColor || "#0066ff"} 
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            className="w-36 font-mono"
                            onBlur={(e) => {
                              // Validar se é uma cor hexadecimal válida
                              const isValidHex = /^#[0-9A-F]{6}$/i.test(e.target.value);
                              if (!isValidHex) {
                                toast({
                                  title: "Cor inválida",
                                  description: "Por favor, insira um valor hexadecimal válido (ex: #0066ff)",
                                  variant: "destructive",
                                });
                                // Restaurar cor anterior se inválida
                                handleColorChange('primaryColor', currentFunnel.settings?.primaryColor || "#0066ff");
                              }
                            }}
                          />
                          {saving && <span className="ml-2 h-4 w-4 inline-block border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></span>}
                        </div>
                        <Badge className="ml-auto">Botões e links</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="background-color" className="text-sm font-medium">Cor de Fundo</Label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="relative w-12 h-12 border rounded-md overflow-hidden">
                          <div 
                            style={{ backgroundColor: currentFunnel.settings?.backgroundColor || "#ffffff" }} 
                            className="absolute inset-0"
                          />
                          <input 
                            type="color" 
                            id="background-color" 
                            value={currentFunnel.settings?.backgroundColor || "#ffffff"} 
                            onChange={(e) => {
                              const newColor = e.target.value;
                              console.log("Novo valor de cor de fundo selecionado:", newColor);
                              handleColorChange('backgroundColor', newColor);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center flex-1">
                          <Input 
                            value={currentFunnel.settings?.backgroundColor || "#ffffff"} 
                            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                            className="w-36 font-mono"
                            onBlur={(e) => {
                              // Validar se é uma cor hexadecimal válida
                              const isValidHex = /^#[0-9A-F]{6}$/i.test(e.target.value);
                              if (!isValidHex) {
                                toast({
                                  title: "Cor inválida",
                                  description: "Por favor, insira um valor hexadecimal válido (ex: #ffffff)",
                                  variant: "destructive",
                                });
                                // Restaurar cor anterior se inválida
                                handleColorChange('backgroundColor', currentFunnel.settings?.backgroundColor || "#ffffff");
                              }
                            }}
                          />
                          {saving && <span className="ml-2 h-4 w-4 inline-block border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></span>}
                        </div>
                        <Badge className="ml-auto">Fundo da página</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tipografia" className="mt-0">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="font-family" className="text-sm font-medium">Fonte Principal</Label>
                        <select 
                          id="font-family"
                          className="w-full h-10 px-3 mt-1.5 rounded-md border border-input bg-background"
                          value={currentFunnel.settings?.fontFamily || "Inter"}
                          onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">Fonte utilizada em todo o funil</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label htmlFor="heading-size" className="text-sm font-medium">Tamanho de Título</Label>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Input 
                              id="heading-size"
                              type="number"
                              min="16"
                              max="48"
                              value={currentFunnel.settings?.headingSize || "32"}
                              onChange={(e) => handleColorChange('headingSize', e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">pixels</span>
                            <div className="ml-2 flex items-center gap-1.5">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleColorChange('headingSize', String(Math.max(16, Number(currentFunnel.settings?.headingSize || 32) - 2)))}
                              >
                                -
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleColorChange('headingSize', String(Math.min(48, Number(currentFunnel.settings?.headingSize || 32) + 2)))}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="body-size" className="text-sm font-medium">Tamanho do Texto</Label>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Input 
                              id="body-size"
                              type="number"
                              min="12"
                              max="24"
                              value={currentFunnel.settings?.bodySize || "16"}
                              onChange={(e) => handleColorChange('bodySize', e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">pixels</span>
                            <div className="ml-2 flex items-center gap-1.5">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleColorChange('bodySize', String(Math.max(12, Number(currentFunnel.settings?.bodySize || 16) - 1)))}
                              >
                                -
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleColorChange('bodySize', String(Math.min(24, Number(currentFunnel.settings?.bodySize || 16) + 1)))}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Estilo do Texto</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="text-bold"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={currentFunnel.settings?.textBold || false}
                              onChange={(e) => handleColorChange('textBold', e.target.checked)}
                            />
                            <Label htmlFor="text-bold" className="text-sm font-semibold cursor-pointer">Negrito</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="text-italic"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={currentFunnel.settings?.textItalic || false}
                              onChange={(e) => handleColorChange('textItalic', e.target.checked)}
                            />
                            <Label htmlFor="text-italic" className="text-sm italic cursor-pointer">Itálico</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="text-underline"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={currentFunnel.settings?.textUnderline || false}
                              onChange={(e) => handleColorChange('textUnderline', e.target.checked)}
                            />
                            <Label htmlFor="text-underline" className="text-sm underline cursor-pointer">Sublinhado</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="text-uppercase"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={currentFunnel.settings?.textUppercase || false}
                              onChange={(e) => handleColorChange('textUppercase', e.target.checked)}
                            />
                            <Label htmlFor="text-uppercase" className="text-sm uppercase cursor-pointer">Maiúsculas</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="line-height" className="text-sm font-medium">Altura da Linha</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Input 
                            id="line-height"
                            type="number"
                            step="0.1"
                            min="1"
                            max="2"
                            value={currentFunnel.settings?.lineHeight || "1.5"}
                            onChange={(e) => handleColorChange('lineHeight', e.target.value)}
                            className="w-24"
                          />
                          <div className="ml-2 flex items-center gap-1.5">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleColorChange('lineHeight', String(Math.max(1, Number(currentFunnel.settings?.lineHeight || 1.5) - 0.1)))}
                            >
                              -
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleColorChange('lineHeight', String(Math.min(2, Number(currentFunnel.settings?.lineHeight || 1.5) + 0.1)))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Controla o espaçamento entre linhas de texto</p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="layout" className="mt-0">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="container-width" className="text-sm font-medium">Largura do Container</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Input 
                            id="container-width"
                            type="number"
                            min="300"
                            max="1200"
                            value={currentFunnel.settings?.containerWidth || "600"}
                            onChange={(e) => handleColorChange('containerWidth', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">pixels</span>
                          <Badge className="ml-2">Desktop</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Largura máxima do conteúdo no desktop</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Espaçamento</Label>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <Label htmlFor="spacing-vertical" className="text-sm">Vertical</Label>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Input 
                                id="spacing-vertical"
                                type="number"
                                min="0"
                                max="48"
                                value={currentFunnel.settings?.spacingVertical || "16"}
                                onChange={(e) => handleColorChange('spacingVertical', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">pixels</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="spacing-horizontal" className="text-sm">Horizontal</Label>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Input 
                                id="spacing-horizontal"
                                type="number"
                                min="0"
                                max="48"
                                value={currentFunnel.settings?.spacingHorizontal || "16"}
                                onChange={(e) => handleColorChange('spacingHorizontal', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">pixels</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Bordas</Label>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <Label htmlFor="border-radius" className="text-sm">Arredondamento</Label>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Input 
                                id="border-radius"
                                type="number"
                                min="0"
                                max="24"
                                value={currentFunnel.settings?.borderRadius || "8"}
                                onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">pixels</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="border-width" className="text-sm">Espessura</Label>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Input 
                                id="border-width"
                                type="number"
                                min="0"
                                max="5"
                                value={currentFunnel.settings?.borderWidth || "1"}
                                onChange={(e) => handleColorChange('borderWidth', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">pixels</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="shadow-strength" className="text-sm font-medium">Intensidade das Sombras</Label>
                        <div className="grid grid-cols-4 gap-3 mt-1.5">
                          {['Nenhuma', 'Suave', 'Média', 'Forte'].map((strength, index) => (
                            <Button 
                              key={index}
                              variant={currentFunnel.settings?.shadowStrength === String(index) ? "default" : "outline"}
                              className="h-20 py-2 flex flex-col gap-2 items-center justify-center"
                              onClick={() => handleColorChange('shadowStrength', String(index))}
                            >
                              <div 
                                className={`w-6 h-6 rounded-full bg-violet-500 
                                  ${index === 0 ? '' : 
                                   index === 1 ? 'shadow-sm' : 
                                   index === 2 ? 'shadow-md' : 'shadow-lg'}`}
                              />
                              <span className="text-xs">{strength}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Design;
