import prisma from '../infra/prismaClient';
import { createIdea } from './ideaService';

export interface CreateDraftInput {
  ownerUserId: string;
  title: string;
  description: string;
  category: string;
  dynamicFieldValues: Record<string, unknown>;
}

export interface UpdateDraftInput {
  draftId: string;
  ownerUserId: string;
  title?: string;
  description?: string;
  category?: string;
  dynamicFieldValues?: Record<string, unknown>;
}

export async function createDraft(input: CreateDraftInput) {
  const { ownerUserId, title, description, category, dynamicFieldValues } = input;

  const draft = await prisma.draft.create({
    data: {
      ownerUserId,
      title,
      description,
      category,
      dynamicFieldValues,
      status: 'DRAFT',
    },
  });

  console.info('[drafts] created', { draftId: draft.id, ownerUserId });
  return draft;
}

export async function listDraftsForUser(ownerUserId: string) {
  return prisma.draft.findMany({
    where: { ownerUserId },
    include: { attachments: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getDraftForUser(draftId: string, ownerUserId: string) {
  return prisma.draft.findFirst({
    where: { id: draftId, ownerUserId },
    include: { attachments: true },
  });
}

export async function updateDraft(input: UpdateDraftInput) {
  const { draftId, ownerUserId, ...patch } = input;

  const draft = await prisma.draft.update({
    where: { id: draftId },
    data: {
      ...patch,
    },
  });

  console.info('[drafts] updated', { draftId, ownerUserId });
  return draft;
}

export async function deleteDraft(draftId: string, ownerUserId: string) {
  const existing = await prisma.draft.findFirst({ where: { id: draftId, ownerUserId } });
  if (!existing) {
    const err: any = new Error('Draft not found');
    err.status = 404;
    throw err;
  }

  await prisma.draftAttachment.deleteMany({ where: { draftId } });
  await prisma.draft.delete({ where: { id: draftId } });
  console.info('[drafts] deleted', { draftId, ownerUserId });
}

export interface SubmitDraftInput {
  draftId: string;
  ownerUserId: string;
}

export async function submitDraft(input: SubmitDraftInput) {
  const { draftId, ownerUserId } = input;

  const draft = await getDraftForUser(draftId, ownerUserId);
  if (!draft) {
    const err: any = new Error('Draft not found');
    err.status = 404;
    throw err;
  }

  if (!draft.title || !draft.description || !draft.category) {
    const err: any = new Error('Validation failed: title, description, category are required to submit draft');
    err.status = 400;
    throw err;
  }

  const idea = await createIdea({
    authorId: ownerUserId,
    title: draft.title,
    description: draft.description,
    category: draft.category,
  });

  // Transfer attachments from draft to idea
  if (draft.attachments && draft.attachments.length > 0) {
    for (const draftAttachment of draft.attachments) {
      const createdAttachment = await prisma.attachment.create({
        data: {
          ideaId: idea.id,
          filename: draftAttachment.filename,
          url: '',
          mimetype: draftAttachment.mimetype,
          size: draftAttachment.size,
          content: (draftAttachment as any).content,
        },
      });

      // Update URL with the new attachment ID
      const publicUrl = `http://localhost:3000/api/attachments/${createdAttachment.id}`;
      await prisma.attachment.update({
        where: { id: createdAttachment.id },
        data: { url: publicUrl },
      });
    }
  }

  // Delete draft attachments
  await prisma.draftAttachment.deleteMany({ where: { draftId } });

  // Delete the draft itself
  await prisma.draft.delete({ where: { id: draftId } });

  console.info('[drafts] submitted and deleted', { draftId, ownerUserId, ideaId: idea.id });
  return { draftId, idea };
}
