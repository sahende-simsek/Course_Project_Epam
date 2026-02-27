import jwt from 'jsonwebtoken';

describe('integration: multiple attachments endpoints', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TEST_USE_INMEMORY = '1';
    process.env.MAX_ATTACHMENT_BYTES = '2048';
    process.env.MAX_ATTACHMENTS_PER_IDEA = '3';
  });

  afterEach(() => {
    delete process.env.TEST_USE_INMEMORY;
    delete process.env.MAX_ATTACHMENT_BYTES;
    delete process.env.MAX_ATTACHMENTS_PER_IDEA;
    jest.resetModules();
  });

  function makeAuthToken(userId: string) {
    return jwt.sign({ sub: userId }, 'dev-secret');
  }

  function makeRequest(method: string, path: string, body?: any, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }
    return new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  it('supports uploading and removing multiple attachments with validation', async () => {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    const { Role } = require('@prisma/client');
    const { POST, DELETE } = require('../../src/auth/adapters/attachments.route');

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
        title: 'Multi-attach',
        description: 'Test',
        category: 'general',
        authorId: user.id,
      },
    });

    const token = makeAuthToken(user.id);

    // Upload two valid attachments
    const upload1 = await POST(
      makeRequest(
        'POST',
        `/api/ideas/${encodeURIComponent(idea.id)}/attachments`,
        {
          filename: 'doc1.pdf',
          mimetype: 'application/pdf',
          size: 100,
          contentBase64: Buffer.from('content-1').toString('base64'),
        },
        token,
      ),
    );
    expect(upload1.status).toBe(201);
    const att1 = await upload1.json();
    expect(att1.ideaId).toBe(idea.id);

    const upload2 = await POST(
      makeRequest(
        'POST',
        `/api/ideas/${encodeURIComponent(idea.id)}/attachments`,
        {
          filename: 'doc2.pdf',
          mimetype: 'application/pdf',
          size: 100,
          contentBase64: Buffer.from('content-2').toString('base64'),
        },
        token,
      ),
    );
    expect(upload2.status).toBe(201);
    const att2 = await upload2.json();
    expect(att2.ideaId).toBe(idea.id);

    // Another user (not the submitter) attempting to attach should be forbidden
    const other = await prisma.user.create({
      data: { email: 'intruder@example.com', username: 'intruder', passwordHash: 'x', role: Role.SUBMITTER },
    });
    const otherToken = makeAuthToken(other.id);
    const forbidden = await POST(
      makeRequest(
        'POST',
        `/api/ideas/${encodeURIComponent(idea.id)}/attachments`,
        {
          filename: 'intrude.pdf',
          mimetype: 'application/pdf',
          size: 10,
          contentBase64: Buffer.from('x').toString('base64'),
        },
        otherToken,
      ),
    );
    expect(forbidden.status).toBe(403);

    // Upload a third attachment without specifying mimetype (should default)
    const upload3 = await POST(
      makeRequest(
        'POST',
        `/api/ideas/${encodeURIComponent(idea.id)}/attachments`,
        {
          filename: 'doc3.pdf',
          size: 100,
          contentBase64: Buffer.from('content-3').toString('base64'),
        },
        token,
      ),
    );
    expect(upload3.status).toBe(201);
    const att3 = await upload3.json();
    expect(att3.ideaId).toBe(idea.id);
    expect(att3.mimetype).toBe('application/octet-stream');

    // Disallowed extension
    const badExt = await POST(
      makeRequest(
        'POST',
        `/api/ideas/${encodeURIComponent(idea.id)}/attachments`,
        {
          filename: 'malware.exe',
          mimetype: 'application/octet-stream',
          size: 100,
          contentBase64: Buffer.from('boom').toString('base64'),
        },
        token,
      ),
    );
    expect(badExt.status).toBe(415);

    // Remove one attachment
    const delRes = await DELETE(
      makeRequest(
        'DELETE',
        `/api/ideas/${encodeURIComponent(idea.id)}/attachments/${encodeURIComponent(
          att1.id,
        )}`,
        undefined,
        token,
      ),
    );
    expect(delRes.status).toBe(204);

    const remaining = await prisma.attachment.findMany({ where: { ideaId: idea.id } });
    // att1 removed; att2 and att3 should remain
    expect(remaining.length).toBe(2);
    const ids = remaining.map((r: any) => r.id);
    expect(ids).toContain(att2.id);
    expect(ids).toContain(att3.id);
  });
});

