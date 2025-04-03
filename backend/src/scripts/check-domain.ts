import dotenv from 'dotenv';
import axios from 'axios';
import { supabase } from '../config/supabase';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações da API Vercel
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || '';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';

/**
 * Script para verificar o status de um domínio na Vercel
 * 
 * Uso: ts-node src/scripts/check-domain.ts meudominio.com
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Uso: ts-node src/scripts/check-domain.ts <dominio>');
    process.exit(1);
  }
  
  const domain = args[0];
  
  console.log(`Verificando status do domínio: ${domain}`);
  
  try {
    // 1. Verificar na Vercel
    let vercelInfo = null;
    let vercelError = null;
    
    try {
      // URL da API da Vercel
      let apiUrl = `https://api.vercel.com/v9/domains/${domain}`;
      if (VERCEL_TEAM_ID) {
        apiUrl += `?teamId=${VERCEL_TEAM_ID}`;
      }
      
      console.log(`\nConsultando API da Vercel: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      vercelInfo = response.data;
      console.log('\n===== INFORMAÇÕES DA VERCEL =====');
      console.log(JSON.stringify(vercelInfo, null, 2));
    } catch (error: any) {
      vercelError = error.response?.data || error.message;
      console.error('\n❌ Erro ao consultar Vercel:', vercelError);
    }
    
    // 2. Verificar no banco de dados
    try {
      const { data: funnels, error: funnelsError } = await supabase
        .from('funnels')
        .select('id, name, custom_domain')
        .eq('custom_domain', domain);
      
      if (funnelsError) {
        console.error('\n❌ Erro ao consultar banco de dados:', funnelsError);
      } else {
        console.log('\n===== INFORMAÇÕES DO BANCO DE DADOS =====');
        if (funnels && funnels.length > 0) {
          console.log(`Encontrados ${funnels.length} funis usando este domínio:`);
          funnels.forEach((funnel, index) => {
            console.log(`${index + 1}. Funil ID: ${funnel.id}`);
            console.log(`   Nome: ${funnel.name || 'Sem nome'}`);
            console.log(`   Domínio: ${funnel.custom_domain}`);
          });
        } else {
          console.log('Nenhum funil está usando este domínio no banco de dados.');
        }
      }
    } catch (dbError) {
      console.error('\n❌ Erro ao consultar banco de dados:', dbError);
    }
    
    console.log('\n===== RESUMO =====');
    console.log(`Domínio: ${domain}`);
    console.log(`Status na Vercel: ${vercelInfo ? 'Encontrado' : 'Não encontrado'}`);
    if (vercelInfo) {
      console.log(`Verificado: ${vercelInfo.verified ? 'Sim' : 'Não'}`);
      console.log(`Pronto para uso: ${vercelInfo.readyToUse ? 'Sim' : 'Não'}`);
      console.log(`Projeto: ${vercelInfo.projectId || 'Não associado'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro geral:', error);
    process.exit(1);
  }
}

// Executar o script
main(); 