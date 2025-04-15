import { Router } from 'express';
import Stripe from 'stripe';
import { PLANS } from '../config/plans';
import { supabase } from '../config/supabase';

interface RequestUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, interval } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('📝 Criando sessão de checkout para:', {
      userId: user.id,
      userEmail: user.email,
      planId,
      interval
    });

    // Encontra o plano selecionado
    const plan = PLANS.find((p: { id: string }) => p.id === planId);
    if (!plan) {
      console.error('❌ Plano não encontrado:', planId);
      return res.status(400).json({ error: 'Plano não encontrado' });
    }
    
    console.log('✅ Plano encontrado:', {
      id: plan.id,
      name: plan.name,
      priceId: interval === 'month' ? plan.monthlyPriceId : plan.annualPriceId
    });

    // Determina o priceId baseado no intervalo
    const priceId = interval === 'month' ? plan.monthlyPriceId : plan.annualPriceId;

    // Verificar se o usuário já tem uma assinatura ativa
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      // Erro real (diferente de "não encontrado")
      console.error('❌ Erro ao verificar assinatura existente:', subscriptionError);
    }

    if (existingSubscription && existingSubscription.status === 'active') {
      console.log('⚠️ Usuário já possui assinatura ativa:', {
        subscriptionId: existingSubscription.stripe_subscription_id,
        planId: existingSubscription.plan_id
      });
      // Aqui poderia implementar um fluxo de upgrade/downgrade
    }

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: plan.id,
        interval: interval,
        planName: plan.name
      }
    });

    console.log('✅ Sessão de checkout criada:', {
      sessionId: session.id,
      sessionUrl: session.url,
      metadata: session.metadata
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Erro ao criar sessão de checkout:', error.message);
    res.status(500).json({ error: 'Erro ao criar sessão de checkout' });
  }
});

// Rota para verificar assinatura atual
router.get('/subscription', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar assinatura do usuário
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Se não encontrar assinatura devido a não ter resultados, retorne null (não é erro)
    if (error && error.code === 'PGRST116') {
      console.log(`Usuário ${user.id} não possui assinatura.`);
      return res.json(null);
    }

    // Se houver algum outro erro na consulta do Supabase
    if (error) {
      console.error('Erro ao buscar assinatura no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados de assinatura' });
    }

    // Se não encontrou a assinatura
    if (!subscription) {
      console.log(`Usuário ${user.id} não possui assinatura (resultado vazio).`);
      return res.json(null);
    }

    try {
      // Tenta buscar assinatura no Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      const currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000).toISOString();

      // Retorna os detalhes da assinatura
      return res.json({
        planId: subscription.plan_id,
        status: stripeSubscription.status,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      });
    } catch (stripeError: any) {
      // Se o Stripe não encontrar a assinatura ou outro erro do Stripe
      console.error('Erro ao buscar assinatura no Stripe:', stripeError);
      
      // Se a assinatura não existe mais no Stripe, atualize o status no banco
      if (stripeError.code === 'resource_missing') {
        try {
          await supabase
            .from('subscriptions')
            .update({ status: 'inactive' })
            .eq('id', subscription.id);
        } catch (updateError) {
          console.error('Erro ao atualizar status da assinatura:', updateError);
        }
      }
      
      // Retorna null para o cliente (assinatura inválida)
      return res.json(null);
    }
  } catch (error) {
    console.error('Erro geral ao verificar assinatura:', error);
    res.status(500).json({ error: 'Falha ao processar solicitação de assinatura' });
  }
});

// Rota de diagnóstico para auxiliar na resolução de problemas
router.get('/subscription/diagnostic', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log(`🔍 Executando diagnóstico de assinatura para o usuário ${user.id}...`);
    
    // Verificar assinatura no banco de dados
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    // Tipo para os dados de diagnóstico
    type DiagnosticType = {
      userId: string;
      databaseSubscription: {
        exists: boolean;
        data: any | null; // Usando any para evitar problemas de tipagem com Supabase
        error: { code: string; message: string } | null;
      };
      stripeSubscription: {
        exists: boolean;
        data: any | null; // Usando any para tipagem mais flexível
        error: { code: string; message: string } | null;
      };
      conclusion: string;
    };
    
    // Preparar resposta
    const diagnostic: DiagnosticType = {
      userId: user.id,
      databaseSubscription: {
        exists: !dbError && dbSubscription !== null,
        data: dbSubscription || null,
        error: dbError ? { code: dbError.code, message: dbError.message } : null
      },
      stripeSubscription: {
        exists: false,
        data: null,
        error: null
      },
      conclusion: ''
    };
    
    // Se existir assinatura no banco, verificar no Stripe
    if (diagnostic.databaseSubscription.exists && dbSubscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id);
        
        // Atualizar com dados do Stripe
        diagnostic.stripeSubscription.exists = true;
        diagnostic.stripeSubscription.data = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          items: stripeSubscription.items.data
        };
        
        // Verificar sincronização
        if (diagnostic.stripeSubscription.data.status !== dbSubscription.status) {
          diagnostic.conclusion = 'Os status da assinatura estão diferentes entre o banco de dados e o Stripe. Uma sincronização é necessária.';
        } else {
          diagnostic.conclusion = 'A assinatura parece estar correta e sincronizada.';
        }
      } catch (stripeError: any) {
        // Atualizar com erro do Stripe
        diagnostic.stripeSubscription.error = {
          code: stripeError.code || 'unknown',
          message: stripeError.message || 'Erro desconhecido'
        };
        diagnostic.conclusion = 'A assinatura existe no banco de dados, mas não foi encontrada no Stripe. É necessário limpar os dados inconsistentes.';
      }
    } else {
      diagnostic.conclusion = 'Nenhuma assinatura encontrada para este usuário.';
    }
    
    // Retornar diagnóstico completo
    console.log('✅ Diagnóstico concluído:', diagnostic);
    return res.json(diagnostic);
  } catch (error: any) {
    console.error('❌ Erro ao executar diagnóstico de assinatura:', error);
    res.status(500).json({ 
      error: 'Erro ao executar diagnóstico de assinatura',
      details: error.message
    });
  }
});

// Nova rota para Portal do Cliente
router.post('/create-customer-portal', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar assinatura do usuário
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (error || !subscription) {
      console.error('Erro ao buscar assinatura:', error);
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    // Criar sessão de portal do cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar portal do cliente:', error);
    res.status(500).json({ error: 'Erro ao criar portal do cliente' });
  }
});

// Rota para verificar o status de uma sessão de checkout
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário não autenticado' 
      });
    }

    console.log(`🔍 Verificando sessão de checkout: ${sessionId} para usuário: ${user.id}`);

    // Buscar detalhes da sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verificar se a sessão existe e se está completa
    if (!session) {
      console.log(`⚠️ Sessão ${sessionId} não encontrada.`);
      return res.json({ 
        success: false, 
        error: 'Sessão de checkout não encontrada' 
      });
    }
    
    if (session.status !== 'complete') {
      console.log(`⚠️ Sessão ${sessionId} não está completa. Status: ${session.status}`);
      return res.json({ 
        success: false, 
        error: `Sessão não está completa. Status atual: ${session.status}` 
      });
    }

    // Verificar se a sessão pertence ao usuário atual
    if (session.metadata?.userId !== user.id) {
      console.error(`❌ Sessão ${sessionId} não pertence ao usuário ${user.id}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Esta sessão de pagamento não pertence ao usuário atual' 
      });
    }

    // Buscar assinatura associada à sessão
    const subscriptionId = session.subscription as string;
    
    if (!subscriptionId) {
      console.error('❌ Sessão não possui ID de assinatura');
      return res.json({ 
        success: false, 
        error: 'Sessão não possui assinatura associada' 
      });
    }

    // Buscar detalhes da assinatura
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Verificar se a assinatura está ativa
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      console.error(`❌ Assinatura ${subscriptionId} não está ativa. Status: ${subscription.status}`);
      return res.json({ 
        success: false, 
        error: `Assinatura não está ativa. Status atual: ${subscription.status}` 
      });
    }
    
    // Buscar assinatura no banco de dados
    const { data: dbSubscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar assinatura no banco:', error);
      // Tentar criar a assinatura no banco se não existir
      if (error.code === 'PGRST116') { // Código para "not found"
        console.log('⚠️ Assinatura não encontrada no banco. Tentando sincronizar com webhook...');
        // Aguardar alguns segundos para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Tentar novamente
        const { data: retrySubscription, error: retryError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
          
        if (retryError) {
          console.error('❌ Falha ao encontrar assinatura mesmo após espera:', retryError);
          return res.json({ 
            success: false, 
            error: 'Assinatura não encontrada no banco de dados. Webhook pode ainda não ter processado.' 
          });
        }
        
        // Se encontrou na segunda tentativa
        if (retrySubscription) {
          console.log('✅ Assinatura encontrada na segunda tentativa!');
          return res.json({
            success: true,
            planId: session.metadata?.planId,
            subscription: {
              id: subscriptionId,
              status: subscription.status,
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString()
            }
          });
        }
      } else {
        return res.json({ 
          success: false, 
          error: `Erro ao buscar assinatura: ${error.message}` 
        });
      }
    }

    // Se chegou até aqui, tudo está OK
    console.log('✅ Verificação de sessão concluída com sucesso:', {
      sessionId,
      userId: user.id,
      planId: session.metadata?.planId,
      subscriptionId,
      subscriptionStatus: subscription.status
    });

    // Retornar informações sobre a assinatura
    return res.json({
      success: true,
      planId: session.metadata?.planId,
      subscription: {
        id: subscriptionId,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar sessão de checkout:', error.message);
    
    // Verificar se é um erro de "recurso não encontrado" do Stripe
    if (error.code === 'resource_missing') {
      return res.json({ 
        success: false, 
        error: 'Sessão de checkout não encontrada no Stripe' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Erro ao verificar sessão de checkout: ${error.message}` 
    });
  }
});

export default router; 