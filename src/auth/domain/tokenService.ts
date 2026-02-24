import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import getConfig from '../../config';

const ACCESS_TTL_SECONDS = 3600; // 1 hour

export function generateAccessToken(user: { id: string; email?: string }) {
  const secret = getConfig.JWT_SECRET || 'dev-secret';
  const jti = randomUUID();
  const payload = { sub: user.id, email: user.email };
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: ACCESS_TTL_SECONDS,
    jwtid: jti,
  });
  return { token, expiresIn: ACCESS_TTL_SECONDS };
}

export default { generateAccessToken };
