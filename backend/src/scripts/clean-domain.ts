import dotenv from 'dotenv';
import { forceCleanupDomain } from '../utils/domain-cleanup';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para limpeza manual de domínio
 * 
 * Uso: ts-node src/scripts/clean-domain.ts meudominio.com [funnelId]
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Uso: ts-node src/scripts/clean-domain.ts <dominio> [funnelId]');
    process.exit(1);
  }
  
  const domain = args[0];
  const funnelId = args.length > 1 ? args[1] : '';
  
  console.log(`Iniciando limpeza manual do domínio: ${domain}`);
  console.log(`FunnelId fornecido: ${funnelId || 'nenhum'}`);
  
  try {
    const result = await forceCleanupDomain(domain, funnelId);
    
    console.log('\n===== RESULTADO DA LIMPEZA =====');
    console.log(`Sucesso geral: ${result.overallSuccess ? 'SIM' : 'NÃO'}`);
    console.log(`Vercel: ${result.vercelSuccess ? 'Sucesso' : 'Falha'} - ${result.vercelMessage}`);
    console.log(`Banco de dados: ${result.databaseSuccess ? 'Sucesso' : 'Falha'} - ${result.databaseMessage}`);
    
    if (result.overallSuccess) {
      console.log('\n✅ Limpeza concluída com sucesso!');
      process.exit(0);
    } else {
      console.error('\n⚠️ Limpeza parcial ou com problemas.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro na limpeza:', error);
    process.exit(1);
  }
}

// Executar o script
main(); 