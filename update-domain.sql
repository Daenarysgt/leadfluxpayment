-- Script para adicionar domínio personalizado ao funil
UPDATE funnels 
SET custom_domain = 'fluxlead.site' 
WHERE id = '3c333232-5cf1-4c4a-a549-43aedd54b005';

-- Verificar se foi atualizado
SELECT id, name, custom_domain 
FROM funnels 
WHERE id = '3c333232-5cf1-4c4a-a549-43aedd54b005';