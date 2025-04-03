import { supabase } from '../config/supabase';
import axios from 'axios';

// Configurações da API Vercel
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || '';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';

/**
 * Função utilitária para forçar a limpeza de um domínio, tanto no banco quanto na Vercel
 * Esta função é projetada para ser mais robusta em casos onde a remoção normal falha
 */
export const forceCleanupDomain = async (domain: string, funnelId: string = '', userId: string = '') => {
  console.log(`[Domain Cleanup] Iniciando limpeza forçada para domínio: ${domain}, funil: ${funnelId || 'não fornecido'}, userId: ${userId || 'não fornecido'}`);
  
  const results = {
    vercelSuccess: false,
    vercelMessage: '',
    databaseSuccess: false,
    databaseMessage: '',
    overallSuccess: false
  };
  
  // 1. Verificar se o funil existe (sem restrição de usuário para depuração)
  let funnelExists = false;
  let funnelOwnerId = '';
  let funnelCurrentDomain = '';
  
  // Verificar funil apenas se foi fornecido um ID válido
  if (funnelId && funnelId.trim() !== '') {
    try {
      // Primeiro verificamos o funil sem restrição de usuário para debug
      const { data: funnels, error: funnelError } = await supabase
        .from('funnels')
        .select('id, user_id, custom_domain')
        .eq('id', funnelId);
      
      if (funnelError) {
        console.error(`[Domain Cleanup] Erro ao verificar funil: ${funnelId}`, funnelError);
        results.databaseMessage = `Erro ao verificar funil: ${funnelError.message}`;
      } else if (!funnels || funnels.length === 0) {
        console.error(`[Domain Cleanup] Funil ${funnelId} não encontrado`);
        results.databaseMessage = 'Funil não encontrado';
      } else {
        const funnel = funnels[0];
        funnelExists = true;
        funnelOwnerId = funnel.user_id;
        funnelCurrentDomain = funnel.custom_domain || '';
        
        console.log(`[Domain Cleanup] Funil encontrado: ID=${funnel.id}, UserID=${funnel.user_id}, Domain=${funnel.custom_domain}`);
        
        // Verificar se o usuário tem permissão (apenas para log, não impedirá a execução na limpeza forçada)
        if (userId && funnel.user_id !== userId) {
          console.warn(`[Domain Cleanup] Alerta: Usuário ${userId} não é o proprietário do funil ${funnelId} (pertence a ${funnel.user_id})`);
        }
        
        // Verificar se o domínio corresponde ao registrado no banco (apenas para log)
        if (funnel.custom_domain !== domain && funnel.custom_domain !== null) {
          console.warn(`[Domain Cleanup] Alerta: Domínio informado (${domain}) não corresponde ao registrado no banco (${funnel.custom_domain})`);
        }
      }
    } catch (dbError) {
      console.error(`[Domain Cleanup] Erro ao verificar funil:`, dbError);
      results.databaseMessage = 'Erro ao verificar funil';
    }
  } else {
    console.log(`[Domain Cleanup] Nenhum ID de funil fornecido, pulando verificação de funil`);
  }
  
  // 2. Tentar remover o domínio da Vercel (sempre tenta, mesmo se o funil não existir)
  try {
    // URL da API da Vercel para remover domínio
    let apiUrl = `https://api.vercel.com/v9/domains/${domain}`;
    if (VERCEL_TEAM_ID) {
      apiUrl += `?teamId=${VERCEL_TEAM_ID}`;
    }
    
    console.log(`[Domain Cleanup] Removendo domínio da Vercel: ${apiUrl}`);
    
    const response = await axios.delete(apiUrl, {
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`[Domain Cleanup] Resposta da remoção na Vercel:`, response.data || 'Sucesso (sem dados)');
    results.vercelSuccess = true;
    results.vercelMessage = 'Domínio removido da Vercel com sucesso';
  } catch (vercelError: any) {
    console.error(`[Domain Cleanup] Erro ao remover domínio da Vercel:`, vercelError.response?.data || vercelError.message);
    
    // Verificar se o erro é porque o domínio não existe (o que significa que já está removido)
    if (vercelError.response?.status === 404 || 
        (vercelError.response?.data?.error?.code === 'not_found') ||
        (vercelError.response?.data?.error?.message && vercelError.response?.data?.error?.message.includes('not found'))) {
      console.log(`[Domain Cleanup] Domínio não encontrado na Vercel, considerando como já removido`);
      results.vercelSuccess = true;
      results.vercelMessage = 'Domínio não encontrado na Vercel (já removido)';
    } else {
      results.vercelMessage = vercelError.response?.data?.error?.message || vercelError.message || 'Erro ao remover domínio da Vercel';
    }
  }
  
  // 3. Limpar o banco de dados
  // 3.1. Se existe um funil específico, atualizá-lo
  if (funnelExists && funnelId) {
    try {
      console.log(`[Domain Cleanup] Removendo associação de domínio no banco de dados para funil: ${funnelId}`);
      
      const { error: updateError } = await supabase
        .from('funnels')
        .update({ custom_domain: null })
        .eq('id', funnelId);
      
      if (updateError) {
        console.error(`[Domain Cleanup] Erro ao atualizar funil no banco de dados:`, updateError);
        results.databaseMessage = updateError.message || 'Erro ao atualizar funil no banco de dados';
      } else {
        console.log(`[Domain Cleanup] Funil atualizado com sucesso no banco de dados`);
        results.databaseSuccess = true;
        results.databaseMessage = 'Funil atualizado com sucesso';
      }
    } catch (dbError: any) {
      console.error(`[Domain Cleanup] Erro ao atualizar banco de dados:`, dbError);
      results.databaseMessage = dbError.message || 'Erro ao atualizar banco de dados';
    }
  }
  
  // 3.2. De qualquer forma, procurar todos os funis com este domínio
  try {
    console.log(`[Domain Cleanup] Procurando todos os funis com domínio ${domain} para limpar`);
    
    const { data: funnelsWithDomain, error: findError } = await supabase
      .from('funnels')
      .select('id')
      .eq('custom_domain', domain);
    
    if (findError) {
      console.error(`[Domain Cleanup] Erro ao procurar funis com domínio ${domain}:`, findError);
    } else if (funnelsWithDomain && funnelsWithDomain.length > 0) {
      console.log(`[Domain Cleanup] Encontrados ${funnelsWithDomain.length} funis com domínio ${domain}`);
      
      // Atualizar cada funil encontrado
      for (const funnel of funnelsWithDomain) {
        const { error: updateError } = await supabase
          .from('funnels')
          .update({ custom_domain: null })
          .eq('id', funnel.id);
        
        if (updateError) {
          console.error(`[Domain Cleanup] Erro ao atualizar funil ${funnel.id}:`, updateError);
        } else {
          console.log(`[Domain Cleanup] Funil ${funnel.id} atualizado com sucesso`);
          results.databaseSuccess = true;
          results.databaseMessage = 'Funis atualizados com sucesso';
        }
      }
    } else {
      console.log(`[Domain Cleanup] Nenhum funil encontrado com domínio ${domain}`);
      // Se não encontramos funis com este domínio, consideramos sucesso do banco
      if (!results.databaseSuccess) {
        results.databaseSuccess = true;
        results.databaseMessage = 'Nenhum funil encontrado com este domínio para atualizar';
      }
    }
  } catch (searchError: any) {
    console.error(`[Domain Cleanup] Erro ao procurar funis com domínio ${domain}:`, searchError);
    if (!results.databaseMessage) {
      results.databaseMessage = 'Erro ao procurar funis com este domínio';
    }
  }
  
  // 4. Determinar o sucesso geral da operação
  results.overallSuccess = results.databaseSuccess || results.vercelSuccess;
  
  console.log(`[Domain Cleanup] Resultado da limpeza para domínio ${domain}:`, results);
  return results;
}; 