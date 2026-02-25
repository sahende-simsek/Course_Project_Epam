const http = require('http');
const url = require('url');

// Simple runtime guard for duplicate emails when using the in-memory adapter.
const _registeredEmails = new Set();

// Use in-memory Prisma when DATABASE_URL is not set (same convention as tests)
if (!process.env.DATABASE_URL) {
  process.env.TEST_USE_INMEMORY = '1';
}

// Require compiled JS from dist (compile with `npx tsc` before running)
const createUser = require('../dist/auth/domain/userService').createUser;
const verifyCredentials = require('../dist/auth/domain/authService').verifyCredentials;
const generateAccessToken = require('../dist/auth/domain/tokenService').generateAccessToken;
const rotateRefreshToken = require('../dist/auth/domain/refreshService').rotateRefreshToken;
const revokeAllRefreshTokensForUser = require('../dist/auth/domain/refreshService').revokeAllRefreshTokensForUser;

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
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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
      const { email, password } = data;
      if (!email || !password) return jsonResponse(res, 400, { error: 'email and password required' });
      // runtime duplicate guard (helps in-memory adapter)
      const norm = (email || '').toLowerCase().trim();
      if (_registeredEmails.has(norm)) return jsonResponse(res, 409, { error: 'email already registered' });
      try {
        const user = await createUser(email, password);
        _registeredEmails.add(norm);
        return jsonResponse(res, 201, { id: user.id, email: user.email, createdAt: user.createdAt });
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
  console.log('Endpoints: POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout, GET /_health');
});
