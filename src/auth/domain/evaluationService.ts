import prisma from '../infra/prismaClient';

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
