import prisma from '../infra/prismaClient';

export async function listReviewStages() {
  return prisma.reviewStage.findMany({
    orderBy: { orderIndex: 'asc' },
  });
}

export async function addStageReview(params: {
  ideaId: string;
  stageId: string;
  evaluatorUserId: string;
  decision: 'ADVANCE' | 'HOLD' | 'REJECT';
  comments?: string;
  scoreOverall?: number;
}) {
  const { ideaId, stageId, evaluatorUserId, decision, comments, scoreOverall } = params;

  return prisma.stageReview.create({
    data: {
      ideaId,
      stageId,
      evaluatorUserId,
      decision,
      comments,
      scoreOverall,
    },
  });
}
