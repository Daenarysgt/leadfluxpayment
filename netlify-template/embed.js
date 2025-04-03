// Script para carregar dinamicamente o funil do LeadFlux
(function() {
  // Função para extrair parâmetros da URL
  function getQueryParams() {
    const params = {};
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return params;
  }

  // Função para carregar o funil
  async function loadFunnel() {
    try {
      // Obter o nome do domínio atual
      const domain = window.location.hostname;
      
      // API para buscar informações do funil baseado no domínio
      const response = await fetch(`https://api.leadflux.app/api/custom-domains/funnel?domain=${domain}`);
      
      if (!response.ok) {
        throw new Error('Não foi possível carregar o funil');
      }
      
      const data = await response.json();
      
      if (!data || !data.funnelId) {
        throw new Error('Funil não encontrado');
      }
      
      // Carregar o funil dinamicamente
      loadFunnelContent(data.funnelId, data.pageSlug);
      
    } catch (error) {
      console.error('Erro ao carregar o funil:', error);
      displayError('Não foi possível carregar o funil. Por favor, tente novamente mais tarde.');
    }
  }

  // Função para carregar o conteúdo do funil
  function loadFunnelContent(funnelId, pageSlug) {
    // Aqui você pode carregar o conteúdo do funil usando a API do LeadFlux
    // Por exemplo, redirecionando para a URL do funil ou carregando via iframe
    
    // Opção 1: Redirecionar para o funil na plataforma LeadFlux
    window.location.href = `https://app.leadflux.app/f/${funnelId}/${pageSlug || ''}`;
    
    // Opção 2: Carregar via iframe
    /*
    const iframe = document.createElement('iframe');
    iframe.src = `https://app.leadflux.app/f/${funnelId}/${pageSlug || ''}`;
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    
    document.getElementById('root').innerHTML = '';
    document.getElementById('root').appendChild(iframe);
    */
  }

  // Função para exibir mensagem de erro
  function displayError(message) {
    const errorElement = document.createElement('div');
    errorElement.style.textAlign = 'center';
    errorElement.style.padding = '20px';
    errorElement.style.color = '#721c24';
    errorElement.style.backgroundColor = '#f8d7da';
    errorElement.style.border = '1px solid #f5c6cb';
    errorElement.style.borderRadius = '4px';
    errorElement.style.margin = '20px';
    errorElement.innerText = message;
    
    document.getElementById('root').innerHTML = '';
    document.getElementById('root').appendChild(errorElement);
  }

  // Iniciar o carregamento quando a página estiver pronta
  document.addEventListener('DOMContentLoaded', loadFunnel);
})(); 