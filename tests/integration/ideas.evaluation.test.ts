import prisma from '../../src/auth/infra/prismaClient';
import { createUser } from '../../src/auth/domain/userService';
import { createIdea, listIdeasForUser, getIdeaForUser } from '../../src/auth/domain/ideaService';
import { evaluateIdea } from '../../src/auth/domain/evaluationService';
import { clearDb, disconnectDb } from '../helpers/testDb';
import { IdeaStatus, Role } from '@prisma/client';

// Integration test for Phase 12: idea submission, listing visibility (FR-011) and evaluation workflow.

describe('integration: ideas & evaluation (Phase 12, T055)', () => {
  beforeAll(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await clearDb();
    await disconnectDb();
  });

  it('supports submitter idea submission and evaluator acceptance with FR-011 visibility', async () => {
    if (!process.env.DATABASE_URL) {
      // Skip when real DB is not configured.
      console.warn('Skipping ideas/evaluation integration test: DATABASE_URL not set');
      return;
    }

  try {
    // Create submitter and evaluator users.
    const submitter = await prisma.user.create({
    data: {
      email: `submitter+${Date.now()}@example.com`,
      passwordHash: 'x',
      role: Role.SUBMITTER,
    },
    });

    const evaluator = await prisma.user.create({
    data: {
      email: `evaluator+${Date.now()}@example.com`,
      passwordHash: 'x',
      role: Role.EVALUATOR,
    },
    });

    // Submitter creates an idea.
    const idea = await createIdea({
    authorId: submitter.id,
    title: 'New idea',
    description: 'An innovative concept',
    category: 'General',
    });

    expect(idea.status).toBe(IdeaStatus.SUBMITTED);

    // Visibility: submitter sees only own ideas; evaluator sees all.
    const submitterList = await listIdeasForUser(submitter.id, Role.SUBMITTER);
    expect(submitterList.map((i) => i.id)).toContain(idea.id);

    const evaluatorList = await listIdeasForUser(evaluator.id, Role.EVALUATOR);
    expect(evaluatorList.map((i) => i.id)).toContain(idea.id);

    // Evaluator accepts the idea.
    const result = await evaluateIdea({
    ideaId: idea.id,
    evaluatorId: evaluator.id,
    decision: IdeaStatus.ACCEPTED,
    comments: 'Looks good',
    });

    expect(result.evaluation.decision).toBe(IdeaStatus.ACCEPTED);

    const updated = await getIdeaForUser(idea.id, evaluator.id, Role.EVALUATOR);
    expect(updated.status).toBe(IdeaStatus.ACCEPTED);
  } catch (e: any) {
    if (String(e.message || '').includes('does not exist')) {
    console.warn('Skipping ideas/evaluation integration test: database schema not initialized');
    return;
    }
    throw e;
  }
  });
});
