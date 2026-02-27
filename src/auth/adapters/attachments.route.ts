import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import { createIdeaAttachmentFromBase64, removeIdeaAttachment } from '../domain/attachmentService';

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
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // Expect /api/ideas/:id/attachments
    const ideaIdFromPath = pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'ideas'
      ? pathParts[2]
      : null;

    const body = await req.json();
    const {
      ideaId = ideaIdFromPath,
      filename,
      contentBase64,
      mimetype,
      size,
    } = body || {};

    if (!ideaId || !filename || !contentBase64 || typeof size !== 'number') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'validation_error',
            message: 'ideaId, filename, contentBase64 and size are required',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const attachment = await createIdeaAttachmentFromBase64({
      ideaId,
      ownerUserId: userId,
      filename,
      mimetype,
      size,
      contentBase64,
    });

    return new Response(JSON.stringify(attachment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const code = String(err?.code || 'error');
    const message = err?.message || 'Bad Request';
    return new Response(
      JSON.stringify({ error: { code, message } }),
      { status, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // Expect /api/ideas/:ideaId/attachments/:attachmentId
    const [, , ideaId, , attachmentId] = pathParts;

    if (!ideaId || !attachmentId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'validation_error',
            message: 'ideaId and attachmentId are required in path',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    await removeIdeaAttachment({
      ideaId,
      ownerUserId: userId,
      attachmentId,
    });

    return new Response(null, {
      status: 204,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const code = String(err?.code || 'error');
    const message = err?.message || 'Bad Request';
    return new Response(
      JSON.stringify({ error: { code, message } }),
      { status, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

