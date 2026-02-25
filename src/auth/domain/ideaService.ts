import prisma from '../infra/prismaClient';
import { IdeaStatus, Role } from '@prisma/client';

export interface CreateIdeaInput {
  authorId: string;
  title: string;
  description: string;
  category: string;
}

export async function createIdea(input: CreateIdeaInput) {
  const { authorId, title, description, category } = input;
  if (!authorId) {
    const err: any = new Error('Unauthorized: missing authorId');
    err.status = 401;
    throw err;
  }
  if (!title || !description || !category) {
    const err: any = new Error('Validation failed: title, description, category are required');
    err.status = 400;
    throw err;
  }

  const idea = await prisma.idea.create({
    data: {
      title,
      description,
      category,
      status: IdeaStatus.SUBMITTED,
      authorId,
    },
  });

  return idea;
}

export async function listIdeasForUser(userId: string, role: Role) {
  if (!userId) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  if (role === 'EVALUATOR') {
    return prisma.idea.findMany({
      include: { attachments: true, evaluations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Default: SUBMITTER only sees own ideas (FR-011)
  return prisma.idea.findMany({
    where: { authorId: userId },
    include: { attachments: true, evaluations: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getIdeaForUser(ideaId: string, userId: string, role: Role) {
  if (!ideaId) {
    const err: any = new Error('Validation failed: missing ideaId');
    err.status = 400;
    throw err;
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    const err: any = new Error('Idea not found');
    err.status = 404;
    throw err;
  }

  if (role === 'EVALUATOR') {
    return idea;
  }

  if (idea.authorId !== userId) {
    const err: any = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  return idea;
}

export default { createIdea, listIdeasForUser, getIdeaForUser };
