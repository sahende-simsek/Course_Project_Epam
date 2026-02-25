import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import prisma from '../infra/prismaClient';
import { listIdeasForUser, getIdeaForUser } from '../domain/ideaService';
import type { Role } from '@prisma/client';
import type { AuthTokenPayload, HttpError } from '../domain/types';

function getUserIdFromAuth(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);
  try {
	const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret') as AuthTokenPayload;
	return decoded.sub ?? null;
  } catch {
    return null;
  }
}

async function getUserRole(userId: string): Promise<Role | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return (user?.role as Role) ?? null;
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const role = await getUserRole(userId);
    if (!role) {
      return new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'User not found' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const ideaId = url.searchParams.get('id');

    if (ideaId) {
      const idea = await getIdeaForUser(ideaId, userId, role);
      return new Response(JSON.stringify(idea), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ideas = await listIdeasForUser(userId, role);
    return new Response(JSON.stringify(ideas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
  const error = err as HttpError;
  const status = error.status || 400;
  const payload = { error: { code: String(error.code || 'error'), message: error.message || 'Bad Request' } };
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
