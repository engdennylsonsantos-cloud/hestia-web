// Captura as imagens da landing page a partir do próprio Hestia (dev server em :5200).
//   node scripts/capture.mjs
// Requer o app rodando: npx vite --port 5200 (em hestia-gpu/apps/web)
import { createRequire } from 'node:module';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(path.resolve('../hestia-gpu/package.json'));
const { chromium } = require('playwright-core');

const OUT = path.resolve('assets');
mkdirSync(OUT, { recursive: true });

const FIXTURE = path.resolve('scripts/casa-demo.hestia.json');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5200/?debug=1';

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

const shot = async (name, target) => {
  const loc = target ?? page;
  await loc.screenshot({ path: path.join(OUT, name) });
  console.log('salvo', name);
};

const enquadrar = async (cx, cy, zoom) => {
  await page.evaluate(({ cx, cy, zoom }) => {
    const r = document.querySelector('.canvas-wrap').getBoundingClientRect();
    window.__hestia.editor.setViewport({ cx, cy, zoom, width: Math.round(r.width), height: Math.round(r.height) });
  }, { cx, cy, zoom });
  await page.waitForTimeout(450);
};

try {
  await page.goto(URL);
  await page.waitForSelector('.canvas-wrap canvas');
  await page.waitForFunction(() => window.__hestia);
  await page.waitForTimeout(800);

  await page.setInputFiles('#file-open', FIXTURE);
  await page.waitForFunction(() => window.__hestia.editor.fileName === 'casa-demo.hestia.json');
  await page.waitForTimeout(700);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Planta
  await page.getByRole('tab', { name: /Térreo/ }).click();
  await page.waitForTimeout(400);
  await enquadrar(5.2, 3.4, 76);
  await shot('planta.png');

  // Planta em close: camadas, hachura, giro das portas
  await enquadrar(3.9, 2.3, 150);
  await shot('planta-close.png', page.locator('.canvas-wrap'));

  // 3D
  await page.getByRole('button', { name: 'Vista 3D' }).click();
  await page.waitForTimeout(1500);
  const caixa = await page.locator('.canvas-wrap').boundingBox();
  await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await page.mouse.wheel(0, -420);
  await page.waitForTimeout(700);
  await shot('modelo-3d.png');
  await shot('modelo-3d-canvas.png', page.locator('.canvas-wrap'));
} catch (e) {
  console.log('ERRO', e.message);
} finally {
  await browser.close();
}
