import prisma from '../infra/prismaClient';
import getConfig from '../../config';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

export interface AttachmentRules {
  maxBytesPerFile?: number;
  maxAttachmentsPerIdea?: number;
}

export function getAttachmentRules(): AttachmentRules {
  const cfg = getConfig;
  return {
    maxBytesPerFile: cfg.MAX_ATTACHMENT_BYTES,
    maxAttachmentsPerIdea: cfg.MAX_ATTACHMENTS_PER_IDEA,
  };
}

function isAllowedExtension(filename: string): boolean {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return false;
  const ext = filename.slice(idx + 1).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

function buildError(message: string, status: number, code: string) {
  const err: any = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

export async function validateNewAttachmentForIdea(params: {
  ideaId: string;
  ownerUserId: string;
  filename: string;
  size: number;
}) {
  const { ideaId, ownerUserId, filename, size } = params;

  if (!ideaId || !ownerUserId || !filename || typeof size !== 'number') {
    throw buildError(
      'ideaId, ownerUserId, filename and size are required',
      400,
      'attachment_validation_error',
    );
  }

  if (!isAllowedExtension(filename)) {
    // FR-206: MIME / extension whitelist
    throw buildError(
      'Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed',
      415,
      'unsupported_media_type',
    );
  }

  const rules = getAttachmentRules();

  if (rules.maxBytesPerFile && size > rules.maxBytesPerFile) {
    throw buildError(
      'Attachment exceeds maximum allowed size',
      413,
      'attachment_size_exceeded',
    );
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw buildError('Idea not found', 404, 'idea_not_found');
  }
  if (idea.authorId !== ownerUserId) {
    throw buildError(
      'Only the submitter can attach files',
      403,
      'attachment_forbidden',
    );
  }

  if (rules.maxAttachmentsPerIdea && rules.maxAttachmentsPerIdea > 0) {
    const existing = await prisma.attachment.findMany({ where: { ideaId } });
    if (existing.length >= rules.maxAttachmentsPerIdea) {
      throw buildError(
        'Attachment limit exceeded for this idea',
        409,
        'attachment_limit',
      );
    }
  }
}

export async function createIdeaAttachmentFromBase64(params: {
  ideaId: string;
  ownerUserId: string;
  filename: string;
  mimetype?: string;
  size: number;
  contentBase64: string;
}) {
  const { ideaId, ownerUserId, filename, mimetype, size, contentBase64 } = params;

  await validateNewAttachmentForIdea({ ideaId, ownerUserId, filename, size });

  let content: Buffer;
  try {
    content = Buffer.from(contentBase64, 'base64');
  } catch {
    throw buildError('Invalid attachment content', 400, 'attachment_bad_content');
  }

  const created = await prisma.attachment.create({
    data: {
      ideaId,
      filename,
      url: '',
      mimetype: mimetype || 'application/octet-stream',
      size,
      content,
    },
  });

  // For now, construct a simple localhost URL; callers may rewrite if needed.
  const publicUrl = `http://localhost:3000/api/attachments/${created.id}`;
  const attachment = await prisma.attachment.update({
    where: { id: created.id },
    data: { url: publicUrl },
  });

  // Basic logging hook for observability (T030)
  // eslint-disable-next-line no-console
  console.log('[attachmentService] attachment_created', {
    ideaId,
    attachmentId: attachment.id,
    size: attachment.size,
    mimetype: attachment.mimetype,
  });

  return attachment;
}

export async function removeIdeaAttachment(params: {
  ideaId: string;
  ownerUserId: string;
  attachmentId: string;
}) {
  const { ideaId, ownerUserId, attachmentId } = params;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw buildError('Idea not found', 404, 'idea_not_found');
  }
  if (idea.authorId !== ownerUserId) {
    throw buildError(
      'Only the submitter can remove attachments',
      403,
      'attachment_forbidden',
    );
  }

  const att = await prisma.attachment.findUnique({ where: { id: attachmentId } });
  if (!att || att.ideaId !== ideaId) {
    throw buildError(
      'Attachment not found on this idea',
      404,
      'attachment_not_found',
    );
  }

  await prisma.attachment.deleteMany({ where: { id: attachmentId, ideaId } });

  // eslint-disable-next-line no-console
  console.log('[attachmentService] attachment_deleted', {
    ideaId,
    attachmentId,
  });
}

export default {
  getAttachmentRules,
  validateNewAttachmentForIdea,
  createIdeaAttachmentFromBase64,
  removeIdeaAttachment,
};

