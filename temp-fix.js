// Salve este arquivo como temp-fix.js
// Este é um script temporário para forçar o funcionamento do domínio personalizado

console.log('Iniciando configuração de domínio personalizado');

// Substitua estes valores pelos seus
const funnelId = '3c333232-5cf1-4c4a-a549-43aedd54b005'; // ID do seu funil (da URL)
const customDomain = 'fluxlead.site'; // Seu domínio personalizado

async function configureDomain() {
  try {
    // Configurar o domínio personalizado
    console.log(`Configurando domínio ${customDomain} para o funil ${funnelId}...`);
    
    // Passo 1: Verificar acesso ao backend
    const baseUrl = 'https://leadflux-digital.onrender.com/api';
    
    // Passo 2: Tentar forçar a configuração do domínio
    console.log('Forçando configuração do domínio...');
    const configResponse = await fetch(`${baseUrl}/domains/configure-hosting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: customDomain,
        funnelId: funnelId
      })
    });
    
    const configData = await configResponse.json();
    console.log('Resposta da configuração:', configData);
    
    // Passo 3: Forçar renovação de certificado
    console.log('Solicitando renovação de certificado SSL...');
    const sslResponse = await fetch(`${baseUrl}/domains/renew-certificate/${customDomain}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const sslData = await sslResponse.json();
    console.log('Resposta da renovação de SSL:', sslData);
    
    console.log('Configuração completa!');
    console.log('Aguarde alguns minutos (5-15) para os certificados SSL serem emitidos pela Vercel');
    console.log(`Em seguida, tente acessar seu domínio: https://${customDomain}`);
    
  } catch (error) {
    console.error('Erro durante a configuração:', error);
  }
}

configureDomain();

/*
  INSTRUÇÕES:
  
  1. Abra o console do navegador nas ferramentas de desenvolvimento (F12 ou Ctrl+Shift+I)
  2. Cole o conteúdo deste arquivo no console e pressione Enter
  3. Aguarde a execução completa do script
  4. Aguarde 5-15 minutos para a propagação dos certificados SSL
  5. Tente acessar seu domínio personalizado: https://fluxlead.site
  
  Se ainda tiver problemas após 15 minutos, pode ser necessário verificar a configuração 
  DNS do seu domínio, garantindo que os registros A estão configurados corretamente:
  
  - Tipo: A, Nome: @, Valor: 76.76.21.21
  - Tipo: A, Nome: @, Valor: 76.76.21.98
*/ 