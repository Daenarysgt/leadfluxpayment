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

    // Encontra o plano selecionado
    const plan = PLANS.find((p: { id: string }) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }

    // Determina o priceId baseado no intervalo
    const priceId = interval === 'month' ? plan.monthlyPriceId : plan.annualPriceId;

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
        planId: plan.id,
        userId: user.id
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
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

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar assinatura:', error);
      return res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }

    if (!subscription) {
      return res.json(null);
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000).toISOString();

    return res.json({
      planId: subscription.plan_id,
      status: stripeSubscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    res.status(500).json({ error: 'Erro ao verificar assinatura' });
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