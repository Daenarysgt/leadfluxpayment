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

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    console.log('🔒 Auth middleware:', { 
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader?.substring(0, 10) + '...',
      hasToken: !!token,
      tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none'
    });
    
    if (!token) {
      console.log('❌ Token não fornecido');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('❌ Erro de autenticação:', error);
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    console.log('✅ Usuário autenticado:', {
      userId: user.id,
      email: user.email
    });

    // Adiciona o usuário ao objeto da requisição usando nossa interface
    const requestUser: RequestUser = {
      id: user.id,
      email: user.email || '',
    };

    req.user = requestUser;
    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}; 