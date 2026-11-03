import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(path.resolve('../hestia-gpu/package.json'));
const { chromium } = require('playwright-core');

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.resolve('scripts/og.html')).href);
await page.waitForTimeout(1200);
await page.screenshot({ path: path.resolve('assets/og.png') });
await browser.close();
console.log('og.png salvo');
