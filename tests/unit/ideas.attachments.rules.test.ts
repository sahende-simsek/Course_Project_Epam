import jwt from 'jsonwebtoken';

describe('attachmentService rules', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TEST_USE_INMEMORY = '1';
    process.env.MAX_ATTACHMENT_BYTES = '1024'; // 1 KB per file for tests
    process.env.MAX_ATTACHMENTS_PER_IDEA = '2';
  });

  afterEach(() => {
    delete process.env.TEST_USE_INMEMORY;
    delete process.env.MAX_ATTACHMENT_BYTES;
    delete process.env.MAX_ATTACHMENTS_PER_IDEA;
    jest.resetModules();
  });

  async function bootstrapIdea() {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    const { Role } = require('@prisma/client');
    const user = await prisma.user.create({
      data: {
        email: 'owner@example.com',
        username: 'owner',
        passwordHash: 'x',
        role: Role.SUBMITTER,
      },
    });
    const idea = await prisma.idea.create({
      data: {
        title: 'Idea',
        description: 'Desc',
        category: 'general',
        authorId: user.id,
      },
    });
    return { prisma, user, idea };
  }

  it('allows valid attachment within limits', async () => {
    const { idea, user } = await bootstrapIdea();
    const {
      validateNewAttachmentForIdea,
    } = require('../../src/auth/domain/attachmentService');

    await expect(
      validateNewAttachmentForIdea({
        ideaId: idea.id,
        ownerUserId: user.id,
        filename: 'file.pdf',
        size: 512,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects disallowed file extension', async () => {
    const { idea, user } = await bootstrapIdea();
    const {
      validateNewAttachmentForIdea,
    } = require('../../src/auth/domain/attachmentService');

    await expect(
      validateNewAttachmentForIdea({
        ideaId: idea.id,
        ownerUserId: user.id,
        filename: 'file.exe',
        size: 100,
      }),
    ).rejects.toMatchObject({
      status: 415,
      code: 'unsupported_media_type',
    });
  });

  it('rejects attachment exceeding per-file size limit', async () => {
    const { idea, user } = await bootstrapIdea();
    const {
      validateNewAttachmentForIdea,
    } = require('../../src/auth/domain/attachmentService');

    await expect(
      validateNewAttachmentForIdea({
        ideaId: idea.id,
        ownerUserId: user.id,
        filename: 'file.pdf',
        size: 2048,
      }),
    ).rejects.toMatchObject({
      status: 413,
      code: 'attachment_size_exceeded',
    });
  });

  it('enforces per-idea attachment count limit', async () => {
    const { prisma, idea, user } = await bootstrapIdea();
    const {
      validateNewAttachmentForIdea,
    } = require('../../src/auth/domain/attachmentService');

    // Insert up to limit
    await prisma.attachment.create({
      data: {
        ideaId: idea.id,
        filename: 'a.pdf',
        url: '',
        mimetype: 'application/pdf',
        size: 10,
        content: Buffer.from('a'),
      },
    });
    await prisma.attachment.create({
      data: {
        ideaId: idea.id,
        filename: 'b.pdf',
        url: '',
        mimetype: 'application/pdf',
        size: 10,
        content: Buffer.from('b'),
      },
    });

    await expect(
      validateNewAttachmentForIdea({
        ideaId: idea.id,
        ownerUserId: user.id,
        filename: 'c.pdf',
        size: 10,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'attachment_limit',
    });
  });
});

