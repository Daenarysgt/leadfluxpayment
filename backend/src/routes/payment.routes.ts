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

export default router; 