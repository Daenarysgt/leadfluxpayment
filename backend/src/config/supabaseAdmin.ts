import { createClient } from '@supabase/supabase-js';

// Client especial com service_role key para operações administrativas que precisam ignorar RLS
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // chave privada com permissão total
); 