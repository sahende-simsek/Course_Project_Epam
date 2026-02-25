import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import prisma from '../infra/prismaClient';

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
    const { ideaId, filename, url, mimetype, size } = body || {};

    if (!ideaId || !filename || !url || !mimetype || typeof size !== 'number') {
      return new Response(JSON.stringify({ error: { code: 'validation_error', message: 'ideaId, filename, url, mimetype, size are required' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) {
      return new Response(JSON.stringify({ error: { code: 'not_found', message: 'Idea not found' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (idea.authorId !== userId) {
      return new Response(JSON.stringify({ error: { code: 'forbidden', message: 'Only the submitter can attach files' } }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Enforce single attachment per idea by deleting existing attachments first (MVP simplicity).
    await prisma.attachment.deleteMany({ where: { ideaId } });

    const attachment = await prisma.attachment.create({
      data: { ideaId, filename, url, mimetype, size },
    });

    return new Response(JSON.stringify(attachment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
