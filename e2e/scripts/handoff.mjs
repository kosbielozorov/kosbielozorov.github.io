#!/usr/bin/env node
/**
 * `npm run handoff -- init <feature>`  — creates `.work/<feature>/handoff.md` from the template.
 * `npm run handoff -- check <feature>` — checks the handoff (format: ai/instructions/08-handoff.md):
 *
 *   - required sections and the status line are present; size under the soft limit;
 *   - every test file listed in section 2 (`**Tests:**`) exists;
 *   - the listed tests pass the Framework-contract lint rules (`TEST_CONTRACT_RULES` in
 *     `eslint.config.js`) — drafts under `.work/` included, which the full lint skips;
 *   - every question line (`Q-n: … → requirement | out of scope | open`) is numbered, unique, uses a
 *     defined resolution, and a resolved `Q-n` appears in the spec named in section 1;
 *   - `Flow: characterization` (legacy app, skill `characterize-feature`): every **Expected** line
 *     of the spec carries `(O-n; confirmed by <who>, <date>)`, and — once step 1 is done — no
 *     observation in the spec's **Observations** table is still `pending`;
 *   - the `**Gap plan:**` (G-n lines) matches `npm run gaps` on those tests: a reported gap that is
 *     not planned is an error (misspelled / renamed existing member); a planned gap that is no
 *     longer reported is closed.
 *
 * Exit code: 0 when there are no errors (warnings allowed); 1 otherwise.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import {
  TEST_CONTRACT_PLUGINS,
  TEST_CONTRACT_RULES,
} from '../eslint.config.js';

/** CLI output — a script's job is to print, so `no-console` does not apply here. */
const out = console;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(root, 'ai', 'templates', 'handoff.template.md');
const SOFT_LIMIT = 15 * 1024;
const SECTIONS = [
  '## 0. Status',
  '## 1. Scenarios',
  '## 2. Tests and gaps',
  '## 3. Implementation',
  '## 4. Run',
  '## 5. Review',
  '## Approvals',
];
const STATUS_LINE = /^Status: step [0-5] .+ — (in progress|done|blocked)/m;
/** A question line: `- Q-3: <question> → out of scope` (the `- ` is optional). */
const QUESTION_LINE = /^(?:- )?(Q-(?:\d+|\?))\s*:(.*)$/;
const RESOLUTION = /→\s*(requirement|out of scope|open)\b/;
const GAP_LINE = /^- (G-\d+) (FIXTURE|PAGE|CONTROLLER|METHOD) `?([\w.]+)`?/;
const FEATURE = /^[a-z0-9][a-z0-9-]*$/;
const FLOW_LINE = /^- Flow:\s*(requirement|characterization)\b/m;
const CONFIRMATION =
  /\(O-\d+(?:, O-\d+)*; confirmed by .+?, \d{4}-\d{2}-\d{2}\)/;
const OBSERVATION_ROW = /^\|\s*(O-\d+)\s*\|.*\|\s*([^|]*?)\s*\|\s*$/;

const [command, target] = process.argv.slice(2);
if (command === 'init') init(target);
else if (command === 'check') await check(target);
else {
  out.error('Usage: npm run handoff -- init <feature> | check <feature|path>');
  process.exit(1);
}

function handoffPath(feature) {
  return path.join(root, '.work', feature, 'handoff.md');
}

function init(feature) {
  if (!feature || !FEATURE.test(feature)) {
    out.error('handoff init: <feature> must be kebab-case, e.g. user-login');
    process.exit(1);
  }
  const file = handoffPath(feature);
  if (fs.existsSync(file)) {
    out.error(`handoff init: ${path.relative(root, file)} already exists`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    fs.readFileSync(TEMPLATE, 'utf8').replaceAll('{{feature}}', feature),
  );
  out.log(`handoff: created ${path.relative(root, file)}`);
}

async function check(arg) {
  if (!arg) {
    out.error('handoff check: give a <feature> or a path');
    process.exit(1);
  }
  const file = arg.endsWith('.md')
    ? path.resolve(process.cwd(), arg)
    : handoffPath(arg);
  if (!fs.existsSync(file)) {
    out.error(`handoff check: ${path.relative(root, file)} not found`);
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf8');
  const errors = [];
  const warnings = [];
  const info = [];

  for (const heading of SECTIONS)
    if (!text.includes(`\n${heading}`))
      errors.push(`missing section "${heading}"`);
  if (!STATUS_LINE.test(text))
    errors.push(
      'missing status line: "Status: step <n> <name> — in progress | done | blocked"',
    );
  const size = Buffer.byteLength(text);
  if (size > SOFT_LIMIT)
    warnings.push(
      `size ${(size / 1024).toFixed(1)} KB > 15 KB soft limit — trim duplicates`,
    );

  checkQuestions(text, { errors, warnings, info });
  checkCharacterization(text, { errors, warnings, info });

  const section2 = sectionText(text, '## 2. Tests and gaps');
  const tests = testFiles(section2, errors);
  const plan = gapPlan(section2, errors);

  if (tests.length) {
    await lintContract(tests, { errors, info });
    compareGaps(tests, plan, { errors, warnings, info });
  } else if (plan.size)
    warnings.push('gap plan without **Tests:** — nothing to compare');

  out.log(`handoff check — ${path.relative(root, file)}`);
  for (const line of info) out.log(`  ${line}`);
  for (const w of warnings) out.log(`  warn   ${w}`);
  for (const e of errors) out.log(`  error  ${e}`);
  out.log(errors.length ? `FAIL — ${errors.length} error(s)` : 'OK');
  process.exit(errors.length ? 1 : 0);
}

/**
 * Question lines anywhere in the handoff (sections 1 and 5). Each must be numbered by the runner
 * (`Q-?` is a proposal, not a recorded question), unique, and — once answered — end in a defined
 * resolution that the spec records (the spec cites the `Q-n`), because `.work/` is not committed.
 */
function checkQuestions(text, { errors, warnings, info }) {
  const { specPath, spec } = specOf(text);
  const seen = new Set();
  let resolved = 0;
  for (const raw of text.split('\n')) {
    const m = QUESTION_LINE.exec(raw.trim());
    if (!m) continue;
    if (
      checkQuestion(m[1], m[2], raw.trim(), {
        specPath,
        spec,
        seen,
        errors,
        warnings,
      })
    )
      resolved += 1;
  }
  if (seen.size)
    info.push(`questions: ${seen.size} recorded, ${resolved} resolved`);
}

/** Checks one question line; returns `true` when it carries a valid resolution. */
function checkQuestion(
  id,
  rest,
  line,
  { specPath, spec, seen, errors, warnings },
) {
  if (id === 'Q-?') {
    errors.push(
      `unnumbered question "${line.slice(0, 80)}" — give it the next free Q-n`,
    );
    return false;
  }
  if (seen.has(id))
    errors.push(`question ${id} appears twice — one line per question`);
  seen.add(id);
  if (!rest.includes('→')) {
    warnings.push(`${id} not resolved yet`);
    return false;
  }
  const res = RESOLUTION.exec(rest);
  if (!res) {
    errors.push(
      `${id}: resolution must be "→ requirement | out of scope | open"`,
    );
    return false;
  }
  if (!specPath)
    errors.push(`${id} is resolved but section 1 names no "Spec:" path`);
  else if (spec === null) errors.push(`${id}: spec ${specPath} not found`);
  else if (!new RegExp(`\\b${id}\\b`).test(spec))
    errors.push(
      `${id} → ${res[1]}, but ${specPath} does not cite ${id} — record the answer in the spec`,
    );
  return true;
}

/** The spec named in section 1 (`Spec: \`specs/<f>.md\``): its path and text (`null` if missing). */
function specOf(text) {
  const specPath = /Spec:\s*`([^`]+\.md)`/.exec(
    sectionText(text, '## 1. Scenarios'),
  )?.[1];
  const spec =
    specPath && fs.existsSync(path.join(root, specPath))
      ? fs.readFileSync(path.join(root, specPath), 'utf8')
      : null;
  return { specPath, spec };
}

/** Bullets under every `**Expected…**` heading of a spec; a wrapped bullet is joined into one line. */
function expectedLines(spec) {
  const lines = [];
  let inExpected = false;
  for (const raw of spec.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('**Expected')) inExpected = true;
    else if (line.startsWith('**') || line.startsWith('#')) inExpected = false;
    else if (inExpected && line.startsWith('- ')) lines.push(line);
    else if (inExpected && line && /^\s/.test(raw) && lines.length)
      lines[lines.length - 1] += ` ${line}`;
  }
  return lines;
}

/**
 * Characterization flow (`Flow: characterization`): the oracle is a confirmed observation. Every
 * Expected line must cite its observation and who confirmed it; after step 1 (Gate 1 triage) no
 * observation may stay `pending`.
 */
function checkCharacterization(text, { errors, warnings, info }) {
  const flow = FLOW_LINE.exec(text)?.[1];
  if (!flow) {
    warnings.push(
      'no "- Flow: requirement | characterization" line in section 0 — assuming requirement',
    );
    return;
  }
  if (flow !== 'characterization') return;
  const { specPath, spec } = specOf(text);
  if (spec === null) {
    warnings.push(
      `characterization: spec ${specPath ?? '(none named)'} not found yet`,
    );
    return;
  }
  const unconfirmed = expectedLines(spec).filter(l => !CONFIRMATION.test(l));
  for (const line of unconfirmed)
    errors.push(
      `characterization: Expected line without confirmation "${line.slice(0, 70)}" — add "(O-n; confirmed by <who>, <YYYY-MM-DD>)" or move it to Open questions`,
    );
  const rows = spec
    .split('\n')
    .map(l => OBSERVATION_ROW.exec(l.trim()))
    .filter(Boolean);
  const pending = rows.filter(m => /^pending$/i.test(m[2]) || m[2] === '');
  const step = Number(/^Status: step (\d)/m.exec(text)?.[1] ?? 0);
  for (const m of pending) {
    const msg = `characterization: observation ${m[1]} is not triaged (intended / suspected bug / out of scope)`;
    if (step >= 2 || (step === 1 && /^Status: step 1 .+ — done/m.test(text)))
      errors.push(msg);
    else warnings.push(msg);
  }
  info.push(
    `characterization: ${rows.length} observation(s), ${pending.length} pending; ${expectedLines(spec).length} Expected line(s), ${unconfirmed.length} unconfirmed`,
  );
}

/** Text of one `## ` section, up to the next `## ` heading. */
function sectionText(text, heading) {
  const start = text.indexOf(`\n${heading}`);
  if (start === -1) return '';
  const next = text.indexOf('\n## ', start + heading.length + 1);
  return text.slice(start, next === -1 ? undefined : next);
}

/** Backticked `.ts` paths on the `**Tests:**` line; each must exist. */
function testFiles(section, errors) {
  const line = section.split('\n').find(l => l.startsWith('**Tests:**')) ?? '';
  const files = [...line.matchAll(/`([^`]+\.ts)`/g)].map(m => m[1]);
  for (const f of files)
    if (!fs.existsSync(path.join(root, f)))
      errors.push(`test file not found: ${f}`);
  return files.filter(f => fs.existsSync(path.join(root, f)));
}

/** `- G-n KIND key` lines → Map(key → { id, kind }). */
function gapPlan(section, errors) {
  const plan = new Map();
  const ids = new Set();
  for (const line of section.split('\n')) {
    const m = GAP_LINE.exec(line.trim());
    if (!m) continue;
    const [, id, kind, key] = m;
    if (ids.has(id)) errors.push(`duplicate gap id ${id}`);
    if (plan.has(key)) errors.push(`gap ${key} planned twice`);
    ids.add(id);
    plan.set(key, { id, kind });
  }
  return plan;
}

/**
 * Runs the Framework-contract lint rules on the tests. Type-aware rules are not in this set, so it
 * works on drafts outside the TypeScript project; the full `npm run lint:contract` still applies
 * once a draft moves to `tests/`.
 */
async function lintContract(tests, { errors, info }) {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ['**/*.ts'],
        languageOptions: { parser: tseslint.parser },
        plugins: TEST_CONTRACT_PLUGINS,
        rules: TEST_CONTRACT_RULES,
      },
    ],
  });
  const results = await eslint.lintFiles(tests.map(t => path.join(root, t)));
  let count = 0;
  for (const r of results)
    for (const m of r.messages) {
      count += 1;
      const where = `${path.relative(root, r.filePath)}:${m.line}`;
      errors.push(`contract ${where} ${m.message} [${m.ruleId ?? 'parse'}]`);
    }
  const drafts = tests.filter(t => t.startsWith('.work/')).length;
  const note = drafts
    ? ` (contract rules only — full lint after the move to tests/ for ${drafts} draft(s))`
    : '';
  info.unshift(
    `contract lint: ${tests.length} test file(s), ${count} problem(s)${note}`,
  );
}

/** Runs `gaps --json` on the tests and compares its output with the plan. */
function compareGaps(tests, plan, { errors, warnings, info }) {
  const run = spawnSync(
    process.execPath,
    [path.join(root, 'scripts', 'gaps.mjs'), '--json', ...tests],
    { cwd: root, encoding: 'utf8' },
  );
  let result;
  try {
    result = JSON.parse(run.stdout);
  } catch {
    errors.push(
      `npm run gaps failed: ${(run.stderr || run.stdout).trim().slice(0, 200)}`,
    );
    return;
  }

  const reported = new Map(result.gaps.map(g => [g.key, g]));
  let open = 0;
  for (const [key, { id, kind }] of plan) {
    const actual = reported.get(key);
    if (!actual) info.push(`closed  ${id} ${kind} ${key}`);
    else {
      open += 1;
      info.push(`open    ${id} ${kind} ${key}`);
      if (actual.kind !== kind)
        warnings.push(`${id}: planned as ${kind}, gaps reports ${actual.kind}`);
    }
  }
  for (const [key, g] of reported) {
    if (plan.has(key)) continue;
    const hint = g.similar ? ` (similar to: ${g.similar})` : '';
    errors.push(
      `not in gap plan: ${g.kind} ${key}${hint} — a misspelled or renamed existing member? Fix the test; add it to the plan only if it is genuinely new`,
    );
  }
  for (const o of result.other)
    warnings.push(
      `type error ${o.code} at ${o.where}: ${o.text.slice(0, 120)}`,
    );
  info.unshift(
    `gaps: ${tests.length} test file(s), ${plan.size} planned, ${open} open, ${plan.size - open} closed, ${reported.size - open} unplanned`,
  );
}
