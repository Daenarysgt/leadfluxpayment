import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { auth } from '../middleware/auth';
import { PLAN_LIMITS } from '../config/plans';

// Interface para o usuário na requisição
interface RequestUser {
  id: string;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser;
  }
}

const router = Router();

// Listar funis do usuário
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    next(err);
  }
});

// Criar novo funil
router.post('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // 1. Buscar assinatura ativa do usuário
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();
    
    // Se houve erro (diferente de não encontrado), reportar
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Erro ao verificar assinatura:', subscriptionError);
      return res.status(500).json({ error: 'Erro ao verificar assinatura' });
    }
    
    // Definir plano padrão se não tiver assinatura ativa
    const planId = subscription?.plan_id || 'free';
    
    // 2. Obter limite máximo de funis para o plano
    const planLimits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
    const maxFunnels = planLimits.maxFunnels;
    
    // 3. Contar funis existentes do usuário
    const { count, error: countError } = await supabase
      .from('funnels')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);
    
    if (countError) {
      console.error('Erro ao contar funis:', countError);
      return res.status(500).json({ error: 'Erro ao verificar limite de funis' });
    }
    
    // 4. Verificar se atingiu o limite
    const currentCount = count || 0; // Garantir que count não seja null
    if (currentCount >= maxFunnels) {
      return res.status(403).json({ 
        error: 'Limite de funis atingido', 
        limit: maxFunnels,
        current: currentCount,
        planId
      });
    }

    const { name, description } = req.body;
    const { data, error } = await supabase
      .from('funnels')
      .insert([
        {
          name,
          description,
          user_id: req.user.id,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    next(err);
  }
});

// Rotas básicas para funis
router.get('/basic', (req, res) => {
  res.json({ message: 'Lista de funis' });
});

export default router; 