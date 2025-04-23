import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { SubscriptionCanceledModal } from "./SubscriptionCanceledModal";
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export function TestCanceledSubscription() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const testCancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado"
        });
        return;
      }
      
      // Verificar se o usuário tem uma assinatura ativa
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao verificar assinatura",
          description: error.message
        });
        return;
      }
      
      if (!subscriptions || subscriptions.length === 0) {
        toast({
          variant: "destructive",
          title: "Sem assinatura ativa",
          description: "Nenhuma assinatura ativa encontrada para este usuário"
        });
        setShowModal(true);
        return;
      }
      
      // Mostrar o modal para simular assinatura cancelada
      setShowModal(true);
      toast({
        title: "Teste ativado",
        description: "Testando interface de assinatura cancelada"
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao testar o cancelamento"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={testCancelSubscription}
        disabled={isLoading}
        className="mx-2"
      >
        {isLoading ? "Processando..." : "Testar Modal Cancelamento"}
      </Button>
      
      <SubscriptionCanceledModal 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </>
  );
} 