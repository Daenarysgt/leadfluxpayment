import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/setupSchema' // Importar o script de configuração do schema

// A configuração do banco agora será feita automaticamente via setupSchema.ts

// Script para aplicar transições suaves entre etapas do funil
// Este código será executado em todas as páginas, incluindo funis públicos
document.addEventListener('click', (event) => {
  // Procurar por botões que navegam entre etapas
  const target = event.target as HTMLElement;
  const isNavigationButton = 
    target.tagName === 'BUTTON' || 
    target.closest('button') || 
    target.closest('[role="button"]') ||
    target.closest('a') ||
    target.getAttribute('data-action') === 'next' ||
    target.getAttribute('data-action') === 'prev';
  
  // Verificar se o elemento está dentro de um funil
  const inFunnel = 
    target.closest('[class*="funnel"]') || 
    target.closest('[class*="Funnel"]') ||
    target.closest('[class*="step"]') ||
    target.closest('[class*="Step"]') ||
    target.closest('[id*="funnel"]') ||
    target.closest('[id*="step"]');
  
  // Se for um botão de navegação dentro de um funil
  if (isNavigationButton && inFunnel) {
    // Aplicar transição suave
    document.body.classList.add('page-transitioning');
    
    // Remover classe após transição (delayada)
    setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 400); // Tempo suficiente para a transição ocorrer
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
