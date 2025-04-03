import { supabase } from '@/lib/supabase';

/**
 * Verifica e inicializa o schema do banco de dados
 * Criando tabelas e colunas necessárias se não existirem
 */
export async function setupDatabaseSchema() {
  console.log('Iniciando verificação e setup do schema do banco de dados...');
  
  try {
    // 1. Verificar se a tabela steps existe e criar se necessário
    const { error: checkError } = await supabase
      .from('steps')
      .select('id')
      .limit(1);
    
    let needsTableCreation = false;
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Tabela steps não existe, será criada');
      needsTableCreation = true;
    }
    
    if (needsTableCreation) {
      // Criar a tabela steps se não existir
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS steps (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          button_text TEXT DEFAULT 'Continuar',
          back_button_text TEXT DEFAULT 'Voltar',
          show_progress_bar BOOLEAN DEFAULT true,
          canvas_elements JSONB DEFAULT '[]'::jsonb,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('execute_sql', { 
        query: createTableSQL 
      });
      
      if (createError) {
        console.error('Erro ao criar tabela steps:', createError);
        
        // Tentativa alternativa - adaptar para o schema existente
        await createFallbackSchema();
        return;
      }
      
      console.log('Tabela steps criada com sucesso');
    } else {
      // 2. Se a tabela existe, verificar se as colunas necessárias existem
      await verifyColumnsAndAddMissing();
    }
    
    console.log('Setup do schema concluído com sucesso');
    return true;
  } catch (error) {
    console.error('Erro durante setup do schema:', error);
    await createFallbackSchema();
    return false;
  }
}

/**
 * Verifica se as colunas necessárias existem e adiciona as que estão faltando
 */
async function verifyColumnsAndAddMissing() {
  try {
    // Obter um step qualquer para verificar colunas
    const { data: sampleStep, error } = await supabase
      .from('steps')
      .select('*')
      .limit(1)
      .single();
    
    if (error && !error.message.includes('no rows returned')) {
      console.error('Erro ao verificar colunas da tabela steps:', error);
      return;
    }
    
    // Lista de colunas essenciais
    const requiredColumns = [
      { name: 'canvas_elements', type: 'jsonb', default: "DEFAULT '[]'::jsonb" },
      { name: 'button_text', type: 'text', default: "DEFAULT 'Continuar'" },
      { name: 'back_button_text', type: 'text', default: "DEFAULT 'Voltar'" },
      { name: 'show_progress_bar', type: 'boolean', default: 'DEFAULT true' }
    ];
    
    // Verificar quais colunas existem
    const existingColumns = sampleStep ? Object.keys(sampleStep) : [];
    
    // Para cada coluna necessária, verificar se existe
    for (const column of requiredColumns) {
      // Converter para camelCase para comparação
      const camelColumn = toCamelCase(column.name);
      
      if (!existingColumns.includes(camelColumn) && !existingColumns.includes(column.name)) {
        console.log(`Coluna ${column.name} não existe, adicionando...`);
        
        // Adicionar a coluna
        const alterSQL = `
          ALTER TABLE steps 
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type} ${column.default};
        `;
        
        const { error } = await supabase.rpc('execute_sql', { 
          query: alterSQL 
        });
        
        if (error) {
          console.error(`Erro ao adicionar coluna ${column.name}:`, error);
        } else {
          console.log(`Coluna ${column.name} adicionada com sucesso`);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar e adicionar colunas:', error);
  }
}

/**
 * Cria uma função SQL para executar comandos SQL arbitrários
 * (Necessário para operações DDL como CREATE TABLE e ALTER TABLE)
 */
async function createSQLExecuteFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION execute_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `;
  
  try {
    // Criamos a função na primeira execução
    const { error } = await supabase.rpc('execute_sql', { 
      query: 'SELECT 1' 
    });
    
    if (error && error.message.includes('function execute_sql(text) does not exist')) {
      // Precisamos criar a função
      const { error: rpcError } = await supabase.rpc('execute_sql', { 
        query: createFunctionSQL 
      });
      
      if (rpcError) {
        console.error('Erro ao criar função execute_sql:', rpcError);
        return false;
      }
      
      console.log('Função execute_sql criada com sucesso');
      return true;
    }
    
    return !error;
  } catch (error) {
    console.error('Erro ao verificar ou criar função SQL:', error);
    return false;
  }
}

/**
 * Cria um esquema alternativo se a abordagem principal falhar
 */
async function createFallbackSchema() {
  console.log('Criando adaptador de esquema alternativo...');
  
  // Monkey patch para compatibilidade
  window.stepsDatabaseAdapter = {
    // Função para obter elementos do canvas, tentando diferentes convenções
    getCanvasElements: (step: any) => {
      if (!step) return [];
      
      // Tentar diferentes nomes para o campo canvasElements
      if (Array.isArray(step.canvasElements)) return step.canvasElements;
      if (Array.isArray(step.canvas_elements)) return step.canvas_elements;
      
      // Inicializar se não existir
      return [];
    },
    
    // Salvar no campo correto baseado no que existe
    saveCanvasElements: async (stepId: string, elements: any[]) => {
      try {
        // Tentar determinar o nome correto do campo no schema atual
        const { data: sampleStep } = await supabase
          .from('steps')
          .select('*')
          .limit(1)
          .single();
          
        // Verificar qual campo existe
        let fieldName = 'canvas_elements';
        if (sampleStep) {
          if ('canvasElements' in sampleStep) fieldName = 'canvasElements';
          else if ('canvas_elements' in sampleStep) fieldName = 'canvas_elements';
        }
        
        // Dados para update
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        
        // Definir o campo correto
        updateData[fieldName] = elements;
        
        // Executar o update
        const { error } = await supabase
          .from('steps')
          .update(updateData)
          .eq('id', stepId);
          
        return !error;
      } catch (error) {
        console.error('Erro ao salvar elementos do canvas (adaptador):', error);
        return false;
      }
    }
  };
  
  console.log('Adaptador de esquema alternativo criado - a aplicação usará uma solução de compatibilidade');
}

// Utilitário para converter snake_case para camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Inicializar o schema automaticamente
setupDatabaseSchema().catch(error => {
  console.error('Falha ao inicializar schema do banco de dados:', error);
}); 