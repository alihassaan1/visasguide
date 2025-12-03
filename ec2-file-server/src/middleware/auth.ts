import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const serverSecret = process.env.FILE_SERVER_SECRET;

  if (!serverSecret) {
    logger.error('FILE_SERVER_SECRET not configured');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid authorization header');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  
  if (token !== serverSecret) {
    logger.warn('Invalid authentication token');
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
