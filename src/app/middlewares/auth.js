import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeaders.split(' ');

  try {
    const decodedToken = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decodedToken.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid!' });
  }
};
