import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/setupSchema' // Importar o script de configuração do schema

// Script para corrigir problemas de renderização em dispositivos móveis
const fixMobileRenderingIssues = () => {
  // Verificar se é um dispositivo móvel
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;
  
  // Função para remover transformações e outros estilos problemáticos
  const applyFixes = () => {
    // Correção para elementos principais do viewport
    document.documentElement.style.zoom = '1';
    document.documentElement.style.transform = 'none';
    document.documentElement.style.webkitTransform = 'none';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.perspective = 'none';
    document.documentElement.style.webkitPerspective = 'none';
    
    document.body.style.zoom = '1';
    document.body.style.transform = 'none';
    document.body.style.webkitTransform = 'none';
    document.body.style.overflowX = 'hidden';
    document.body.style.perspective = 'none';
    document.body.style.webkitPerspective = 'none';
    
    // Adicionar uma classe global para debugging
    document.body.classList.add('mobile-fixes-applied');
    
    console.log('✅ Correções de renderização para mobile aplicadas');
  };
  
  // Aplicar as correções imediatamente
  applyFixes();
  
  // E também após o carregamento completo da página
  window.addEventListener('load', applyFixes);
  
  // E após qualquer alteração de tamanho
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      applyFixes();
    }
  });
};

// Executar a função imediatamente
fixMobileRenderingIssues();

// A configuração do banco agora será feita automaticamente via setupSchema.ts
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
