import { supabase } from '@/lib/supabase';
import { Domain, DomainFormData } from '@/types/domain';
import { createClient } from '@supabase/supabase-js';

const VERCEL_API = 'https://api.vercel.com/v9';
const PROJECT_ID = import.meta.env.VITE_VERCEL_PROJECT_ID;
const TOKEN = import.meta.env.VITE_VERCEL_TOKEN;

// Cliente Supabase público para consultas não autenticadas
const publicSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export const domainsService = {
    // Adicionar novo domínio
    async addDomain(data: DomainFormData): Promise<Domain> {
        // 1. Verificar se já existe um domínio para este funil
        const { data: existingDomains } = await supabase
            .from('domains')
            .select('*')
            .eq('funnel_id', data.funnel_id);

        if (existingDomains && existingDomains.length > 0) {
            throw new Error('Este funil já possui um domínio conectado. Por favor, remova o domínio existente antes de adicionar um novo.');
        }

        // 2. Validar domínio
        if (!this.isValidDomain(data.domain)) {
            throw new Error('Formato de domínio inválido');
        }

        // 3. Configurar na Vercel
        const vercelDomain = await this.configureVercelDomain(data.domain);

        // 4. Obter o usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Usuário não autenticado');

        // 5. Salvar no Supabase
        const { data: domain, error } = await supabase
            .from('domains')
            .insert({
                domain: data.domain,
                funnel_id: data.funnel_id,
                user_id: user.id,
                status: 'pending',
                verification_records: vercelDomain.verification
            })
            .select()
            .single();

        if (error) throw error;
        return domain;
    },

    // Listar domínios
    async listDomains(funnelId?: string) {
        let query = supabase.from('domains').select('*');
        
        if (funnelId) {
            query = query.eq('funnel_id', funnelId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Remover domínio
    async removeDomain(id: string): Promise<void> {
        const { data: domain, error: fetchError } = await supabase
            .from('domains')
            .select('domain')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 1. Remover da Vercel
        await this.removeVercelDomain(domain.domain);

        // 2. Remover do Supabase
        const { error } = await supabase
            .from('domains')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Verificar status do domínio
    async checkDomainStatus(domain: string): Promise<string> {
        const status = await this.verifyVercelDomain(domain);
        
        // Atualizar status no Supabase
        await supabase
            .from('domains')
            .update({ status: status.verified ? 'active' : 'pending' })
            .eq('domain', domain);

        return status.verified ? 'active' : 'pending';
    },

    // Buscar domínio pelo nome (usando cliente público)
    async getDomainByName(domain: string): Promise<Domain | null> {
        try {
            console.log('DomainsService - Iniciando busca por domínio:', domain);
            
            // Limpar o domínio (remover www. se existir)
            const cleanDomain = domain.replace(/^www\./, '');
            console.log('DomainsService - Domínio limpo:', cleanDomain);
            
            // Buscar todas as variações possíveis do domínio
            const variations = [
                domain,           // domínio original
                cleanDomain,      // sem www
                `www.${cleanDomain}`, // com www
            ];
            
            console.log('DomainsService - Tentando variações:', variations);
            
            // Usar o cliente público para a busca
            const { data: domains, error } = await publicSupabase
                .from('domains')
                .select(`
                    *,
                    funnel:funnel_id (
                        id,
                        name,
                        status
                    )
                `)
                .in('domain', variations)
                .eq('status', 'active');
                
            console.log('DomainsService - Resultado da busca:', {
                data: domains,
                error,
                variations
            });

            if (error) {
                console.error('DomainsService - Erro na busca:', error);
                return null;
            }

            if (!domains || domains.length === 0) {
                // Se não encontrou, tentar uma busca case-insensitive
                console.log('DomainsService - Tentando busca case-insensitive');
                const { data: caseInsensitive, error: caseError } = await publicSupabase
                    .from('domains')
                    .select(`
                        *,
                        funnel:funnel_id (
                            id,
                            name,
                            status
                        )
                    `)
                    .or(variations.map(v => `domain.ilike.${v}`).join(','))
                    .eq('status', 'active');

                console.log('DomainsService - Resultado da busca case-insensitive:', {
                    data: caseInsensitive,
                    error: caseError
                });

                if (caseError) {
                    console.error('DomainsService - Erro na busca case-insensitive:', caseError);
                    return null;
                }

                if (!caseInsensitive || caseInsensitive.length === 0) {
                    console.log('DomainsService - Domínio não encontrado em nenhuma busca');
                    return null;
                }

                return caseInsensitive[0] as Domain;
            }

            return domains[0] as Domain;
        } catch (error) {
            console.error('DomainsService - Erro ao buscar domínio:', error);
            return null;
        }
    },

    // Helpers
    isValidDomain(domain: string): boolean {
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    },

    // Vercel API calls
    async configureVercelDomain(domain: string) {
        console.log('Configurando domínio:', {
            domain,
            projectId: PROJECT_ID,
            token: TOKEN?.slice(0, 5) + '...'
        });

        try {
            // 1. Primeiro, tentar remover o domínio se ele já existir
            try {
                await fetch(`${VERCEL_API}/projects/${PROJECT_ID}/domains/${domain}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Domínio removido com sucesso');
            } catch (removeError) {
                console.log('Erro ao remover domínio (pode ser que não existia):', removeError);
            }

            // 2. Agora adicionar ao projeto
            const response = await fetch(`${VERCEL_API}/projects/${PROJECT_ID}/domains`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name: domain
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Erro ao configurar domínio:', error);
                throw new Error(error.error?.message || error.message || 'Failed to configure domain');
            }

            const data = await response.json();
            console.log('Resposta da Vercel:', data);
            return data;
        } catch (error: any) {
            console.error('Erro completo:', error);
            if (error.response) {
                const errorData = await error.response.json();
                console.error('Detalhes do erro:', errorData);
            }
            throw error;
        }
    },

    async verifyVercelDomain(domain: string) {
        const response = await fetch(`${VERCEL_API}/projects/${PROJECT_ID}/domains/${domain}`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to verify domain');
        }

        return response.json();
    },

    async removeVercelDomain(domain: string) {
        const response = await fetch(`${VERCEL_API}/projects/${PROJECT_ID}/domains/${domain}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove domain');
        }

        return response.json();
    }
}; 