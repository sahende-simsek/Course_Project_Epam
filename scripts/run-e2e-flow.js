(process.env.TEST_USE_INMEMORY = '1');
const fetch = globalThis.fetch;
(async ()=>{
  try {
    const email = `e2e_${Date.now()}@example.com`;
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'Password123!' })
    });
    const user = await regRes.json();
    console.log('REGISTER_RESPONSE', JSON.stringify(user));

    const refreshRepo = require('../dist/auth/infra/refreshRepo');
    const expiresAt = new Date(Date.now() + 24*60*60*1000).toISOString();
    const created = await refreshRepo.createRefreshToken(user.id, expiresAt);
    console.log('CREATED_REFRESH', JSON.stringify(created));

    const refreshService = require('../dist/auth/domain/refreshService');
    const rotated = await refreshService.rotateRefreshToken(created.tokenId);
    console.log('ROTATED', JSON.stringify(rotated));

    await refreshService.revokeAllRefreshTokensForUser(user.id);
    const rec = await refreshRepo.findByTokenId(created.tokenId);
    console.log('AFTER_REVOKE', JSON.stringify(rec));
  } catch (e) {
    console.error('ERROR', e && e.stack ? e.stack : e);
    process.exitCode = 1;
  }
})();
