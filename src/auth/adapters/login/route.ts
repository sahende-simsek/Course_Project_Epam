import { verifyCredentials } from '../../domain/authService';
import { generateAccessToken } from '../../domain/tokenService';
import { issueRefreshTokenForUser } from '../../domain/refreshService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const user = await verifyCredentials(email, password);
    const { token, expiresIn } = generateAccessToken(user as any);

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';

    const refresh = await issueRefreshTokenForUser((user as any).id, ip as string, ua as string);
    const expires = new Date(refresh.expiresAt).toUTCString();
    const cookie = `refresh=${refresh.tokenId}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expires}`;

    return new Response(JSON.stringify({ accessToken: token, expiresIn }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
