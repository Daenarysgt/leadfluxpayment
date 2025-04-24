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
    getCanvasElements: async (step: any) => {
      if (!step || !step.id) {
        console.log(`DatabaseAdapter - Step inválido, não é possível buscar elementos`);
        return [];
      }
      
      try {
        console.log(`DatabaseAdapter - Buscando elementos do canvas para step ${step.id}`);
        
        // Primeiro, tentar buscar da tabela canvas_elements
        const { data: elementsFromTable, error } = await supabase
          .from('canvas_elements')
          .select('*')
          .eq('step_id', step.id)
          .order('position', { ascending: true });
        
        if (error) {
          // Se a tabela não existir, cair no fallback
          if (error.message && error.message.includes('does not exist')) {
            console.log(`DatabaseAdapter - Tabela canvas_elements não existe, usando campo canvasElements`);
          } else {
            console.error(`DatabaseAdapter - Erro ao buscar da tabela canvas_elements:`, error);
          }
        } else if (elementsFromTable && elementsFromTable.length > 0) {
          console.log(`DatabaseAdapter - Encontrados ${elementsFromTable.length} elementos na tabela canvas_elements`);
          
          // Processar elementos da tabela para o formato esperado
          const processedElements = elementsFromTable.map(element => {
            // Se o elemento tiver config como um objeto JSON, extrair seus valores
            if (element.config && typeof element.config === 'object') {
              return {
                ...element.config,
                id: element.id // Garantir que estamos usando o ID correto
              };
            }
            
            // Caso contrário, retornar o elemento como está
            return element;
          });
          
          return processedElements;
        } else {
          console.log(`DatabaseAdapter - Nenhum elemento encontrado na tabela canvas_elements`);
        }
        
        // Fallback: usar campo canvasElements do próprio step
        if (step.canvasElements && Array.isArray(step.canvasElements)) {
          console.log(`DatabaseAdapter - Usando ${step.canvasElements.length} elementos do campo canvasElements`);
          return step.canvasElements;
        }
        
        console.log(`DatabaseAdapter - Nenhum elemento encontrado para o step ${step.id}`);
        return [];
      } catch (error) {
        console.error(`DatabaseAdapter - Erro ao buscar elementos do canvas:`, error);
        
        // Em caso de erro, tentar retornar do campo canvasElements
        if (step.canvasElements && Array.isArray(step.canvasElements)) {
          return step.canvasElements;
        }
        
        return [];
      }
    },
    
    // Salvar no campo correto baseado no que existe
    saveCanvasElements: async (stepId: string, elements: any[]) => {
      console.log(`DatabaseAdapter - Salvando ${elements.length} elementos para o step ${stepId}`);
      
      try {
        // Verificar se a tabela canvas_elements existe
        let useNewTable = true;
        try {
          // Testar a existência da tabela com uma consulta
          const { count, error } = await supabase
            .from('canvas_elements')
            .select('*', { count: 'exact', head: true })
            .limit(1);
            
          if (error && error.message && error.message.includes('does not exist')) {
            console.log(`DatabaseAdapter - Tabela canvas_elements não encontrada, usando método legado`);
            useNewTable = false;
          }
        } catch (tableCheckError) {
          console.error(`DatabaseAdapter - Erro ao verificar tabela canvas_elements:`, tableCheckError);
          useNewTable = false;
        }
        
        if (useNewTable) {
          console.log(`DatabaseAdapter - Usando tabela canvas_elements para salvar elementos`);
          
          // 1. Primeiro, remover todos os elementos existentes deste step
          const { error: deleteError } = await supabase
            .from('canvas_elements')
            .delete()
            .eq('step_id', stepId);
            
          if (deleteError) {
            console.error(`DatabaseAdapter - Erro ao limpar elementos existentes:`, deleteError);
            throw deleteError;
          }
          
          // 2. Se houver elementos para inserir, preparar dados
          if (elements && elements.length > 0) {
            const now = new Date().toISOString();
            const elementsToInsert = elements.map(element => {
              // Garantir que cada elemento tenha um ID
              const id = element.id || crypto.randomUUID();
              
              return {
                id,
                step_id: stepId,
                type: element.type || 'unknown',
                config: element, // Armazenar o elemento inteiro como config
                position: element.position || 0,
                created_at: now,
                updated_at: now
              };
            });
            
            // 3. Inserir os novos elementos
            const { error: insertError } = await supabase
              .from('canvas_elements')
              .insert(elementsToInsert);
              
            if (insertError) {
              console.error(`DatabaseAdapter - Erro ao inserir novos elementos:`, insertError);
              throw insertError;
            }
            
            console.log(`DatabaseAdapter - ${elementsToInsert.length} elementos salvos com sucesso na tabela canvas_elements`);
          } else {
            console.log(`DatabaseAdapter - Nenhum elemento para salvar, step ${stepId} está vazio`);
          }
          
          return true;
        } else {
          // MÉTODO LEGADO: Salvar na coluna canvasElements como antes
          console.log(`DatabaseAdapter - Usando método legado para salvar elementos`);
          
          const { error } = await supabase
            .from('steps')
            .update({
              canvasElements: elements,
              updated_at: new Date().toISOString()
            })
            .eq('id', stepId);
            
          if (error) {
            console.error(`DatabaseAdapter - Erro ao salvar elementos pelo método legado:`, error);
            throw error;
          }
          
          console.log(`DatabaseAdapter - Elementos salvos com sucesso pelo método legado`);
          return true;
        }
      } catch (error) {
        console.error(`DatabaseAdapter - Erro ao salvar elementos do canvas:`, error);
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