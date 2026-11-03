import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.resolve('../hestia-gpu/package.json'));
const { chromium } = require('playwright-core');

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problemas = [];
page.on('response', (r) => {
  if (r.status() >= 400) problemas.push(`HTTP ${r.status()} ${r.url()}`);
});
page.on('console', (m) => {
  if (m.type() === 'error') problemas.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => problemas.push(`pageerror: ${e.message}`));

await page.goto('http://127.0.0.1:5300/', { waitUntil: 'networkidle' });

const info = await page.evaluate(() => ({
  title: document.title,
  h1: [...document.querySelectorAll('h1')].map((el) => el.textContent.trim()),
  h2: document.querySelectorAll('h2').length,
  imgs: [...document.images].map((img) => ({
    src: img.getAttribute('src'),
    ok: img.complete && img.naturalWidth > 0,
    alt: img.alt,
  })),
  links: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')),
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  semAlt: [...document.images].filter((i) => !i.alt && !i.closest('[aria-hidden="true"]')).length,
}));

// links internos existem?
const alvos = await page.evaluate(() =>
  [...document.querySelectorAll('a[href^="#"]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => h.length > 1 && !document.querySelector(h)),
);

// FAQ abre
await page.locator('#perguntas details').first().locator('summary').click();
const faqAberto = await page.locator('#perguntas details').first().evaluate((d) => d.open);

// menu móvel abre/fecha
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole('button', { name: 'Abrir menu' }).click();
const menuAberto = await page.locator('[data-mobile-menu]').isVisible();
await page.keyboard.press('Escape');
const menuFechado = !(await page.locator('[data-mobile-menu]').isVisible());

console.log(JSON.stringify({ problemas, info, alvosInexistentes: alvos, faqAberto, menuAberto, menuFechado }, null, 1));
await browser.close();
