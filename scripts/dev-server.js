const http = require('http');
const url = require('url');

// Simple runtime guard for duplicate emails when using the in-memory adapter.
const _registeredEmails = new Set();

// For local dev, prefer in-memory Prisma to avoid a real DB dependency.
// If you really want to use the DATABASE_URL Postgres instance, set USE_REAL_DB=1.
if (!process.env.USE_REAL_DB) {
  delete process.env.DATABASE_URL;
  process.env.TEST_USE_INMEMORY = '1';
}

// Require compiled JS from dist (compile with `npx tsc` before running)
const createUser = require('../dist/auth/domain/userService').createUser;
const verifyCredentials = require('../dist/auth/domain/authService').verifyCredentials;
const generateAccessToken = require('../dist/auth/domain/tokenService').generateAccessToken;
const rotateRefreshToken = require('../dist/auth/domain/refreshService').rotateRefreshToken;
const revokeAllRefreshTokensForUser = require('../dist/auth/domain/refreshService').revokeAllRefreshTokensForUser;
const createIdea = require('../dist/auth/domain/ideaService').createIdea;
const listIdeasForUser = require('../dist/auth/domain/ideaService').listIdeasForUser;
const getIdeaForUser = require('../dist/auth/domain/ideaService').getIdeaForUser;
const evaluateIdea = require('../dist/auth/domain/evaluationService').evaluateIdea;

function jsonResponse(res, status, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

async function handleRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const method = req.method;
  if (method === 'OPTIONS') {
    const origin = req.headers.origin || 'http://localhost:3001';
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    });
    return res.end();
  }

  // collect body
  let body = '';
  req.on('data', (chunk) => { body += chunk.toString(); });
  await new Promise((r) => req.on('end', r));
  let data = {};
  try { if (body) data = JSON.parse(body); } catch (e) { /* ignore */ }

  try {
    if (method === 'POST' && parsed.pathname === '/api/auth/register') {
      const { email, password, username } = data;
      if (!email || !password) return jsonResponse(res, 400, { error: 'email and password required' });
      // runtime duplicate guard (helps in-memory adapter)
      const norm = (email || '').toLowerCase().trim();
      if (_registeredEmails.has(norm)) return jsonResponse(res, 409, { error: 'email already registered' });
      try {
        const user = await createUser(email, password, username);
        _registeredEmails.add(norm);
        return jsonResponse(res, 201, { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt });
      } catch (err) {
        if (err && err.status === 409) return jsonResponse(res, 409, { error: 'email already registered' });
        throw err;
      }
    }

    if (method === 'POST' && parsed.pathname === '/api/auth/login') {
      const { email, password } = data;
      if (!email || !password) return jsonResponse(res, 400, { error: 'email and password required' });
      try {
        const user = await verifyCredentials(email, password);
        const token = generateAccessToken(user);
        return jsonResponse(res, 200, { accessToken: token });
      } catch (err) {
        if (err && err.status === 401) return jsonResponse(res, 401, { error: 'invalid email or password' });
        throw err;
      }
    }

    if (method === 'POST' && parsed.pathname === '/api/auth/refresh') {
      const { tokenId } = data;
      if (!tokenId) return jsonResponse(res, 400, { error: 'tokenId required' });
      const result = await rotateRefreshToken(tokenId);
      return jsonResponse(res, 200, result);
    }

    if (method === 'POST' && parsed.pathname === '/api/auth/logout') {
      const { userId } = data;
      if (!userId) return jsonResponse(res, 400, { error: 'userId required' });
      await revokeAllRefreshTokensForUser(userId);
      return jsonResponse(res, 204, {});
    }

    // Ideas API — minimal JWT-based auth using accessToken
    if (method === 'POST' && parsed.pathname === '/api/ideas') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const { title, description, category } = data;
      try {
        const idea = await createIdea({ authorId: userId, title, description, category });
        return jsonResponse(res, 201, idea);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to create idea';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'GET' && parsed.pathname === '/api/ideas') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      let role;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
        role = decoded && decoded.role; // optional: if role included
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      // For dev-server we rely on domain service to enforce FR-011 using DB role; here we pass role if present, otherwise SUBMITTER.
      const Role = require('@prisma/client').Role;
      const effectiveRole = role || Role.SUBMITTER;

      try {
        const ideas = await listIdeasForUser(userId, effectiveRole);
        return jsonResponse(res, 200, ideas);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to load ideas';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'GET' && parsed.pathname && parsed.pathname.startsWith('/api/ideas/')) {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      let role;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
        role = decoded && decoded.role;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const Role = require('@prisma/client').Role;
      const effectiveRole = role || Role.SUBMITTER;
      const parts = parsed.pathname.split('/');
      const ideaId = parts[parts.length - 1];
      try {
        const idea = await getIdeaForUser(ideaId, userId, effectiveRole);
        return jsonResponse(res, 200, idea);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to load idea';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'POST' && parsed.pathname === '/api/ideas/attach') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const { ideaId, filename, contentBase64, mimetype, size } = data;
      const prisma = require('../dist/auth/infra/prismaClient').default;
      const allowedExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      const idx = filename && filename.lastIndexOf('.');
      const ext = idx !== -1 && typeof filename === 'string' ? filename.slice(idx + 1).toLowerCase() : '';
      if (!ext || !allowedExt.includes(ext)) {
        return jsonResponse(res, 415, {
          error: 'Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed',
        });
      }
      try {
        const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
        if (!idea) return jsonResponse(res, 404, { error: 'Idea not found' });
        if (idea.authorId !== userId) return jsonResponse(res, 403, { error: 'Only the submitter can attach files' });

        let contentBuffer = null;
        if (typeof contentBase64 === 'string' && contentBase64.length > 0) {
          try {
            contentBuffer = Buffer.from(contentBase64, 'base64');
          } catch (_) {
            // fall through to validation error
          }
        }

        if (!contentBuffer) {
          return jsonResponse(res, 400, { error: 'invalid attachment content' });
        }

        const createdAttachment = await prisma.attachment.create({
          data: {
            ideaId,
            filename,
            url: '',
            mimetype: mimetype || 'application/octet-stream',
            size,
            content: contentBuffer,
          },
        });

        const publicUrl = `http://localhost:${PORT}/api/attachments/${createdAttachment.id}`;

        const attachment = await prisma.attachment.update({
          where: { id: createdAttachment.id },
          data: { url: publicUrl },
        });

        return jsonResponse(res, 201, attachment);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to attach file';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'GET' && parsed.pathname && parsed.pathname.startsWith('/api/attachments/')) {

      const prisma = require('../dist/auth/infra/prismaClient').default;
      const parts = parsed.pathname.split('/');
      const attachmentId = parts[parts.length - 1];

      try {
        let attachment = await prisma.attachment.findUnique({
          where: { id: attachmentId },
          include: { idea: true },
        });

        let isDraftAttachment = false;
        if (!attachment) {
          const draftAttachment = await prisma.draftAttachment.findUnique({ where: { id: attachmentId } });
          if (!draftAttachment) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Attachment not found' }));
          }
          attachment = draftAttachment;
          isDraftAttachment = true;
        }

        res.writeHead(200, {
          'Content-Type': attachment.mimetype || 'application/octet-stream',
          'Content-Length': attachment.size || undefined,
          'Content-Disposition': `inline; filename="${attachment.filename}"`,
        });

        return res.end(attachment.content);
      } catch (err) {
        console.error('failed to serve attachment', err && err.stack ? err.stack : err);
        return jsonResponse(res, 500, { error: 'failed to load attachment' });
      }
    }

    if (method === 'POST' && parsed.pathname === '/api/drafts/attach') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const { draftId, filename, contentBase64, mimetype, size } = data;
      const prisma = require('../dist/auth/infra/prismaClient').default;
      const allowedExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      const idx = filename && filename.lastIndexOf('.');
      const ext = idx !== -1 && typeof filename === 'string' ? filename.slice(idx + 1).toLowerCase() : '';
      if (!ext || !allowedExt.includes(ext)) {
        return jsonResponse(res, 415, {
          error: 'Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed',
        });
      }
      try {
        const draft = await prisma.draft.findUnique({ where: { id: draftId } });
        if (!draft) return jsonResponse(res, 404, { error: 'Draft not found' });
        if (draft.ownerUserId !== userId) return jsonResponse(res, 403, { error: 'Only the owner can attach files to draft' });

        let contentBuffer = null;
        if (typeof contentBase64 === 'string' && contentBase64.length > 0) {
          try {
            contentBuffer = Buffer.from(contentBase64, 'base64');
          } catch (_) {
            // fall through to validation error
          }
        }

        if (!contentBuffer) {
          return jsonResponse(res, 400, { error: 'invalid attachment content' });
        }

        const createdAttachment = await prisma.draftAttachment.create({
          data: {
            draftId,
            filename,
            url: '',
            mimetype: mimetype || 'application/octet-stream',
            size,
            content: contentBuffer,
          },
        });

        const publicUrl = `http://localhost:${PORT}/api/attachments/${createdAttachment.id}`;

        const attachment = await prisma.draftAttachment.update({
          where: { id: createdAttachment.id },
          data: { url: publicUrl },
        });

        return jsonResponse(res, 201, attachment);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to attach file to draft';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'DELETE' && parsed.pathname && parsed.pathname.startsWith('/api/drafts/attachments/')) {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const prisma = require('../dist/auth/infra/prismaClient').default;
      const parts = parsed.pathname.split('/');
      const attachmentId = parts[parts.length - 1];

      try {
        const att = await prisma.draftAttachment.findUnique({ where: { id: attachmentId }, include: { draft: true } });
        if (!att) return jsonResponse(res, 404, { error: 'Attachment not found' });
        if (!att.draft || att.draft.ownerUserId !== userId) {
          return jsonResponse(res, 403, { error: 'Only the owner can remove draft attachments' });
        }

        await prisma.draftAttachment.delete({ where: { id: attachmentId } });
        return jsonResponse(res, 204, {});
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to delete draft attachment';
        return jsonResponse(res, status, { error: message });
      }
    }

    // Drafts API – basic CRUD and submit-from-draft
    if (method === 'POST' && parsed.pathname === '/api/drafts') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const { title, description, category, dynamicFieldValues } = data;
      try {
        const { createDraft } = require('../dist/auth/domain/draftService');
        const draft = await createDraft({
          ownerUserId: userId,
          title,
          description,
          category,
          dynamicFieldValues: dynamicFieldValues || {},
        });
        return jsonResponse(res, 201, draft);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to create draft';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'GET' && parsed.pathname === '/api/drafts') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const { listDraftsForUser, getDraftForUser } = require('../dist/auth/domain/draftService');
      const id = (parsed.query && parsed.query.id) || undefined;
      try {
        if (id) {
          const draft = await getDraftForUser(id, userId);
          if (!draft) return jsonResponse(res, 404, { error: 'Draft not found' });
          return jsonResponse(res, 200, draft);
        }
        const drafts = await listDraftsForUser(userId);
        return jsonResponse(res, 200, drafts);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to load drafts';
        return jsonResponse(res, status, { error: message });
      }
    }

    if ((method === 'PUT' || method === 'DELETE' || method === 'POST') && parsed.pathname && parsed.pathname.startsWith('/api/drafts/')) {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let userId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        userId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const parts = parsed.pathname.split('/');
      const draftId = parts[3];
      const action = parts[4];

      const { updateDraft, deleteDraft, submitDraft } = require('../dist/auth/domain/draftService');

      try {
        if (method === 'PUT' && draftId && !action) {
          const { title, description, category, dynamicFieldValues } = data;
          const updated = await updateDraft({
            draftId,
            ownerUserId: userId,
            title,
            description,
            category,
            dynamicFieldValues,
          });
          return jsonResponse(res, 200, updated);
        }

        if (method === 'DELETE' && draftId && !action) {
          await deleteDraft(draftId, userId);
          return jsonResponse(res, 204, {});
        }

        if (method === 'POST' && draftId && action === 'submit') {
          const prisma = require('../dist/auth/infra/prismaClient').default;
          const result = await submitDraft({ draftId, ownerUserId: userId });

          // Promote draft attachments to idea attachments
          const draftAttachments = await prisma.draftAttachment.findMany({ where: { draftId } });
          for (const da of draftAttachments) {
            const createdAttachment = await prisma.attachment.create({
              data: {
                ideaId: result.idea.id,
                filename: da.filename,
                url: '',
                mimetype: da.mimetype || 'application/octet-stream',
                size: da.size,
                content: da.content,
              },
            });
            const publicUrl = `http://localhost:${PORT}/api/attachments/${createdAttachment.id}`;
            await prisma.attachment.update({
              where: { id: createdAttachment.id },
              data: { url: publicUrl },
            });
          }
          await prisma.draftAttachment.deleteMany({ where: { draftId } });

          return jsonResponse(res, 201, result.idea);
        }
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to handle draft request';
        return jsonResponse(res, status, { error: message });
      }
    }

    if (method === 'POST' && parsed.pathname === '/api/evaluations') {
      const auth = req.headers['authorization'] || '';
      if (!auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'missing or invalid token' });
      const token = auth.slice('Bearer '.length);
      let evaluatorId;
      try {
        const jwt = require('jsonwebtoken');
        const getConfig = require('../dist/config').default;
        const decoded = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
        evaluatorId = decoded && decoded.sub;
      } catch (_) {
        return jsonResponse(res, 401, { error: 'invalid token' });
      }

      const { ideaId, decision, comments } = data;
      try {
        const result = await evaluateIdea({ ideaId, evaluatorId, decision, comments });
        return jsonResponse(res, 201, result);
      } catch (err) {
        const status = (err && err.status) || 400;
        const message = (err && err.message) || 'failed to evaluate idea';
        return jsonResponse(res, status, { error: message });
      }
    }

    // Health
    if (method === 'GET' && parsed.pathname === '/_health') {
      return jsonResponse(res, 200, { status: 'ok' });
    }


    jsonResponse(res, 404, { error: 'not found' });
  } catch (err) {
    console.error('dev-server error', err && err.stack ? err.stack : err);
    jsonResponse(res, 500, { error: 'internal error' });
  }
}

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  // CORS: echo origin and allow credentials for frontend requests
  const origin = req.headers.origin || 'http://localhost:3001';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // allow common headers for requests from the frontend
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`);
  console.log('Endpoints: POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout,');
  console.log('           POST /api/ideas, GET /api/ideas, GET /api/ideas/:id, POST /api/ideas/attach, GET /api/attachments/:id, POST /api/evaluations, GET /_health');
});
