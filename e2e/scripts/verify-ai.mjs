#!/usr/bin/env node
/**
 * verify:ai — integrity check for the AI layer.
 *
 * Fails on:
 *  1. broken / degraded skill symlinks (Windows checkouts turn them into text files)
 *  2. loader skill sets drifting from the SSoT in ai/skills
 *  3. missing or mismatched SKILL.md frontmatter
 *  4. dead file references inside markdown
 *  5. leftovers of pre-`ai/` layout names
 */
import {
  readdirSync,
  readFileSync,
  lstatSync,
  existsSync,
  realpathSync,
} from 'node:fs';
import { dirname, join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HOSTS,
  readDefinition,
  outputPath,
  renderConfig,
  serialize,
} from './lib/mcp.mjs';
import { VENDORED_SKILLS, renderVendoredSkill } from './lib/skills.mjs';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SSOT = join(PKG, 'ai', 'skills');

const errors = [];
const warnings = [];
const fail = m => errors.push(m);
const warn = m => warnings.push(m);
const rel = p => relative(PKG, p) || '.';

/** Skill directories that are the single source of truth. */
const skills = readdirSync(SSOT, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

if (skills.length === 0) fail(`no skills found in ${rel(SSOT)}`);

// ── 1 + 2. Loader symlinks ───────────────────────────────────────────────────
const loaders = [
  join(PKG, '.claude', 'skills'),
  join(PKG, '.cursor', 'skills'),
];

for (const loader of loaders) {
  if (!existsSync(loader)) {
    fail(`loader directory missing: ${rel(loader)} — run the loader generator`);
    continue;
  }

  const entries = readdirSync(loader)
    .filter(n => !n.startsWith('.'))
    .sort();

  for (const name of skills.filter(s => !entries.includes(s))) {
    fail(`${rel(loader)}: skill "${name}" is missing`);
  }
  for (const name of entries.filter(e => !skills.includes(e))) {
    fail(`${rel(loader)}: "${name}" has no counterpart in ${rel(SSOT)}`);
  }

  for (const name of entries) {
    const link = join(loader, name);
    const stat = lstatSync(link);

    if (!stat.isSymbolicLink()) {
      fail(
        `${rel(link)} is not a symlink (${stat.isFile() ? 'plain file' : 'directory'}) — ` +
          `typical of a Windows checkout without core.symlinks=true`,
      );
      continue;
    }
    if (!existsSync(link)) {
      fail(`${rel(link)} is a broken symlink`);
      continue;
    }
    if (realpathSync(link) !== realpathSync(join(SSOT, name))) {
      fail(
        `${rel(link)} resolves outside the SSoT: ${rel(realpathSync(link))}`,
      );
    }
  }
}

// ── 2b. MCP configs match the SSoT ───────────────────────────────────────────
const definition = readDefinition(PKG);

// JSON silently keeps the *last* of two identical keys, so a duplicated server
// name looks fine to the parser while quietly discarding the other definition.
const ssotPath = join(PKG, 'ai', 'mcp', 'servers.json');
const ssotSource = readFileSync(ssotPath, 'utf8');
for (const name of Object.keys(definition.servers)) {
  const occurrences = ssotSource.split(`"${name}":`).length - 1;
  if (occurrences > 1) {
    fail(
      `${rel(ssotPath)}: server "${name}" is declared ${occurrences} times — ` +
        `JSON keeps only the last one`,
    );
  }
}

for (const host of Object.keys(HOSTS)) {
  const expected = renderConfig(definition, host);
  const target = outputPath(PKG, host);

  if (!expected) continue;

  if (!existsSync(target)) {
    fail(`${rel(target)} is missing — run \`npm run sync:ai\``);
    continue;
  }
  if (readFileSync(target, 'utf8') !== serialize(expected)) {
    fail(
      `${rel(target)} does not match ai/mcp/servers.json — edit the SSoT, then run \`npm run sync:ai\` ` +
        `(never hand-edit or reformat a generated config)`,
    );
  }
}

// ── 2c. Vendored skills match their upstream copy ────────────────────────────
for (const name of Object.keys(VENDORED_SKILLS)) {
  const rendered = renderVendoredSkill(PKG, name);

  if (!rendered) {
    warn(
      `skill "${name}" not checked — ${VENDORED_SKILLS[name].package} is not installed`,
    );
    continue;
  }

  for (const [file, content] of Object.entries(rendered)) {
    const target = join(SSOT, name, file);

    if (!existsSync(target)) {
      fail(`${rel(target)} is missing — run \`npm run sync:ai\``);
      continue;
    }
    if (readFileSync(target, 'utf8') !== content) {
      fail(
        `${rel(target)} differs from the copy shipped in ${VENDORED_SKILLS[name].package} — ` +
          `run \`npm run sync:ai\` (local additions belong in scripts/lib/${name}.overlay.md)`,
      );
    }
  }
}

// ── 3. Skill frontmatter ─────────────────────────────────────────────────────
for (const name of skills) {
  const file = join(SSOT, name, 'SKILL.md');
  if (!existsSync(file)) {
    fail(`${rel(file)} is missing`);
    continue;
  }

  const body = readFileSync(file, 'utf8');
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(body);
  if (!fm) {
    fail(`${rel(file)}: no YAML frontmatter`);
    continue;
  }

  const declared = /^name:\s*(.+)$/m.exec(fm[1])?.[1]?.trim();
  if (!declared) fail(`${rel(file)}: frontmatter has no "name"`);
  else if (declared !== name)
    fail(`${rel(file)}: name "${declared}" ≠ directory "${name}"`);
  if (!/^description:\s*\S/m.test(fm[1]))
    fail(`${rel(file)}: frontmatter has no "description"`);
}

// ── 4 + 5. Markdown references ───────────────────────────────────────────────
const STALE = ['.agents/', 'AI-instructions/', 'playwright-skill.project.md'];
const CHECKED_EXT = new Set(['.md', '.mdc', '.ts', '.js', '.mjs', '.json']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'test-results',
  'playwright-report',
  '.work', // per-feature working files (handoff, drafts) — not guidance
]);

const markdown = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue; // SSoT is visited directly
    if (entry.isDirectory()) walk(full);
    else if (/\.mdc?$/.test(entry.name)) markdown.push(full);
  }
})(PKG);

for (const file of markdown) {
  const body = readFileSync(file, 'utf8');

  for (const token of STALE) {
    if (body.includes(token))
      fail(`${rel(file)}: stale path "${token}" from the pre-ai/ layout`);
  }

  // Templates describe *other* repositories — their paths are examples, not references.
  if (file.startsWith(join(PKG, 'ai', 'templates'))) continue;

  // Vendored skills are upstream content; their example paths are not ours to fix.
  if (Object.keys(VENDORED_SKILLS).some(n => file.startsWith(join(SSOT, n))))
    continue;

  for (const [, raw] of body.matchAll(/`([^`\s]+)`/g)) {
    if (!raw.includes('/') || raw.includes('*') || raw.includes('://'))
      continue;
    if (raw.startsWith('@') || raw.startsWith('#')) continue;
    if (raw.startsWith('~')) continue; // home-directory paths are never repo references
    if (/[<>{}]/.test(raw)) continue; // placeholders: <name>, {{feature}}, {a,b}
    if (!CHECKED_EXT.has(extname(raw))) continue;

    const path = raw.split('#')[0];
    const bases = [
      dirname(file),
      PKG,
      join(PKG, 'ai'),
      join(PKG, 'ai', 'instructions'),
    ];
    if (!bases.some(base => existsSync(resolve(base, path)))) {
      warn(`${rel(file)}: reference not found — ${raw}`);
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const log = console;
log.info(
  `verify:ai — ${skills.length} skills, ${loaders.length} loaders, ${markdown.length} markdown files`,
);
for (const w of warnings) log.warn(`  warn  ${w}`);
for (const e of errors) log.error(`  ERROR ${e}`);

if (errors.length) {
  log.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
log.info(`OK — no errors, ${warnings.length} warning(s)`);
