// Render an OG card HTML -> PNG at exact 1200x630 using headless Chromium.
// Usage:
//   node tools/render-og.mjs <input.html> <output.png>   # single file
//   node tools/render-og.mjs                              # batch: tools/candidates/*.html -> tools/out/
// For every render it also writes a "<name>.square.png" (the centered 630x630
// crop) so we can verify the design survives the Teams square-crop.

import { chromium } from 'playwright';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';

const W = 1200, H = 630;
const SQUARE = 630;                 // Teams compact crop is a centered square
const SQUARE_X = Math.round((W - SQUARE) / 2); // 285

const here = dirname(fileURLToPath(import.meta.url));

async function render(page, inputHtml, outputPng) {
  const url = pathToFileURL(resolve(inputHtml)).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  // Make sure the web fonts are actually loaded before we shoot.
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(350);
  await page.screenshot({ path: outputPng, clip: { x: 0, y: 0, width: W, height: H } });
  const squarePng = outputPng.replace(/\.png$/, '.square.png');
  await page.screenshot({ path: squarePng, clip: { x: SQUARE_X, y: 0, width: SQUARE, height: SQUARE } });
  console.log(`rendered ${basename(inputHtml)} -> ${basename(outputPng)} (+ square crop)`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

const args = process.argv.slice(2);
if (args.length >= 2) {
  await render(page, args[0], args[1]);
} else {
  const candDir = join(here, 'candidates');
  const outDir = join(here, 'out');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const files = readdirSync(candDir).filter(f => f.endsWith('.html'));
  for (const f of files) {
    await render(page, join(candDir, f), join(outDir, f.replace(/\.html$/, '.png')));
  }
}

await browser.close();
