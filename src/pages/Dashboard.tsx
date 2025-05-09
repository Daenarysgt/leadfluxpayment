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
  User,
  CalendarIcon
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
import { dashboardService } from '@/services/dashboardService';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { funnelService } from '@/services/funnelService';
import ProfileModal from '@/components/ProfileModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

  // Estado para o gráfico e período
  const [chartPeriod, setChartPeriod] = useState<'today' | '7days' | '30days'>('7days');
  const [chartData, setChartData] = useState<Array<{
    name: string;
    sessoes: number;
    concluidos: number;
  }>>([]);
  
  // Novos estados para armazenar dados consistentes por período
  const [chartDataByPeriod, setChartDataByPeriod] = useState<{
    today: Array<{name: string; sessoes: number; concluidos: number;}>;
    '7days': Array<{name: string; sessoes: number; concluidos: number;}>;
    '30days': Array<{name: string; sessoes: number; concluidos: number;}>;
  }>({
    today: [],
    '7days': [],
    '30days': []
  });
  
  // Flag para controlar a inicialização dos dados por período
  const [dataInitialized, setDataInitialized] = useState<{
    today: boolean;
    '7days': boolean;
    '30days': boolean;
  }>({
    today: false,
    '7days': false,
    '30days': false
  });

  // Flag para controlar carregamento do gráfico
  const [loadingChartData, setLoadingChartData] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Forçar atualização de dados ao carregar o componente
    const loadAllData = async () => {
      try {
        setLoadingChartData(true);
        setLoadingMetrics(true);
        
        console.log("Atualizando dados do dashboard...");
        
        // Buscar dados do gráfico (usando cache se disponível)
        const chartData = await dashboardService.getDashboardChartData(chartPeriod);
        
        // Atualizar gráfico
        setChartData(chartData);
        setChartDataByPeriod(prev => ({
          ...prev,
          [chartPeriod]: chartData
        }));
        setDataInitialized(prev => ({
          ...prev,
          [chartPeriod]: true
        }));
        
        // Buscar métricas para os cards (usando cache se disponível)
        const metrics = await dashboardService.getDashboardCardMetrics();
        
        // Atualizar métricas
        setMetrics({
          totalFunnels: metrics.total_funnels || funnels.length,
          totalSessions: metrics.total_sessions || 0,
          completionRate: metrics.completion_rate || 0,
          interactionRate: metrics.interaction_rate || 0
        });
      } catch (error) {
        console.error("Erro ao atualizar dados do dashboard:", error);
      } finally {
        setLoadingChartData(false);
        setLoadingMetrics(false);
      }
    };
    
    // Carregar dados imediatamente
    loadAllData();
    
    // Configurar um intervalo para atualizar a cada 5 minutos,
    // podemos usar um intervalo maior já que temos cache
    const intervalId = setInterval(loadAllData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [funnels, chartPeriod]);

  // Função para forçar a atualização dos dados do gráfico
  const refreshChartData = async () => {
    try {
      setLoadingChartData(true);
      setLoadingMetrics(true);
      
      console.log("Atualizando dados manualmente...");
      
      // Usar a nova função que atualiza todos os dados de uma vez
      const allData = await dashboardService.refreshAllData();
      
      // Atualizar gráfico com os dados do período atual
      setChartData(allData.charts[chartPeriod]);
      
      // Atualizar todos os dados do gráfico para os diferentes períodos
      setChartDataByPeriod(prev => ({
        ...prev,
        today: allData.charts.today,
        '7days': allData.charts['7days'],
        '30days': allData.charts['30days']
      }));
      
      // Marcar todos os períodos como inicializados
      setDataInitialized({
        today: true,
        '7days': true,
        '30days': true
      });
      
      // Atualizar métricas dos cards
      setMetrics({
        totalFunnels: allData.metrics.total_funnels || funnels.length,
        totalSessions: allData.metrics.total_sessions || 0,
        completionRate: allData.metrics.completion_rate || 0,
        interactionRate: allData.metrics.interaction_rate || 0
      });
      
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setLoadingChartData(false);
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
              <div className="flex items-center gap-2 ml-auto">
                <Button 
                  variant="outline"
                  onClick={handleOpenNewFunnelDialog}
                  className="rounded-full shadow-sm hover:shadow-md transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-100"
                  disabled={!canCreateFunnel()}
                >
                  <Plus className="h-4 w-4 mr-2 text-primary" />
                  Novo Funil
                </Button>
              </div>
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
              {loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-blue-100 rounded"></div>
                  <div className="h-4 w-24 bg-blue-50 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {metrics.totalFunnels || "0"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Atualizado</span>
                  </div>
                </>
              )}
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
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {Number(metrics.totalSessions).toLocaleString() || "0"}
                  </div>
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
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
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
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    {Number(metrics.completionRate).toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Atualizado</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="text-xs">Percentual de visitantes que chegam até a última etapa do funil</span>
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
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {Number(metrics.interactionRate).toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Atualizado</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="text-xs">Percentual de visitantes que interagem com pelo menos uma etapa</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Novo componente de gráfico */}
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 border-blue-100/50 rounded-xl mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Performance dos Funis
              {chartPeriod === 'today' && (
                <span className="text-xs text-blue-600 bg-blue-100/70 px-2 py-1 rounded-full ml-2">
                  Visualização por hora
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant={chartPeriod === 'today' ? 'default' : 'outline'} 
                size="sm" 
                className={`text-xs rounded-full ${chartPeriod === 'today' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setChartPeriod('today')}
                disabled={loadingChartData}
              >
                Hoje
              </Button>
              <Button 
                variant={chartPeriod === '7days' ? 'default' : 'outline'} 
                size="sm" 
                className={`text-xs rounded-full ${chartPeriod === '7days' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setChartPeriod('7days')}
                disabled={loadingChartData}
              >
                Últimos 7 dias
              </Button>
              <Button 
                variant={chartPeriod === '30days' ? 'default' : 'outline'} 
                size="sm" 
                className={`text-xs rounded-full ${chartPeriod === '30days' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setChartPeriod('30days')}
                disabled={loadingChartData}
              >
                Últimos 30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-full hover:bg-blue-50"
                onClick={refreshChartData}
                title="Atualizar dados"
                disabled={loadingChartData}
              >
                {loadingChartData ? (
                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                    <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-700">
                  {chartPeriod === 'today' 
                    ? 'Sessões por hora do dia' 
                    : 'Sessões por dia'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-700">
                  {chartPeriod === 'today' 
                    ? 'Funis concluídos por hora' 
                    : 'Funis concluídos por dia'}
                </span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {loadingChartData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground py-6 px-4 border border-dashed rounded-xl bg-slate-50/50 max-w-sm">
                    <p className="mb-3">Nenhum dado disponível para este período.</p>
                    <Button onClick={refreshChartData} variant="outline" className="rounded-full hover:bg-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                        <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                      </svg>
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      tickMargin={10}
                      // Ajustar o eixo X para o caso de dados por hora
                      interval={chartPeriod === 'today' ? 2 : 'preserveEnd'}
                      angle={chartPeriod === 'today' ? -45 : 0}
                      textAnchor={chartPeriod === 'today' ? 'end' : 'middle'}
                      height={chartPeriod === 'today' ? 60 : 30}
                    />
                    <YAxis stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                      }}
                      formatter={(value, name, props) => {
                        // Corrigir os rótulos para mostrar Sessões e Concluídos corretamente
                        if (name === 'sessoes' || props?.dataKey === 'sessoes') {
                          return [value, 'Sessões'];
                        }
                        if (name === 'concluidos' || props?.dataKey === 'concluidos') {
                          return [value, 'Concluídos'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        if (chartPeriod === 'today') {
                          return `Hora: ${label}`;
                        }
                        return `Data: ${label}`;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessoes"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#3b82f6', strokeWidth: 2, r: 6 }}
                      name="Sessões"
                    />
                    <Line
                      type="monotone"
                      dataKey="concluidos"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ stroke: '#22c55e', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#22c55e', strokeWidth: 2, r: 6 }}
                      name="Concluídos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

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