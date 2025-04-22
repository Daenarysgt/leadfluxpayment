import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Interface para o usuário na requisição
interface RequestUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const paymentAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Erro de autenticação:', error);
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    // Adiciona o usuário ao objeto da requisição sem verificar assinatura
    const requestUser: RequestUser = {
      id: user.id,
      email: user.email || '',
    };

    req.user = requestUser;
    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação para pagamento:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}; 