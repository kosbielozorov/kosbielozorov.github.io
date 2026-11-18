#!/usr/bin/env node
/**
 * sync:ai — (re)generate everything that only points at `ai/`:
 *   1. skill loaders  → ai/skills
 *   2. MCP configs    → ai/mcp/servers.json
 *
 * Symlinks by default for skills. Pass `--copy` on platforms where symlinks are
 * unavailable (Windows without core.symlinks / Developer Mode); re-run after
 * editing a skill, because copies do not track the SSoT.
 */
import {
  readdirSync,
  rmSync,
  mkdirSync,
  symlinkSync,
  cpSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
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
const COPY = process.argv.includes('--copy');

// ── Vendored skills — rendered from a dependency before the loaders are linked ──
for (const name of Object.keys(VENDORED_SKILLS)) {
  const files = renderVendoredSkill(PKG, name);

  if (!files) {
    // eslint-disable-next-line no-console
    console.warn(
      `skipped skill "${name}" — ${VENDORED_SKILLS[name].package} is not installed`,
    );
    continue;
  }

  for (const [file, content] of Object.entries(files)) {
    const target = join(SSOT, name, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }

  // eslint-disable-next-line no-console
  console.info(
    `vendored ${Object.keys(files).length} file(s) → ai/skills/${name}`,
  );
}

/** Loader directories that must mirror the SSoT. */
const loaders = [
  join(PKG, '.claude', 'skills'),
  join(PKG, '.cursor', 'skills'),
];

const skills = readdirSync(SSOT, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

for (const loader of loaders) {
  rmSync(loader, { recursive: true, force: true });
  mkdirSync(loader, { recursive: true });

  for (const name of skills) {
    const target = join(loader, name);
    if (COPY) {
      cpSync(join(SSOT, name), target, { recursive: true });
    } else {
      symlinkSync(relative(loader, join(SSOT, name)), target);
    }
  }

  // eslint-disable-next-line no-console
  console.info(
    `${COPY ? 'copied' : 'linked'} ${skills.length} skills → ${relative(PKG, loader)}`,
  );
}

// ── MCP configs ──────────────────────────────────────────────────────────────
const definition = readDefinition(PKG);

for (const host of Object.keys(HOSTS)) {
  const config = renderConfig(definition, host);
  const target = outputPath(PKG, host);

  if (!config) {
    // eslint-disable-next-line no-console
    console.info(
      `skipped ${relative(PKG, target)} — no server targets ${host}`,
    );
    continue;
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, serialize(config));

  // eslint-disable-next-line no-console
  console.info(
    `wrote ${Object.keys(config.mcpServers ?? config.servers).length} MCP server(s) → ${relative(PKG, target)}`,
  );
}
