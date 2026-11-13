#!/usr/bin/env node
/**
 * `npm run resume:pdf` — prints the resume page to the downloadable PDFs, one per language:
 * `../public/download/qa-engineer-k.bielozorov-{en,ua}.pdf`. The PDF is the page as the site renders
 * it (`@media print` in `src/components/Resume/resume.css`), so it never drifts from
 * `src/info/{en,uk}.js`. Run it after changing the resume data; review both files before committing.
 *
 * Uses the dev server at DEV_BASE_APP_URL (default http://localhost:5173); starts it when it is not
 * running and stops it afterwards. (Known defect RESUME-1: the Ukrainian PDF was a copy of the English one.)
 */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

/** CLI output — a script's job is to print, so `no-console` does not apply here. */
const out = console;
const PACKAGE_ROOT = join(import.meta.dirname, '..');
const SITE_ROOT = join(PACKAGE_ROOT, '..');
const BASE_URL = process.env.DEV_BASE_APP_URL ?? 'http://localhost:5173';
const OUTPUT = join(SITE_ROOT, 'public', 'download');
const LANGUAGES = [
  { locale: 'en-US', file: 'qa-engineer-k.bielozorov-en.pdf' },
  { locale: 'uk-UA', file: 'qa-engineer-k.bielozorov-ua.pdf' },
];

async function reachable() {
  try {
    return (await fetch(BASE_URL)).ok;
  } catch {
    return false;
  }
}

async function startServer() {
  if (await reachable()) return null;
  const port = new URL(BASE_URL).port || '5173';
  const server = spawn(
    'npm',
    ['run', 'dev', '--', '--port', port, '--strictPort'],
    {
      cwd: SITE_ROOT,
      stdio: 'ignore',
    },
  );
  for (let i = 0; i < 60; i++) {
    if (await reachable()) return server;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  server.kill();
  throw new Error(`The dev server did not start at ${BASE_URL}`);
}

const server = await startServer();
const browser = await chromium.launch();
try {
  for (const { locale, file } of LANGUAGES) {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    await page.goto(new URL('/my-resume', BASE_URL).href, {
      waitUntil: 'networkidle',
    });
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const path = join(OUTPUT, file);
    await page.pdf({
      path,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      /* Fits the longer Ukrainian resume on one A4 page; the English one stays one page too. */
      scale: 0.96,
    });
    out.log(`${locale} → public/download/${file}`);
    await context.close();
  }
} finally {
  await browser.close();
  server?.kill();
}
