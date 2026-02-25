import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import { evaluateIdea } from '../domain/evaluationService';

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
    const evaluatorId = getUserIdFromAuth(req);
    if (!evaluatorId) {
      return new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { ideaId, decision, comments } = body || {};

    if (!ideaId || !decision || !comments) {
      return new Response(JSON.stringify({ error: { code: 'validation_error', message: 'ideaId, decision and comments are required' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!(decision === 'ACCEPTED' || decision === 'REJECTED')) {
      return new Response(JSON.stringify({ error: { code: 'validation_error', message: 'decision must be ACCEPTED or REJECTED' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await evaluateIdea({
      ideaId,
      evaluatorId,
      decision: decision as 'ACCEPTED' | 'REJECTED',
      comments,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
