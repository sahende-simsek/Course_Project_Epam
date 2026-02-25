import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import { createIdea } from '../domain/ideaService';

function getUserIdFromAuth(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);
  try {
    const decoded: any = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
    return decoded?.sub ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { title, description, category } = body || {};

    const idea = await createIdea({
      authorId: userId,
      title,
      description,
      category,
    });

    return new Response(JSON.stringify(idea), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
