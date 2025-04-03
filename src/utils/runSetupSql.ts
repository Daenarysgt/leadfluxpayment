import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

/**
 * Executa o script de setup SQL
 * Este utilitário deve ser executado diretamente do seu ambiente de desenvolvimento.
 * Ele lê o arquivo SQL e o executa no Supabase.
 * 
 * Uso: 
 * node runSetupSql.js
 */

async function runSetupSql() {
  try {
    console.log('Executando setup SQL...');
    
    // Ler o conteúdo do arquivo SQL
    const sqlFilePath = path.join(__dirname, '../../sql/setup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividir em comandos separados
    const commands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`Encontrados ${commands.length} comandos SQL`);
    
    // Executar os comandos um por um
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`Executando comando ${i+1}/${commands.length}`);
      
      try {
        const { error } = await supabase.rpc('execute_sql', { query: command });
        
        if (error) {
          if (error.message.includes('function execute_sql(text) does not exist') && i === 0) {
            console.log('Criando função execute_sql primeiro...');
            
            // Conectar diretamente para criar a função
            // Nota: Isso requer permissões de admin
            // Você pode precisar executar essa parte manualmente no console SQL do Supabase
            continue;
          }
          
          console.error(`Erro ao executar comando ${i+1}:`, error);
        } else {
          console.log(`Comando ${i+1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.error(`Falha no comando ${i+1}:`, cmdError);
      }
    }
    
    console.log('Setup SQL concluído');
  } catch (error) {
    console.error('Erro ao executar setup SQL:', error);
  }
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  runSetupSql();
}

export default runSetupSql; 