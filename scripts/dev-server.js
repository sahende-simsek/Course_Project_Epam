const http = require('http');
const url = require('url');

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
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
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
      const user = await createUser(email, password);
      return jsonResponse(res, 201, { id: user.id, email: user.email, createdAt: user.createdAt });
    }

    if (method === 'POST' && parsed.pathname === '/api/auth/login') {
      const { email, password } = data;
      if (!email || !password) return jsonResponse(res, 400, { error: 'email and password required' });
      const user = await verifyCredentials(email, password);
      if (!user) return jsonResponse(res, 401, { error: 'invalid credentials' });
      const token = generateAccessToken(user);
      return jsonResponse(res, 200, { accessToken: token });
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
  // basic CORS for browsing
  res.setHeader('Access-Control-Allow-Origin', '*');
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`);
  console.log('Endpoints: POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout, GET /_health');
});
