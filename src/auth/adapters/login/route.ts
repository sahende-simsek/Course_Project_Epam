import { verifyCredentials } from '../../domain/authService';
import { generateAccessToken } from '../../domain/tokenService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const user = await verifyCredentials(email, password);
    const { token, expiresIn } = generateAccessToken(user as any);

    // Placeholder refresh cookie — real refresh flow implemented in Phase 6.
    const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toUTCString();
    const cookie = `refresh=placeholder; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expires}`;

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
