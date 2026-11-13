import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Runs characterization scaffolding (`tests/characterization/**\/*.test.ts`) — temporary tests
 * that pin the current behaviour of a legacy zone (ARIA snapshots, API response shapes) until
 * functional tests cover it. Nightly only, never in PR runs; the main config ignores this folder.
 * A red result means "behaviour changed", not "bug": a human decides whether to update the
 * snapshots (`npm run test:characterization -- --update-snapshots`) or file a bug. AI never
 * updates them on its own (`ai/instructions/02-architecture.md` → Characterization scaffolding).
 */
export default defineConfig({
  ...base,
  testDir: './tests/characterization',
  testIgnore: [],
  /* Response shapes do not depend on the OS / browser — no `-chromium-darwin` suffix, so a snapshot
   * written locally is found on CI. */
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  projects: base.projects?.filter(p => p.name === 'chromium'),
});
