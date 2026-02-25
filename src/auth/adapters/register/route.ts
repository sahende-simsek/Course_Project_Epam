import { createUser } from '../../domain/userService';
import type { HttpError } from '../../domain/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const user = await createUser(email, password);
    return new Response(JSON.stringify(user), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const error = err as HttpError;
    const status = error.status || 400;
    const payload = { error: { code: String(error.code || 'error'), message: error.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
