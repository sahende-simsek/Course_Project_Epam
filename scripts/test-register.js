(async ()=>{
  const fetch = global.fetch || (await import('node-fetch')).default;
  const body = { email: 'dup+test@example.com', password: 'Password123!' };
  try{
    let r = await fetch('http://localhost:3000/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    console.log('first status', r.status);
    console.log('first body', await r.text());
  }catch(e){ console.error('first error', e.message) }
  try{
    let r2 = await fetch('http://localhost:3000/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    console.log('second status', r2.status);
    console.log('second body', await r2.text());
  }catch(e){ console.error('second error', e.message) }
})();
