import { createRequire } from 'node:module';
import path from 'node:path';
import { readFileSync, statSync } from 'node:fs';
const require = createRequire(path.resolve('../hestia-gpu/package.json'));
const { chromium } = require('playwright-core');

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage();
const arquivos = ['modelo-3d'];

for (const nome of arquivos) {
  const png = readFileSync(path.resolve(`assets/${nome}.png`));
  const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
  const webp = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.9).split(',')[1];
  }, dataUrl);
  const { writeFileSync } = await import('node:fs');
  writeFileSync(path.resolve(`assets/${nome}.webp`), Buffer.from(webp, 'base64'));
  const antes = statSync(path.resolve(`assets/${nome}.png`)).size;
  const depois = statSync(path.resolve(`assets/${nome}.webp`)).size;
  console.log(`${nome}: ${Math.round(antes / 1024)} KB → ${Math.round(depois / 1024)} KB`);
}

await browser.close();
