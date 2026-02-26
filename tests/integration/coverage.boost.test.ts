// Use the in-memory Prisma test shim for this file to avoid DB ordering issues.
process.env.TEST_USE_INMEMORY = '1';
import prisma from '../../src/auth/infra/prismaClient';
import { clearDb } from '../helpers/testDb';
import { evaluateIdea } from '../../src/auth/domain/evaluationService';
import { listIdeasForUser, getIdeaForUser } from '../../src/auth/domain/ideaService';
import { IdeaStatus, Role } from '@prisma/client';
import * as refreshService from '../../src/auth/domain/refreshService';
import refreshRepo from '../../src/auth/infra/refreshRepo';
import * as ideaService from '../../src/auth/domain/ideaService';
import * as draftService from '../../src/auth/domain/draftService';
import * as userService from '../../src/auth/domain/userService';
import config from '../../src/config';

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  if (prisma && typeof prisma.$disconnect === 'function') {
    await prisma.$disconnect();
  }
});

test('evaluateIdea success path and updates idea status', async () => {
  const now = Date.now();
  // create evaluator
  const evaluator = await prisma.user.create({ data: { email: `eval+${now}@example.com`, passwordHash: 'x', role: 'EVALUATOR' } as any });
  const author = await prisma.user.create({ data: { email: `author+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });

  const idea = await prisma.idea.create({ data: { title: 'I', description: 'D', category: 'C', status: IdeaStatus.SUBMITTED, authorId: author.id } });

  const res = await evaluateIdea({ ideaId: idea.id, evaluatorId: evaluator.id, decision: 'ACCEPTED', comments: 'Good' });
  expect(res).toHaveProperty('ideaId', idea.id);

  const updated = await prisma.idea.findUnique({ where: { id: idea.id } });
  expect(updated?.status).toBe(IdeaStatus.ACCEPTED);
});

test('getIdeaForUser forbids non-author submitter', async () => {
  const now = Date.now();
  const author = await prisma.user.create({ data: { email: `a2+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const other = await prisma.user.create({ data: { email: `other+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const idea = await prisma.idea.create({ data: { title: 'I2', description: 'D2', category: 'C2', status: IdeaStatus.SUBMITTED, authorId: author.id } });

  await expect(getIdeaForUser(idea.id, other.id, Role.SUBMITTER as any)).rejects.toMatchObject({ status: 403 });
});

test('listIdeasForUser returns all ideas for evaluator role', async () => {
  const now = Date.now();
  const author = await prisma.user.create({ data: { email: `a3+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const evaluator = await prisma.user.create({ data: { email: `e3+${now}@example.com`, passwordHash: 'x', role: 'EVALUATOR' } as any });

  await prisma.idea.create({ data: { title: 'i1', description: 'd1', category: 'c', status: IdeaStatus.SUBMITTED, authorId: author.id } });
  await prisma.idea.create({ data: { title: 'i2', description: 'd2', category: 'c', status: IdeaStatus.SUBMITTED, authorId: author.id } });

  const list = await listIdeasForUser(evaluator.id, Role.EVALUATOR as any);
  expect(Array.isArray(list)).toBe(true);
  expect(list.length).toBeGreaterThanOrEqual(2);
});

test('rotateRefreshToken success and error branches', async () => {
  const now = Date.now();
  const user = await prisma.user.create({ data: { email: `rt+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });

  // issue token via service
  const issued = await refreshService.issueRefreshTokenForUser(user.id);
  expect(issued).toHaveProperty('tokenId');

  // rotate should succeed
  const rotated = await refreshService.rotateRefreshToken(issued.tokenId);
  expect(rotated).toHaveProperty('access');
  expect(rotated).toHaveProperty('refresh');

  // expired token
  const expired = await refreshRepo.createRefreshToken(user.id, new Date(Date.now() - 1000));
  await expect(refreshService.rotateRefreshToken(expired.tokenId)).rejects.toMatchObject({ status: 401 });

  // revoked (replay) token: mark as revoked then rotate
  const replay = await refreshRepo.createRefreshToken(user.id, new Date(Date.now() + 10000));
  await refreshRepo.revokeTokenById(replay.tokenId);
  await expect(refreshService.rotateRefreshToken(replay.tokenId)).rejects.toMatchObject({ status: 403 });
});

test('evaluateIdea error branches (validation, unauthorized, forbidden, not-found, already evaluated)', async () => {
  const now = Date.now();

  // validation: missing fields
  await expect((evaluateIdea as any)({})).rejects.toMatchObject({ status: 400 });

  // unauthorized: evaluator not found
  const fakeEvaluatorId = `no-user-${now}`;
  const fakeIdeaId = `no-idea-${now}`;
  await expect(evaluateIdea({ ideaId: fakeIdeaId, evaluatorId: fakeEvaluatorId, decision: 'ACCEPTED', comments: 'x' })).rejects.toMatchObject({ status: 401 });

  // create non-evaluator user
  const submitter = await prisma.user.create({ data: { email: `s+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const author = await prisma.user.create({ data: { email: `a+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const idea = await prisma.idea.create({ data: { title: 'I3', description: 'D3', category: 'C3', status: IdeaStatus.SUBMITTED, authorId: author.id } });

  // forbidden: submitter tries to evaluate
  await expect(evaluateIdea({ ideaId: idea.id, evaluatorId: submitter.id, decision: 'REJECTED', comments: 'nope' })).rejects.toMatchObject({ status: 403 });

  // not-found: fake idea id with valid evaluator
  const evaluator = await prisma.user.create({ data: { email: `ev+${now}@example.com`, passwordHash: 'x', role: 'EVALUATOR' } as any });
  await expect(evaluateIdea({ ideaId: 'non-existent-id', evaluatorId: evaluator.id, decision: 'ACCEPTED', comments: 'x' })).rejects.toMatchObject({ status: 404 });

  // already evaluated
  const evaluatedIdea = await prisma.idea.create({ data: { title: 'I4', description: 'D4', category: 'C4', status: IdeaStatus.ACCEPTED, authorId: author.id } });
  await expect(evaluateIdea({ ideaId: evaluatedIdea.id, evaluatorId: evaluator.id, decision: 'REJECTED', comments: 'x' })).rejects.toMatchObject({ status: 409 });
});

test('ideaService createIdea validation and unauthorized branches', async () => {
  const now = Date.now();
  // missing authorId
  await expect(ideaService.createIdea({ authorId: '' as any, title: 't', description: 'd', category: 'c' })).rejects.toMatchObject({ status: 401 });

  // missing fields
  const user = await prisma.user.create({ data: { email: `ci+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  await expect(ideaService.createIdea({ authorId: user.id, title: '' as any, description: '', category: '' })).rejects.toMatchObject({ status: 400 });
});

test('tokenService generates access token with optional fields', () => {
  const { generateAccessToken } = require('../../src/auth/domain/tokenService');
  const out = generateAccessToken({ id: 'u1', email: 'x@y.com', role: 'EVALUATOR', username: 'theuser' });
  expect(out).toHaveProperty('token');
  expect(out).toHaveProperty('expiresIn');
});

test('userService createUser validation and conflict branches', async () => {
  const now = Date.now();
  // invalid password
  await expect(userService.createUser(`u+${now}@example.com`, 'short')).rejects.toThrow('Password validation failed');

  // conflict when email exists
  const email = `conflict+${now}@example.com`;
  await prisma.user.create({ data: { email, passwordHash: 'x', role: 'SUBMITTER' } as any });
  await expect(userService.createUser(email, 'Password123!')).rejects.toMatchObject({ status: 409 });
});

test('draftService delete and submit branches (not-found, validation, attachments transfer)', async () => {
  const now = Date.now();

  // validation failed on submit (empty title/description/category)
  const owner = await prisma.user.create({ data: { email: `downer+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const badDraft = await prisma.draft.create({ data: { ownerUserId: owner.id, title: '', description: '', category: '', dynamicFieldValues: {} as any } });
  await expect(draftService.submitDraft({ draftId: badDraft.id, ownerUserId: owner.id })).rejects.toMatchObject({ status: 400 });

  // successful submit with attachments transfer
  const draft = await prisma.draft.create({ data: { ownerUserId: owner.id, title: 'T', description: 'D', category: 'C', dynamicFieldValues: {} as any } });
  await prisma.draftAttachment.create({ data: { draftId: draft.id, filename: 'f.txt', url: '', mimetype: 'text/plain', size: 5, content: Buffer.from('x') } as any });

  const res = await draftService.submitDraft({ draftId: draft.id, ownerUserId: owner.id });
  expect(res).toHaveProperty('idea');
  const attachments = await prisma.attachment.findMany({ where: { ideaId: res.idea.id } });
  expect(attachments.length).toBeGreaterThanOrEqual(1);

  const deleted = await prisma.draft.findUnique({ where: { id: draft.id } });
  expect(deleted).toBeNull();
  
  // deleteDraft success path: create another draft and delete it
  const d2 = await prisma.draft.create({ data: { ownerUserId: owner.id, title: 'T2', description: 'D2', category: 'C2', dynamicFieldValues: {} as any } });
  await draftService.deleteDraft(d2.id, owner.id);
  const after = await prisma.draft.findUnique({ where: { id: d2.id } });
  expect(after).toBeNull();
});

test('draftService create, list, get and update branches', async () => {
  const now = Date.now();
  const owner = await prisma.user.create({ data: { email: `downer+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });

  const created = await draftService.createDraft({ ownerUserId: owner.id, title: 'DT', description: 'DD', category: 'DC', dynamicFieldValues: {} });
  expect(created).toHaveProperty('id');

  const list = await draftService.listDraftsForUser(owner.id);
  expect(Array.isArray(list)).toBe(true);
  expect(list.find((d: any) => d.id === created.id)).toBeTruthy();

  const got = await draftService.getDraftForUser(created.id, owner.id);
  expect(got).toHaveProperty('id', created.id);

  const updated = await draftService.updateDraft({ draftId: created.id, ownerUserId: owner.id, title: 'DT2' });
  expect(updated).toHaveProperty('title', 'DT2');
});

test('ideaService create, list unauthorized and evaluator access branches', async () => {
  const now = Date.now();
  const author = await prisma.user.create({ data: { email: `iauthor+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  const evaluator = await prisma.user.create({ data: { email: `ieval+${now}@example.com`, passwordHash: 'x', role: 'EVALUATOR' } as any });

  const idea = await ideaService.createIdea({ authorId: author.id, title: 'It', description: 'Id', category: 'Ic' });
  expect(idea).toHaveProperty('id');

  await expect(ideaService.listIdeasForUser('', 'SUBMITTER' as any)).rejects.toMatchObject({ status: 401 });

  const fetched = await ideaService.getIdeaForUser(idea.id, evaluator.id, 'EVALUATOR' as any);
  expect(fetched).toHaveProperty('id', idea.id);
});

test('userService role derivation from config and create success', async () => {
  const now = Date.now();
  const adminEmail = `admin+${now}@example.com`;

  // set admin email in config temporarily
  const prevEmails = config.ADMIN_EMAILS;
  const prevDomains = config.ADMIN_EMAIL_DOMAINS;
  try {
    config.ADMIN_EMAILS = [adminEmail.toLowerCase()];
    const u1 = await userService.createUser(adminEmail, 'Password123!');
    expect(u1.role).toBe('EVALUATOR');

    // domain-based admin
    config.ADMIN_EMAILS = [] as any;
    config.ADMIN_EMAIL_DOMAINS = ['admin.example.com'];
    const domEmail = `user@admin.example.com`;
    const u2 = await userService.createUser(domEmail, 'Password123!');
    expect(u2.role).toBe('EVALUATOR');
  } finally {
    config.ADMIN_EMAILS = prevEmails;
    config.ADMIN_EMAIL_DOMAINS = prevDomains;
  }
});

test('ideaService submitter list returns own ideas', async () => {
  const now = Date.now();
  const author = await prisma.user.create({ data: { email: `alist+${now}@example.com`, passwordHash: 'x', role: 'SUBMITTER' } as any });
  await ideaService.createIdea({ authorId: author.id, title: 'Own', description: 'Own', category: 'c' });
  const list = await ideaService.listIdeasForUser(author.id, 'SUBMITTER' as any);
  expect(Array.isArray(list)).toBe(true);
  expect(list.length).toBeGreaterThanOrEqual(1);
});
