import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.resolve('../hestia-gpu/package.json'));
const { chromium } = require('playwright-core');

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5300/');
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')));
await page.waitForTimeout(500);

const out = path.resolve('scripts/review');
const fs = await import('node:fs');
fs.mkdirSync(out, { recursive: true });

const sections = [
  ['hero', 0],
  ['produto', 560],
  ['modelo', '#modelo'],
  ['elementos', '#elementos'],
  ['fluxo', '#fluxo'],
  ['galeria', '#galeria'],
  ['open-source', '#open-source'],
  ['placa', '.section-plate'],
  ['cta', '.section-cta'],
  ['faq', '#perguntas'],
  ['rodape', '.site-footer'],
];

for (const [nome, alvo] of sections) {
  if (typeof alvo === 'string') {
    await page.locator(alvo).scrollIntoViewIfNeeded();
    await page.evaluate((s) => window.scrollBy(0, -80), alvo);
  } else {
    await page.evaluate((y) => window.scrollTo(0, y), alvo);
  }
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(out, `${nome}.png`) });
  console.log(nome);
}
await browser.close();
