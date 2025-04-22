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
  console.log('📩 Webhook do Stripe recebido');
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    console.error('❌ Webhook sem assinatura - recusado');
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
    console.log(`✅ Webhook verificado com sucesso: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Erro na assinatura do webhook: ${err.message}`);
    return res.status(400).json({ error: `Assinatura do webhook inválida: ${err.message}` });
  }

  // Processa o evento de acordo com o tipo
  try {
    console.log(`🔄 Processando evento: ${event.type}`);
    switch (event.type) {
      case 'checkout.session.completed':
        console.log(`💳 Checkout completado, ID: ${event.data.object.id}`);
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        console.log(`📝 Assinatura atualizada, ID: ${event.data.object.id}`);
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log(`❌ Assinatura cancelada, ID: ${event.data.object.id}`);
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        console.log(`💰 Fatura paga, ID: ${event.data.object.id}`);
        await handleInvoicePaid(event.data.object);
        break;
      default:
        console.log(`⏩ Evento não processado: ${event.type}`);
    }

    // Responde ao Stripe para confirmar o recebimento
    console.log('✅ Evento processado com sucesso');
    return res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro ao processar evento webhook:', error);
    return res.status(500).json({ error: 'Erro ao processar evento webhook' });
  }
});

// Funções para processar os eventos
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('🔄 Processando checkout completado:', session.id);
    console.log('📋 Metadados da sessão:', session.metadata);
    
    // Verifica se o checkout é de uma assinatura
    if (session.mode !== 'subscription') {
      console.log('⚠️ Checkout não é de assinatura, ignorando');
      return;
    }

    // Obter os metadados da sessão
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('❌ Metadados incompletos na sessão:', {
        sessionId: session.id,
        metadata: session.metadata,
        userId,
        planId
      });
      return;
    }

    // Obter detalhes da assinatura
    const subscriptionId = session.subscription as string;
    console.log(`🔍 Buscando detalhes da assinatura: ${subscriptionId}`);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(`📊 Status da assinatura: ${subscription.status}`);

    // Salvar ou atualizar a assinatura no banco de dados
    console.log('💾 Salvando assinatura no banco de dados');
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'subscription_id'
      });

    if (error) {
      console.error('❌ Erro ao salvar assinatura no banco:', error);
      return;
    }

    console.log('✅ Assinatura salva com sucesso:', {
      userId,
      planId,
      subscriptionId
    });
  } catch (error) {
    console.error('❌ Erro ao processar checkout completado:', error);
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
      .eq('subscription_id', subscription.id);

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
      .eq('subscription_id', subscription.id);

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

async function handleInvoicePaid(invoice: any) {
  try {
    console.log('💰 Processando fatura paga:', invoice.id);
    
    // Verificar se a fatura está relacionada a uma assinatura
    if (!invoice.subscription) {
      console.log('⚠️ Fatura não relacionada a uma assinatura, ignorando');
      return;
    }
    
    const subscriptionId = invoice.subscription as string;
    
    // Atualizar o status da assinatura para 'active' no banco de dados
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscriptionId);
    
    if (error) {
      console.error('❌ Erro ao atualizar status da assinatura após pagamento:', error);
      return;
    }
    
    console.log('✅ Status da assinatura atualizado para ativo após pagamento:', subscriptionId);
    
    // Opcional: Registrar a fatura no banco de dados se necessário
    const { error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        subscription_id: subscriptionId,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer as string,
        amount: invoice.total / 100, // Convertendo de centavos para a moeda base
        currency: invoice.currency,
        status: invoice.status,
        paid: invoice.paid,
        paid_at: invoice.paid ? new Date().toISOString() : null,
        billing_reason: invoice.billing_reason,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (invoiceError) {
      console.error('⚠️ Erro ao registrar fatura no banco de dados:', invoiceError);
      // Não falhar o processo por causa do erro no registro da fatura
    } else {
      console.log('✅ Fatura registrada com sucesso:', invoice.id);
    }
  } catch (error) {
    console.error('❌ Erro ao processar fatura paga:', error);
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