import prisma from '../infra/prismaClient';
import type { Role } from '@prisma/client';
import { IdeaStatus } from '@prisma/client';
import type { HttpError } from './types';

export interface CreateIdeaInput {
  authorId: string;
  title: string;
  description: string;
  category: string;
}

export async function createIdea(input: CreateIdeaInput) {
  const { authorId, title, description, category } = input;
  if (!authorId) {
  const err = new Error('Unauthorized: missing authorId') as HttpError;
  err.status = 401;
  throw err;
  }
  if (!title || !description || !category) {
  const err = new Error('Validation failed: title, description, category are required') as HttpError;
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
  const err = new Error('Unauthorized') as HttpError;
  err.status = 401;
  throw err;
  }

  if (role === 'EVALUATOR') {
    return prisma.idea.findMany({
      include: { attachments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Default: SUBMITTER only sees own ideas (FR-011)
  return prisma.idea.findMany({
    where: { authorId: userId },
    include: { attachments: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getIdeaForUser(ideaId: string, userId: string, role: Role) {
  if (!ideaId) {
  const err = new Error('Validation failed: missing ideaId') as HttpError;
  err.status = 400;
  throw err;
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
  const err = new Error('Idea not found') as HttpError;
  err.status = 404;
  throw err;
  }

  if (role === 'EVALUATOR') {
    return idea;
  }

  if (idea.authorId !== userId) {
  const err = new Error('Forbidden') as HttpError;
  err.status = 403;
  throw err;
  }

  return idea;
}

export default { createIdea, listIdeasForUser, getIdeaForUser };
