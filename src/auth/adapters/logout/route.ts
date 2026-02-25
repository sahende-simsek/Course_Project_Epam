import { revokeAllRefreshTokensForUser } from '../../domain/refreshService';
import jwt from 'jsonwebtoken';
import getConfig from '../../../config';
import type { AuthTokenPayload, HttpError } from '../../domain/types';

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization');

    let userId: string | undefined;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice('Bearer '.length);
      try {
	const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret') as AuthTokenPayload;
	userId = decoded.sub;
      } catch (_) {
        // ignore invalid token
      }
    }

    if (userId) {
      await revokeAllRefreshTokensForUser(userId);
    }

    // Clear refresh cookie
    const expired = new Date(0).toUTCString();
    const clearCookie = `refresh=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expired}`;

    return new Response(null, { status: 204, headers: { 'Set-Cookie': clearCookie } });
  } catch (err: unknown) {
	const error = err as HttpError;
	const payload = { error: { code: String(error.code || 'error'), message: error.message || 'Bad Request' } };
	return new Response(JSON.stringify(payload), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
