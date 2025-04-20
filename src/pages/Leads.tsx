import { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, ChevronLeft, Download, Search, Users, 
  Mail, Phone, Calendar, Filter, MoreHorizontal,
  ArrowUpRight, MousePointerClick, ClipboardList
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { accessService } from "@/services/accessService";
import { Checkbox } from "@/components/ui/checkbox";
import { TrackingTable } from "@/components/tracking-table";
import { createClient } from '@supabase/supabase-js';

// Criar cliente Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Mock data for leads
const mockLeads = [
  { id: 1, name: "João Silva", email: "joao.silva@example.com", phone: "+55 11 99999-9999", date: "2023-06-15T14:30:00", source: "Facebook Ads", status: "new" },
  { id: 2, name: "Maria Oliveira", email: "maria.oliveira@example.com", phone: "+55 21 98888-8888", date: "2023-06-14T10:15:00", source: "Google Search", status: "contacted" },
  { id: 3, name: "Pedro Santos", email: "pedro.santos@example.com", phone: "+55 31 97777-7777", date: "2023-06-13T16:45:00", source: "Instagram", status: "qualified" },
  { id: 4, name: "Ana Costa", email: "ana.costa@example.com", phone: "+55 41 96666-6666", date: "2023-06-12T09:20:00", source: "Direct", status: "new" },
  { id: 5, name: "Carlos Ferreira", email: "carlos.ferreira@example.com", phone: "+55 51 95555-5555", date: "2023-06-11T11:10:00", source: "Partner", status: "contacted" },
];

interface LeadMetrics {
  totalSessions: number;
  completionRate: number;
  interactionRate: number;
  todayLeads: number;
  loadingMetrics: boolean;
  mainSource: {
    name: string;
    percentage: number;
  };
}

interface TrackingData {
  id: string;
  date: string;
  steps: {
    name: string;
    status: string;
    value?: string;
    interactionRate: number;
  }[];
}

interface LeadInteraction {
  status: string; // Pode ser 'clicked' ou o valor da escolha (ex: 'Masculino', 'Feminino')
  type: 'click' | 'choice'; // Tipo específico da interação
  value?: string | null; // Valor opcional para múltipla escolha
  timestamp: Date;
}

interface Lead {
  sessionId: string;
  firstInteraction: Date;
  interactions: {
    [stepNumber: string]: LeadInteraction;
  };
}

// Adicionar os componentes de logo
const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor"/>
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleAdsLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path
      d="M20 12L12 4L4 12c0 4.4 3.6 8 8 8s8-3.6 8-8z"
      fill="#FBBC05"
    />
    <path
      d="M20 12L12 4v16c4.4 0 8-3.6 8-8z"
      fill="#4285F4"
    />
    <circle cx="6" cy="12" r="2" fill="#34A853" />
  </svg>
);

const YouTubeAdsLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TRAFFIC_SOURCES = [
  { id: 'tiktok', name: 'TikTok Ads', icon: <TikTokLogo />, color: 'text-black dark:text-white' },
  { id: 'meta', name: 'Meta Ads', icon: <MetaLogo />, color: 'text-[#1877F2]' },
  { id: 'google', name: 'Google Ads', icon: <GoogleAdsLogo />, color: 'text-[#4285F4]' },
  { id: 'youtube', name: 'YouTube Ads', icon: <YouTubeAdsLogo />, color: 'text-[#FF0000]' }
];

const Leads = () => {
  const { currentFunnel, setCurrentFunnel } = useStore();
  const { funnelId } = useParams<{ funnelId: string }>();
  const [selectedSource, setSelectedSource] = useState(TRAFFIC_SOURCES[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadMetrics>({
    totalSessions: 0,
    completionRate: 0,
    interactionRate: 0,
    todayLeads: 0,
    loadingMetrics: true,
    mainSource: {
      name: TRAFFIC_SOURCES[0].name,
      percentage: 0
    }
  });
  const [stepMetrics, setStepMetrics] = useState<Array<{
    step_number: number;
    total_interactions: number;
    interaction_rate: number;
    button_id: string;
  }>>([]);
  // Novo estado para dados de formulários
  const [formDataLeads, setFormDataLeads] = useState<Array<{
    sessionId: string;
    submissionTime: Date;
    leadInfo: Record<string, string>;
  }>>([]);

  useEffect(() => {
    if (funnelId && (!currentFunnel || currentFunnel.id !== funnelId)) {
      setCurrentFunnel(funnelId);
    }
  }, [funnelId, currentFunnel, setCurrentFunnel]);

  useEffect(() => {
    if (currentFunnel?.id) {
      loadMetrics();
      loadLeads();
      loadStepMetrics();
      loadFormData(); // Nova chamada
      
      // Subscription para atualizações em tempo real
      const subscription = supabase
        .channel(`funnel-leads-${currentFunnel.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'funnel_access_logs',
            filter: `funnel_id=eq.${currentFunnel.id}`
          },
          async (payload) => {
            console.log('Novo lead detectado:', payload);
            await Promise.all([
              loadLeads(),
              loadMetrics(),
              loadStepMetrics(),
              loadFormData() // Adiciona o carregamento dos dados de formulário
            ]);
          }
        )
        .subscribe();

      // Subscription para atualizações em tempo real na tabela funnel_responses
      const formSubscription = supabase
        .channel(`funnel-forms-${currentFunnel.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'funnel_responses',
            filter: `funnel_id=eq.${currentFunnel.id}`
          },
          async (payload) => {
            console.log('Novos dados de formulário detectados:', payload);
            await loadFormData();
          }
        )
        .subscribe();

      // Recarregar dados a cada minuto
      const intervalId = setInterval(() => {
        loadStepMetrics();
        loadMetrics();
      }, 60000);

      return () => {
        subscription.unsubscribe();
        formSubscription.unsubscribe();
        clearInterval(intervalId);
      };
    }
  }, [currentFunnel?.id, selectedPeriod]);

  const loadMetrics = async () => {
    try {
      if (!currentFunnel?.id) return;
      
      const funnelMetrics = await accessService.getFunnelMetrics(currentFunnel.id);
      
      // Calcular leads de hoje baseado na taxa de interação
      const todayLeads = Math.round((funnelMetrics.interaction_rate * funnelMetrics.total_sessions) / 100);
      
      setMetrics({
        totalSessions: funnelMetrics.total_sessions,
        completionRate: funnelMetrics.completion_rate,
        interactionRate: funnelMetrics.interaction_rate,
        todayLeads,
        loadingMetrics: false,
        mainSource: {
          name: selectedSource.name,
          percentage: funnelMetrics.interaction_rate
        }
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics({
        totalSessions: 0,
        completionRate: 0,
        interactionRate: 0,
        todayLeads: 0,
        loadingMetrics: false,
        mainSource: {
          name: selectedSource.name,
          percentage: 0
        }
      });
    }
  };

  const loadLeads = async () => {
    try {
      if (!currentFunnel?.id) return;
      
      console.log('Getting leads for funnel:', currentFunnel.id);
      const leadsData = await accessService.getFunnelLeadsWithInteractions(currentFunnel.id, selectedPeriod);
      
      console.log('Leads data:', leadsData);
      // Converter os dados para o formato correto
      const formattedLeads = leadsData.map(lead => ({
        ...lead,
        firstInteraction: new Date(lead.firstInteraction),
        interactions: Object.fromEntries(
          Object.entries(lead.interactions || {}).map(([key, value]) => [
            key,
            {
              status: value.status || 'clicked',
              type: value.type || 'click',
              value: value.value || null,
              timestamp: new Date(value.timestamp)
            }
          ])
        )
      }));
      
      console.log('Formatted leads:', formattedLeads);
      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    }
  };

  const loadStepMetrics = async () => {
    try {
      if (!currentFunnel?.id) return;
      
      console.log('Getting step metrics for funnel:', currentFunnel.id);
      const { data, error } = await supabase
        .rpc('get_funnel_step_metrics', { 
          p_funnel_id: currentFunnel.id 
        });

      if (error) {
        console.error('Error getting funnel step metrics:', error);
        setStepMetrics([]);
        return;
      }

      console.log('Step metrics data:', data);
      
      // Mapear os dados diretamente da resposta
      const formattedMetrics = data.map(metric => ({
        step_number: metric.step_number,
        total_interactions: metric.total_interactions,
        interaction_rate: metric.interaction_rate > 0 ? metric.interaction_rate : 5, // Garantir que tenha pelo menos 5% para visualização
        button_id: metric.button_id
      }));
      
      console.log('Formatted metrics:', formattedMetrics);
      setStepMetrics(formattedMetrics);
    } catch (error) {
      console.error('Error loading step metrics:', error);
      setStepMetrics([]);
    }
  };

  // Nova função para carregar dados de formulários
  const loadFormData = async () => {
    try {
      if (!currentFunnel?.id) return;
      
      console.log('Getting form data for funnel:', currentFunnel.id);
      const formData = await accessService.getFunnelFormData(currentFunnel.id, selectedPeriod);
      
      console.log('Form data found:', formData);
      setFormDataLeads(formData);
    } catch (error) {
      console.error('Error loading form data:', error);
      setFormDataLeads([]);
    }
  };

  // Função para recarregar todas as métricas e dados
  const reloadAllData = async () => {
    if (currentFunnel?.id) {
      try {
        await Promise.all([
          loadMetrics(),
          loadLeads(),
          loadStepMetrics(),
          loadFormData()
        ]);
        console.log('Dados recarregados com sucesso');
      } catch (error) {
        console.error('Erro ao recarregar dados:', error);
      }
    }
  };

  if (!currentFunnel) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-[400px] p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Nenhum funil selecionado</h2>
          <p className="text-muted-foreground mb-4">
            Volte para a página inicial e selecione ou crie um funil para começar.
          </p>
          <Button className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800" onClick={() => window.location.href = "/"}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b py-3 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100" onClick={() => window.location.href = "/"}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">LeadFlux</h1>
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
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Configurações
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to={`/leads/${currentFunnel.id}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle({
                  className: "bg-gradient-to-r from-blue-700/10 to-purple-700/10 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700"
                })}>
                  <Users className="h-4 w-4 mr-1.5 text-blue-700" />
                  Leads
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Button 
          size="sm" 
          className="h-9 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 gap-1.5 px-4 shadow-sm"
          onClick={() => console.log("Exportar leads")}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leads Capturados</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todos os leads do seu funil
            </p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700" />
                <span>Total de Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-800">{metrics.totalSessions}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Atualizado</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600"></span>
                </span>
                <span>Taxa de Conversão</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-800">{metrics.completionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Atualizado</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Hoje</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-800">{metrics.todayLeads}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <span className="inline-block h-3 w-3 bg-blue-500 rounded-full"></span>
                    Leads que interagiram hoje
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className={`h-5 w-5 flex items-center justify-center ${selectedSource.color}`}>
                  {selectedSource.icon}
                </span>
                <span>Origem Principal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.loadingMetrics ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                </div>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-auto p-0 font-bold text-3xl text-gray-800 hover:bg-transparent hover:text-gray-600 flex items-center gap-2">
                        <span className={selectedSource.color}>{selectedSource.icon}</span>
                        {selectedSource.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      {TRAFFIC_SOURCES.map((source) => (
                        <DropdownMenuItem
                          key={source.id}
                          onClick={() => setSelectedSource(source)}
                          className="flex items-center gap-2"
                        >
                          <span className={source.color}>{source.icon}</span>
                          {source.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metrics.mainSource.percentage.toFixed(1)}% dos visitantes interagiram
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tracking Table Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={selectedPeriod === 'all' ? 'default' : 'outline'}
              className={selectedPeriod === 'all' ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white' : ''}
              onClick={() => setSelectedPeriod('all')}
            >
              Todos os leads
            </Button>
            <Button
              variant={selectedPeriod === 'today' ? 'default' : 'outline'}
              className={selectedPeriod === 'today' ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white' : ''}
              onClick={() => setSelectedPeriod('today')}
            >
              Hoje
            </Button>
            <Button
              variant={selectedPeriod === '7days' ? 'default' : 'outline'}
              className={selectedPeriod === '7days' ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white' : ''}
              onClick={() => setSelectedPeriod('7days')}
            >
              Últimos 7 dias
            </Button>
            <Button
              variant={selectedPeriod === '30days' ? 'default' : 'outline'}
              className={selectedPeriod === '30days' ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white' : ''}
              onClick={() => setSelectedPeriod('30days')}
            >
              Últimos 30 dias
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline" onClick={reloadAllData}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9C19.8214 7.33167 18.7192 5.89469 17.2931 4.87678C15.8671 3.85887 14.1733 3.30381 12.4403 3.28V3.28C10.2949 3.25941 8.20968 3.97218 6.5371 5.29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15C4.17861 16.6683 5.28085 18.1053 6.70689 19.1232C8.13293 20.1411 9.82669 20.6962 11.5597 20.72V20.72C13.7051 20.7406 15.7903 20.0278 17.4629 18.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Atualizar
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="w-[120px] border-r">Data</TableHead>
                  {stepMetrics.map((step) => (
                    <TableHead key={step.step_number} className="relative min-w-[180px] border-r">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div>Etapa {step.step_number}</div>
                          <div className="text-xs text-muted-foreground">
                            button: {step.button_id || '-'}
                          </div>
                        </div>
                        <div className="w-2 h-16 bg-gray-100 rounded relative">
                          <div 
                            className="absolute bottom-0 w-full bg-green-500 rounded"
                            style={{ 
                              height: `${step.interaction_rate}%`,
                              minHeight: '4px',
                              transition: 'height 0.3s ease-in-out'
                            }}
                          />
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead, leadIndex) => {
                  // Buscar os dados de formulário correspondentes para esta sessão específica
                  // E como fallback, usar o formulário com o mesmo índice na lista
                  const formDataForLead = formDataLeads.find(form => form.sessionId === lead.sessionId) || 
                                          (formDataLeads.length > leadIndex ? formDataLeads[leadIndex] : null);
                  
                  // Log detalhado para depuração
                  console.log(`Lead #${leadIndex}:`, {
                    sessionId: lead.sessionId,
                    matchingFormData: !!formDataForLead,
                    formData: formDataForLead,
                    interactions: lead.interactions
                  });
                  
                  return (
                    <TableRow key={lead.sessionId}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="border-r">
                        {new Date(lead.firstInteraction).toLocaleDateString('pt-BR')}
                      </TableCell>
                      {stepMetrics.map((step, stepIndex) => {
                        // Exibir informações do formulário na primeira etapa com interação
                        const isFirstInteractionStep = stepIndex === 0;
                        const hasInteraction = !!lead.interactions[step.step_number];
                        const interaction = lead.interactions[step.step_number];
                        
                        return (
                          <TableCell key={step.step_number} className="border-r">
                            {hasInteraction ? (
                              <div className="text-sm">
                                {interaction.status === 'clicked' ? (
                                  <div>
                                    <div>Clicou</div>
                                    
                                    {/* Exibir dados do formulário na primeira etapa para cada lead */}
                                    {isFirstInteractionStep && formDataForLead && (
                                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                                        {formDataForLead.leadInfo?.email && (
                                          <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span>{formDataForLead.leadInfo.email}</span>
                                          </div>
                                        )}
                                        {formDataForLead.leadInfo?.phone && (
                                          <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{formDataForLead.leadInfo.phone}</span>
                                          </div>
                                        )}
                                        {formDataForLead.leadInfo?.text && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs">{formDataForLead.leadInfo.text}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <div>Escolheu</div>
                                    {interaction.type === 'choice' && (
                                      <div className="text-muted-foreground">
                                        {/* Exibir o valor completo da opção escolhida */}
                                        <div className="mt-1 text-xs flex items-center gap-1">
                                          <ClipboardList className="h-3 w-3" />
                                          <span>{interaction.value || interaction.status}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : ''}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
