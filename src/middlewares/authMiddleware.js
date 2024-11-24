import createHttpError from 'http-errors';
import { Session } from '../db/models/session.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Access token is missing');
    }

    const accessToken = authHeader.split(' ')[1];

    const session = await Session.findOne({
      accessToken,
      accessTokenValidUntil: { $gt: new Date() },
    });

    if (!session) {
      throw createHttpError(401, 'Invalid or expired access token');
    }

    req.user = session.userId; // Передаємо користувача в `req`
    next();
  } catch (error) {
    next(error);
  }
};
