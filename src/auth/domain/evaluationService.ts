import prisma from '../infra/prismaClient';
import { IdeaStatus } from '@prisma/client';

export interface EvaluateIdeaInput {
  ideaId: string;
  evaluatorId: string;
  decision: 'ACCEPTED' | 'REJECTED';
  comments: string;
}

export async function evaluateIdea(input: EvaluateIdeaInput) {
  const { ideaId, evaluatorId, decision, comments } = input;

  if (!ideaId || !evaluatorId || !decision || !comments) {
    const err: any = new Error('Validation failed: ideaId, evaluatorId, decision and comments are required');
    err.status = 400;
    throw err;
  }

  const evaluator = await prisma.user.findUnique({ where: { id: evaluatorId } });
  if (!evaluator) {
    const err: any = new Error('Unauthorized: evaluator not found');
    err.status = 401;
    throw err;
  }

  if (evaluator.role !== 'EVALUATOR') {
    const err: any = new Error('Forbidden: only evaluator/admin can evaluate ideas');
    err.status = 403;
    throw err;
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    const err: any = new Error('Idea not found');
    err.status = 404;
    throw err;
  }

  // Prevent re-evaluation once a final decision has been made.
  if (idea.status === IdeaStatus.ACCEPTED || idea.status === IdeaStatus.REJECTED) {
    const err: any = new Error('Idea has already been evaluated');
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
