import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFunnels } from '@/hooks/useFunnels';
import { Button } from '@/components/ui/button';
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
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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

  const handleCreateFunnel = async () => {
    try {
      const newFunnel = await createFunnel('Novo Funil');
      if (newFunnel?.id) {
        navigate(`/builder/${newFunnel.id}`);
      }
    } catch (error) {
      console.error('Erro ao criar funil:', error);
      toast.error('Erro ao criar funil');
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header com navegação */}
      <div className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
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
                    className="pl-9 w-[300px] bg-muted/50 border-none focus-visible:ring-1"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative p-2"
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
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Funis</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{metrics.totalFunnels}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Atualizado</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{metrics.totalSessions}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Atualizado</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{metrics.completionRate.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Atualizado</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Interação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{metrics.interactionRate.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Atualizado</span>
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
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-muted/50">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 group-hover:border-blue-600 transition-colors bg-white/50"
                    onClick={handleCreateFunnel}
                  >
                    <Plus className="h-6 w-6 text-blue-600" />
                    <span>Novo Funil</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 group-hover:border-blue-600 transition-colors bg-white/50"
                    onClick={() => navigate('/design')}
                  >
                    <Palette className="h-6 w-6 text-blue-600" />
                    <span>Design</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna do Meio e Direita */}
          <div className="lg:col-span-2">
            <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-muted/50">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
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
                      <Button onClick={refreshFunnels} variant="outline" className="ml-2">
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : funnels.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhum funil criado ainda.
                      <Button onClick={handleCreateFunnel} variant="link" className="ml-2">
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
                            className="flex items-center justify-between p-4 rounded-lg border bg-white/50 hover:shadow-sm transition-all"
                          >
                            {/* Se estiver editando este funil, mostrar campo de edição */}
                            {editingFunnelId === funnel.id ? (
                              <div className="flex flex-1 items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                  <LayoutGrid className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={newFunnelName}
                                      onChange={(e) => setNewFunnelName(e.target.value)}
                                      className="h-8 text-sm font-medium"
                                      disabled={actionLoading}
                                      autoFocus
                                    />
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8" 
                                      onClick={() => handleSaveRename(funnel.id)}
                                      disabled={actionLoading}
                                    >
                                      <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8" 
                                      onClick={handleCancelEdit}
                                      disabled={actionLoading}
                                    >
                                      <X className="h-4 w-4 text-red-500" />
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
                                <div className="p-2 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10">
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
                                "capitalize",
                                funnel.status === "active" && "bg-green-50 text-green-700 border-green-200",
                                funnel.status === "draft" && "bg-gray-50 text-gray-700 border-gray-200"
                              )}>
                                {funnel.status === "active" ? "Ativo" : "Rascunho"}
                              </Badge>

                              {/* Menu de opções */}
                              {editingFunnelId !== funnel.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditing(funnel.id, funnel.name);
                                    }}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar nome
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartDelete(funnel.id);
                                      }}
                                      className="text-red-600 focus:text-red-600"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O funil será permanentemente excluído
              do nosso servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
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
    </div>
  );
};

export default Dashboard; 