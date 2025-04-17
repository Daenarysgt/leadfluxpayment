/**
 * Script para corrigir assinaturas com timestamps inválidos
 * 
 * Este script identifica e corrige assinaturas onde o current_period_start
 * e current_period_end têm valores idênticos, o que é tecnicamente incorreto.
 * 
 * Para executar:
 * ts-node scripts/fix-subscriptions.ts
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
// Use a versão mais recente da API Stripe ou a que já está configurada no projeto
const stripe = new Stripe(stripeSecretKey);

async function main() {
  console.log('🔍 Iniciando diagnóstico de assinaturas...');
  
  // Buscar assinaturas onde o período de início e fim são idênticos
  const { data: invalidSubscriptions, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, subscription_id, status, current_period_start, current_period_end')
    .eq('status', 'active')
    .filter('current_period_start', 'eq', 'current_period_end');
    
  if (error) {
    console.error('❌ Erro ao buscar assinaturas com timestamps inválidos:', error);
    return;
  }
  
  console.log(`✅ Encontradas ${invalidSubscriptions?.length || 0} assinaturas com timestamps inválidos.`);
  
  if (!invalidSubscriptions || invalidSubscriptions.length === 0) {
    console.log('✅ Não há assinaturas para corrigir.');
    return;
  }
  
  console.log('📊 Detalhes das assinaturas inválidas:');
  console.table(invalidSubscriptions);
  
  // Corrigir cada assinatura
  let correctedCount = 0;
  let errorCount = 0;
  
  for (const subscription of invalidSubscriptions) {
    try {
      console.log(`🔧 Corrigindo assinatura ID: ${subscription.id}`);
      
      // Tentar buscar assinatura no Stripe primeiro
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id);
        
        // Se a assinatura existir no Stripe, use os timestamps corretos do Stripe
        // TypeScript pode não reconhecer essas propriedades, mas elas existem na API do Stripe
        const current_period_start = Math.floor(Number((stripeSubscription as any).current_period_start));
        const current_period_end = Math.floor(Number((stripeSubscription as any).current_period_end));
        
        console.log(`📅 Timestamps do Stripe: start=${current_period_start}, end=${current_period_end}`);
        
        // Atualizar no banco de dados
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            current_period_start,
            current_period_end,
            updated_at: Math.floor(Date.now() / 1000)
          })
          .eq('id', subscription.id);
          
        if (updateError) {
          throw new Error(`Erro ao atualizar: ${updateError.message}`);
        }
        
        correctedCount++;
        console.log(`✅ Corrigido com dados do Stripe: ${subscription.id}`);
      } catch (error) {
        // Se não encontrar no Stripe ou ocorrer outro erro, calcular timestamps manualmente
        const stripeError = error as Error;
        console.log(`⚠️ Assinatura não encontrada no Stripe ou erro: ${stripeError.message}`);
        console.log('⚠️ Aplicando correção manual...');
        
        // Determinar a duração do plano (30 dias para mensal, aproximadamente)
        const durationInSeconds = 30 * 24 * 60 * 60; // 30 dias em segundos
        const start = subscription.current_period_start;
        const end = start + durationInSeconds;
        
        // Atualizar no banco de dados
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            current_period_end: end,
            updated_at: Math.floor(Date.now() / 1000)
          })
          .eq('id', subscription.id);
          
        if (updateError) {
          throw new Error(`Erro ao atualizar: ${updateError.message}`);
        }
        
        correctedCount++;
        console.log(`✅ Corrigido manualmente: ${subscription.id}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao corrigir assinatura ${subscription.id}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📋 Resumo da operação:');
  console.log(`Total de assinaturas verificadas: ${invalidSubscriptions.length}`);
  console.log(`✅ Assinaturas corrigidas: ${correctedCount}`);
  console.log(`❌ Erros: ${errorCount}`);
}

// Executar script
main()
  .then(() => {
    console.log('✅ Script concluído.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }); 