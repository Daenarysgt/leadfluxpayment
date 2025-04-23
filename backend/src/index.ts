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
    try {
      const eventId = `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
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
        
        // Atualizar diretamente o status da assinatura para 'canceled'
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: Math.floor(Date.now() / 1000),
            cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
          })
          .eq('subscription_id', subscription.id);
        
        if (error) {
          console.error('❌ Erro ao atualizar status da assinatura:', error);
          return res.status(500).json({ error: 'Erro ao processar cancelamento' });
        }
        
        console.log('✅ Assinatura cancelada com sucesso:', subscription.id);
      } else {
        console.log(`⚠️ Tipo de evento não tratado diretamente: ${event.type}`);
      }
      
      // Responde ao Stripe para confirmar recebimento
      return res.json({ received: true });
    } catch (err: any) {
      console.error(`❌ Erro na verificação do webhook: ${err.message}`);
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