import { revokeAllRefreshTokensForUser } from '../../domain/refreshService';
import jwt from 'jsonwebtoken';
import getConfig from '../../../config';

function parseCookie(header: string | null): Record<string,string> {
  if (!header) return {};
  return header.split(';').map(p => p.trim()).reduce((acc, part) => {
    const [k,v] = part.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string,string>);
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie');

    let userId: string | undefined;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice('Bearer '.length);
      try {
        const decoded: any = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded?.sub;
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
  } catch (err: any) {
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
