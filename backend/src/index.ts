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
// Estas rotas precisam receber o corpo da requisição como raw
// O Stripe usa esta configuração para verificar a assinatura
app.use('/api/payment/webhook/stripe', express.raw({ type: 'application/json' }));
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

// Redirecionar os webhooks para a rota principal em payment.routes.ts
app.post('/api/payment/webhook/stripe', (req, res, next) => {
  console.log('📩 Webhook do Stripe recebido em /api/payment/webhook/stripe, redirecionando...');
  // Modificar o caminho para usar o handler em payment.routes
  req.url = '/webhook';
  next();
});

app.post('/webhook/stripe', (req, res, next) => {
  console.log('📩 Webhook do Stripe recebido em /webhook/stripe, redirecionando...');
  // Modificar o caminho para usar o handler em payment.routes
  req.url = '/webhook';
  next();
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
    console.log('🚫 Processando exclusão de assinatura:', subscription.id);
    console.log('📊 Detalhes da assinatura cancelada:', {
      subscriptionId: subscription.id,
      status: subscription.status,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Verificar se a assinatura existe no banco de dados antes de atualizar
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status, subscription_id, user_id')
      .eq('subscription_id', subscription.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar existência da assinatura:', checkError);
    }

    if (existingSubscription) {
      console.log('✅ Assinatura encontrada no banco de dados:', {
        id: existingSubscription.id,
        currentStatus: existingSubscription.status,
        user_id: existingSubscription.user_id
      });
    } else {
      console.warn('⚠️ Assinatura não encontrada no banco de dados, criando registro de cancelamento');
    }

    // IMPORTANTE: Atualizar diretamente usando UPDATE em vez de UPSERT
    // para garantir que o status seja definido como 'canceled'
    if (existingSubscription) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('subscription_id', subscription.id);
      
      if (error) {
        console.error('❌ Erro ao marcar assinatura como cancelada (UPDATE):', error);
        return;
      }
      
      console.log('✅ Assinatura atualizada para cancelada com sucesso:', subscription.id);
    } else {
      // Só use upsert se a assinatura não existir
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          subscription_id: subscription.id,
          status: 'canceled',
          updated_at: new Date().toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, {
          onConflict: 'subscription_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Erro ao marcar assinatura como cancelada (UPSERT):', error);
        return;
      }
      
      console.log('✅ Assinatura criada como cancelada com sucesso:', subscription.id);
    }
    
    // Buscar a assinatura atualizada para confirmar que o status foi alterado
    const { data: updatedSubscription, error: verifyError } = await supabase
      .from('subscriptions')
      .select('id, status, subscription_id, updated_at, user_id')
      .eq('subscription_id', subscription.id)
      .single();
      
    if (verifyError) {
      console.error('❌ Erro ao verificar atualização da assinatura:', verifyError);
    } else {
      console.log('✅ Confirmação de atualização da assinatura:', {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        user_id: updatedSubscription.user_id,
        updatedAt: updatedSubscription.updated_at
      });
      
      // Verificar se o status realmente foi alterado para 'canceled'
      if (updatedSubscription.status !== 'canceled') {
        console.error('⚠️ ALERTA: Status da assinatura não foi alterado para canceled!', {
          subscriptionId: subscription.id,
          expectedStatus: 'canceled',
          actualStatus: updatedSubscription.status
        });
        
        // Tentar atualizar novamente com força bruta - última tentativa
        try {
          const { error: forceError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .match({ subscription_id: subscription.id });
          
          if (forceError) {
            console.error('❌ Erro na última tentativa de cancelamento:', forceError);
          } else {
            console.log('✅ Força bruta: Assinatura marcada como cancelada');
            
            // Verificar novamente
            const { data: finalCheck } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('subscription_id', subscription.id)
              .single();
              
            console.log(`🔍 Status final da assinatura: ${finalCheck?.status || 'desconhecido'}`);
          }
        } catch (lastError) {
          console.error('💥 Erro fatal na última tentativa de cancelamento:', lastError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar exclusão de assinatura:', error);
    throw error;
  }
}

async function handleInvoicePaid(invoice: any) {
  try {
    console.log('💰 Processando fatura paga:', invoice.id);
    console.log('📊 Detalhes da fatura:', {
      invoiceId: invoice.id,
      status: invoice.status,
      subscriptionId: invoice.subscription,
      customerId: invoice.customer,
      total: invoice.total / 100, // Convertendo para a moeda base
      paid: invoice.paid,
      paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null
    });
    
    // Verificar se a fatura está relacionada a uma assinatura
    if (!invoice.subscription) {
      console.log('⚠️ Fatura não relacionada a uma assinatura, ignorando');
      return;
    }
    
    const subscriptionId = invoice.subscription as string;
    
    // Verificar se a assinatura existe no banco de dados antes de atualizar
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status, subscription_id, user_id')
      .eq('subscription_id', subscriptionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar existência da assinatura:', checkError);
    }
    
    if (existingSubscription) {
      console.log('✅ Assinatura encontrada no banco de dados:', {
        id: existingSubscription.id,
        currentStatus: existingSubscription.status,
        user_id: existingSubscription.user_id
      });
    } else {
      console.warn('⚠️ Assinatura não encontrada no banco de dados, impossível atualizar o status');
      return;
    }
    
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
    
    // Verificar se a atualização foi aplicada corretamente
    const { data: updatedSubscription, error: verifyError } = await supabase
      .from('subscriptions')
      .select('id, status, subscription_id, updated_at, user_id')
      .eq('subscription_id', subscriptionId)
      .single();
      
    if (verifyError) {
      console.error('❌ Erro ao verificar atualização da assinatura após pagamento:', verifyError);
    } else {
      console.log('✅ Confirmação de atualização da assinatura após pagamento:', {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        user_id: updatedSubscription.user_id,
        updatedAt: updatedSubscription.updated_at
      });
      
      // Verificar se o status foi devidamente atualizado para 'active'
      if (updatedSubscription.status !== 'active') {
        console.error('⚠️ ALERTA: Status da assinatura não foi atualizado para active após pagamento!', {
          subscriptionId: subscriptionId,
          expectedStatus: 'active',
          actualStatus: updatedSubscription.status
        });
        
        // Tentar atualizar novamente
        try {
          const { error: forceError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .match({ subscription_id: subscriptionId });
          
          if (forceError) {
            console.error('❌ Erro na tentativa de forçar atualização:', forceError);
          } else {
            console.log('✅ Força bruta: Assinatura marcada como ativa após pagamento');
          }
        } catch (lastError) {
          console.error('💥 Erro fatal na tentativa de ativar assinatura:', lastError);
        }
      }
    }
    
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