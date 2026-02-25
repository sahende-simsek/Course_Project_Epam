const fetch = global.fetch || ((u, o) => import('node-fetch').then(m => m.default(u, o)));

async function check(url){
  try{
    const res = await fetch(url, { method: 'GET' });
    return res.ok ? await res.text() : null;
  }catch(e){
    return null;
  }
}

async function poll(url, label, tries=30, delay=1000){
  for(let i=0;i<tries;i++){
    const r = await check(url);
    if(r!=null){
      console.log(`${label} ready`);
      return true;
    }
    await new Promise(r=>setTimeout(r, delay));
  }
  console.error(`${label} not ready after ${tries} tries`);
  return false;
}

(async ()=>{
  const a = await poll('http://localhost:3000/_health', 'API');
  const f = await poll('http://localhost:3001/', 'Frontend');
  process.exit(a && f ? 0 : 2);
})();
