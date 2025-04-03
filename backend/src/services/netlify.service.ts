import axios from 'axios';
import { config } from 'dotenv';
import { supabase } from '../config/supabase';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

config();

// Configuração do Netlify
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN || '';
const NETLIFY_TEAM_ID = process.env.NETLIFY_TEAM_ID || '';

// URLs base da API do Netlify
const NETLIFY_API_URL = 'https://api.netlify.com/api/v1';

// Função para obter cabeçalhos de autenticação padrão
const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${NETLIFY_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

// Função para obter instruções DNS baseadas no tipo de domínio
const getDnsInstructions = (domain: string, netlifyDomain: string) => {
  // Verificar se é um domínio apex (sem www ou outros prefixos)
  const isDomainApex = domain.split('.').length === 2 || 
                     (domain.split('.').length > 2 && !domain.startsWith('www.'));
  
  if (isDomainApex) {
    return {
      type: 'apex',
      instructions: [
        { type: 'A', name: '@', value: '75.2.60.5' },  // Netlify IP primário
        { type: 'CNAME', name: 'www', value: `${netlifyDomain}` }, // Host para www
      ]
    };
  } else {
    // Subdomínio
    const cnameName = domain.split('.')[0];  // Pega o primeiro segmento (ex: www)
    return {
      type: 'subdomain',
      instructions: [
        { type: 'CNAME', name: cnameName, value: `${netlifyDomain}` }
      ]
    };
  }
};

export const netlifyService = {
  // Criar um novo site no Netlify para um funil específico
  async createSiteForFunnel(funnelId: string, customDomain?: string) {
    try {
      console.log(`[Netlify Service] Criando site para o funil: ${funnelId}`);
      
      // 1. Buscar dados do funil no Supabase
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select('*')
        .eq('id', funnelId)
        .single();
      
      if (funnelError || !funnel) {
        console.error(`[Netlify Service] Erro ao buscar funil:`, funnelError);
        return {
          success: false,
          error: 'Funil não encontrado'
        };
      }
      
      // 2. Criar um site no Netlify
      const siteName = `leadflux-funil-${funnel.slug || funnelId.substring(0, 8)}`;
      let createSiteUrl = `${NETLIFY_API_URL}/sites`;
      
      if (NETLIFY_TEAM_ID) {
        createSiteUrl += `?teamId=${NETLIFY_TEAM_ID}`;
      }
      
      const siteData = {
        name: siteName,
        custom_domain: customDomain || null,
        force_ssl: true
      };
      
      const response = await axios.post(
        createSiteUrl,
        siteData,
        { headers: getAuthHeaders() }
      );
      
      console.log(`[Netlify Service] Site criado:`, response.data);
      
      const siteId = response.data.id;
      const siteDomain = response.data.ssl_url || response.data.url;
      
      // 3. Armazenar ID do site no banco de dados
      const { error: updateError } = await supabase
        .from('funnels')
        .update({ 
          netlify_site_id: siteId,
          netlify_url: siteDomain
        })
        .eq('id', funnelId);
      
      if (updateError) {
        console.error(`[Netlify Service] Erro ao atualizar funil com IDs do Netlify:`, updateError);
      }
      
      // 4. Se um domínio personalizado foi fornecido, configurá-lo
      let domainConfig = null;
      if (customDomain) {
        try {
          domainConfig = await this.configureDomain(siteId, customDomain);
        } catch (domainError) {
          console.error(`[Netlify Service] Erro ao configurar domínio:`, domainError);
        }
      }
      
      return {
        success: true,
        site: response.data,
        siteId,
        siteDomain,
        domainConfig
      };
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao criar site:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
  
  // Fazer deploy do conteúdo do funil para o site do Netlify
  async deployFunnelContent(funnelId: string, siteId: string) {
    try {
      console.log(`[Netlify Service] Preparando deploy para o funil: ${funnelId}`);
      
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
        console.error(`[Netlify Service] Erro ao buscar funil:`, funnelError);
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
      
      // 3. Salvar o HTML em um arquivo temporário
      const tempDir = path.join(__dirname, 'temp');
      const tempFile = path.join(tempDir, 'index.html');
      
      try {
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempFile, funnelHtml);
      } catch (fsError) {
        console.error(`[Netlify Service] Erro ao criar arquivo temporário:`, fsError);
        return {
          success: false,
          error: 'Erro ao criar arquivo para deploy'
        };
      }
      
      // 4. Preparar dados para upload
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempFile), {
        filename: 'index.html',
        contentType: 'text/html'
      });
      
      // 5. Fazer deploy para o Netlify
      const deployUrl = `${NETLIFY_API_URL}/sites/${siteId}/deploys`;
      
      const deployResponse = await axios.post(
        deployUrl, 
        formData,
        { 
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${NETLIFY_API_TOKEN}`
          }
        }
      );
      
      console.log(`[Netlify Service] Deploy realizado:`, deployResponse.data);
      
      // 6. Limpar arquivos temporários
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupError) {
        console.error(`[Netlify Service] Erro ao limpar arquivo temporário:`, cleanupError);
      }
      
      return {
        success: true,
        deployment: deployResponse.data
      };
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao fazer deploy:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
  
  // Verificar disponibilidade e status de um domínio
  async checkDomain(domain: string) {
    try {
      console.log(`[Netlify Service] Verificando domínio: ${domain}`);
      
      // Verificação básica de formato
      if (!domain.includes('.')) {
        return {
          verified: false,
          message: 'O domínio precisa incluir pelo menos um ponto (exemplo: meudominio.com)'
        };
      }
      
      // Verificar se o domínio já está sendo usado em algum site do Netlify
      let checkUrl = `${NETLIFY_API_URL}/domains/${domain}`;
      
      if (NETLIFY_TEAM_ID) {
        checkUrl += `?teamId=${NETLIFY_TEAM_ID}`;
      }
      
      try {
        const response = await axios.get(checkUrl, { headers: getAuthHeaders() });
        
        console.log(`[Netlify Service] Informações do domínio:`, response.data);
        
        return {
          exists: true,
          verified: !!response.data.verified,
          data: response.data,
          dnsInstructions: getDnsInstructions(domain, response.data.site_domain || 'site.netlify.app')
        };
      } catch (error: any) {
        // Se receber 404, o domínio está disponível
        if (error.response?.status === 404) {
          console.log(`[Netlify Service] Domínio disponível para uso`);
          return {
            exists: false,
            verified: false,
            dnsInstructions: getDnsInstructions(domain, 'site.netlify.app')
          };
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao verificar domínio:`, error.response?.data || error.message);
      
      return {
        exists: false,
        verified: false,
        error: error.response?.data?.message || error.message,
        dnsInstructions: getDnsInstructions(domain, 'site.netlify.app')
      };
    }
  },
  
  // Buscar sites associados a um funil
  async getFunnelSite(funnelId: string) {
    try {
      // 1. Buscar ID do site no Supabase
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select('netlify_site_id, netlify_url, custom_domain')
        .eq('id', funnelId)
        .single();
      
      if (funnelError || !funnel) {
        console.error(`[Netlify Service] Erro ao buscar funil:`, funnelError);
        return {
          success: false,
          error: 'Funil não encontrado'
        };
      }
      
      // Se o funil não tiver site no Netlify, criar um
      if (!funnel.netlify_site_id) {
        return {
          success: false,
          error: 'Funil não tem site no Netlify',
          needsCreation: true
        };
      }
      
      // 2. Buscar detalhes do site no Netlify
      const siteUrl = `${NETLIFY_API_URL}/sites/${funnel.netlify_site_id}`;
      
      try {
        const response = await axios.get(siteUrl, { headers: getAuthHeaders() });
        
        console.log(`[Netlify Service] Detalhes do site:`, response.data);
        
        return {
          success: true,
          site: response.data,
          funnelInfo: funnel
        };
      } catch (error: any) {
        // Se o site não existir mais no Netlify, limpar referência no banco
        if (error.response?.status === 404) {
          console.log(`[Netlify Service] Site não encontrado no Netlify, limpando referência`);
          
          await supabase
            .from('funnels')
            .update({ 
              netlify_site_id: null,
              netlify_url: null
            })
            .eq('id', funnelId);
          
          return {
            success: false,
            error: 'Site não existe mais no Netlify',
            needsCreation: true
          };
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao buscar site do funil:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
  
  // Configurar um domínio personalizado para um site existente no Netlify
  async configureDomain(siteId: string, domain: string) {
    try {
      console.log(`[Netlify Service] Configurando domínio ${domain} para o site ${siteId}`);
      
      // 1. Verificar se o domínio já está em uso
      const domainCheck = await this.checkDomain(domain);
      
      // Se o domínio já estiver em uso, verificar se é no mesmo site
      if (domainCheck.exists && domainCheck.data?.site_id && domainCheck.data.site_id !== siteId) {
        return {
          success: false,
          error: 'Este domínio já está sendo usado em outro site'
        };
      }
      
      // 2. Adicionar domínio ao site
      const domainUrl = `${NETLIFY_API_URL}/sites/${siteId}/domains`;
      
      const response = await axios.post(
        domainUrl, 
        { hostname: domain }, 
        { headers: getAuthHeaders() }
      );
      
      console.log(`[Netlify Service] Domínio adicionado:`, response.data);
      
      // 3. Provocar renovação de certificado SSL
      try {
        await this.renewCertificate(siteId);
      } catch (sslError) {
        console.warn(`[Netlify Service] Aviso ao renovar certificado:`, sslError);
        // Continuar mesmo com erro no SSL
      }
      
      // 4. Obter informações de site para instruções DNS
      const siteInfo = await axios.get(
        `${NETLIFY_API_URL}/sites/${siteId}`,
        { headers: getAuthHeaders() }
      );
      
      const siteDomain = siteInfo.data.ssl_url || siteInfo.data.url;
      const netlifyDomain = siteDomain.replace('https://', '').replace('http://', '');
      
      return {
        success: true,
        data: response.data,
        site: siteInfo.data,
        dnsInstructions: getDnsInstructions(domain, netlifyDomain)
      };
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao configurar domínio:`, error.response?.data || error.message);
      
      // Se o erro for por que o domínio já existe, tentar obter informações
      if (error.response?.status === 422 && error.response?.data?.message?.includes('already exists')) {
        try {
          // Obter informações do site
          const siteInfo = await axios.get(
            `${NETLIFY_API_URL}/sites/${siteId}`,
            { headers: getAuthHeaders() }
          );
          
          const siteDomain = siteInfo.data.ssl_url || siteInfo.data.url;
          const netlifyDomain = siteDomain.replace('https://', '').replace('http://', '');
          
          return {
            success: true,
            alreadyExists: true,
            message: 'Domínio já existe e está configurado para este site',
            dnsInstructions: getDnsInstructions(domain, netlifyDomain)
          };
        } catch (infoError) {
          console.error(`[Netlify Service] Erro ao obter informações do site:`, infoError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
  
  // Renovar certificado SSL para um site
  async renewCertificate(siteId: string) {
    try {
      console.log(`[Netlify Service] Renovando certificado para o site: ${siteId}`);
      
      const renewUrl = `${NETLIFY_API_URL}/sites/${siteId}/ssl`;
      
      const response = await axios.post(
        renewUrl, 
        {}, 
        { headers: getAuthHeaders() }
      );
      
      console.log(`[Netlify Service] Certificado renovado:`, response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao renovar certificado:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
  
  // Remover um domínio de um site
  async removeDomain(siteId: string, domain: string) {
    try {
      console.log(`[Netlify Service] Removendo domínio ${domain} do site ${siteId}`);
      
      const domainUrl = `${NETLIFY_API_URL}/sites/${siteId}/domains/${domain}`;
      
      const response = await axios.delete(
        domainUrl, 
        { headers: getAuthHeaders() }
      );
      
      console.log(`[Netlify Service] Domínio removido`);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error(`[Netlify Service] Erro ao remover domínio:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};
