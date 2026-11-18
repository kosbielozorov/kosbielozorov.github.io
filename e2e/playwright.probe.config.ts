import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Runs adversarial probes (`.work/review/**\/*.probe.ts`) — throw-away tests the
 * `adversarial-tester` subagent writes to prove a weak assertion. Same settings as the main
 * config, chromium only, no reporters that publish (Testomatio) and no junit file.
 */
export default defineConfig({
  ...base,
  testDir: './.work/review',
  testMatch: ['**/*.probe.ts'],
  reporter: [['list']],
  retries: 0,
  repeatEach: 1,
  projects: base.projects?.filter(p => p.name === 'chromium'),
});
