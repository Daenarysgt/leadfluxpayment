import { useFunnels } from '@/hooks/useFunnels';
import { useStore } from '@/utils/store';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { syncManager } from '@/utils/syncManager';

export const FunnelList = () => {
  const { funnels, loading, error, refreshFunnels, repairFunnel } = useFunnels();
  const { createFunnel, deleteFunnel, setCurrentFunnel } = useStore();
  const [syncingFunnelId, setSyncingFunnelId] = useState<string | null>(null);
  const [isGlobalSync, setIsGlobalSync] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCreateFunnel = async () => {
    try {
      await createFunnel('Novo Funil de Teste');
    } catch (error) {
      console.error('Erro ao criar funil:', error);
    }
  };

  const handleDeleteFunnel = async (id: string) => {
    try {
      await deleteFunnel(id);
    } catch (error) {
      console.error('Erro ao deletar funil:', error);
    }
  };
  
  const handleRepairSync = async (funnel) => {
    try {
      setSyncingFunnelId(funnel.id);
      
      toast({
        title: "Iniciando sincronização",
        description: "Estamos reparando a sincronização deste funil..."
      });
      
      await syncManager.repairFunnelSync(funnel);
      
      await refreshFunnels();
      
      toast({
        title: "Sincronização concluída",
        description: "O funil foi sincronizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao sincronizar funil:', error);
      toast({
        title: "Erro de sincronização",
        description: "Ocorreu um erro ao sincronizar o funil",
        variant: "destructive"
      });
    } finally {
      setSyncingFunnelId(null);
    }
  };
  
  const handleSyncAllFunnels = async () => {
    if (!funnels || funnels.length === 0) return;
    
    try {
      setIsGlobalSync(true);
      
      toast({
        title: "Sincronização global iniciada",
        description: `Sincronizando ${funnels.length} funis...`
      });
      
      for (const funnel of funnels) {
        await syncManager.repairFunnelSync(funnel);
      }
      
      await refreshFunnels();
      
      toast({
        title: "Sincronização global concluída",
        description: `${funnels.length} funis foram sincronizados com sucesso`
      });
    } catch (error) {
      console.error('Erro na sincronização global:', error);
      toast({
        title: "Erro de sincronização",
        description: "Ocorreu um erro na sincronização global",
        variant: "destructive"
      });
    } finally {
      setIsGlobalSync(false);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando funis...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Erro: {error}
        <Button onClick={refreshFunnels} className="ml-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Meus Funis</h2>
        <div className="space-x-2">
          <Button onClick={handleCreateFunnel}>Criar Novo Funil</Button>
          <Button onClick={refreshFunnels} variant="outline">
            Atualizar Lista
          </Button>
          <Button 
            onClick={handleSyncAllFunnels} 
            variant="outline"
            disabled={isGlobalSync}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          >
            {isGlobalSync ? "Sincronizando..." : "Sincronizar Todos"}
          </Button>
        </div>
      </div>

      {funnels.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum funil encontrado. Crie um novo funil para começar!
        </div>
      ) : (
        <div className="grid gap-4">
          {funnels.map((funnel) => (
            <div
              key={funnel.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{funnel.name}</h3>
                  <p className="text-sm text-gray-500">
                    {funnel.steps?.length || 0} passos
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentFunnel(funnel.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRepairSync(funnel)}
                    disabled={syncingFunnelId === funnel.id}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {syncingFunnelId === funnel.id ? "Sincronizando..." : "Reparar Sincronização"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteFunnel(funnel.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 