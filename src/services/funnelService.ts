import { supabase } from '@/lib/supabase';
import { Funnel, Step, Question } from '@/utils/types';

/**
 * Função utilitária para gerar slug a partir de um nome
 * Inclui verificação de unicidade para evitar colisões
 */
const generateSlug = async (name: string, existingId?: string): Promise<string> => {
  try {
    // Gerar slug base a partir do nome (remover espaços e caracteres especiais)
    let baseSlug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remover caracteres especiais
      .replace(/\s+/g, '-')     // Substituir espaços por hífens
      .replace(/-+/g, '-');     // Evitar hífens duplicados
    
    if (!baseSlug) {
      baseSlug = 'funil'; // Slug padrão se o nome não gerar um slug válido
    }
    
    // Verificar se já existe um funil com esse slug
    const { data: existingFunnels } = await supabase
      .from('funnels')
      .select('id, slug')
      .eq('slug', baseSlug)
      .neq('id', existingId || ''); // Ignorar o próprio funil ao renomear
    
    // Se não houver colisão, usar o slug base
    if (!existingFunnels || existingFunnels.length === 0) {
      return baseSlug;
    }
    
    // Se houver colisão, adicionar um sufixo numérico
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;
    
    // Verificar novamente até encontrar um slug disponível
    while (true) {
      const { data: existingWithSuffix } = await supabase
        .from('funnels')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', existingId || '');
      
      if (!existingWithSuffix || existingWithSuffix.length === 0) {
        return newSlug;
      }
      
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
  } catch (error) {
    console.error('Erro ao gerar slug:', error);
    // Fallback: usar timestamp como slug
    return `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }
};

/**
 * Converte um nome em slug para verificação
 * Sem consultar o banco de dados
 */
const nameToSlug = (name: string): string => {
  let slug = name.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiais
    .replace(/\s+/g, '-')     // Substituir espaços por hífens
    .replace(/-+/g, '-');     // Evitar hífens duplicados
  
  // Se o slug for vazio, usar o padrão
  if (!slug) {
    slug = 'funil';
  }
  
  return slug;
};

export const funnelService = {
  // Buscar todos os funis do usuário com verificação robusta de autenticação
  async getFunnels() {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      if (!user.id) throw new Error('Invalid user ID');

      const { data, error } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Garantir que canvasElements esteja inicializado em todos os steps
      if (data) {
        data.forEach(funnel => {
          if (funnel.steps) {
            // Ordenar os steps por position/order_index
            funnel.steps.sort((a, b) => {
              const orderA = a.order_index ?? 0;
              const orderB = b.order_index ?? 0;
              return orderA - orderB;
            });
            
            // Inicializar canvasElements onde necessário
            funnel.steps.forEach(step => {
              if (!step.canvasElements) {
                console.log(`Step ${step.id} no funil ${funnel.id} não tem canvasElements, inicializando array vazio`);
                step.canvasElements = [];
              }
            });
          }
        });
      }
      
      // Log para depuração
      console.log(`Retrieved ${data?.length || 0} funnels for user ${user.id}`);
      return data;
    } catch (error) {
      console.error('Error fetching funnels:', error);
      throw error;
    }
  },

  // Buscar um funil pelo slug (para acesso público)
  async getFunnelBySlug(slug: string) {
    try {
      // Remover caracteres não seguros do slug
      const safeSlug = slug.replace(/[^\w-]/g, '');
      
      const { data, error } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .eq('slug', safeSlug)
        .eq('status', 'active') // Apenas funis ativos são acessíveis publicamente
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Ordenar steps
      if (data && data.steps) {
        data.steps.sort((a, b) => {
          const orderA = a.order_index ?? 0;
          const orderB = b.order_index ?? 0;
          return orderA - orderB;
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching funnel by slug:', error);
      throw error;
    }
  },

  // Buscar um funil pelo ID (para acesso público via domínio personalizado)
  async getFunnelById(id: string) {
    try {
        console.log('FunnelService - Buscando funil por ID:', id);
        
        const { data, error } = await supabase
            .from('funnels')
            .select(`
                *,
                steps (
                    *,
                    questions (*)
                )
            `)
            .eq('id', id)
            .eq('status', 'active')
            .single();

        if (error) {
            console.error('FunnelService - Erro ao buscar funil:', error);
            throw error;
        }

        if (!data) {
            console.log('FunnelService - Funil não encontrado');
            return null;
        }

        // Ordenar steps
        if (data.steps) {
            console.log(`FunnelService - Ordenando ${data.steps.length} steps`);
            data.steps.sort((a, b) => {
                const orderA = a.order_index ?? 0;
                const orderB = b.order_index ?? 0;
                return orderA - orderB;
            });

            // Garantir que canvasElements esteja inicializado
            data.steps.forEach(step => {
                if (!step.canvasElements) {
                    console.log(`FunnelService - Step ${step.id} não tem canvasElements, inicializando array vazio`);
                    step.canvasElements = [];
                }
            });
        }

        console.log('FunnelService - Funil carregado com sucesso:', {
            id: data.id,
            name: data.name,
            stepsCount: data.steps?.length || 0
        });

        return data;
    } catch (error) {
        console.error('FunnelService - Erro ao buscar funil:', error);
        throw error;
    }
  },

  // Criar um novo funil
  async createFunnel(funnel: Partial<Funnel>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Gerar slug baseado no nome
      const slug = await generateSlug(funnel.name || 'Novo Funil');
      
      const { data, error } = await supabase
        .from('funnels')
        .insert([{
          name: funnel.name,
          description: '',
          status: 'draft',
          user_id: user.id,
          slug: slug, // Incluir o slug gerado
          settings: {
            primaryColor: '#0066ff',
            backgroundColor: '#ffffff',
            fontFamily: 'SF Pro Display',
            showProgressBar: true,
            collectLeadData: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating funnel:', error);
      throw error;
    }
  },

  // Atualizar um funil existente
  async updateFunnel(id: string, updates: Partial<Funnel>) {
    try {
      console.log('Enviando atualização para o Supabase:', {id, updatesKeys: Object.keys(updates)});
      
      // Log do logo se existir nas atualizações
      if (updates.settings?.logo) {
        console.log('funnelService - Logo presente nas atualizações, tamanho:', 
          updates.settings.logo.length, 
          'primeiros chars:', updates.settings.logo.substring(0, 30) + '...'
        );
      } else if (updates.settings) {
        console.log('funnelService - Updates contém settings mas sem logo');
      }
      
      // Importante: NÃO enviar steps diretamente, pois é uma relação e não uma coluna
      const dataToUpdate: any = {
        name: updates.name,
        description: updates.description,
        status: updates.status,
        settings: updates.settings,
        updated_at: new Date().toISOString()
      };
      
      // Se o nome foi alterado, atualizar o slug também
      if (updates.name) {
        dataToUpdate.slug = await generateSlug(updates.name, id);
      }
      
      // Se o slug foi explicitamente fornecido, usá-lo em vez de gerar
      if (updates.slug) {
        dataToUpdate.slug = updates.slug;
      }
      
      // Remover campos undefined para evitar sobrescrever com null
      Object.keys(dataToUpdate).forEach(key => 
        dataToUpdate[key] === undefined && delete dataToUpdate[key]
      );
      
      console.log('Dados formatados para atualização:', {
        ...dataToUpdate,
        settings: dataToUpdate.settings ? 
          {
            ...dataToUpdate.settings,
            logo: dataToUpdate.settings.logo ? 
              `${dataToUpdate.settings.logo.substring(0, 30)}... (tamanho: ${dataToUpdate.settings.logo.length})` : 
              'não definido'
          } : 
          'não definido'
      });
      
      const { data, error } = await supabase
        .from('funnels')
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Verificar se o logo foi preservado na resposta
      if (dataToUpdate.settings?.logo && !data.settings?.logo) {
        console.error('funnelService - Logo perdido após persistência no Supabase!');
      } else if (data.settings?.logo) {
        console.log('funnelService - Logo preservado na resposta do Supabase, tamanho:', 
          data.settings.logo.length
        );
      }
      
      console.log('Funil atualizado com sucesso:', {
        id: data.id, 
        name: data.name,
        settingsKeys: data.settings ? Object.keys(data.settings) : 'sem settings',
        stepsCount: data.steps?.length || 0
      });
      
      return data;
    } catch (error) {
      console.error('Error updating funnel:', error);
      throw error;
    }
  },

  // Deletar um funil
  async deleteFunnel(id: string) {
    try {
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting funnel:', error);
      throw error;
    }
  },

  // Duplicar um funil existente
  async duplicateFunnel(funnelId: string) {
    try {
      console.log('Iniciando duplicação do funil:', funnelId);
      
      // 1. Primeiro, obter o funil original com todos os seus dados
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data: originalFunnel, error: fetchError } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .eq('id', funnelId)
        .single();

      if (fetchError) throw fetchError;
      if (!originalFunnel) throw new Error('Funnel not found');
      
      console.log('Funil original obtido com sucesso:', originalFunnel.name);
      
      // Gerar nome e slug para a cópia
      const copyName = `${originalFunnel.name} (Cópia)`;
      const copySlug = await generateSlug(copyName);
      
      // 2. Criar um novo funil baseado no original
      const { data: newFunnel, error: createError } = await supabase
        .from('funnels')
        .insert([{
          name: copyName,
          slug: copySlug,
          description: originalFunnel.description,
          status: 'draft', // Sempre iniciar como rascunho
          user_id: user.id,
          settings: originalFunnel.settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (!newFunnel) throw new Error('Failed to create new funnel');
      
      console.log('Novo funil criado com sucesso:', newFunnel.id);
      
      // 3. Se o funil original tem steps, duplicar cada um deles
      if (originalFunnel.steps && originalFunnel.steps.length > 0) {
        console.log(`Duplicando ${originalFunnel.steps.length} steps...`);
        
        // Mapear os IDs antigos para os novos para manter referências
        const stepIdMap = new Map();
        
        // Criar os novos steps com referência ao novo funil
        for (const originalStep of originalFunnel.steps) {
          const { data: newStep, error: stepError } = await supabase
            .from('steps')
            .insert([{
              title: originalStep.title,
              buttonText: originalStep.buttonText,
              backButtonText: originalStep.backButtonText,
              showProgressBar: originalStep.showProgressBar,
              funnel_id: newFunnel.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (stepError) throw stepError;
          if (!newStep) continue;
          
          stepIdMap.set(originalStep.id, newStep.id);
          
          // 4. Se o step original tem questions, duplicar cada uma delas
          if (originalStep.questions && originalStep.questions.length > 0) {
            console.log(`Duplicando ${originalStep.questions.length} questions para o step ${newStep.id}...`);
            
            const questionsToInsert = originalStep.questions.map(originalQuestion => ({
              type: originalQuestion.type,
              title: originalQuestion.title,
              description: originalQuestion.description,
              options: originalQuestion.options,
              required: originalQuestion.required,
              configuration: originalQuestion.configuration,
              step_id: newStep.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            
            if (questionsToInsert.length > 0) {
              const { error: questionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);
                
              if (questionsError) throw questionsError;
            }
          }
          
          // 5. Se o step original tem elementos de canvas, copiá-los
          if (originalStep.canvasElements && originalStep.canvasElements.length > 0) {
            // Atualizar o step com os elementos de canvas
            const { error: updateError } = await supabase
              .from('steps')
              .update({
                canvasElements: originalStep.canvasElements,
                updated_at: new Date().toISOString()
              })
              .eq('id', newStep.id);
              
            if (updateError) throw updateError;
            
            console.log(`Copiados ${originalStep.canvasElements.length} elementos do canvas para o step ${newStep.id}`);
          }
        }
      }
      
      // 6. Buscar o funil completo depois de todas as inserções
      const { data: completeFunnel, error: completeError } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .eq('id', newFunnel.id)
        .single();
        
      if (completeError) throw completeError;
      
      console.log('Duplicação concluída com sucesso');
      return completeFunnel;
    } catch (error) {
      console.error('Error duplicating funnel:', error);
      throw error;
    }
  },

  // Criar um novo step
  async createStep(step: Partial<Step>) {
    try {
      const { data, error } = await supabase
        .from('steps')
        .insert([{
          ...step,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  },

  // Atualizar um step existente
  async updateStep(id: string, updates: Partial<Step>) {
    try {
      const { data, error } = await supabase
        .from('steps')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  },

  // Criar uma nova questão
  async createQuestion(question: Partial<Question>) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          ...question,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Atualizar uma questão existente
  async updateQuestion(id: string, updates: Partial<Question>) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  async refreshFunnelCanvasElements(funnelId: string) {
    try {
      console.log(`FunnelService - Forçando atualização dos canvasElements do funil ${funnelId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // 1. Buscar o funil atual com todos os steps
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *
          )
        `)
        .eq('id', funnelId)
        .single();
        
      if (funnelError) throw funnelError;
      if (!funnel) throw new Error('Funnel not found');
      
      // 2. Para cada step, verificar se tem canvasElements e garantir que estão devidamente inicializados
      if (funnel.steps && funnel.steps.length > 0) {
        console.log(`FunnelService - Verificando canvasElements de ${funnel.steps.length} steps`);
        
        // Processar cada step
        for (const step of funnel.steps) {
          // Buscar canvasElements do banco
          const { data: stepData, error: stepError } = await supabase
            .from('steps')
            .select('canvasElements')
            .eq('id', step.id)
            .single();
            
          if (stepError) {
            console.error(`FunnelService - Erro ao buscar canvasElements do step ${step.id}:`, stepError);
            continue;
          }
          
          // Se o step não tem canvasElements definidos, inicializar com array vazio
          if (!step.canvasElements || !Array.isArray(step.canvasElements)) {
            console.log(`FunnelService - Step ${step.id} não tem canvasElements, inicializando array vazio`);
            
            const { error: updateError } = await supabase
              .from('steps')
              .update({ canvasElements: [] })
              .eq('id', step.id);
              
            if (updateError) {
              console.error(`FunnelService - Erro ao inicializar canvasElements para step ${step.id}:`, updateError);
            }
          } else {
            console.log(`FunnelService - Step ${step.id} já tem ${step.canvasElements.length} canvasElements definidos`);
          }
        }
      }
      
      console.log(`FunnelService - Atualização de canvasElements concluída para funil ${funnelId}`);
      return true;
    } catch (error) {
      console.error(`FunnelService - Erro ao atualizar canvasElements do funil ${funnelId}:`, error);
      return false;
    }
  },

  /**
   * Verifica o schema da tabela steps e identifica problemas
   * Este método é útil para ajudar a diagnosticar problemas relacionados
   * a colunas ausentes no schema do banco de dados
   */
  async checkStepsSchema() {
    try {
      console.log('FunnelService - Verificando schema da tabela steps');
      
      // Primeiro obtém as colunas esperadas no código vs. as existentes no banco
      // Pegando um step aleatório como referência
      const { data: sampleStep, error: stepError } = await supabase
        .from('steps')
        .select('*')
        .limit(1)
        .single();
      
      if (stepError) {
        console.error('Erro ao verificar schema:', stepError);
        return false;
      }
      
      // Colunas esperadas no código
      const expectedColumns = [
        'id', 'title', 'funnel_id', 'order_index', 'canvasElements', 
        'buttonText', 'backButtonText', 'showProgressBar', 
        'created_at', 'updated_at'
      ];
      
      // Colunas existentes no banco
      const existingColumns = sampleStep ? Object.keys(sampleStep) : [];
      
      // Verificar quais colunas estão faltando
      const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.warn(`FunnelService - AVISO: As seguintes colunas esperadas não existem na tabela steps: ${missingColumns.join(', ')}`);
        console.warn('Isso pode causar erros ao tentar persistir esses campos.');
        console.warn('Para resolver, adicione essas colunas ao schema do banco de dados ou remova-as do código.');
        
        // Armazenar as colunas ausentes para referência
        (window as any)._missingStepColumns = missingColumns;
        return false;
      }
      
      console.log('FunnelService - Schema da tabela steps está completo');
      return true;
    } catch (error) {
      console.error('Erro ao verificar schema:', error);
      return false;
    }
  },

  // Verificar se um slug está disponível globalmente (todos os usuários)
  async checkSlugAvailability(name: string): Promise<{
    available: boolean;
    slug: string;
    suggestedSlug?: string;
  }> {
    try {
      const slug = nameToSlug(name);
      
      if (!slug) {
        return { available: false, slug: 'funil' };
      }
      
      // Verificar no banco de dados
      const { data: existingFunnels } = await supabase
        .from('funnels')
        .select('id, slug')
        .eq('slug', slug);
      
      // Se não houver colisão, o slug está disponível
      if (!existingFunnels || existingFunnels.length === 0) {
        return { available: true, slug };
      }
      
      // Se houver colisão, sugerir um slug alternativo
      let counter = 1;
      let suggestedSlug = `${slug}-${counter}`;
      
      // Verificar sugestões até encontrar uma disponível
      while (counter <= 5) { // Limitar a 5 tentativas para esta verificação rápida
        const { data: existingWithSuffix } = await supabase
          .from('funnels')
          .select('id')
          .eq('slug', suggestedSlug);
        
        if (!existingWithSuffix || existingWithSuffix.length === 0) {
          break;
        }
        
        counter++;
        suggestedSlug = `${slug}-${counter}`;
      }
      
      return {
        available: false,
        slug,
        suggestedSlug
      };
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de slug:', error);
      return { available: false, slug: nameToSlug(name) };
    }
  }
}; 