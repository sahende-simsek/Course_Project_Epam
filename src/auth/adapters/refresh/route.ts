import refreshService from '../../domain/refreshService';
import type { HttpError } from '../../domain/types';

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(p => p.split('=').map(s => s && s.trim())));
    const refreshToken = cookies['refresh'];
    if (!refreshToken) {
      return new Response(JSON.stringify({ error: { code: 'no_cookie', message: 'Missing refresh cookie' } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';

    const result = await refreshService.rotateRefreshToken(refreshToken, ip as string, ua as string);

    const expires = new Date(result.refresh.expiresAt).toUTCString();
    const cookie = `refresh=${result.refresh.tokenId}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expires}`;

    return new Response(JSON.stringify({ accessToken: result.access.token, expiresIn: result.access.expiresIn }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } });
  } catch (err: unknown) {
  const error = err as HttpError;
  const status = error.status || 400;
  const payload = { error: { code: String(error.code || 'error'), message: error.message || 'Bad Request' } };
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
