// يصوّر الفيديو إطار إطار من index.html (شغّل خادم محلي على المجلد أولاً، الشرح في README.md)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:' + (process.env.PORT || 4316) + '/index.html?record'); require('fs').mkdirSync('frames', { recursive: true }); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  await p.waitForFunction(() => window.__ready, null, { timeout: 30000 }); await p.waitForTimeout(300);
  const FPS = 30, DUR = await p.evaluate(() => window.__DUR), N = Math.round(DUR * FPS);
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await p.evaluate((t) => window.__render(t), f / FPS);
    await p.screenshot({ path: `frames/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 95 });
    if (f % 150 === 0) console.log(f, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  console.log('done', N, errs);
  await b.close();
})();
