import { Router } from 'express';
import Stripe from 'stripe';
import { PLANS } from '../config/plans';
import { supabase } from '../config/supabase';
import { supabaseAdmin } from '../config/supabaseAdmin';
import { PLAN_LIMITS } from '../config/plans';
import express from 'express';

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

// Configuração especial para processar o corpo da requisição raw para webhooks
// Esta rota precisa ser definida antes de app.use(express.json())
router.use('/webhook', express.raw({ type: 'application/json' }));

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
      allow_promotion_codes: true,
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

    console.log(`🔍 Verificando assinatura do usuário ${user.id}...`);

    // Buscar assinatura do usuário no banco de dados
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Log detalhado da consulta
    console.log('📝 Resultado da busca por assinatura:', {
      encontrado: !!subscription,
      erro: error ? `${error.code}: ${error.message}` : null,
      dados: subscription ? {
        id: subscription.id,
        status: subscription.status,
        user_id: subscription.user_id,
        subscription_id: subscription.subscription_id,
        plan_id: subscription.plan_id
      } : null
    });

    // Se não encontrar assinatura devido a não ter resultados, retorne null (não é erro)
    if (error && error.code === 'PGRST116') {
      console.log(`⚠️ Usuário ${user.id} não possui assinatura.`);
      
      // Verificar se há qualquer tipo de assinatura (mesmo não ativa)
      const { data: anySubscription } = await supabase
        .from('subscriptions')
        .select('subscription_id, status')
        .eq('user_id', user.id)
        .single();
        
      if (anySubscription) {
        console.log(`ℹ️ Usuário tem assinatura no estado: ${anySubscription.status}`);
      }
      
      return res.json(null);
    }

    // Se houver algum outro erro na consulta do Supabase
    if (error) {
      console.error('❌ Erro ao buscar assinatura no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados de assinatura' });
    }

    // Se não encontrou a assinatura
    if (!subscription) {
      console.log(`⚠️ Usuário ${user.id} não possui assinatura ativa (resultado vazio).`);
      return res.json(null);
    }

    console.log('✅ Assinatura encontrada no banco de dados:', {
      id: subscription.id,
      status: subscription.status,
      plan_id: subscription.plan_id
    });

    // Verificar se os timestamps da assinatura são válidos
    const now = Math.floor(Date.now() / 1000);
    const isPeriodValid = subscription.current_period_end > now;
    
    console.log('🕒 Verificação de período:', {
      agora: now,
      fim_periodo: subscription.current_period_end,
      valido: isPeriodValid
    });
    
    // IMPORTANTE: A assinatura no banco de dados é nossa fonte primária de verdade
    // Se o status for 'active' e o período ainda é válido, consideramos válida
    // independentemente do Stripe
    if (subscription.status === 'active' && isPeriodValid) {
      try {
        // Tenta buscar assinatura no Stripe apenas para confirmar
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id);
        
        console.log('✅ Assinatura Stripe recuperada:', {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_end: (stripeSubscription as any).current_period_end
        });
        
        // Converte o timestamp Unix para uma data ISO para a resposta
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Retorna os detalhes da assinatura
        return res.json({
          planId: subscription.plan_id,
          status: subscription.status,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false
        });
      } catch (stripeError: any) {
        // Se o Stripe não encontrar a assinatura, ainda CONFIAMOS nos dados do banco
        console.warn('⚠️ Erro ao buscar assinatura no Stripe, mas confiando nos dados do banco:', stripeError.message);
        
        // ⚠️ Aqui está a mudança principal: em vez de marcar a assinatura como inativa,
        // confiamos nos dados do banco de dados se forem válidos
        
        // Converte o timestamp Unix para uma data ISO
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        // Retorna os detalhes da assinatura baseados no banco local
        return res.json({
          planId: subscription.plan_id,
          status: 'active',  // Confiamos no status do banco
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false
        });
      }
    } else if (subscription.status === 'active' && !isPeriodValid) {
      // A assinatura está marcada como ativa, mas o período expirou
      console.log('⚠️ Assinatura marcada como ativa, mas o período expirou. Verificando no Stripe...');
      
      try {
        // Verificar no Stripe se a assinatura foi renovada
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id);
        
        if (stripeSubscription.status === 'active') {
          // Se o Stripe diz que está ativa, atualizamos nosso banco com os novos timestamps
          const stripeEnd = (stripeSubscription as any).current_period_end;
          const stripeStart = (stripeSubscription as any).current_period_start;
          
          console.log('✅ Assinatura renovada no Stripe. Atualizando banco de dados:', {
            inicio: stripeStart,
            fim: stripeEnd
          });
          
          // Atualizar no banco
          await supabase
            .from('subscriptions')
            .update({
              current_period_start: stripeStart,
              current_period_end: stripeEnd,
              updated_at: now
            })
            .eq('subscription_id', subscription.subscription_id);
          
          // Converte o timestamp para ISO para a resposta
          const currentPeriodEnd = new Date(stripeEnd * 1000).toISOString();
          
          return res.json({
            planId: subscription.plan_id,
            status: 'active',
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
          });
        } else {
          console.log('⚠️ Assinatura expirada e também não está ativa no Stripe.');
          return res.json(null);
        }
      } catch (stripeError) {
        console.error('❌ Erro ao verificar renovação no Stripe:', stripeError);
        return res.json(null);
      }
    } else {
      // A assinatura não está ativa no banco
      console.log('⚠️ Assinatura não está ativa no banco de dados.');
      return res.json(null);
    }
  } catch (error) {
    console.error('❌ Erro geral ao verificar assinatura:', error);
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
        timestampDetails?: {
          current_period_start_type: string;
          current_period_end_type: string;
          current_period_start_value: any;
          current_period_end_value: any;
        };
      };
      stripeSubscription: {
        exists: boolean;
        data: any | null; // Usando any para tipagem mais flexível
        error: { code: string; message: string } | null;
        timestampDetails?: {
          current_period_start_type: string;
          current_period_end_type: string;
          current_period_start_value: number;
          current_period_end_value: number;
        };
      };
      conclusion: string;
      timestampSync: boolean;
      timestampIssues: string[];
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
      conclusion: '',
      timestampSync: true,
      timestampIssues: []
    };
    
    // Adicionar detalhes de timestamp do banco de dados
    if (diagnostic.databaseSubscription.exists && dbSubscription) {
      diagnostic.databaseSubscription.timestampDetails = {
        current_period_start_type: typeof dbSubscription.current_period_start,
        current_period_end_type: typeof dbSubscription.current_period_end,
        current_period_start_value: dbSubscription.current_period_start,
        current_period_end_value: dbSubscription.current_period_end
      };
    }
    
    // Se existir assinatura no banco, verificar no Stripe
    if (diagnostic.databaseSubscription.exists && dbSubscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.subscription_id);
        
        // Adicionar detalhes de timestamp do Stripe
        const rawStart = (stripeSubscription as any).current_period_start;
        const rawEnd = (stripeSubscription as any).current_period_end;
        
        diagnostic.stripeSubscription.timestampDetails = {
          current_period_start_type: typeof rawStart,
          current_period_end_type: typeof rawEnd,
          current_period_start_value: rawStart,
          current_period_end_value: rawEnd
        };
        
        // Verificar sincronização de timestamps
        if (typeof dbSubscription.current_period_start === 'number' && 
            typeof dbSubscription.current_period_end === 'number') {
          // Verificar se os timestamps são aproximadamente iguais (pode haver pequenas diferenças)
          const startDiff = Math.abs(Number(dbSubscription.current_period_start) - Number(rawStart));
          const endDiff = Math.abs(Number(dbSubscription.current_period_end) - Number(rawEnd));
          
          if (startDiff > 5) { // diferença de mais de 5 segundos
            diagnostic.timestampSync = false;
            diagnostic.timestampIssues.push(`Diferença no current_period_start: DB=${dbSubscription.current_period_start}, Stripe=${rawStart}`);
          }
          
          if (endDiff > 5) { // diferença de mais de 5 segundos
            diagnostic.timestampSync = false;
            diagnostic.timestampIssues.push(`Diferença no current_period_end: DB=${dbSubscription.current_period_end}, Stripe=${rawEnd}`);
          }
        } else {
          diagnostic.timestampSync = false;
          diagnostic.timestampIssues.push('Os formatos de timestamp no banco de dados não são numéricos');
        }
        
        // Atualizar com dados do Stripe
        diagnostic.stripeSubscription.exists = true;
        diagnostic.stripeSubscription.data = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: rawStart,
          currentPeriodEnd: rawEnd,
          currentPeriodEnd_formatted: new Date(rawEnd * 1000).toISOString(),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          items: stripeSubscription.items.data
        };
        
        // Verificar sincronização
        if (diagnostic.stripeSubscription.data.status !== dbSubscription.status) {
          diagnostic.conclusion = 'Os status da assinatura estão diferentes entre o banco de dados e o Stripe. Uma sincronização é necessária.';
        } else if (!diagnostic.timestampSync) {
          diagnostic.conclusion = 'Os timestamps da assinatura estão diferentes entre o banco de dados e o Stripe. Uma sincronização é necessária.';
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

    console.log('🔍 DEBUG A: Iniciando verificação com dados:', {
      sessionId,
      userId: user?.id
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário não autenticado' 
      });
    }

    console.log('🔍 DEBUG B: Buscando sessão no Stripe');
    // Buscar detalhes da sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📦 DEBUG C: Dados da sessão:', {
      status: session.status,
      metadata: session.metadata,
      subscription: session.subscription,
      customer: session.customer
    });

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

    console.log('🔍 DEBUG D: Buscando assinatura no Stripe');
    const subscriptionId = session.subscription as string;
    const initialStripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    console.log('📦 DEBUG E: Dados da assinatura:', {
      id: initialStripeSubscription.id,
      status: initialStripeSubscription.status,
      current_period_start: (initialStripeSubscription as any).current_period_start,
      current_period_end: (initialStripeSubscription as any).current_period_end,
      raw_start_type: typeof (initialStripeSubscription as any).current_period_start,
      raw_end_type: typeof (initialStripeSubscription as any).current_period_end
    });

    // Verificar se a sessão pertence ao usuário atual
    if (session.metadata?.userId !== user.id) {
      console.error(`❌ Sessão ${sessionId} não pertence ao usuário ${user.id}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Esta sessão de pagamento não pertence ao usuário atual' 
      });
    }

    // Buscar assinatura associada à sessão
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

        // Função auxiliar para garantir timestamp Unix válido
        function getUnixTimestamp(timestamp: number | undefined | null): number {
          if (timestamp === undefined || timestamp === null) {
            console.log('⚠️ Timestamp indefinido ou nulo, usando tempo atual');
            return Math.floor(Date.now() / 1000);
          }
          
          // Garantir que é um número
          const numericTimestamp = Number(timestamp);
          
          if (isNaN(numericTimestamp)) {
            console.error('❌ Timestamp inválido (NaN):', timestamp);
            // Usar tempo atual como fallback em caso de erro
            return Math.floor(Date.now() / 1000);
          }
          
          return numericTimestamp;
        }

        // Extrair e validar timestamps
        const rawStart = (stripeSubscription as any).current_period_start;
        const rawEnd = (stripeSubscription as any).current_period_end;
        
        console.log('🕒 PONTO 7: Valores temporais brutos:', {
          rawStart,
          rawEnd,
          typeStart: typeof rawStart,
          typeEnd: typeof rawEnd
        });
        
        // Validar timestamps
        const current_period_start = getUnixTimestamp(rawStart);
        const current_period_end = getUnixTimestamp(rawEnd);
        const now = Math.floor(Date.now() / 1000);
        
        console.log('🕒 PONTO 8: Timestamps como Unix:', {
          current_period_start,
          current_period_end,
          now
        });

        // Garantir que os valores são do tipo inteiro
        if (!Number.isInteger(current_period_start) || !Number.isInteger(current_period_end)) {
          console.error('❌ PONTO 9: Erro - timestamps não são números inteiros:', {
            current_period_start,
            current_period_end
          });
          throw new Error('Timestamps inválidos recebidos do Stripe');
        }
        
        // Preparar dados com validação extra
              const subscriptionData = {
          user_id: session.metadata.userId,
          plan_id: session.metadata.planId,
          subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
          status: stripeSubscription.status || 'incomplete',
          // Forçar valores inteiros
          current_period_start: Math.floor(Number(current_period_start)),
          current_period_end: Math.floor(Number(current_period_end)),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          created_at: Math.floor(Number(now)),
          updated_at: Math.floor(Number(now))
        };
            
        console.log('📝 PONTO 10: Dados preparados para inserção:', subscriptionData);
              
              // Inserir no banco
        console.log('💾 PONTO 11: Tentando inserir no banco...');
        
        // Usar "upsert" com opções corretas
        const { error: upsertError } = await supabase
                .from('subscriptions')
          .upsert(
            subscriptionData,
            { 
              onConflict: 'subscription_id',
              ignoreDuplicates: false
            }
          );

        if (upsertError) {
          console.error('❌ PONTO 12: Erro no upsert:', {
            code: upsertError.code,
            message: upsertError.message,
            details: upsertError.details
          });
          throw new Error(`Erro ao inserir/atualizar assinatura: ${upsertError.message}`);
        }

        console.log('✅ PONTO 13: Upsert bem-sucedido!');
        
              return res.json({
                success: true,
          planId: session.metadata.planId,
                subscription: {
                  id: subscriptionId,
            status: stripeSubscription.status,
            // Convertendo o timestamp para resposta ao cliente
            currentPeriodEnd: new Date(current_period_end * 1000).toISOString()
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
    
    // Garantir que o timestamp do período final é um número
    const endTimestamp = (stripeSubscription as any).current_period_end;
    const currentPeriodEnd = Number.isFinite(Number(endTimestamp)) 
      ? new Date(Number(endTimestamp) * 1000).toISOString()
      : new Date().toISOString(); // Fallback para data atual se inválido

    // Retornar informações sobre a assinatura
    return res.json({
      success: true,
      planId: session.metadata?.planId,
      subscription: {
        id: subscriptionId,
        status: stripeSubscription.status,
        currentPeriodEnd
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
  const eventId = `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  console.log('🔔 WEBHOOK RECEBIDO - Headers:', JSON.stringify(req.headers));
  console.log('🔔 WEBHOOK RECEBIDO - Body tipo:', typeof req.body);
  
  // Criar um registro inicial na tabela de logs
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      event_id: eventId,
      event_type: 'pending',
      payload: { headers: req.headers },
      success: false
    });
  } catch (logError) {
    console.error('❌ WEBHOOK: Erro ao registrar log inicial:', logError);
  }
  
  if (!sig) {
    console.error('❌ WEBHOOK: Assinatura do webhook ausente');
    
    // Registrar o erro
    try {
      await supabaseAdmin.from('webhook_logs').update({
        error: 'Assinatura do webhook ausente',
        success: false
      }).eq('event_id', eventId);
    } catch (logError) {
      console.error('❌ WEBHOOK: Erro ao atualizar log de erro:', logError);
    }
    
    return res.status(400).json({ error: 'Assinatura do webhook ausente' });
  }

  let event;

  try {
    // Verificar a assinatura do webhook usando a chave secreta de webhook
    console.log('🔍 WEBHOOK: Tentando verificar assinatura com secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Configurado' : 'NÃO CONFIGURADO');
    
    // O corpo da requisição já deve estar no formato raw devido ao middleware
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Atualizar o registro de log com os detalhes do evento
    const eventType = event.type;
    const actualEventId = event.id;
    const payload = event.data.object;
    
    // Extrair o ID da assinatura de forma segura, dependendo do tipo de evento
    let subscriptionId = 'unknown';
    if (eventType.includes('subscription')) {
      subscriptionId = (payload as any).id || 'unknown';
    } else if (eventType.includes('checkout.session')) {
      subscriptionId = (payload as any).subscription || 'unknown';
    } else if (eventType.includes('invoice')) {
      subscriptionId = (payload as any).subscription || 'unknown';
    }
    
    console.log(`✅ WEBHOOK: Evento recebido: ${eventType}, ID: ${actualEventId}`);
    console.log(`📋 WEBHOOK: Dados do evento:`, JSON.stringify(payload).substring(0, 200) + '...');
    
    // Atualizar o log com os detalhes corretos do evento
    try {
      await supabaseAdmin.from('webhook_logs').update({
        event_id: actualEventId,
        event_type: eventType,
        subscription_id: subscriptionId,
        payload: payload,
      }).eq('event_id', eventId);
    } catch (logError) {
      console.error('❌ WEBHOOK: Erro ao atualizar log com detalhes do evento:', logError);
    }
  } catch (err: any) {
    console.error(`❌ WEBHOOK: Erro na assinatura do webhook: ${err.message}`);
    
    // Registrar o erro
    try {
      await supabaseAdmin.from('webhook_logs').update({
        error: `Erro na assinatura: ${err.message}`,
        success: false
      }).eq('event_id', eventId);
    } catch (logError) {
      console.error('❌ WEBHOOK: Erro ao atualizar log de erro de assinatura:', logError);
    }
    
    return res.status(400).json({ error: `Assinatura do webhook inválida: ${err.message}` });
  }

  // Processar eventos específicos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🔄 WEBHOOK: Processando checkout.session.completed');
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.paid':
        console.log('🔄 WEBHOOK: Processando invoice.paid');
        await handleInvoicePaid(event.data.object);
        break;
      case 'customer.subscription.updated':
        console.log('🔄 WEBHOOK: Processando customer.subscription.updated');
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('🔄 WEBHOOK: Processando customer.subscription.deleted - ID:', event.data.object.id);
        // Aqui está o ponto crítico - vamos processar o evento de cancelamento
        console.log('🔎 WEBHOOK: Status do objeto antes de processamento:', event.data.object.status);
        
        try {
          await handleSubscriptionDeleted(event.data.object);
          console.log('✅ WEBHOOK: Evento de cancelamento processado com sucesso');
        } catch (cancelError) {
          console.error('❌ WEBHOOK: Erro ao processar cancelamento:', cancelError);
          throw cancelError; // Repassar o erro para ser registrado
        }
        
        break;
      default:
        console.log(`⚠️ WEBHOOK: Evento não tratado: ${event.type}`);
    }

    // Atualizar o log com sucesso
    try {
      await supabaseAdmin.from('webhook_logs').update({
        success: true
      }).eq('event_id', event.id);
    } catch (logError) {
      console.error('❌ WEBHOOK: Erro ao atualizar log de sucesso:', logError);
    }

    console.log('✅ WEBHOOK: Processamento concluído com sucesso');
    res.json({ received: true });
  } catch (error: any) {
    console.error(`❌ WEBHOOK: Erro ao processar webhook: ${error.message}`, error);
    
    // Registrar o erro
    try {
      await supabaseAdmin.from('webhook_logs').update({
        error: `Erro ao processar: ${error.message}`,
        success: false
      }).eq('event_id', event.id || eventId);
    } catch (logError) {
      console.error('❌ WEBHOOK: Erro ao atualizar log de erro de processamento:', logError);
    }
    
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Funções auxiliares para lidar com eventos do webhook
async function handleCheckoutCompleted(session: any) {
  console.log('✅ Sessão de checkout concluída, processando assinatura...');
  
  if (!session.subscription || !session.customer) {
    console.log('⚠️ Sessão sem assinatura ou cliente associado, ignorando.');
    return;
  }

  // Extrair assinatura e plano da sessão
  const subscriptionId = session.subscription;
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  
  if (!userId || !planId) {
    console.log('⚠️ Metadados incompletos na sessão, impossível associar usuário/plano.');
    return;
  }
  
  // Obter detalhes da assinatura criada
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  console.log('📝 Detalhes da assinatura Stripe:', {
    id: subscription.id,
    status: subscription.status,
    customer: subscription.customer
  });

  const now = Math.floor(Date.now() / 1000);
  
  // Função auxiliar para garantir timestamp Unix válido
  function getUnixTimestamp(timestamp: number | undefined | null): number {
    if (timestamp === undefined || timestamp === null) {
      console.log('⚠️ Timestamp indefinido ou nulo, usando tempo atual');
      return Math.floor(Date.now() / 1000);
    }
    
    // Garantir que é um número inteiro
    const numericTimestamp = Number(timestamp);
    
    if (isNaN(numericTimestamp)) {
      console.error('❌ Timestamp inválido (NaN):', timestamp);
      // Usar tempo atual como fallback em caso de erro
      return Math.floor(Date.now() / 1000);
    }
    
    return Math.floor(numericTimestamp);
  }
  
  // Extrair e validar timestamps
  const rawStart = (subscription as any).current_period_start;
  const rawEnd = (subscription as any).current_period_end;
  
  console.log('🕒 Valores temporais no webhook:', {
    rawStart,
    rawEnd,
    typeStart: typeof rawStart,
    typeEnd: typeof rawEnd
  });
  
  // Validar timestamps
  let current_period_start = getUnixTimestamp(rawStart);
  let current_period_end = getUnixTimestamp(rawEnd);
  
  // CORREÇÃO: Verificar se os timestamps fazem sentido e corrigi-los se necessário
  if (current_period_start === current_period_end || current_period_end <= current_period_start) {
    console.log('⚠️ Timestamps inválidos detectados. Corrigindo...');
    // Garantir que o período final seja 30 dias após o início para assinaturas mensais
    // ou 365 dias para assinaturas anuais
    const isAnnual = subscription.items?.data?.some((item: any) => 
      item.price?.recurring?.interval === 'year'
    );
    
    const periodDuration = isAnnual ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;
    current_period_end = current_period_start + periodDuration;
    
    console.log('🕒 Timestamps corrigidos:', {
      current_period_start,
      current_period_end,
      período: isAnnual ? 'anual' : 'mensal'
    });
  }
  
  console.log('🕒 Timestamps convertidos no webhook:', {
    current_period_start,
    current_period_end,
    types: {
      start: typeof current_period_start,
      end: typeof current_period_end
    }
  });
  
  // Garantir que os valores são do tipo inteiro
  if (!Number.isInteger(current_period_start) || !Number.isInteger(current_period_end)) {
    console.error('❌ Erro - timestamps não são números inteiros:', {
      current_period_start,
      current_period_end
    });
    throw new Error('Timestamps inválidos recebidos do Stripe');
  }
  
  // Garantir que o status seja 'active' se a assinatura estiver ativa no Stripe
  // Observe que o Stripe pode retornar 'active', 'trialing', etc., mas queremos simplificar para nossa aplicação
  let status = subscription.status;
  if (status === 'active' || status === 'trialing') {
    status = 'active'; // Uniformizar para nosso sistema
  }
  
  const subscriptionData = {
    user_id: userId,
    plan_id: planId,
    subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    status: status,
    current_period_start: Math.floor(current_period_start),
    current_period_end: Math.floor(current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    created_at: Math.floor(now),
    updated_at: Math.floor(now)
  };

  console.log('📝 Dados preparados para inserção/atualização:', subscriptionData);

  // Usar upsert para evitar erro de duplicação
  const { data, error: upsertError } = await supabase
      .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'subscription_id',
      ignoreDuplicates: false
    });
  
  if (upsertError) {
    console.error('❌ Erro no upsert da assinatura:', upsertError);
    throw new Error(`Erro ao upsert assinatura: ${upsertError.message}`);
  }
  
  console.log('✅ Assinatura criada/atualizada com sucesso via upsert:', data);
}

async function handleInvoicePaid(invoice: any) {
  console.log('💰 Fatura paga, atualizando período de assinatura...');
  
  if (!invoice.subscription) {
    console.log('⚠️ Fatura sem assinatura associada, ignorando.');
    return;
  }
  
  // Obter detalhes da assinatura atualizada
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // Função auxiliar para garantir timestamp Unix válido
  function getUnixTimestamp(timestamp: number | undefined | null): number {
    if (timestamp === undefined || timestamp === null) {
      console.log('⚠️ Timestamp indefinido ou nulo, usando tempo atual');
      return Math.floor(Date.now() / 1000);
    }
    
    // Garantir que é um número inteiro
    const numericTimestamp = Number(timestamp);
    
    if (isNaN(numericTimestamp)) {
      console.error('❌ Timestamp inválido (NaN):', timestamp);
      // Usar tempo atual como fallback em caso de erro
      return Math.floor(Date.now() / 1000);
    }
    
    return Math.floor(numericTimestamp);
  }
  
  // Extrair e validar timestamps
  const rawStart = (subscription as any).current_period_start;
  const rawEnd = (subscription as any).current_period_end;
  const now = Math.floor(Date.now() / 1000);
  
  console.log('🕒 Valores temporais em handleInvoicePaid:', {
    rawStart,
    rawEnd,
    typeStart: typeof rawStart,
    typeEnd: typeof rawEnd
  });
  
  // Validar timestamps
  const current_period_start = getUnixTimestamp(rawStart);
  const current_period_end = getUnixTimestamp(rawEnd);
  
  console.log('🕒 Timestamps convertidos em handleInvoicePaid:', {
    current_period_start,
    current_period_end
  });
  
  // Garantir que os valores são do tipo inteiro
  if (!Number.isInteger(current_period_start) || !Number.isInteger(current_period_end)) {
    console.error('❌ Erro - timestamps não são números inteiros em handleInvoicePaid:', {
      current_period_start,
      current_period_end
    });
    throw new Error('Timestamps inválidos recebidos do Stripe em handleInvoicePaid');
  }
  
  // Atualizar a assinatura no banco de dados com upsert para maior segurança
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      subscription_id: subscription.id,
      status: subscription.status || 'incomplete',
      current_period_start: Math.floor(current_period_start),
      current_period_end: Math.floor(current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: Math.floor(now)
    }, {
      onConflict: 'subscription_id',
      ignoreDuplicates: false
    });
  
  if (error) {
    console.error('❌ Erro ao atualizar período da assinatura:', error);
    throw new Error('Erro ao atualizar período da assinatura');
  }
  
  console.log('✅ Período da assinatura atualizado com sucesso');
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('🔄 Assinatura atualizada, sincronizando mudanças...');
  
  // Função auxiliar para garantir timestamp Unix válido
  function getUnixTimestamp(timestamp: number | undefined | null): number {
    if (timestamp === undefined || timestamp === null) {
      console.log('⚠️ Timestamp indefinido ou nulo, usando tempo atual');
      return Math.floor(Date.now() / 1000);
    }
    
    // Garantir que é um número inteiro
    const numericTimestamp = Number(timestamp);
    
    if (isNaN(numericTimestamp)) {
      console.error('❌ Timestamp inválido (NaN):', timestamp);
      // Usar tempo atual como fallback em caso de erro
      return Math.floor(Date.now() / 1000);
    }
    
    return Math.floor(numericTimestamp);
  }
  
  // Extrair e validar timestamps
  const rawStart = (subscription as any).current_period_start;
  const rawEnd = (subscription as any).current_period_end;
  const now = Math.floor(Date.now() / 1000);
  
  console.log('🕒 Valores temporais em handleSubscriptionUpdated:', {
    rawStart,
    rawEnd,
    typeStart: typeof rawStart,
    typeEnd: typeof rawEnd
  });
  
  // Validar timestamps
  let current_period_start = getUnixTimestamp(rawStart);
  let current_period_end = getUnixTimestamp(rawEnd);
  
  // CORREÇÃO: Verificar se os timestamps fazem sentido e corrigi-los se necessário
  if (current_period_start === current_period_end || current_period_end <= current_period_start) {
    console.log('⚠️ Timestamps inválidos detectados na atualização. Corrigindo...');
    // Determinar o tipo de assinatura (mensal/anual)
    const isAnnual = subscription.items?.data?.some((item: any) => 
      item.price?.recurring?.interval === 'year'
    );
    
    const periodDuration = isAnnual ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;
    current_period_end = current_period_start + periodDuration;
    
    console.log('🕒 Timestamps corrigidos na atualização:', {
      current_period_start,
      current_period_end,
      período: isAnnual ? 'anual' : 'mensal'
    });
  }
  
  console.log('🕒 Timestamps validados em handleSubscriptionUpdated:', {
    current_period_start,
    current_period_end
  });
  
  // Garantir que os valores são do tipo inteiro
  if (!Number.isInteger(current_period_start) || !Number.isInteger(current_period_end)) {
    console.error('❌ Erro - timestamps não são números inteiros em handleSubscriptionUpdated:', {
      current_period_start,
      current_period_end
    });
    throw new Error('Timestamps inválidos recebidos do Stripe em handleSubscriptionUpdated');
  }
  
  // Atualizar a assinatura no banco de dados com upsert para maior segurança
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      subscription_id: subscription.id,
      status: subscription.status || 'incomplete',
      current_period_start: Math.floor(current_period_start),
      current_period_end: Math.floor(current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: Math.floor(now)
    }, {
      onConflict: 'subscription_id',
      ignoreDuplicates: false
    });
  
  if (error) {
    console.error('❌ Erro ao sincronizar atualização da assinatura:', error);
    throw new Error('Erro ao sincronizar atualização da assinatura');
  }
  
  console.log('✅ Assinatura sincronizada com sucesso');
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('❌ WEBHOOK HANDLER: Início de processamento de cancelamento de assinatura');
  console.log('📋 WEBHOOK HANDLER: Dados do evento:', JSON.stringify({
    subscriptionId: subscription.id,
    status: subscription.status,
    customer: subscription.customer
  }));
  
  try {
    // 1. Tentativa inicial com supabaseAdmin (service_role, ignora RLS)
    console.log(`🔄 WEBHOOK HANDLER: Atualizando diretamente via supabaseAdmin (service_role)`);
    const { error: directUpdateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: Math.floor(Date.now() / 1000),
        cancel_at_period_end: true
      })
      .eq('subscription_id', subscription.id);
    
    if (directUpdateError) {
      console.error(`❌ WEBHOOK HANDLER: Erro na atualização direta:`, directUpdateError);
    } else {
      console.log(`✅ WEBHOOK HANDLER: Atualização direta bem-sucedida!`);
      return;
    }
    
    // 2. Se a atualização direta falhar, pesquisar primeiro
    console.log(`🔍 WEBHOOK HANDLER: Buscando assinatura ${subscription.id} no banco de dados`);
    const { data: existingSubscription, error: findError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, subscription_id, status, user_id')
      .eq('subscription_id', subscription.id)
      .single();
    
    if (findError) {
      console.error(`❌ WEBHOOK HANDLER: Erro ao buscar assinatura:`, findError);
      if (findError.code === 'PGRST116') {
        console.log(`⚠️ WEBHOOK HANDLER: Assinatura ${subscription.id} não encontrada no banco de dados`);
      }
      
      // TENTATIVA ALTERNATIVA - SQL DIRETO
      console.log(`🔄 WEBHOOK HANDLER: Tentativa alternativa - SQL direto`);
      try {
        const sqlResult = await supabaseAdmin.rpc('execute_sql', { 
          sql_query: `UPDATE subscriptions SET status = 'canceled', updated_at = ${Math.floor(Date.now() / 1000)}, cancel_at_period_end = true WHERE subscription_id = '${subscription.id}'` 
        });
        
        if (sqlResult.error) {
          console.error(`❌ WEBHOOK HANDLER: Erro na execução SQL:`, sqlResult.error);
        } else {
          console.log(`✅ WEBHOOK HANDLER: Execução SQL bem-sucedida`);
        }
      } catch (sqlError) {
        console.error(`❌ WEBHOOK HANDLER: Erro ao executar SQL:`, sqlError);
      }
      
      return;
    }
    
    if (!existingSubscription) {
      console.log(`⚠️ WEBHOOK HANDLER: Assinatura ${subscription.id} não encontrada no banco de dados (resultado vazio)`);
      return;
    }
    
    console.log(`✅ WEBHOOK HANDLER: Assinatura encontrada no banco:`, {
      id: existingSubscription.id,
      status: existingSubscription.status,
      user_id: existingSubscription.user_id
    });
    
    // 3. Atualizar usando supabaseAdmin com ID específico
    console.log(`🔄 WEBHOOK HANDLER: Atualizando via ID específico`);
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: Math.floor(Date.now() / 1000),
        cancel_at_period_end: true
      })
      .eq('id', existingSubscription.id);
    
    if (updateError) {
      console.error(`❌ WEBHOOK HANDLER: Erro ao atualizar com ID específico:`, updateError);
    } else {
      console.log(`✅ WEBHOOK HANDLER: Atualização com ID específico bem-sucedida`);
    }
    
    // 4. Verificar se a atualização funcionou
    console.log(`🔍 WEBHOOK HANDLER: Verificando resultado da atualização`);
    const { data: verifyResult, error: verifyError } = await supabaseAdmin
      .from('subscriptions')
      .select('status, cancel_at_period_end')
      .eq('subscription_id', subscription.id)
      .single();
    
    if (verifyError) {
      console.error(`❌ WEBHOOK HANDLER: Erro ao verificar atualização:`, verifyError);
    } else {
      console.log(`📊 WEBHOOK HANDLER: Status após atualização:`, verifyResult);
      
      if (verifyResult?.status === 'canceled') {
        console.log(`✅ WEBHOOK HANDLER: Assinatura cancelada com sucesso!`);
      } else {
        console.log(`⚠️ WEBHOOK HANDLER: Falha ao atualizar status para canceled`);
      }
    }
    
    console.log(`✅ WEBHOOK HANDLER: Processamento de cancelamento de assinatura concluído`);
  } catch (error) {
    console.error(`❌ WEBHOOK HANDLER: Erro geral ao processar cancelamento:`, error);
    console.error(`🔍 WEBHOOK HANDLER: Detalhes do erro:`, JSON.stringify(error));
  }
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

// Rota para cancelar a assinatura do usuário atual
router.post('/cancel-subscription', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar a assinatura ativa do usuário
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscriptionError) {
      console.error('❌ Erro ao buscar assinatura:', subscriptionError);
      return res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }

    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    console.log(`🔍 Cancelando assinatura ${subscription.id} para o usuário ${user.id}...`);

    // Atualizar o status da assinatura no banco de dados
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.subscription_id);

    if (updateError) {
      console.error('❌ Erro ao cancelar assinatura:', updateError);
      return res.status(500).json({ error: 'Erro ao cancelar assinatura no banco de dados' });
    }

    // Se houver um ID de assinatura do Stripe, cancelar também no Stripe
    if (subscription.subscription_id && subscription.subscription_id.startsWith('sub_')) {
      try {
        await stripe.subscriptions.update(subscription.subscription_id, {
          cancel_at_period_end: true
        });
        console.log(`✅ Assinatura ${subscription.subscription_id} marcada para cancelamento no Stripe`);
      } catch (stripeError: any) {
        console.error(`⚠️ Erro ao cancelar assinatura no Stripe: ${stripeError.message}`);
        // Continuamos mesmo com erro no Stripe para garantir que o status no banco seja atualizado
      }
    }

    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura: ' + error.message });
  }
});

// Rota para obter limites do plano atual e uso
router.get('/plan-limits', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Buscar assinatura ativa do usuário
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    // Se houve erro (diferente de não encontrado), reportar
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Erro ao verificar assinatura:', subscriptionError);
      return res.status(500).json({ error: 'Erro ao verificar assinatura' });
    }
    
    // Definir plano padrão se não tiver assinatura ativa
    const planId = subscription?.plan_id || 'free';
    
    // Obter limites para o plano
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
    
    // Contar funis existentes
    const { count: funnelCount, error: funnelError } = await supabase
      .from('funnels')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (funnelError) {
      console.error('Erro ao contar funis:', funnelError);
      return res.status(500).json({ error: 'Erro ao contar funis' });
    }

    // Opcional: Contar leads também (se quiser implementar limitação de leads)
    // const { count: leadCount, error: leadError } = await supabase...
    
    return res.json({ 
      planId, 
      limits,
      usage: {
        funnels: funnelCount || 0,
        // leads: leadCount || 0
      },
      remaining: {
        funnels: Math.max(0, limits.maxFunnels - (funnelCount || 0)),
        // leads: Math.max(0, limits.maxLeads - (leadCount || 0))
      },
      allPlans: PLANS.map(plan => ({
        id: plan.id,
        name: plan.name,
        limits: PLAN_LIMITS[plan.id]
      }))
    });
  } catch (error) {
    console.error('Erro ao obter limites do plano:', error);
    return res.status(500).json({ error: 'Erro ao obter limites do plano' });
  }
});

// Rota administrativa para cancelar manualmente uma assinatura (útil para testes e correções)
router.post('/admin/cancel-subscription', async (req, res) => {
  try {
    const user = req.user;
    const { subscription_id, user_id } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar se o ID da assinatura foi fornecido
    if (!subscription_id && !user_id) {
      return res.status(400).json({ error: 'É necessário fornecer subscription_id ou user_id' });
    }

    console.log('🛠️ Tentativa de cancelamento manual de assinatura:', {
      requestedBy: user.id,
      subscription_id,
      user_id
    });

    // Verificar se é o mesmo usuário ou se tem permissão administrativa
    // Essa verificação deve ser adaptada conforme suas regras de autorização
    const { data: userRole } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userRole?.role === 'admin';
    
    if (!isAdmin && user_id && user_id !== user.id) {
      return res.status(403).json({ error: 'Sem permissão para cancelar assinatura de outro usuário' });
    }

    // Se user_id for fornecido, buscar a assinatura ativa do usuário
    let query = supabase
      .from('subscriptions')
      .select('*');

    if (subscription_id) {
      query = query.eq('subscription_id', subscription_id);
    } else if (user_id) {
      query = query.eq('user_id', user_id).eq('status', 'active');
    }

    const { data: subscriptions, error: queryError } = await query;

    if (queryError) {
      console.error('❌ Erro ao buscar assinatura:', queryError);
      return res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    // Iterar sobre todas as assinaturas encontradas
    const results = [];
    for (const sub of subscriptions) {
      // Atualizar o status da assinatura no banco de dados
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', sub.subscription_id);

      if (updateError) {
        console.error(`❌ Erro ao cancelar assinatura ${sub.id}:`, updateError);
        results.push({
          subscription_id: sub.subscription_id,
          status: 'error',
          message: updateError.message
        });
      } else {
        console.log(`✅ Assinatura ${sub.id} cancelada com sucesso`);
        results.push({
          subscription_id: sub.subscription_id,
          status: 'canceled',
          message: 'Assinatura cancelada com sucesso'
        });

        // Se fornecido subscription_id do Stripe, tentar cancelar também no Stripe
        if (sub.subscription_id && sub.subscription_id.startsWith('sub_')) {
          try {
            await stripe.subscriptions.update(sub.subscription_id, {
              cancel_at_period_end: true
            });
            console.log(`✅ Assinatura ${sub.subscription_id} marcada para cancelamento no Stripe`);
          } catch (stripeError: any) {
            console.error(`⚠️ Erro ao cancelar assinatura no Stripe: ${stripeError.message}`);
            // Não falhar a operação se o cancelamento no Stripe falhar
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Operação de cancelamento processada',
      results
    });
  } catch (error: any) {
    console.error('❌ Erro ao cancelar assinatura manualmente:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura: ' + error.message });
  }
});

// Nova rota para verificar o status de uma assinatura no Stripe
router.get('/verify-stripe-subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!subscriptionId) {
      return res.status(400).json({ error: 'ID da assinatura não fornecido' });
    }

    console.log(`🔍 Verificando status da assinatura ${subscriptionId} no Stripe...`);

    try {
      // Buscar assinatura do usuário no banco de dados
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('user_id', user.id)
        .single();

      // Verificar se o usuário tem permissão para acessar esta assinatura
      if (error || !subscription) {
        console.error('❌ Assinatura não encontrada ou não pertence ao usuário:', error);
        return res.status(404).json({ error: 'Assinatura não encontrada' });
      }

      // Buscar status atual no Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      console.log(`✅ Status da assinatura no Stripe: ${stripeSubscription.status}`);
      
      return res.json({
        stripeStatus: stripeSubscription.status,
        dbStatus: subscription.status,
        subscriptionId
      });
    } catch (stripeError: any) {
      console.error('❌ Erro ao verificar assinatura no Stripe:', stripeError.message);
      
      // Se o erro for "assinatura não encontrada", pode ter sido excluída no Stripe
      if (stripeError.code === 'resource_missing') {
        return res.json({
          stripeStatus: 'canceled',
          error: 'Assinatura não encontrada no Stripe (provavelmente cancelada)'
        });
      }
      
      return res.status(500).json({ error: `Erro ao verificar assinatura: ${stripeError.message}` });
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar verificação de assinatura:', error);
    return res.status(500).json({ error: 'Erro interno ao verificar assinatura' });
  }
});

// Rota administrativa para sincronizar assinaturas antigas canceladas no Stripe
router.post('/admin/sync-canceled-subscriptions', async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar permissão administrativa
    const { data: userRole } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userRole?.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Permissão negada. Apenas administradores podem executar esta ação.' });
    }

    console.log('🔄 Iniciando sincronização de assinaturas canceladas...');

    // Buscar todas as assinaturas que não estão marcadas como canceladas no banco
    const { data: activeSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .not('status', 'eq', 'canceled');

    if (fetchError) {
      console.error('❌ Erro ao buscar assinaturas ativas:', fetchError);
      return res.status(500).json({ error: 'Erro ao buscar assinaturas do banco de dados' });
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return res.json({ message: 'Nenhuma assinatura ativa encontrada para verificar.' });
    }

    console.log(`🔍 Encontradas ${activeSubscriptions.length} assinaturas para verificar`);

    // Resultados da operação
    const results = {
      total: activeSubscriptions.length,
      processados: 0,
      atualizados: 0,
      falhas: 0,
      detalhes: [] as any[]
    };

    // Verificar cada assinatura no Stripe
    for (const subscription of activeSubscriptions) {
      results.processados++;
      
      try {
        // Verificar se o ID da assinatura é válido
        if (!subscription.subscription_id || !subscription.subscription_id.startsWith('sub_')) {
          results.detalhes.push({
            id: subscription.id,
            status: 'ignorado',
            motivo: 'ID de assinatura inválido ou ausente'
          });
          continue;
        }

        console.log(`🔍 Verificando assinatura ${subscription.subscription_id} no Stripe...`);
        
        try {
          // Tentar buscar a assinatura no Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id);
          
          // Se a assinatura estiver cancelada no Stripe mas não no banco
          if (stripeSubscription.status === 'canceled' && subscription.status !== 'canceled') {
            console.log(`⚠️ Assinatura ${subscription.subscription_id} está cancelada no Stripe mas não no banco`);
            
            // Atualizar usando a função SQL direta
            const { data: updateResult, error: updateError } = await supabase.rpc('direct_update_subscription_status', {
              sub_id: subscription.subscription_id,
              new_status: 'canceled'
            });
            
            if (updateError) {
              console.error(`❌ Erro ao atualizar assinatura ${subscription.id}:`, updateError);
              results.falhas++;
              results.detalhes.push({
                id: subscription.id,
                subscription_id: subscription.subscription_id,
                status: 'erro',
                motivo: updateError.message
              });
            } else {
              console.log(`✅ Assinatura ${subscription.id} atualizada para 'canceled'`);
              results.atualizados++;
              results.detalhes.push({
                id: subscription.id,
                subscription_id: subscription.subscription_id,
                status: 'atualizado',
                de: subscription.status,
                para: 'canceled'
              });
            }
          } else {
            // Assinatura está sincronizada ou não está cancelada no Stripe
            results.detalhes.push({
              id: subscription.id,
              subscription_id: subscription.subscription_id,
              status: 'sincronizado',
              stripeStatus: stripeSubscription.status,
              dbStatus: subscription.status
            });
          }
        } catch (stripeError: any) {
          // Se o erro for "recurso não encontrado", a assinatura foi excluída no Stripe
          if (stripeError.code === 'resource_missing') {
            console.log(`⚠️ Assinatura ${subscription.subscription_id} não encontrada no Stripe, marcando como cancelada`);
            
            // Atualizar usando função SQL direta
            const { data: updateResult, error: updateError } = await supabase.rpc('direct_update_subscription_status', {
              sub_id: subscription.subscription_id,
              new_status: 'canceled'
            });
            
            if (updateError) {
              console.error(`❌ Erro ao atualizar assinatura ${subscription.id}:`, updateError);
              results.falhas++;
              results.detalhes.push({
                id: subscription.id,
                subscription_id: subscription.subscription_id,
                status: 'erro',
                motivo: updateError.message
              });
            } else {
              console.log(`✅ Assinatura ${subscription.id} marcada como 'canceled' (não encontrada no Stripe)`);
              results.atualizados++;
              results.detalhes.push({
                id: subscription.id,
                subscription_id: subscription.subscription_id,
                status: 'atualizado',
                de: subscription.status,
                para: 'canceled',
                motivo: 'Não encontrada no Stripe'
              });
            }
          } else {
            // Outro erro do Stripe
            console.error(`❌ Erro ao verificar assinatura ${subscription.subscription_id} no Stripe:`, stripeError.message);
            results.falhas++;
            results.detalhes.push({
              id: subscription.id,
              subscription_id: subscription.subscription_id,
              status: 'erro',
              motivo: `Erro Stripe: ${stripeError.message}`
            });
          }
        }
      } catch (error: any) {
        console.error(`❌ Erro geral ao processar assinatura ${subscription.id}:`, error);
        results.falhas++;
        results.detalhes.push({
          id: subscription.id,
          status: 'erro',
          motivo: `Erro geral: ${error.message}`
        });
      }
    }

    console.log('✅ Sincronização concluída');
    console.log(`📊 Resultados: Total: ${results.total}, Atualizados: ${results.atualizados}, Falhas: ${results.falhas}`);
    
    return res.json({
      success: true,
      resultados: results
    });
  } catch (error: any) {
    console.error('❌ Erro ao sincronizar assinaturas canceladas:', error);
    return res.status(500).json({ 
      error: 'Erro ao sincronizar assinaturas canceladas', 
      message: error.message 
    });
  }
});

// Rota para diagnosticar problemas com assinaturas
router.get('/diagnose-subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    
    console.log(`🔍 Verificando assinatura do usuário ${userId}...`);
    
    // 1. Verificar assinatura no banco de dados
    const { data: dbSubscription, error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Definir o tipo de diagnóstico aqui
    interface DiagnosticResult {
      userId: string;
      databaseSubscription: {
        exists: boolean;
        data: any | null;
        error: { code: string; message: string } | null;
      };
      stripeSubscription: {
        exists: boolean;
        data: any | null;
        error: { code: string; message: string } | null;
        timestampDetails?: {
          current_period_start_type: string;
          current_period_end_type: string;
          current_period_start_value: number;
          current_period_end_value: number;
        };
      };
      conclusion: string;
      timestampSync: boolean;
      timestampIssues: string[];
    }
    
    let diagnosticResult: DiagnosticResult = {
      userId,
      databaseSubscription: {
        exists: !!dbSubscription,
        data: dbSubscription,
        error: dbError ? { code: dbError.code, message: dbError.message } : null
      },
      stripeSubscription: {
        exists: false,
        data: null,
        error: null
      },
      conclusion: '',
      timestampSync: true,
      timestampIssues: []
    };
    
    // 2. Se existir no banco, verificar no Stripe
    if (dbSubscription && dbSubscription.subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          dbSubscription.subscription_id
        );
        
        // Obter os valores dos timestamps do objeto Stripe (que podem estar em diferentes formatos)
        const stripeStart = (stripeSubscription as any).current_period_start || null;
        const stripeEnd = (stripeSubscription as any).current_period_end || null;
        
        diagnosticResult.stripeSubscription = {
          exists: true,
          data: stripeSubscription,
          error: null,
          timestampDetails: {
            current_period_start_type: typeof stripeStart,
            current_period_end_type: typeof stripeEnd,
            current_period_start_value: stripeStart,
            current_period_end_value: stripeEnd
          }
        };
        
        // Verificar sincronização de status
        if (dbSubscription.status !== stripeSubscription.status) {
          diagnosticResult.conclusion += `Status não sincronizado: DB=${dbSubscription.status}, Stripe=${stripeSubscription.status}. `;
          
          // Tentar corrigir automaticamente se a assinatura está cancelada no Stripe mas não no banco
          if (stripeSubscription.status === 'canceled' && dbSubscription.status !== 'canceled') {
            try {
              console.log(`🔄 Corrigindo status da assinatura para canceled...`);
              await supabaseAdmin
                .from('subscriptions')
                .update({
                  status: 'canceled',
                  updated_at: Math.floor(Date.now() / 1000),
                  cancel_at_period_end: (stripeSubscription as any).cancel_at_period_end || false
                })
                .eq('subscription_id', dbSubscription.subscription_id);
              
              diagnosticResult.conclusion += `Status corrigido para 'canceled' automaticamente. `;
            } catch (fixError) {
              diagnosticResult.conclusion += `Falha ao corrigir status: ${fixError}. `;
            }
          }
        }
        
        // Verificar sincronização de timestamps
        const dbStart = dbSubscription.current_period_start;
        const dbEnd = dbSubscription.current_period_end;
        
        if (stripeStart && dbStart && stripeStart !== dbStart) {
          diagnosticResult.timestampSync = false;
          diagnosticResult.timestampIssues.push(`Período inicial não sincronizado: DB=${dbStart}, Stripe=${stripeStart}`);
        }
        
        if (stripeEnd && dbEnd && stripeEnd !== dbEnd) {
          diagnosticResult.timestampSync = false;
          diagnosticResult.timestampIssues.push(`Período final não sincronizado: DB=${dbEnd}, Stripe=${stripeEnd}`);
        }
        
        if (!diagnosticResult.timestampSync) {
          diagnosticResult.conclusion += "Timestamps não sincronizados entre banco e Stripe. ";
          
          // Tentar corrigir timestamps automaticamente
          try {
            console.log(`🔄 Corrigindo timestamps da assinatura...`);
            await supabaseAdmin
              .from('subscriptions')
              .update({
                current_period_start: stripeStart,
                current_period_end: stripeEnd,
                updated_at: Math.floor(Date.now() / 1000)
              })
              .eq('subscription_id', dbSubscription.subscription_id);
            
            diagnosticResult.conclusion += `Timestamps corrigidos automaticamente. `;
          } catch (fixError) {
            diagnosticResult.conclusion += `Falha ao corrigir timestamps: ${fixError}. `;
          }
        }
        
      } catch (stripeError: any) {
        diagnosticResult.stripeSubscription.error = {
          code: stripeError.code || 'unknown',
          message: stripeError.message
        };
        
        diagnosticResult.conclusion += `Erro ao consultar assinatura no Stripe: ${stripeError.message}. `;
        
        // Se a assinatura não existe no Stripe mas existe no banco, marcar como cancelada
        if (stripeError.code === 'resource_missing') {
          diagnosticResult.conclusion += "Assinatura existe no banco mas não no Stripe. ";
          
          try {
            console.log(`🔄 Assinatura não existe no Stripe, marcando como cancelada no banco...`);
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'canceled',
                updated_at: Math.floor(Date.now() / 1000)
              })
              .eq('subscription_id', dbSubscription.subscription_id);
            
            diagnosticResult.conclusion += `Assinatura marcada como cancelada no banco. `;
          } catch (fixError) {
            diagnosticResult.conclusion += `Falha ao marcar assinatura como cancelada: ${fixError}. `;
          }
        }
      }
    } else {
      diagnosticResult.conclusion += "Assinatura não encontrada no banco de dados. ";
    }
    
    if (diagnosticResult.conclusion === '') {
      diagnosticResult.conclusion = "Assinatura em estado consistente, nenhum problema detectado.";
    }
    
    console.log(`📊 Diagnóstico de assinatura para ${userId}:`, diagnosticResult.conclusion);
    res.json(diagnosticResult);
  } catch (error: any) {
    console.error('❌ Erro ao diagnosticar assinatura:', error);
    res.status(500).json({ error: 'Erro ao diagnosticar assinatura: ' + error.message });
  }
});

export default router; 