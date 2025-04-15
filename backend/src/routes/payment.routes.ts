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
        subscriptionId: existingSubscription.subscription_id,
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
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id);
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
      .select('id, user_id, subscription_id, status, current_period_start, current_period_end, cancel_at_period_end, plan_id, stripe_customer_id')
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
        const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.subscription_id);
        
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

    // Buscar assinatura no banco de dados com mais tentativas
    let dbSubscription = null;
    let retryAttempts = 0;
    const maxRetries = 3;
    
    while (retryAttempts < maxRetries) {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .single();
        
      if (subData) {
        dbSubscription = subData;
        break;
      }
      
      console.log(`⏳ Tentativa ${retryAttempts + 1}/${maxRetries} de buscar assinatura no banco...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos entre tentativas
      retryAttempts++;
    }

    // Se não encontrou após todas as tentativas, criar manualmente
    if (!dbSubscription) {
      console.log('⚠️ Assinatura não encontrada após tentativas, criando manualmente...');
      
      try {
        console.log('🔍 PONTO 1: Iniciando verificação da sessão');
        
        // Validar dados necessários
        if (!session.metadata?.userId || !session.metadata?.planId) {
          console.log('❌ PONTO 2: Metadados incompletos:', {
            userId: session.metadata?.userId,
            planId: session.metadata?.planId
          });
          throw new Error('Metadados incompletos na sessão. UserId ou PlanId ausente.');
        }

        if (!session.customer) {
          console.log('❌ PONTO 3: Customer ID ausente');
          throw new Error('ID do cliente Stripe ausente na sessão.');
        }

        console.log('✅ PONTO 4: Validações básicas OK', {
          sessionId,
          userId: session.metadata.userId,
          planId: session.metadata.planId,
          customerId: session.customer
        });

        // Buscar e validar a assinatura no Stripe
        console.log('🔍 PONTO 5: Buscando assinatura no Stripe:', subscriptionId);
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        console.log('✅ PONTO 6: Assinatura encontrada no Stripe:', {
          id: stripeSubscription.id,
          status: stripeSubscription.status
        });

        // DEBUG: Investigar valores temporais
        const rawStart = (stripeSubscription as any).current_period_start;
        const rawEnd = (stripeSubscription as any).current_period_end;
        
        console.log('🕒 PONTO 7: Valores temporais brutos:', {
          rawStart,
          rawEnd,
          typeStart: typeof rawStart,
          typeEnd: typeof rawEnd
        });

        // Tentar converter as datas
        console.log('🕒 PONTO 8: Tentando converter timestamps');
        const startDate = new Date(rawStart * 1000);
        const endDate = new Date(rawEnd * 1000);

        console.log('✅ PONTO 9: Datas convertidas:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isValidStart: !isNaN(startDate.getTime()),
          isValidEnd: !isNaN(endDate.getTime())
        });

        const subscriptionData = {
          user_id: session.metadata.userId,
          plan_id: session.metadata.planId,
          subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
          status: stripeSubscription.status,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('📝 PONTO 10: Dados preparados para inserção:', subscriptionData);

        // Inserir no banco
        console.log('💾 PONTO 11: Tentando inserir no banco...');
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);

        if (insertError) {
          console.error('❌ PONTO 12: Erro na inserção:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details
          });
          throw new Error(`Erro ao inserir assinatura: ${insertError.message}`);
        }

        console.log('✅ PONTO 13: Inserção bem-sucedida!');
        
        return res.json({
          success: true,
          planId: session.metadata.planId,
          subscription: {
            id: subscriptionId,
            status: stripeSubscription.status,
            currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
          }
        });
      } catch (error: any) {
        console.error('❌ Erro detalhado ao criar assinatura:', {
          error: error.message,
          stack: error.stack,
          originalError: error
        });
        return res.json({
          success: false,
          error: `Falha ao sincronizar assinatura com o banco de dados: ${error.message}`
        });
      }
    }

    // Se chegou até aqui, tudo está OK
    console.log('✅ Verificação de sessão concluída com sucesso:', {
      sessionId,
      userId: user.id,
      planId: session.metadata?.planId,
      subscriptionId,
      subscriptionStatus: session.status
    });

    // Buscar dados atualizados da assinatura no Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Retornar informações sobre a assinatura
    return res.json({
      success: true,
      planId: session.metadata?.planId,
      subscription: {
        id: subscriptionId,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
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

// Webhook do Stripe para processar eventos de pagamento
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).json({ error: 'Assinatura do webhook ausente' });
  }

  let event;

  try {
    // Verificar a assinatura do webhook usando a chave secreta de webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Erro na assinatura do webhook: ${err.message}`);
    return res.status(400).json({ error: `Assinatura do webhook inválida: ${err.message}` });
  }

  console.log(`✅ Webhook recebido: ${event.type}`);

  // Processar eventos específicos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`❌ Erro ao processar webhook: ${error.message}`);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Funções auxiliares para lidar com eventos do webhook
async function handleCheckoutCompleted(session: any) {
  console.log('🎉 Checkout completado, atualizando assinatura na base de dados...');
  
  // Obter detalhes da assinatura criada
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Metadados da sessão que incluem userId e planId
  const { userId, planId } = session.metadata;
  
  // Verificar se já existe uma assinatura para este usuário
  const { data: existingSubscription, error: findError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (findError && findError.code !== 'PGRST116') {
    console.error('❌ Erro ao verificar assinatura existente:', findError);
    throw new Error('Erro ao verificar assinatura existente');
  }
  
  const subscriptionData = {
    user_id: userId,
    plan_id: planId,
    subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    status: subscription.status,
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  };

  if (existingSubscription) {
    // Atualizar assinatura existente
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar assinatura:', updateError);
      throw new Error('Erro ao atualizar assinatura');
    }
    
    console.log('✅ Assinatura atualizada com sucesso');
  } else {
    // Criar nova assinatura
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('❌ Erro ao criar assinatura:', insertError);
      throw new Error('Erro ao criar assinatura');
    }
    
    console.log('✅ Nova assinatura criada com sucesso');
  }
}

async function handleInvoicePaid(invoice: any) {
  console.log('💰 Fatura paga, atualizando período de assinatura...');
  
  if (!invoice.subscription) {
    console.log('⚠️ Fatura sem assinatura associada, ignorando.');
    return;
  }
  
  // Obter detalhes da assinatura atualizada
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // Atualizar a assinatura no banco de dados
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id);
  
  if (error) {
    console.error('❌ Erro ao atualizar período da assinatura:', error);
    throw new Error('Erro ao atualizar período da assinatura');
  }
  
  console.log('✅ Período da assinatura atualizado com sucesso');
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('🔄 Assinatura atualizada, sincronizando mudanças...');
  
  // Atualizar a assinatura no banco de dados
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id);
  
  if (error) {
    console.error('❌ Erro ao sincronizar atualização da assinatura:', error);
    throw new Error('Erro ao sincronizar atualização da assinatura');
  }
  
  console.log('✅ Assinatura sincronizada com sucesso');
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('❌ Assinatura cancelada, atualizando status...');
  
  // Marcar a assinatura como cancelada/inativa no banco de dados
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id);
  
  if (error) {
    console.error('❌ Erro ao marcar assinatura como cancelada:', error);
    throw new Error('Erro ao marcar assinatura como cancelada');
  }
  
  console.log('✅ Assinatura marcada como cancelada com sucesso');
}

// Rota para criar sessão do portal do cliente Stripe
router.post('/create-customer-portal-session', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('📝 Criando sessão do portal do cliente para:', user.id);

    // Buscar assinatura do usuário para obter o stripe_customer_id
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
    
    if (error || !subscription?.stripe_customer_id) {
      console.error('❌ Assinatura ou Customer ID não encontrado:', error);
      return res.status(404).json({ error: 'Assinatura não encontrada para este usuário' });
    }

    // Criar a sessão do portal do cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });

    console.log('✅ Sessão do portal do cliente criada:', {
      sessionId: session.id,
      sessionUrl: session.url
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Erro ao criar sessão do portal do cliente:', error.message);
    res.status(500).json({ error: 'Erro ao criar sessão do portal do cliente' });
  }
});

export default router; 