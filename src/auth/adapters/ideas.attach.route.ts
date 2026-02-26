import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import prisma from '../infra/prismaClient';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

function isAllowedFilename(name: string): boolean {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return false;
  const ext = name.slice(idx + 1).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

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

    if (!isAllowedFilename(filename)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'unsupported_media_type',
            message: 'Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed',
          },
        }),
        {
          status: 415,
          headers: { 'Content-Type': 'application/json' },
        },
      );
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

    // Enforce single-attachment policy: only one attachment per idea
    const existingAttachments = await (prisma as any).attachment.findMany({ where: { ideaId } });
    if (existingAttachments && existingAttachments.length > 0) {
      return new Response(
        JSON.stringify({ error: { code: 'attachment_limit', message: 'At most one attachment can be uploaded for an idea' } }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

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
