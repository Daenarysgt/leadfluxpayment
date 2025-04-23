import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import funnelRoutes from './routes/funnel.routes';
import paymentRoutes from './routes/payment.routes';
import { auth } from './middleware/auth';
import Stripe from 'stripe';
import { supabase } from './config/supabase';
import { supabaseAdmin } from './config/supabaseAdmin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

// Middleware
app.use(cors());

// Processar o webhook diretamente com o handler do /webhook em payment.routes.ts
// O webhook está configurado no Stripe para enviar para esta rota
app.post('/api/payment/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('📩 Webhook do Stripe recebido em /api/payment/webhook/stripe');
  // Importar o handler de webhook de payment.routes.ts e chamá-lo diretamente
  try {
    // Acessar diretamente a função de handleWebhook de payment.routes.ts
    // Como um workaround, vamos duplicar a lógica de webhook aqui
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      console.error('❌ Webhook sem assinatura - recusado');
      return res.status(400).json({ error: 'Assinatura do webhook ausente' });
    }

    // Inserir log na tabela webhook_logs
    let eventId = `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    try {
      await supabase.from('webhook_logs').insert({
        event_id: eventId,
        event_type: 'pending.signature_check',
        payload: { headers: req.headers },
        success: false
      });
    } catch (logError) {
      console.error('❌ Erro ao registrar log inicial:', logError);
    }

    let event;
    try {
      // Verificar a assinatura do webhook
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      console.log(`✅ Webhook verificado com sucesso: ${event.type}`);
      eventId = event.id;
      
      // Verificar se o evento é um cancelamento de assinatura
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        console.log(`❌ Processando cancelamento de assinatura: ${subscription.id}`);
        
        // Registrar o webhook
        try {
          await supabase.from('webhook_logs').insert({
            event_id: event.id,
            event_type: event.type,
            subscription_id: subscription.id,
            payload: subscription,
            success: true
          });
        } catch (logError) {
          console.error('❌ Erro ao registrar log de evento:', logError);
        }
        
        // Tentativa 1: Atualizar diretamente o status da assinatura para 'canceled'
        console.log(`🔄 Tentativa 1: Atualização direta da assinatura para canceled`);
        let success = false;
        
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: Math.floor(Date.now() / 1000),
              cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
            })
            .eq('subscription_id', subscription.id);
          
          if (error) {
            console.error('❌ Erro na Tentativa 1:', error);
          } else {
            console.log('✅ Tentativa 1 bem-sucedida!');
            success = true;
          }
        } catch (updateError) {
          console.error('❌ Exceção na Tentativa 1:', updateError);
        }
        
        // Tentativa 2: Usar supabaseAdmin se a primeira tentativa falhar
        if (!success) {
          console.log(`🔄 Tentativa 2: Usando supabaseAdmin para atualizar assinatura`);
          try {
            const { data, error } = await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'canceled',
                updated_at: Math.floor(Date.now() / 1000),
                cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
              })
              .eq('subscription_id', subscription.id);
            
            if (error) {
              console.error('❌ Erro na Tentativa 2:', error);
            } else {
              console.log('✅ Tentativa 2 bem-sucedida!');
              success = true;
            }
          } catch (adminError) {
            console.error('❌ Exceção na Tentativa 2:', adminError);
          }
        }
        
        // Tentativa 3: SQL direto via RPC se as outras tentativas falharem
        if (!success) {
          console.log(`🔄 Tentativa 3: SQL direto via RPC`);
          try {
            const updateQuery = `UPDATE subscriptions SET status = 'canceled', updated_at = ${Math.floor(Date.now() / 1000)}, cancel_at_period_end = true WHERE subscription_id = '${subscription.id}'`;
            const { error: rpcError } = await supabaseAdmin.rpc('execute_sql', { sql_query: updateQuery });
            
            if (rpcError) {
              console.error('❌ Erro na Tentativa 3:', rpcError);
            } else {
              console.log('✅ Tentativa 3 bem-sucedida!');
              success = true;
            }
          } catch (sqlError) {
            console.error('❌ Exceção na Tentativa 3:', sqlError);
          }
        }
        
        // Verificar se a assinatura foi cancelada
        try {
          const { data: verify, error: verifyError } = await supabaseAdmin
            .from('subscriptions')
            .select('status')
            .eq('subscription_id', subscription.id)
            .single();
          
          if (verifyError) {
            console.error('❌ Erro ao verificar cancelamento:', verifyError);
          } else if (verify?.status === 'canceled') {
            console.log('✅ Assinatura cancelada com sucesso:', subscription.id);
          } else {
            console.error('⚠️ Falha no cancelamento da assinatura. Status atual:', verify?.status);
          }
        } catch (verifyError) {
          console.error('❌ Exceção ao verificar cancelamento:', verifyError);
        }
      } else {
        console.log(`⚠️ Tipo de evento não tratado diretamente: ${event.type}`);
      }
      
      // Responde ao Stripe para confirmar recebimento
      return res.json({ received: true });
    } catch (err: any) {
      console.error(`❌ Erro na verificação do webhook: ${err.message}`);
      
      // Registrar o erro
      try {
        await supabase.from('webhook_logs').update({
          error: `Erro na verificação: ${err.message}`,
          success: false
        }).eq('event_id', eventId);
      } catch (logError) {
        console.error('❌ Erro ao registrar falha na verificação:', logError);
      }
      
      return res.status(400).json({ error: `Webhook inválido: ${err.message}` });
    }
  } catch (error: any) {
    console.error('❌ Erro geral no processamento do webhook:', error);
    return res.status(500).json({ error: 'Erro interno no processamento do webhook' });
  }
});

// Preservar a rota para compatibilidade
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('📩 Webhook do Stripe recebido em /webhook/stripe, encaminhando...');
  // Redirecionar para endpoint principal
  return res.redirect(307, '/api/payment/webhook/stripe');
});

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