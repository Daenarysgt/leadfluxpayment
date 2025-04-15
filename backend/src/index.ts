import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import funnelRoutes from './routes/funnel.routes';
import paymentRoutes from './routes/payment.routes';
import { auth } from './middleware/auth';
import Stripe from 'stripe';
import { supabase } from './config/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

// Middleware
app.use(cors());

// Configuração especial para webhook do Stripe
// A rota /webhook/stripe precisa receber o corpo da requisição como raw
// O Stripe usa esta configuração para verificar a assinatura
app.post('/api/payment/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).json({ error: 'Assinatura do webhook não fornecida' });
  }

  let event;

  try {
    // Verifica a assinatura do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Erro na assinatura do webhook: ${err.message}`);
    return res.status(400).json({ error: `Assinatura do webhook inválida: ${err.message}` });
  }

  // Processa o evento de acordo com o tipo
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Evento não processado: ${event.type}`);
    }

    // Responde ao Stripe para confirmar o recebimento
    return res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar evento webhook:', error);
    return res.status(500).json({ error: 'Erro ao processar evento webhook' });
  }
});

// Funções para processar os eventos
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processando checkout completado:', session.id);
    
    // Verifica se o checkout é de uma assinatura
    if (session.mode !== 'subscription') {
      console.log('Checkout não é de assinatura, ignorando');
      return;
    }

    // Obter os metadados da sessão
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('Metadados incompletos na sessão:', session.id);
      return;
    }

    // Obter detalhes da assinatura
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Salvar ou atualizar a assinatura no banco de dados
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao salvar assinatura:', error);
      return;
    }

    console.log('Assinatura salva com sucesso:', subscriptionId);
  } catch (error) {
    console.error('Erro ao processar checkout completado:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Processando atualização de assinatura:', subscription.id);

    // Atualizar a assinatura no banco de dados
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Erro ao atualizar assinatura:', error);
      return;
    }

    console.log('Assinatura atualizada com sucesso:', subscription.id);
  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Processando exclusão de assinatura:', subscription.id);

    // Atualizar a assinatura como cancelada no banco de dados
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Erro ao marcar assinatura como cancelada:', error);
      return;
    }

    console.log('Assinatura marcada como cancelada com sucesso:', subscription.id);
  } catch (error) {
    console.error('Erro ao processar exclusão de assinatura:', error);
    throw error;
  }
}

// Middleware para as demais rotas
app.use(express.json());

// Routes
app.use('/api/funnels', funnelRoutes);
app.use('/api/payment', auth, paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 