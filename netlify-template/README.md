# Template para Domínios Personalizados LeadFlux

Este é um template básico para o sistema de domínios personalizados do LeadFlux.

## Arquivos

- `index.html` - Página HTML básica que exibe um loader e carrega o script embed.js
- `embed.js` - Script que detecta o domínio e carrega o funil correspondente do LeadFlux

## Como funciona

Quando um usuário acessa um domínio personalizado, este template é servido pelo Netlify. O script embed.js faz uma requisição à API do LeadFlux para identificar qual funil deve ser carregado com base no domínio acessado.

## Configuração

Este template é apenas a base para o sistema de domínios personalizados. A configuração completa requer:

1. Uma conta no Netlify
2. Configuração da API do LeadFlux para gerenciar domínios
3. Integração entre o LeadFlux e o Netlify

## Suporte

Para mais informações, entre em contato com o suporte do LeadFlux. 