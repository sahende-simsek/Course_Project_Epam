import { createUser } from '../../domain/userService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const user = await createUser(email, password);
    return new Response(JSON.stringify(user), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
