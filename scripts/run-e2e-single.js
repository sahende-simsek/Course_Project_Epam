const { chromium } = require('playwright');

(async ()=>{
  const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoles = [];
  const requests = [];
  const responses = [];

  page.on('console', msg => consoles.push({type: msg.type(), text: msg.text()}));
  page.on('request', r => requests.push({url: r.url(), method: r.method()}));
  page.on('response', async r => {
    try{
      const body = await (async ()=>{ const t = await r.text(); return t.length>1000 ? t.slice(0,1000)+"..." : t })();
      responses.push({url: r.url(), status: r.status(), body});
    }catch(e){ responses.push({url: r.url(), status: r.status(), body: '<PARSE ERROR>'}); }
  });

  console.log('Navigating to', BASE+'/register');
  try{
    await page.goto(BASE + '/register', { waitUntil: 'domcontentloaded', timeout: 10000 });
  }catch(e){ console.error('goto failed', e && e.message); }

  try{
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    console.log('Found email input — filling form');
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Password123!';
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Create account")');
    // wait a short while and then report current URL and last network activity
    await page.waitForTimeout(800);
    console.log('Submit attempted, current page.url():', page.url());
  }catch(e){ console.error('Form interaction failed:', e && e.message); }

  // snapshot
  const html = await page.content();
  console.log('\n---- Console messages ----');
  consoles.forEach(c=> console.log(c.type, c.text));
  console.log('\n---- Network responses (recent 20) ----');
  responses.slice(-20).forEach(r=> console.log(r.status, r.url, '\n', r.body && r.body.slice(0,500)));
  console.log('\n---- Page HTML snapshot (first 800 chars) ----');
  console.log(html.slice(0,800));

  await browser.close();
})();
