/**
 * Vendoring for skills that ship inside a dependency.
 *
 * `playwright-cli` is maintained by the Playwright team and shipped in
 * `playwright-core`, version-matched to the test runner. Hand-copying it means the
 * copy silently rots: commands get renamed upstream while the vendored text keeps
 * telling the agent to run something that no longer exists.
 *
 * So the vendored file is rendered: upstream content + a small local overlay.
 * `sync:ai` writes it, `verify:ai` re-renders and compares, which turns a Playwright
 * upgrade into a visible, actionable diff.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const VENDORED_SKILLS = {
  'playwright-cli': {
    upstream: [
      'node_modules',
      'playwright-core',
      'lib',
      'tools',
      'skills',
      'playwright-cli',
    ],
    overlay: join(HERE, 'playwright-cli.overlay.md'),
    package: '@playwright/test (playwright-core)',
  },
};

export const upstreamDir = (pkgRoot, name) =>
  join(pkgRoot, ...VENDORED_SKILLS[name].upstream);

/** Inserted right after the H1 so the local notes are read before any command. */
const applyOverlay = (source, overlay) => {
  const lines = source.split('\n');
  const heading = lines.findIndex(line => line.startsWith('# '));

  if (heading === -1) throw new Error('upstream SKILL.md has no H1 heading');

  return [
    ...lines.slice(0, heading + 1),
    '',
    overlay.trimEnd(),
    ...lines.slice(heading + 1),
  ].join('\n');
};

/**
 * Renders the vendored skill from its upstream copy.
 *
 * @returns `{ 'SKILL.md': string, 'references/<file>': string }`, or `null` when the
 *   dependency is not installed (fresh clone before `npm install`).
 */
export function renderVendoredSkill(pkgRoot, name) {
  const source = upstreamDir(pkgRoot, name);
  if (!existsSync(source)) return null;

  const overlay = readFileSync(VENDORED_SKILLS[name].overlay, 'utf8');
  const files = {
    'SKILL.md': applyOverlay(
      readFileSync(join(source, 'SKILL.md'), 'utf8'),
      overlay,
    ),
  };

  const referenceDir = join(source, 'references');
  if (existsSync(referenceDir)) {
    for (const file of readdirSync(referenceDir).sort()) {
      files[`references/${file}`] = readFileSync(
        join(referenceDir, file),
        'utf8',
      );
    }
  }

  return files;
}
