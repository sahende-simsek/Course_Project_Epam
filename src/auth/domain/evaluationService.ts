import prisma from '../infra/prismaClient';
import { IdeaStatus } from '@prisma/client';
import type { HttpError } from './types';

export interface EvaluateIdeaInput {
  ideaId: string;
  evaluatorId: string;
  decision: 'ACCEPTED' | 'REJECTED';
  comments: string;
}

export async function evaluateIdea(input: EvaluateIdeaInput) {
  const { ideaId, evaluatorId, decision, comments } = input;

  if (!ideaId || !evaluatorId || !decision || !comments) {
  const err = new Error('Validation failed: ideaId, evaluatorId, decision and comments are required') as HttpError;
  err.status = 400;
  throw err;
  }

  const evaluator = await prisma.user.findUnique({ where: { id: evaluatorId } });
  if (!evaluator) {
  const err = new Error('Unauthorized: evaluator not found') as HttpError;
  err.status = 401;
  throw err;
  }

  if (evaluator.role !== 'EVALUATOR') {
  const err = new Error('Forbidden: only evaluator/admin can evaluate ideas') as HttpError;
  err.status = 403;
  throw err;
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
  const err = new Error('Idea not found') as HttpError;
  err.status = 404;
  throw err;
  }

  // Prevent re-evaluation once a final decision has been made.
  if (idea.status === IdeaStatus.ACCEPTED || idea.status === IdeaStatus.REJECTED) {
  const err = new Error('Idea has already been evaluated') as HttpError;
  err.status = 409;
  throw err;
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      ideaId,
      evaluatorId,
      comments,
      decision,
    },
  });

  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: decision },
  });

  return { ideaId, evaluation };
}

export default { evaluateIdea };
