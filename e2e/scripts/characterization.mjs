#!/usr/bin/env node
/**
 * `npm run characterization:check` — keeps characterization scaffolding honest
 * (ai/instructions/02-architecture.md → Characterization scaffolding; skill `characterize-feature`):
 *
 *   - `specs/app-map.md`: zone ids (`### Z-n`) are unique and each zone has a valid `- Status:`;
 *   - every test under `tests/characterization/` cites an existing zone;
 *   - a zone whose status is `covered` still has scaffolding → warning: delete it (D7), functional
 *     tests now hold that zone;
 *   - a zone marked `scaffolded` with no scaffolding test → warning;
 *   - a zone marked `partial` without a `- Covered:` line → warning.
 *
 * Exit code: 0 when there are no errors (warnings allowed); 1 otherwise. No app map and no
 * scaffolding → nothing to check (the requirement flow does not use them).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** CLI output — a script's job is to print, so `no-console` does not apply here. */
const out = console;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAP = path.join(root, 'specs', 'app-map.md');
const SCAFFOLD_DIR = path.join(root, 'tests', 'characterization');
const ZONE_HEADING = /^###\s+(Z-\d+)\s+(.+)$/;
const STATUS =
  /^- Status:\s*(unexplored|observed|scaffolded|partial|covered)\b/;
const ZONE_SOURCE = /specs\/app-map\.md#(Z-\d+)/g;

const errors = [];
const warnings = [];

const zones = readZones();
const scaffolding = readScaffolding();

for (const [file, cited] of scaffolding)
  for (const zone of cited) {
    const z = zones.get(zone);
    if (!z)
      errors.push(
        `${file} cites ${zone}, which specs/app-map.md does not define`,
      );
    else if (z.status === 'covered')
      warnings.push(
        `${file}: zone ${zone} is covered by functional tests — delete its scaffolding (and its snapshots)`,
      );
  }
for (const [id, z] of zones)
  if (
    z.status === 'scaffolded' &&
    ![...scaffolding.values()].some(cited => cited.has(id))
  )
    warnings.push(
      `zone ${id} is "scaffolded" but no test under tests/characterization/ cites it`,
    );
for (const [id, z] of zones)
  if (z.status === 'partial' && !z.covered)
    warnings.push(
      `zone ${id} is "partial" but has no "- Covered: <entry points> → <spec>" line`,
    );

out.log('characterization check');
out.log(`  ${zones.size} zone(s), ${scaffolding.size} scaffolding file(s)`);
for (const w of warnings) out.log(`  warn   ${w}`);
for (const e of errors) out.log(`  error  ${e}`);
out.log(errors.length ? `FAIL — ${errors.length} error(s)` : 'OK');
process.exit(errors.length ? 1 : 0);

/** Zones of `specs/app-map.md`: id → { name, status }. */
function readZones() {
  const result = new Map();
  if (!fs.existsSync(MAP)) return result;
  let current = null;
  for (const raw of fs.readFileSync(MAP, 'utf8').split('\n')) {
    const line = raw.trim();
    const heading = ZONE_HEADING.exec(line);
    if (heading) {
      if (result.has(heading[1]))
        errors.push(
          `specs/app-map.md: zone ${heading[1]} is defined twice — never reuse a zone id`,
        );
      current = { name: heading[2], status: null, covered: false };
      result.set(heading[1], current);
      continue;
    }
    if (current) readZoneLine(line, current);
  }
  for (const [id, z] of result)
    if (!z.status)
      errors.push(
        `specs/app-map.md: zone ${id} has no "- Status: unexplored | observed | scaffolded | partial | covered" line`,
      );
  return result;
}

/** One `- Status:` / `- Covered:` line of the current zone. */
function readZoneLine(line, zone) {
  const status = STATUS.exec(line);
  if (status) zone.status = status[1];
  if (/^- Covered:\s*\S/.test(line)) zone.covered = true;
}

/** Scaffolding test files (relative path) → the zones they cite. */
function readScaffolding() {
  const result = new Map();
  if (!fs.existsSync(SCAFFOLD_DIR)) return result;
  for (const entry of fs.readdirSync(SCAFFOLD_DIR, { recursive: true })) {
    const file = path.join(SCAFFOLD_DIR, entry);
    if (!file.endsWith('.test.ts')) continue;
    const cited = new Set(
      [...fs.readFileSync(file, 'utf8').matchAll(ZONE_SOURCE)].map(m => m[1]),
    );
    result.set(path.relative(root, file), cited);
  }
  return result;
}
