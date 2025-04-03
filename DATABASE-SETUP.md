# Configuração do Banco de Dados para LeadFlux

Este documento explica como configurar corretamente o banco de dados para o LeadFlux, garantindo que todas as tabelas e colunas necessárias estejam presentes.

## Problema: Perda de Dados entre Diferentes Localhost

Se você está enfrentando problemas onde o sistema não salva os elementos do canvas entre diferentes instâncias do localhost (por exemplo, salvando em localhost:8093 mas não disponível em localhost:8094), o problema está relacionado à estrutura do banco de dados no Supabase.

O erro principal ocorre porque a tabela `steps` no banco de dados não possui algumas colunas esperadas pelo código, como `buttonText`, `backButtonText`, `showProgressBar` e `canvasElements`.

## Solução 1: Executar o Script SQL

A maneira mais simples de resolver este problema é executar o script SQL fornecido:

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Entre no seu projeto
3. Vá para a seção "SQL Editor"
4. Crie um novo Query e cole o conteúdo do arquivo `sql/setup.sql`
5. Execute o script

O script irá:
- Criar a função `execute_sql` para permitir comandos SQL dinâmicos
- Garantir que a extensão `uuid-ossp` esteja instalada
- Criar a tabela `steps` se não existir
- Adicionar todas as colunas necessárias à tabela `steps`

## Solução 2: Configuração Automática

Ao iniciar a aplicação, um mecanismo de configuração automática tentará detectar e corrigir problemas no schema do banco de dados. Esta abordagem:

1. Verifica se a tabela `steps` existe
2. Verifica se as colunas necessárias estão presentes
3. Tenta criar uma função SQL para adicionar colunas ausentes
4. Se não for possível, implementa um adaptador para compatibilidade

A configuração automática já está ativa e funciona nos bastidores, mas é menos confiável que executar o script SQL diretamente.

## Verificação Manual das Colunas

Se quiser verificar manualmente se o banco de dados está configurado corretamente:

1. Acesse o dashboard do Supabase
2. Entre no seu projeto
3. Vá para a seção "Table Editor"
4. Selecione a tabela "steps"
5. Verifique se as seguintes colunas existem:
   - `id` (UUID, primary key)
   - `funnel_id` (UUID, referência à tabela funnels)
   - `title` (TEXT)
   - `button_text` (TEXT) ou `buttonText` (TEXT)
   - `back_button_text` (TEXT) ou `backButtonText` (TEXT)
   - `show_progress_bar` (BOOLEAN) ou `showProgressBar` (BOOLEAN)
   - `canvas_elements` (JSONB) ou `canvasElements` (JSONB)
   - `order_index` (INTEGER)
   - `created_at` (TIMESTAMP WITH TIME ZONE)
   - `updated_at` (TIMESTAMP WITH TIME ZONE)

## Nomenclatura de Colunas

Observe que o Supabase pode usar convenções diferentes para nomes de colunas:

- Convenção snake_case: `button_text`, `back_button_text`, `show_progress_bar`, `canvas_elements`
- Convenção camelCase: `buttonText`, `backButtonText`, `showProgressBar`, `canvasElements`

O adaptador implementado tentará detectar automaticamente qual convenção está sendo usada no seu banco de dados.

## Problemas Conhecidos

Se você ainda encontrar problemas após executar o script SQL:

1. **Erro de Permissão**: Pode ser necessário ajustar as políticas de segurança (RLS) para permitir operações na tabela `steps`
2. **Erro de Schema Cache**: Tente limpar o cache do navegador ou usar a função `clearCache()` disponível na aplicação
3. **Erro de Referência**: Certifique-se de que a tabela `funnels` existe antes de criar/modificar a tabela `steps`

---

Para obter ajuda adicional, entre em contato com a equipe de suporte do LeadFlux. 