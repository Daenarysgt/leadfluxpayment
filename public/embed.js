// LeadFlux Embed Script
// Este script carrega e renderiza os funis do LeadFlux em domínios personalizados

(function() {
  // Configurações
  const API_BASE_URL = 'https://leadflux-digital.onrender.com/api';
  const APP_URL = 'https://leadflux.digital';
  
  // Carregar os estilos necessários
  function loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(link);
    
    // Estilos específicos do LeadFlux
    const style = document.createElement('style');
    style.textContent = `
      .leadflux-funnel {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      .leadflux-btn {
        transition: all 0.2s ease;
      }
      .leadflux-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Carregar os dados do funil da API
  async function loadFunnelData(funnelId) {
    try {
      // Primeiro, verificar se os dados já estão disponíveis na página
      if (window.FUNNEL_DATA) {
        console.log('Dados do funil encontrados na página', window.FUNNEL_DATA);
        return window.FUNNEL_DATA;
      }
      
      // Se não, buscar da API
      const response = await fetch(`${API_BASE_URL}/funnels/${funnelId}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar funil: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error);
      return null;
    }
  }
  
  // Renderizar o funil no elemento de destino
  function renderFunnel(container, funnelData) {
    if (!funnelData) {
      container.innerHTML = `
        <div class="p-6 bg-red-50 rounded-lg text-center">
          <h2 class="text-xl font-bold text-red-800 mb-2">Erro ao carregar o funil</h2>
          <p class="text-red-700">Não foi possível carregar os dados do funil.</p>
          <a href="${APP_URL}" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md">
            Acessar LeadFlux
          </a>
        </div>
      `;
      return;
    }
    
    // Iniciar com o primeiro step
    let currentStepIndex = 0;
    const steps = funnelData.steps || [];
    
    // Função para renderizar um step específico
    function renderStep(stepIndex) {
      const step = steps[stepIndex];
      if (!step) return;
      
      // Limpar o container
      container.innerHTML = '';
      
      // Criar elementos básicos
      const stepContainer = document.createElement('div');
      stepContainer.className = 'leadflux-funnel max-w-3xl mx-auto p-6 rounded-lg';
      stepContainer.style.backgroundColor = funnelData.settings?.backgroundColor || '#ffffff';
      
      // Renderizar elementos do passo
      if (step.canvasElements && step.canvasElements.length > 0) {
        // Renderizar elementos do canvas
        step.canvasElements.forEach(element => {
          const elementDiv = document.createElement('div');
          elementDiv.className = 'mb-6';
          
          switch(element.type) {
            case 'text':
              elementDiv.innerHTML = `<div class="text-lg" style="color: ${element.style?.color || '#000000'}">${element.content?.text || ''}</div>`;
              break;
            case 'button':
              const btn = document.createElement('button');
              btn.className = 'leadflux-btn px-6 py-3 rounded-md text-white font-medium';
              btn.style.backgroundColor = element.style?.backgroundColor || funnelData.settings?.primaryColor || '#0066ff';
              btn.textContent = element.content?.text || 'Continuar';
              btn.addEventListener('click', () => {
                if (currentStepIndex < steps.length - 1) {
                  currentStepIndex++;
                  renderStep(currentStepIndex);
                }
              });
              elementDiv.appendChild(btn);
              break;
            case 'image':
              elementDiv.innerHTML = `<img src="${element.content?.src}" alt="${element.content?.alt || ''}" class="max-w-full rounded-lg" />`;
              break;
            // Adicione mais tipos de elementos conforme necessário
            default:
              elementDiv.innerHTML = `<div>Elemento não suportado: ${element.type}</div>`;
          }
          
          stepContainer.appendChild(elementDiv);
        });
      } else {
        // Fallback para quando não há elementos do canvas
        stepContainer.innerHTML = `
          <h2 class="text-xl font-semibold mb-4">${step.title || 'Sem título'}</h2>
          <p class="mb-6">${step.description || ''}</p>
          <button class="leadflux-btn px-6 py-3 rounded-md text-white font-medium" 
                  style="background-color: ${funnelData.settings?.primaryColor || '#0066ff'}">
            Continuar
          </button>
        `;
        
        // Adicionar evento de clique ao botão
        const btn = stepContainer.querySelector('button');
        if (btn) {
          btn.addEventListener('click', () => {
            if (currentStepIndex < steps.length - 1) {
              currentStepIndex++;
              renderStep(currentStepIndex);
            }
          });
        }
      }
      
      // Adicionar barra de progresso se configurado
      if (funnelData.settings?.showProgressBar) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'h-full transition-all duration-500 ease-out';
        progressBar.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
        progressBar.style.backgroundColor = funnelData.settings?.primaryColor || '#0066ff';
        
        progressContainer.appendChild(progressBar);
        stepContainer.insertBefore(progressContainer, stepContainer.firstChild);
      }
      
      // Adicionar ao container principal
      container.appendChild(stepContainer);
    }
    
    // Renderizar o primeiro step
    renderStep(currentStepIndex);
  }
  
  // Função principal de inicialização
  async function init() {
    console.log('LeadFlux Embed Script iniciado');
    
    // Carregar estilos
    loadStyles();
    
    // Encontrar o container
    const container = document.getElementById('funnel-root');
    if (!container) {
      console.error('Elemento #funnel-root não encontrado na página');
      return;
    }
    
    // Obter ID do funil
    const funnelId = container.getAttribute('data-funnel-id');
    if (!funnelId) {
      console.error('Atributo data-funnel-id não encontrado no elemento #funnel-root');
      container.innerHTML = `
        <div class="p-6 bg-red-50 rounded-lg text-center">
          <h2 class="text-xl font-bold text-red-800 mb-2">Configuração incorreta</h2>
          <p class="text-red-700">ID do funil não especificado.</p>
        </div>
      `;
      return;
    }
    
    // Carregar e renderizar o funil
    const funnelData = await loadFunnelData(funnelId);
    renderFunnel(container, funnelData);
  }
  
  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 