import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFunnels } from '@/hooks/useFunnels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LayoutGrid, 
  Palette, 
  Settings, 
  Users, 
  Plus, 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  Bell, 
  Search,
  MoreHorizontal,
  Trash,
  Pencil,
  Check,
  X,
  CheckCircleIcon,
  InfoIcon,
  PlusIcon,
  XCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from '@/utils/store';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { accessService } from '@/services/accessService';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { funnelService } from '@/services/funnelService';
import ProfileModal from '@/components/ProfileModal';

interface DashboardMetrics {
  totalFunnels: number;
  totalSessions: number;
  completionRate: number;
  interactionRate: number;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { funnels, loading: funnelsLoading, error, refreshFunnels } = useFunnels();
  const { createFunnel, deleteFunnel, renameFunnel } = useStore();
  
  // Estados para controles de ação
  const [editingFunnelId, setEditingFunnelId] = useState<string | null>(null);
  const [newFunnelName, setNewFunnelName] = useState<string>('');
  const [funnelToDelete, setFunnelToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFunnels: 0,
    totalSessions: 0,
    completionRate: 0,
    interactionRate: 0
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Adicionar o hook de limites de plano
  const { 
    planId, 
    limits, 
    usage, 
    remaining, 
    canCreateFunnel, 
    loading: limitsLoading, 
    reload: reloadLimits 
  } = usePlanLimits();

  // Estado para controle de diálogo de criação de novo funil
  const [isNewFunnelDialogOpen, setIsNewFunnelDialogOpen] = useState<boolean>(false);
  const [newFunnelNameInput, setNewFunnelNameInput] = useState<string>('');
  const [isCreatingFunnel, setIsCreatingFunnel] = useState<boolean>(false);
  
  // Novo estado para verificação de disponibilidade de slug
  const [slugCheck, setSlugCheck] = useState<{
    checking: boolean;
    available: boolean | null;
    slug: string;
    suggestedSlug?: string;
  }>({
    checking: false,
    available: null,
    slug: ''
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadMetrics();
  }, [funnels]);

  const loadMetrics = async () => {
    try {
      setLoadingMetrics(true);
      
      // Carregar métricas para cada funil em paralelo
      const metricsPromises = funnels.map(funnel => 
        accessService.getFunnelMetrics(funnel.id)
          .catch(error => {
            console.error(`Error loading metrics for funnel ${funnel.id}:`, error);
            return {
              total_sessions: 0,
              completion_rate: 0,
              interaction_rate: 0
            };
          })
      );
      
      const funnelMetrics = await Promise.all(metricsPromises);
      
      // Calcular totais
      const totals = funnelMetrics.reduce((acc, metrics) => {
        // Converter as taxas de volta para números absolutos
        const completions = Math.round((metrics.completion_rate * metrics.total_sessions) / 100);
        const interactions = Math.round((metrics.interaction_rate * metrics.total_sessions) / 100);
        
        return {
          totalSessions: acc.totalSessions + metrics.total_sessions,
          totalCompletions: acc.totalCompletions + completions,
          totalInteractions: acc.totalInteractions + interactions
        };
      }, {
        totalSessions: 0,
        totalCompletions: 0,
        totalInteractions: 0
      });
      
      // Calcular as taxas globais
      setMetrics({
        totalFunnels: funnels.length,
        totalSessions: totals.totalSessions,
        completionRate: totals.totalSessions > 0 ? (totals.totalCompletions / totals.totalSessions) * 100 : 0,
        interactionRate: totals.totalSessions > 0 ? (totals.totalInteractions / totals.totalSessions) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics({
        totalFunnels: funnels.length,
        totalSessions: 0,
        completionRate: 0,
        interactionRate: 0
      });
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleOpenNewFunnelDialog = () => {
    if (!canCreateFunnel()) {
      toast.error(`Você atingiu o limite de ${limits?.maxFunnels} funis do seu plano ${planId?.toUpperCase() || 'atual'}.`, {
        description: "Faça upgrade para criar mais funis.",
        action: {
          label: "Ver Planos",
          onClick: () => navigate('/pricing')
        }
      });
      return;
    }
    
    setNewFunnelNameInput('Novo Funil');
    setIsNewFunnelDialogOpen(true);
    
    // Verificar a disponibilidade inicial do slug
    checkSlugAvailability('Novo Funil');
  };

  // Função para verificar disponibilidade de slug
  const checkSlugAvailability = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setSlugCheck({
          checking: false,
          available: null,
          slug: ''
        });
        return;
      }
      
      try {
        setSlugCheck(prev => ({ ...prev, checking: true }));
        
        // Delay para evitar muitas requisições enquanto digita
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await funnelService.checkSlugAvailability(name);
        
        setSlugCheck({
          checking: false,
          available: result.available,
          slug: result.slug,
          suggestedSlug: result.suggestedSlug
        });
      } catch (error) {
        console.error('Erro ao verificar slug:', error);
        setSlugCheck({
          checking: false,
          available: null,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        });
      }
    },
    []
  );
  
  // Efeito para verificar slug ao digitar
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isNewFunnelDialogOpen) {
        checkSlugAvailability(newFunnelNameInput);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [newFunnelNameInput, isNewFunnelDialogOpen, checkSlugAvailability]);

  const handleCreateFunnelWithName = async () => {
    if (!newFunnelNameInput.trim()) {
      toast.error('O nome do funil não pode estar vazio');
      return;
    }
    
    // Verificar se o slug está disponível
    if (slugCheck.available === false) {
      toast.error('Este nome de funil já está em uso', {
        description: slugCheck.suggestedSlug 
          ? `Sugestão: use "${slugCheck.suggestedSlug}" como alternativa.`
          : 'Por favor, escolha um nome diferente para o seu funil.'
      });
      return;
    }
    
    try {
      setIsCreatingFunnel(true);
      const newFunnel = await createFunnel(newFunnelNameInput.trim());
      if (newFunnel?.id) {
        // Recarregar limites após criar funil
        reloadLimits();
        setIsNewFunnelDialogOpen(false);
        navigate(`/builder/${newFunnel.id}`);
      }
    } catch (error: any) {
      // Verificar se é erro de limite (403)
      if (error.response?.status === 403) {
        toast.error(`Limite de funis atingido: ${error.response.data.current}/${error.response.data.limit}`, {
          description: "Faça upgrade para criar mais funis.",
          action: {
            label: "Ver Planos",
            onClick: () => navigate('/pricing')
          }
        });
        return;
      }
      
      console.error('Erro ao criar funil:', error);
      toast.error('Erro ao criar funil');
    } finally {
      setIsCreatingFunnel(false);
    }
  };
  
  // Iniciar edição de nome
  const handleStartEditing = (funnelId: string, currentName: string) => {
    setEditingFunnelId(funnelId);
    setNewFunnelName(currentName);
  };
  
  // Salvar o nome editado
  const handleSaveRename = async (funnelId: string) => {
    if (!newFunnelName.trim()) {
      toast.error('O nome do funil não pode estar vazio');
      return;
    }
    
    try {
      setActionLoading(true);
      await renameFunnel(funnelId, newFunnelName);
      toast.success('Funil renomeado com sucesso!');
      setEditingFunnelId(null);
    } catch (error) {
      console.error('Erro ao renomear funil:', error);
      toast.error('Erro ao renomear funil');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Cancelar edição de nome
  const handleCancelEdit = () => {
    setEditingFunnelId(null);
    setNewFunnelName('');
  };
  
  // Iniciar processo de exclusão
  const handleStartDelete = (funnelId: string) => {
    setFunnelToDelete(funnelId);
  };
  
  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!funnelToDelete) return;
    
    try {
      setActionLoading(true);
      await deleteFunnel(funnelToDelete);
      toast.success('Funil excluído com sucesso!');
      setFunnelToDelete(null);
      
      // Recarregar limites após excluir funil
      reloadLimits();
    } catch (error) {
      console.error('Erro ao excluir funil:', error);
      toast.error('Erro ao excluir funil');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Cancelar exclusão
  const handleCancelDelete = () => {
    setFunnelToDelete(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30">
      {/* Header com navegação */}
      <div className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LeadFlux
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar..."
                    className="pl-9 w-[300px] bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-full"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative p-2 rounded-full hover:bg-muted/80 transition-colors"
                  onClick={() => navigate('/diagnostic')}
                >
                  <span className="sr-only">Diagnóstico</span>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
                className="rounded-full h-9 w-9 p-0 hover:bg-primary/10 transition-colors"
              >
                <User className="h-5 w-5 text-primary" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')}
                className="rounded-full shadow-sm hover:shadow-md transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-100"
              >
                <Settings className="h-4 w-4 mr-2 text-primary" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 border-blue-100/50 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Funis</CardTitle>
              <div className="p-2 rounded-full bg-blue-100/30 group-hover:bg-blue-100 transition-colors">
                <LayoutGrid className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{metrics.totalFunnels}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">Atualizado</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100/50 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <div className="p-2 rounded-full bg-indigo-100/30 group-hover:bg-indigo-100 transition-colors">
                <Users className="h-4 w-4 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-indigo-100 rounded"></div>
                  <div className="h-4 w-24 bg-indigo-50 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{metrics.totalSessions}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Atualizado</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-green-100/50 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <div className="p-2 rounded-full bg-green-100/30 group-hover:bg-green-100 transition-colors">
                <CheckCircleIcon className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-green-100 rounded"></div>
                  <div className="h-4 w-24 bg-green-50 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{metrics.completionRate.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Atualizado</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 border-purple-100/50 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Interação</CardTitle>
              <div className="p-2 rounded-full bg-purple-100/30 group-hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-4 w-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-purple-100 rounded"></div>
                  <div className="h-4 w-24 bg-purple-50 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{metrics.interactionRate.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Atualizado</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda - Ações Rápidas */}
          <div className="lg:col-span-1">
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 border-slate-100/50 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary/60 transition-colors bg-white/80 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50/50 rounded-xl shadow-sm hover:shadow-md"
                    onClick={handleOpenNewFunnelDialog}
                    disabled={!canCreateFunnel()}
                  >
                    <div className="p-2 rounded-full bg-blue-100/50">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <span>Novo Funil</span>
                    {!limitsLoading && (
                      <div className="text-xs text-muted-foreground">
                        {remaining && remaining.funnels > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{usage?.funnels || 0}/{limits?.maxFunnels || 0} funis</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500">Limite atingido</span>
                        )}
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna do Meio e Direita */}
          <div className="lg:col-span-2">
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 border-slate-100/50 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {funnelsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 py-4">
                      Erro ao carregar funis: {error}
                      <Button onClick={refreshFunnels} variant="outline" className="ml-2 rounded-full">
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : funnels.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6 px-4 border border-dashed rounded-xl bg-slate-50/50">
                      <div className="p-3 rounded-full bg-blue-50 w-fit mx-auto mb-4">
                        <LayoutGrid className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="mb-3">Nenhum funil criado ainda.</p>
                      <Button onClick={handleOpenNewFunnelDialog} variant="outline" className="rounded-full hover:bg-white shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar seu primeiro funil
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {funnels
                        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                        .map((funnel) => (
                          <div
                            key={funnel.id}
                            className="flex items-center justify-between p-4 rounded-xl border bg-white/80 hover:bg-gradient-to-r hover:from-white hover:to-blue-50/20 hover:shadow-md transition-all"
                          >
                            {/* Se estiver editando este funil, mostrar campo de edição */}
                            {editingFunnelId === funnel.id ? (
                              <div className="flex flex-1 items-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100/50">
                                  <LayoutGrid className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={newFunnelName}
                                      onChange={(e) => setNewFunnelName(e.target.value)}
                                      className="h-8 text-sm font-medium rounded-lg border-blue-100 focus-visible:ring-blue-400/30"
                                      disabled={actionLoading}
                                      autoFocus
                                    />
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 rounded-full hover:bg-green-50" 
                                      onClick={() => handleSaveRename(funnel.id)}
                                      disabled={actionLoading}
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 rounded-full hover:bg-red-50" 
                                      onClick={handleCancelEdit}
                                      disabled={actionLoading}
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(funnel.updated_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* Visualização normal */
                              <div 
                                className="flex flex-1 items-center gap-4 cursor-pointer"
                                onClick={() => navigate(`/builder/${funnel.id}`)}
                              >
                                <div className="p-2 rounded-full bg-gradient-to-br from-blue-100/50 to-indigo-100/50">
                                  <LayoutGrid className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{funnel.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(funnel.updated_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "capitalize px-3 py-1 rounded-full text-xs font-medium",
                                funnel.status === "active" && "bg-green-50 text-green-700 border-green-200",
                                funnel.status === "draft" && "bg-slate-50 text-slate-700 border-slate-200"
                              )}>
                                {funnel.status === "active" ? "Ativo" : "Rascunho"}
                              </Badge>

                              {/* Menu de opções */}
                              {editingFunnelId !== funnel.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full hover:bg-slate-100 hover:text-slate-900">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-200">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditing(funnel.id, funnel.name);
                                    }} className="rounded-lg cursor-pointer hover:bg-blue-50">
                                      <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                                      Editar nome
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartDelete(funnel.id);
                                      }}
                                      className="text-red-600 hover:text-red-700 focus:text-red-700 rounded-lg cursor-pointer hover:bg-red-50"
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={funnelToDelete !== null} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent className="rounded-xl bg-white border-red-100 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. O funil será permanentemente excluído
              do nosso servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading} className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 rounded-full"
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Excluindo...</span>
                </div>
              ) : (
                "Sim, excluir funil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de novo funil */}
      <AlertDialog open={isNewFunnelDialogOpen} onOpenChange={setIsNewFunnelDialogOpen}>
        <AlertDialogContent className="rounded-xl bg-white border-blue-100 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Criar novo funil</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Digite um nome para seu novo funil. Este nome será usado para gerar o slug.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="relative">
              <Input
                value={newFunnelNameInput}
                onChange={(e) => setNewFunnelNameInput(e.target.value)}
                placeholder="Nome do funil"
                className="mb-2 pr-10 rounded-lg border-blue-100 focus-visible:ring-blue-400/30"
                autoFocus
              />
              <div className="absolute right-3 top-2">
                {slugCheck.checking ? (
                  <LoaderIcon className="h-5 w-5 text-blue-500 animate-spin" />
                ) : slugCheck.available === true ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : slugCheck.available === false ? (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <InfoIcon className="h-4 w-4 text-blue-500" />
              <div>
                {slugCheck.checking ? (
                  <span>Verificando disponibilidade do slug...</span>
                ) : slugCheck.available === true ? (
                  <span>O slug <code className="bg-blue-50 px-1 rounded">{slugCheck.slug}</code> está disponível</span>
                ) : slugCheck.available === false ? (
                  <span>
                    O slug <code className="bg-red-50 px-1 rounded">{slugCheck.slug}</code> já está em uso.
                    {slugCheck.suggestedSlug && (
                      <> Sugestão: <code className="bg-blue-50 px-1 rounded">{slugCheck.suggestedSlug}</code></>
                    )}
                  </span>
                ) : (
                  <span>O slug será gerado a partir deste nome (ex: novo-funil)</span>
                )}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreatingFunnel} className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateFunnelWithName}
              disabled={isCreatingFunnel || !newFunnelNameInput.trim() || slugCheck.available === false || slugCheck.checking}
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              {isCreatingFunnel ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Criando...</span>
                </div>
              ) : 'Criar Funil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Modal */}
      <ProfileModal 
        open={isProfileModalOpen} 
        onOpenChange={setIsProfileModalOpen} 
        user={user} 
        planInfo={{
          id: planId || 'free',
          name: planId ? planId.toUpperCase() : 'Gratuito',
          isActive: true
        }}
      />
    </div>
  );
};

export default Dashboard; 