import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/utils/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, ChevronLeft, Link as LinkIcon, Mail, Save, Settings as SettingsIcon, 
  Globe, CheckCircle, AlertCircle, ShieldCheck, Zap, Share2, Database, ExternalLink, Lock, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { accessService } from "@/services/accessService";
import { DomainManager } from "@/components/domains/DomainManager";
import FacebookPixelConfig from "@/components/pixel/FacebookPixelConfig";

const Settings = () => {
  const { toast } = useToast();
  const { currentFunnel, updateFunnel, setCurrentFunnel } = useStore();
  const [saving, setSaving] = useState(false);
  const { funnelId } = useParams<{ funnelId: string }>();
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [funnelStats, setFunnelStats] = useState<{views: number; conversions: number} | null>(null);
  
  const fetchFunnelStats = useCallback(async () => {
    if (!currentFunnel?.id) return;
    
    try {
      const stats = await accessService.getFunnelStats(currentFunnel.id);
      setFunnelStats(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do funil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar as estatísticas do funil",
        variant: "destructive",
      });
    }
  }, [currentFunnel?.id, toast]);
  
  useEffect(() => {
    if (funnelId && (!currentFunnel || currentFunnel.id !== funnelId)) {
      setCurrentFunnel(funnelId);
    }
  }, [funnelId, currentFunnel, setCurrentFunnel]);

  // Carregar estatísticas do funil
  useEffect(() => {
    if (currentFunnel?.id) {
      fetchFunnelStats();
    }
  }, [currentFunnel?.id, fetchFunnelStats]);

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
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram salvas com sucesso.",
      });
    }, 800);
  };

  const handleSettingChange = (field: string, value: any) => {
    if (!currentFunnel) return;
    
    const updatedFunnel = {
      ...currentFunnel,
      settings: {
        ...currentFunnel.settings,
        [field]: value,
      },
    };
    updateFunnel(updatedFunnel);
  };

  const handleFunnelNameChange = (name: string) => {
    if (!currentFunnel) return;
    
    const updatedFunnel = {
      ...currentFunnel,
      name,
    };
    updateFunnel(updatedFunnel);
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
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Design
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to={`/settings/${currentFunnel.id}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle({
                  className: "bg-violet-100 text-violet-800"
                })}>
                  <SettingsIcon className="h-4 w-4 mr-1.5" />
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
      </header>

      <div className="container max-w-5xl py-8 px-6 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Configurações do Funil</h1>
            <p className="text-gray-500 mt-1">Configure sua experiência e integrações</p>
          </div>
        </div>
        
        <Tabs defaultValue="informações" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="informações" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Informações
            </TabsTrigger>
            <TabsTrigger value="integrações" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Facebook Pixel
            </TabsTrigger>
            <TabsTrigger value="domínio" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Domínio
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              SEO
            </TabsTrigger>
            <TabsTrigger value="segurança" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Segurança
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="informações" className="space-y-6 mt-0">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-violet-600" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu funil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="funnel-name" className="text-sm font-medium">Nome do Funil</Label>
                  <Input 
                    id="funnel-name" 
                    value={currentFunnel.name} 
                    onChange={(e) => handleFunnelNameChange(e.target.value)}
                    className="mt-1.5"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1.5">O nome do funil só pode ser editado durante a criação</p>
                </div>
                
                <div>
                  <Label htmlFor="funnel-description" className="text-sm font-medium">Descrição</Label>
                  <Textarea 
                    id="funnel-description" 
                    value={currentFunnel.description || ""} 
                    onChange={(e) => {
                      const updatedFunnel = {
                        ...currentFunnel,
                        description: e.target.value,
                      };
                      updateFunnel(updatedFunnel);
                    }}
                    className="mt-1.5 resize-none h-20"
                    placeholder="Descreva o objetivo deste funil"
                  />
                </div>

                <div>
                  <Label htmlFor="funnel-slug" className="text-sm font-medium">URL do Funil</Label>
                  <div className="flex mt-1.5">
                    <div className="bg-gray-100 text-gray-500 px-3 flex items-center border border-r-0 rounded-l-md text-sm">
                      leadflux.digital/f/
                    </div>
                    <Input 
                      id="funnel-slug" 
                      value={currentFunnel.slug || currentFunnel.name.toLowerCase().replace(/\s+/g, '-')} 
                      onChange={(e) => {
                        const updatedFunnel = {
                          ...currentFunnel,
                          slug: e.target.value,
                        };
                        updateFunnel(updatedFunnel);
                      }}
                      className="rounded-l-none"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">O slug do funil é gerado automaticamente a partir do nome</p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="publish-funnel" className="text-sm font-medium">Publicar Funil</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Tornar o funil acessível publicamente</p>
                    </div>
                    <Switch 
                      id="publish-funnel" 
                      checked={currentFunnel.status === 'active'}
                      onCheckedChange={(checked) => {
                        const updatedFunnel = {
                          ...currentFunnel,
                          status: checked ? 'active' : 'draft' as 'active' | 'draft',
                        };
                        updateFunnel(updatedFunnel);

                        // Exibir toast com o status
                        if (checked) {
                          toast({
                            title: "Funil publicado",
                            description: `Seu funil está disponível em: leadflux.digital/f/${currentFunnel.slug}`,
                          });
                        } else {
                          toast({
                            title: "Funil despublicado",
                            description: "Seu funil não está mais acessível publicamente",
                          });
                        }
                      }}
                    />
                  </div>
                  
                  {currentFunnel.status === 'active' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-700">
                          Seu funil está publicado
                        </p>
                      </div>
                      <p className="text-xs mt-2 text-green-600">
                        Acesse em: <a href={`https://leadflux.digital/f/${currentFunnel.slug}`} target="_blank" rel="noopener noreferrer" className="underline font-medium">leadflux.digital/f/{currentFunnel.slug}</a>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 pb-0 flex justify-start bg-gray-50 gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Funil ativo
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <span className="h-3.5 w-3.5">📅</span>
                  Criado em 15/06/2023
                </Badge>
              </CardFooter>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Configurações de Funcionamento
                </CardTitle>
                <CardDescription>
                  Configure como o funil irá funcionar
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-progress" className="text-sm font-medium">Barra de Progresso</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Mostrar barra de progresso no funil</p>
                    </div>
                    <Switch 
                      id="show-progress" 
                      checked={currentFunnel.settings.showProgressBar}
                      onCheckedChange={(checked) => handleSettingChange('showProgressBar', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="collect-lead" className="text-sm font-medium">Coletar Dados do Lead</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Solicitar nome, email e telefone</p>
                    </div>
                    <Switch 
                      id="collect-lead" 
                      checked={currentFunnel.settings.collectLeadData}
                      onCheckedChange={(checked) => handleSettingChange('collectLeadData', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-previous-button" className="text-sm font-medium">Botão "Voltar"</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Permitir que o usuário volte para etapas anteriores</p>
                    </div>
                    <Switch 
                      id="show-previous-button" 
                      checked={currentFunnel.settings.showPreviousButton ?? true}
                      onCheckedChange={(checked) => handleSettingChange('showPreviousButton', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="text-sm font-medium">Salvar Automaticamente</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Salvar progresso do usuário automaticamente</p>
                    </div>
                    <Switch 
                      id="auto-save" 
                      checked={currentFunnel.settings.autoSave ?? true}
                      onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-share-buttons" className="text-sm font-medium">Botões de Compartilhamento</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Exibir botões para compartilhar nas redes sociais</p>
                    </div>
                    <Switch 
                      id="show-share-buttons" 
                      checked={currentFunnel.settings.showShareButtons ?? false}
                      onCheckedChange={(checked) => handleSettingChange('showShareButtons', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrações" className="space-y-6 mt-0">
            {/* Facebook Pixel Config */}
            <FacebookPixelConfig
              facebookPixelId={currentFunnel.settings.facebookPixelId}
              pixelTracking={currentFunnel.settings.pixelTracking}
              onUpdate={handleSettingChange}
            />
          </TabsContent>
          
          <TabsContent value="domínio" className="space-y-4">
            <DomainManager funnelId={currentFunnel.id} />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-6 mt-0">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="h-5 w-5 text-green-500" />
                  SEO & Metadados
                </CardTitle>
                <CardDescription>
                  Configure informações para melhorar o SEO do seu funil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="seo-title" className="text-sm font-medium">Título da Página</Label>
                  <Input 
                    id="seo-title" 
                    placeholder="Título SEO do seu funil" 
                    value={currentFunnel.settings.seoTitle || ""} 
                    onChange={(e) => handleSettingChange('seoTitle', e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Aparecerá na aba do navegador e resultados de busca</p>
                </div>
                
                <div>
                  <Label htmlFor="seo-description" className="text-sm font-medium">Descrição da Página</Label>
                  <Textarea 
                    id="seo-description" 
                    placeholder="Descrição para SEO" 
                    value={currentFunnel.settings.seoDescription || ""} 
                    onChange={(e) => handleSettingChange('seoDescription', e.target.value)}
                    className="mt-1.5 resize-none h-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">Aparecerá nos resultados de busca</p>
                </div>
                
                <div>
                  <Label htmlFor="favicon" className="text-sm font-medium">Favicon</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="border border-input w-12 h-12 rounded-md flex items-center justify-center bg-gray-50">
                      {currentFunnel.settings.favicon ? (
                        <img 
                          src={currentFunnel.settings.favicon}
                          alt="Favicon" 
                          className="max-w-full max-h-full"
                        />
                      ) : (
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1.5">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <path d="M21 14V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V14M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Upload
                      </Button>
                      {currentFunnel.settings.favicon && (
                        <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Ícone que aparece na aba do navegador (recomendado: 32x32px)
                  </p>
                </div>
                
                <div className="pt-2">
                  <Label className="text-sm font-medium">Preview nos Resultados de Busca</Label>
                  <div className="mt-3 border rounded-md p-4 bg-white">
                    <div className="text-blue-600 text-base font-medium">
                      {currentFunnel.settings.seoTitle || currentFunnel.name || "Seu Funil"}
                    </div>
                    <div className="text-green-700 text-xs mt-1">
                      {currentFunnel.settings.customDomain || "leadflux.digital/f/" + (currentFunnel.slug || currentFunnel.name.toLowerCase().replace(/\s+/g, '-'))}
                    </div>
                    <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {currentFunnel.settings.seoDescription || currentFunnel.description || "Descrição do seu funil de vendas personalizado. Adicione uma descrição para melhorar o SEO."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="segurança" className="space-y-6 mt-0">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-violet-500" />
                  Proteção de Acesso
                </CardTitle>
                <CardDescription>
                  Configure como seu funil pode ser acessado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div>
                  <Label htmlFor="visibility" className="text-sm font-medium">Visibilidade</Label>
                  <Select 
                    value={currentFunnel.visibility || 'public'} 
                    onValueChange={(value) => {
                      const updatedFunnel = {
                        ...currentFunnel,
                        visibility: value as 'public' | 'private' | 'unlisted',
                      };
                      updateFunnel(updatedFunnel);
                    }}
                  >
                    <SelectTrigger id="visibility" className="mt-1.5">
                      <SelectValue placeholder="Selecione a visibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-500" />
                          <div>
                            <span className="font-medium">Público</span>
                            <p className="text-xs text-muted-foreground">Qualquer pessoa pode acessar</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-amber-500" />
                          <div>
                            <span className="font-medium">Não listado</span>
                            <p className="text-xs text-muted-foreground">Acessível apenas com o link direto</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <div>
                            <span className="font-medium">Privado</span>
                            <p className="text-xs text-muted-foreground">Protegido por senha</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {currentFunnel.visibility === 'private' && (
                  <div className="space-y-3 pt-2">
                    <Label htmlFor="funnel-password" className="text-sm font-medium">Senha de acesso</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="funnel-password" 
                        type="password"
                        placeholder="Digite uma senha para o funil"
                        value={temporaryPassword || ''}
                        onChange={(e) => setTemporaryPassword(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline"
                        onClick={async () => {
                          if (!temporaryPassword) {
                            toast({
                              title: "Senha inválida",
                              description: "Por favor, digite uma senha válida",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          try {
                            setSaving(true);
                            const success = await accessService.updateFunnelPassword(
                              currentFunnel.id,
                              temporaryPassword
                            );
                            
                            if (success) {
                              toast({
                                title: "Senha definida",
                                description: "A senha foi definida com sucesso",
                              });
                              setTemporaryPassword('');
                            } else {
                              toast({
                                title: "Erro",
                                description: "Não foi possível definir a senha",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error('Erro ao definir senha:', error);
                            toast({
                              title: "Erro",
                              description: "Não foi possível definir a senha",
                              variant: "destructive",
                            });
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        Definir Senha
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Esta senha será solicitada quando alguém tentar acessar seu funil.
                    </p>
                  </div>
                )}
                
                {currentFunnel.visibility !== 'public' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      {currentFunnel.visibility === 'private' 
                        ? "Seu funil está protegido por senha e só poderá ser acessado por pessoas que possuem a senha."
                        : "Seu funil não está listado publicamente e só pode ser acessado por pessoas que possuem o link direto."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Estatísticas de acesso</Label>
                  {funnelStats ? (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-muted-foreground text-xs">Visualizações</div>
                        <div className="text-xl font-bold">{funnelStats.views}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-muted-foreground text-xs">Conversões</div>
                        <div className="text-xl font-bold">{funnelStats.conversions}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm mt-1">
                      Carregando estatísticas...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
