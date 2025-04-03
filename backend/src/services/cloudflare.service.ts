import axios from 'axios';
import { config } from 'dotenv';
import { supabase } from '../config/supabase';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

config();

// Configuração do Cloudflare
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';

// URLs base da API do Cloudflare
const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

// Função para obter cabeçalhos de autenticação padrão
const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

// Função para obter instruções DNS baseadas no tipo de domínio
const getDnsInstructions = (domain: string, cloudflareDomain: string) => {
  // Verificar se é um domínio apex (sem www ou outros prefixos)
  const isDomainApex = domain.split('.').length === 2 || 
                     (domain.split('.').length > 2 && !domain.startsWith('www.'));
  
  if (isDomainApex) {
    return {
      type: 'apex',
      instructions: [
        { type: 'CNAME', name: '@', value: `${cloudflareDomain}` },  // Domínio principal
        { type: 'CNAME', name: 'www', value: `${cloudflareDomain}` } // Host para www
      ]
    };
  } else {
    // Subdomínio
    const cnameName = domain.split('.')[0];  // Pega o primeiro segmento (ex: www)
    return {
      type: 'subdomain',
      instructions: [
        { type: 'CNAME', name: cnameName, value: `${cloudflareDomain}` }
      ]
    };
  }
};

export const cloudflareService = {
  // Criar um novo projeto no Cloudflare Pages para um funil específico
  async createSiteForFunnel(funnelId: string, customDomain?: string) {
    try {
      console.log(`[Cloudflare Service] Criando site para o funil: ${funnelId}`);
      
      // 1. Buscar dados do funil no Supabase
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select('*')
        .eq('id', funnelId)
        .single();
      
      if (funnelError || !funnel) {
        console.error(`[Cloudflare Service] Erro ao buscar funil:`, funnelError);
        return {
          success: false,
          error: 'Funil não encontrado'
        };
      }
      
      // 2. Criar um projeto no Cloudflare Pages
      const siteName = `leadflux-${funnel.slug || funnelId.substring(0, 8)}`;
      const createProjectUrl = `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects`;
      
      const projectData = {
        name: siteName,
        production_branch: 'main'
      };
      
      const response = await axios.post(
        createProjectUrl,
        projectData,
        { headers: getAuthHeaders() }
      );
      
      console.log(`[Cloudflare Service] Projeto criado:`, response.data);
      
      if (!response.data.success) {
        return {
          success: false,
          error: response.data.errors[0].message || 'Erro ao criar projeto no Cloudflare Pages'
        };
      }
      
      const projectId = response.data.result.id;
      const projectName = response.data.result.name;
      const siteDomain = `${projectName}.pages.dev`;
      
      // 3. Armazenar ID do projeto no banco de dados
      const { error: updateError } = await supabase
        .from('funnels')
        .update({ 
          cloudflare_project_id: projectId,
          cloudflare_url: `https://${siteDomain}`
        })
        .eq('id', funnelId);
      
      if (updateError) {
        console.error(`[Cloudflare Service] Erro ao atualizar funil com IDs do Cloudflare:`, updateError);
      }
      
      // 4. Se um domínio personalizado foi fornecido, configurá-lo
      let domainConfig = null;
      if (customDomain) {
        try {
          domainConfig = await this.configureDomain(projectId, customDomain);
        } catch (domainError) {
          console.error(`[Cloudflare Service] Erro ao configurar domínio:`, domainError);
        }
      }
      
      return {
        success: true,
        project: response.data.result,
        projectId,
        siteDomain,
        domainConfig
      };
    } catch (error: any) {
      console.error(`[Cloudflare Service] Erro ao criar projeto:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  },
  
  // Fazer deploy do conteúdo do funil para o Cloudflare Pages
  async deployFunnelContent(funnelId: string, projectId: string) {
    try {
      console.log(`[Cloudflare Service] Preparando deploy para o funil: ${funnelId}`);
      
      // 1. Buscar dados do funil no Supabase
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            canvasElements (*)
          )
        `)
        .eq('id', funnelId)
        .single();
      
      if (funnelError || !funnel) {
        console.error(`[Cloudflare Service] Erro ao buscar funil:`, funnelError);
        return {
          success: false,
          error: 'Funil não encontrado'
        };
      }
      
      // 2. Gerar HTML para o funil
      const funnelHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${funnel.name}</title>
  <meta name="description" content="${funnel.description || 'Funil criado com LeadFlux'}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <script>
    window.FUNNEL_DATA = ${JSON.stringify({
      id: funnel.id,
      name: funnel.name,
      settings: funnel.settings,
      steps: funnel.steps
    })};
  </script>
  <script src="https://cdn.leadflux.digital/embed.js" defer></script>
</head>
<body>
  <div id="funnel-root" data-funnel-id="${funnel.id}"></div>
</body>
</html>
      `;
      
      // 3. Salvar o HTML em um arquivo temporário e criar estrutura de diretório esperada pelo Cloudflare Pages
      const tempDir = path.join(__dirname, 'temp', projectId);
      const tempFile = path.join(tempDir, 'index.html');
      
      try {
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempFile, funnelHtml);
      } catch (fsError) {
        console.error(`[Cloudflare Service] Erro ao criar arquivo temporário:`, fsError);
        return {
          success: false,
          error: 'Erro ao criar arquivo para deploy'
        };
      }
      
      // 4. Comprimir diretório para upload
      const deployUrl = `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectId}/deployments`;
      
      // Criar um objeto FormData com os arquivos
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempFile), {
        filename: 'index.html',
        contentType: 'text/html'
      });
      
      // 5. Enviar para o Cloudflare Pages
      const deployResponse = await axios.post(
        deployUrl,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
          }
        }
      );
      
      console.log(`[Cloudflare Service] Deploy iniciado:`, deployResponse.data);
      
      // 6. Limpar arquivos temporários
      try {
        fs.unlinkSync(tempFile);
        fs.rmdirSync(tempDir, { recursive: true });
      } catch (cleanupError) {
        console.error(`[Cloudflare Service] Erro ao limpar arquivos temporários:`, cleanupError);
      }
      
      return {
        success: true,
        deployment: deployResponse.data.result
      };
    } catch (error: any) {
      console.error(`[Cloudflare Service] Erro ao fazer deploy:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  },
  
  // Verificar disponibilidade e status de um domínio
  async checkDomain(domain: string) {
    try {
      console.log(`[Cloudflare Service] Verificando domínio: ${domain}`);
      
      // Verificação básica de formato
      if (!domain.includes('.')) {
        return {
          verified: false,
          message: 'O domínio precisa incluir pelo menos um ponto (exemplo: meudominio.com)'
        };
      }
      
      // No Cloudflare, precisamos verificar os domínios personalizados configurados em cada projeto
      // para determinar se o domínio já está em uso
      const listProjectsUrl = `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects`;
      
      const response = await axios.get(listProjectsUrl, { headers: getAuthHeaders() });
      
      if (!response.data.success) {
        throw new Error(response.data.errors[0]?.message || 'Erro ao listar projetos do Cloudflare Pages');
      }
      
      // Verificar se o domínio está configurado em algum projeto
      let domainExists = false;
      let projectWithDomain = null;
      
      for (const project of response.data.result) {
        if (project.domains && project.domains.includes(domain)) {
          domainExists = true;
          projectWithDomain = project;
          break;
        }
      }
      
      return {
        exists: domainExists,
        verified: domainExists, // No Cloudflare, se o domínio estiver listado, consideramos verificado
        data: projectWithDomain,
        dnsInstructions: getDnsInstructions(domain, projectWithDomain ? `${projectWithDomain.name}.pages.dev` : 'your-project.pages.dev')
      };
      
    } catch (error: any) {
      console.error(`[Cloudflare Service] Erro ao verificar domínio:`, error.response?.data || error.message);
      
      return {
        exists: false,
        verified: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
        dnsInstructions: getDnsInstructions(domain, 'your-project.pages.dev')
      };
    }
  },
  
  // Buscar sites associados a um funil
  async getFunnelSite(funnelId: string) {
    try {
      // 1. Buscar ID do projeto no Supabase
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select('cloudflare_project_id, cloudflare_url, custom_domain')
        .eq('id', funnelId)
        .single();
      
      if (funnelError || !funnel) {
        console.error(`[Cloudflare Service] Erro ao buscar funil:`, funnelError);
        return {
          success: false,
          error: 'Funil não encontrado'
        };
      }
      
      // Se o funil não tiver projeto no Cloudflare, criar um
      if (!funnel.cloudflare_project_id) {
        return {
          success: false,
          error: 'Funil não tem projeto no Cloudflare Pages',
          needsCreation: true
        };
      }
      
      // 2. Buscar detalhes do projeto no Cloudflare
      const projectUrl = `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${funnel.cloudflare_project_id}`;
      
      try {
        const response = await axios.get(projectUrl, { headers: getAuthHeaders() });
        
        if (!response.data.success) {
          throw new Error(response.data.errors[0]?.message || 'Erro ao obter detalhes do projeto');
        }
        
        console.log(`[Cloudflare Service] Detalhes do projeto:`, response.data.result);
        
        return {
          success: true,
          site: response.data.result,
          funnelInfo: funnel
        };
      } catch (error: any) {
        // Se o projeto não existir mais no Cloudflare, limpar referência no banco
        if (error.response?.status === 404) {
          console.log(`[Cloudflare Service] Projeto não encontrado no Cloudflare, limpando referência`);
          
          await supabase
            .from('funnels')
            .update({ 
              cloudflare_project_id: null,
              cloudflare_url: null
            })
            .eq('id', funnelId);
          
          return {
            success: false,
            error: 'Projeto não existe mais no Cloudflare Pages',
            needsCreation: true
          };
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error(`[Cloudflare Service] Erro ao buscar projeto do funil:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  },
  
  // Configurar um domínio personalizado para um projeto existente no Cloudflare
  async configureDomain(projectId: string, domain: string) {
    try {
      console.log(`[Cloudflare Service] Configurando domínio ${domain} para o projeto ${projectId}`);
      
      // 1. Verificar se o domínio já está em uso
      const domainCheck = await this.checkDomain(domain);
      
      // Se o domínio já estiver em uso em outro projeto, retornar erro
      if (domainCheck.exists && domainCheck.data?.id && domainCheck.data.id !== projectId) {
        return {
          success: false,
          error: 'Este domínio já está sendo usado em outro projeto'
        };
      }
      
      // 2. Adicionar domínio ao projeto
      const domainUrl = `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectId}/domains`;
      
      const response = await axios.post(
        domainUrl, 
        { name: domain }, 
        { headers: getAuthHeaders() }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.errors[0]?.message || 'Erro ao adicionar domínio ao projeto');
      }
      
      console.log(`[Cloudflare Service] Domínio adicionado:`, response.data.result);
      
      // 3. Obter informações do projeto para instruções DNS
      const projectResponse = await axios.get(
        `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectId}`, 
        { headers: getAuthHeaders() }
      );
      
      if (!projectResponse.data.success) {
        throw new Error(projectResponse.data.errors[0]?.message || 'Erro ao obter detalhes do projeto');
      }
      
      const project = projectResponse.data.result;
      const cloudflareDomain = `${project.name}.pages.dev`;
      
      return {
        success: true,
        data: response.data.result,
        project: project,
        dnsInstructions: getDnsInstructions(domain, cloudflareDomain)
      };
    } catch (error: any) {
      console.error(`[Cloudflare Service] Erro ao configurar domínio:`, error.response?.data || error.message);
      
      // Se o erro for por que o domínio já existe, tentar obter informações
      if (error.response?.status === 409) {
        try {
          // Obter informações do projeto
          const projectResponse = await axios.get(
            `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectId}`,
            { headers: getAuthHeaders() }
          );
          
          if (!projectResponse.data.success) {
            throw new Error(projectResponse.data.errors[0]?.message);
          }
          
          const project = projectResponse.data.result;
          const cloudflareDomain = `${project.name}.pages.dev`;
          
          return {
            success: true,
            alreadyExists: true,
            message: 'Domínio já existe e está configurado para este projeto',
            dnsInstructions: getDnsInstructions(domain, cloudflareDomain)
          };
        } catch (infoError) {
          console.error(`[Cloudflare Service] Erro ao obter informações do projeto:`, infoError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  },
  
  // Remover um domínio de um projeto
  async removeDomain(projectId: string, domain: string) {
    try {
      console.log(`[Cloudflare Service] Removendo domínio ${domain} do projeto ${projectId}`);
      
      const domainUrl = `${CLOUDFLARE_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectId}/domains/${domain}`;
      
      const response = await axios.delete(
        domainUrl, 
        { headers: getAuthHeaders() }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.errors[0]?.message || 'Erro ao remover domínio');
      }
      
      console.log(`[Cloudflare Service] Domínio removido`);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error(`[Cloudflare Service] Erro ao remover domínio:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }
}; 