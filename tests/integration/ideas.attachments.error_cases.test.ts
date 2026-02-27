import jwt from 'jsonwebtoken';

describe('integration: multiple attachments error cases', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TEST_USE_INMEMORY = '1';
    process.env.MAX_ATTACHMENT_BYTES = '50';
    process.env.MAX_ATTACHMENTS_PER_IDEA = '1';
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

  it('POST without auth returns 401', async () => {
    const { POST } = require('../../src/auth/adapters/attachments.route');
    const res = await POST(makeRequest('POST', '/api/ideas/idea-x/attachments', {
      filename: 'f.pdf', size: 10, contentBase64: Buffer.from('x').toString('base64'),
    }));
    expect(res.status).toBe(401);
  });

  it('POST with missing fields returns 400', async () => {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    const { Role } = require('@prisma/client');
    const { POST } = require('../../src/auth/adapters/attachments.route');

    const user = await prisma.user.create({ data: { email: 'u1@example.com', passwordHash: 'x', role: Role.SUBMITTER } });
    const token = makeAuthToken(user.id);

    const res = await POST(makeRequest('POST', `/api/ideas/doesnotmatter/attachments`, { filename: 'f.pdf' }, token));
    expect(res.status).toBe(400);
  });

  it('POST with oversized file returns 413', async () => {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    const { Role } = require('@prisma/client');
    const { POST } = require('../../src/auth/adapters/attachments.route');

    const user = await prisma.user.create({ data: { email: 'u2@example.com', passwordHash: 'x', role: Role.SUBMITTER } });
    const idea = await prisma.idea.create({ data: { title: 'I', description: 'd', category: 'g', authorId: user.id } });
    const token = makeAuthToken(user.id);

    const res = await POST(makeRequest('POST', `/api/ideas/${encodeURIComponent(idea.id)}/attachments`, {
      filename: 'big.pdf', size: 1000, contentBase64: Buffer.from('big').toString('base64'),
    }, token));
    expect(res.status).toBe(413);
  });

  it('POST exceeding attachments limit returns 409', async () => {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    const { Role } = require('@prisma/client');
    const { POST } = require('../../src/auth/adapters/attachments.route');

    const user = await prisma.user.create({ data: { email: 'u3@example.com', passwordHash: 'x', role: Role.SUBMITTER } });
    const idea = await prisma.idea.create({ data: { title: 'I2', description: 'd', category: 'g', authorId: user.id } });
    const token = makeAuthToken(user.id);

    const ok1 = await POST(makeRequest('POST', `/api/ideas/${encodeURIComponent(idea.id)}/attachments`, {
      filename: 'a.pdf', size: 10, contentBase64: Buffer.from('a').toString('base64'),
    }, token));
    expect(ok1.status).toBe(201);

    const over = await POST(makeRequest('POST', `/api/ideas/${encodeURIComponent(idea.id)}/attachments`, {
      filename: 'b.pdf', size: 10, contentBase64: Buffer.from('b').toString('base64'),
    }, token));
    expect(over.status).toBe(409);
  });

  it('DELETE with wrong owner returns 403 and non-existent returns 404', async () => {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    const { Role } = require('@prisma/client');
    const { POST, DELETE } = require('../../src/auth/adapters/attachments.route');

    const owner = await prisma.user.create({ data: { email: 'owner2@example.com', passwordHash: 'x', role: Role.SUBMITTER } });
    const other = await prisma.user.create({ data: { email: 'other@example.com', passwordHash: 'x', role: Role.SUBMITTER } });
    const idea = await prisma.idea.create({ data: { title: 'I3', description: 'd', category: 'g', authorId: owner.id } });
    const tokenOther = makeAuthToken(other.id);
    const tokenOwner = makeAuthToken(owner.id);

    const up = await POST(makeRequest('POST', `/api/ideas/${encodeURIComponent(idea.id)}/attachments`, {
      filename: 'c.pdf', size: 10, contentBase64: Buffer.from('c').toString('base64'),
    }, tokenOwner));
    expect(up.status).toBe(201);
    const att = await up.json();

    // wrong owner tries to delete
    const delWrong = await DELETE(makeRequest('DELETE', `/api/ideas/${encodeURIComponent(idea.id)}/attachments/${encodeURIComponent(att.id)}`, undefined, tokenOther));
    expect(delWrong.status).toBe(403);

    // owner deletes with bad id -> 404
    const delNotFound = await DELETE(makeRequest('DELETE', `/api/ideas/${encodeURIComponent(idea.id)}/attachments/not-found`, undefined, tokenOwner));
    expect(delNotFound.status).toBe(404);
  });
});
