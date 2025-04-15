import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { auth } from '../middleware/auth';
import { User } from '@supabase/supabase-js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
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