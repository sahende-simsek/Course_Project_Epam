describe('prismaClient in-memory branches', () => {
  beforeAll(() => {
    jest.resetModules();
    process.env.TEST_USE_INMEMORY = '1';
  });

  afterAll(() => {
    delete process.env.TEST_USE_INMEMORY;
    jest.resetModules();
  });

  it('exercises idea, attachment and evaluation branches', async () => {
    const mod = require('../../src/auth/infra/prismaClient');
    const prisma = mod.prisma as any;

    const user = await prisma.user.create({ data: { email: 'idea@example.com', passwordHash: 'h' } });
    const idea = await prisma.idea.create({
      data: { title: 't', description: 'd', category: 'c', authorId: user.id },
    });

    const att1 = await prisma.attachment.create({
      data: { ideaId: idea.id, filename: 'f1.txt', url: 'u1', mimetype: 'text/plain', size: 1 },
    });
    const att2 = await prisma.attachment.create({
      data: { ideaId: idea.id, filename: 'f2.txt', url: 'u2', mimetype: 'text/plain', size: 2 },
    });
    expect(att1).toHaveProperty('id');
    expect(att2).toHaveProperty('id');

    const listWithRelations = await prisma.idea.findMany({
      where: { authorId: user.id },
      include: { attachments: true, evaluations: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(listWithRelations[0].attachments.length).toBeGreaterThan(0);

    const singleWithRelations = await prisma.idea.findUnique({
      where: { id: idea.id },
      include: { attachments: true, evaluations: true },
    });
    expect(singleWithRelations.attachments.length).toBeGreaterThan(0);

    const attFound = await prisma.attachment.findUnique({ where: { id: att1.id }, include: { idea: true } });
    expect(attFound.idea.id).toBe(idea.id);

    const eval1 = await prisma.evaluation.create({
      data: { ideaId: idea.id, evaluatorId: user.id, comments: 'ok', decision: 'ACCEPTED' },
    });
    expect(eval1).toHaveProperty('id');

    const deleted = await prisma.attachment.deleteMany({ where: { ideaId: idea.id } });
    expect(deleted).toHaveProperty('count');
  });
});
