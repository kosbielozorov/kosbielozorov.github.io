#!/usr/bin/env node
/**
 * `npm run gaps [-- <file|dir>...] [--json]` — lists what a test calls that does not exist yet.
 *
 * Test-first authoring: write the test against the Page Objects / controllers / fixtures it
 * *should* have, calling missing ones as if they existed. This script type-checks the tests and
 * turns "Property 'x' does not exist on type 'Y'" into a gap list:
 *
 *   FIXTURE     usersFlow                                  unknown fixture in the test arguments
 *   PAGE        pageManager.homePage                       page not registered on PageManager
 *   CONTROLLER  controllersManager.usersController         controller not on ControllersManager
 *   METHOD      LoginPage.logout                           method missing on an existing class
 *   METHOD      pageManager.homePage.expectWelcome         method the test calls on a new page
 *
 * A gap list that differs from the plan means the test misspelled or renamed something that
 * already exists — fix the test, do not create the method. When TypeScript finds a similar existing
 * name, the gap carries it (`similar to: login`): either it is a misspelling (fix the test) or a
 * genuinely new member with a close name (keep the gap). Any other type error is reported as OTHER.
 *
 * Default scope: `tests/`. Paths may point outside it (e.g. a draft under `.work/`).
 * Exit code: 0 when nothing is missing and there are no other errors; 1 otherwise.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/** CLI output — a script's job is to print, so `no-console` does not apply here. */
const out = console;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Facades from the binding (`ai/project.md`): fixture name + base class whose members are inherited. */
const FACADES = {
  PageManager: {
    fixture: 'pageManager',
    kind: 'PAGE',
    suffix: 'Page',
    base: { name: 'BasePage', file: 'app/ui/pages/BasePage.ts' },
  },
  ControllersManager: {
    fixture: 'controllersManager',
    kind: 'CONTROLLER',
    suffix: 'Controller',
    base: {
      name: 'BaseController',
      file: 'app/api/controllers/Base.controller.ts',
    },
  },
};
/** Marks the type of a test function's first argument (the fixtures object). */
const FIXTURE_ARGS = /Playwright(Test|Worker)(Args|Options)/;
const MISSING_PROPERTY = 2339;
const DID_YOU_MEAN = 2551;

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const targets = args.filter(a => a !== '--json');
const targetFiles = (targets.length ? targets : ['tests']).flatMap(t =>
  collectTs(path.resolve(process.cwd(), t)),
);
if (targetFiles.length === 0) {
  out.error(`gaps: no .ts files in ${targets.join(', ') || 'tests/'}`);
  process.exit(1);
}

const config = ts.readConfigFile(
  path.join(root, 'tsconfig.json'),
  ts.sys.readFile,
);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram({
  rootNames: [...new Set([...parsed.fileNames, ...targetFiles])],
  options: parsed.options,
});
const checker = program.getTypeChecker();

const gaps = new Map(); // key -> { kind, key, locations: Set }
const other = [];

for (const file of targetFiles) {
  const sf = program.getSourceFile(file);
  const diagnostics = [
    ...program.getSyntacticDiagnostics(sf),
    ...program.getSemanticDiagnostics(sf),
  ];
  for (const d of diagnostics) {
    const where = location(sf, d.start);
    const text = ts
      .flattenDiagnosticMessageText(d.messageText, '\n')
      .split('\n')[0];
    const match = /Property '([^']+)' does not exist on type '([^']+)'/.exec(
      text,
    );

    if ((d.code === MISSING_PROPERTY || d.code === DID_YOU_MEAN) && match) {
      const similar = /Did you mean '([^']+)'/.exec(text)?.[1];
      classify(match[1], match[2], findIdentifier(sf, d.start), where, similar);
    } else {
      other.push({ where, code: `TS${d.code}`, text });
    }
  }
}

report();
process.exit(gaps.size + other.length === 0 ? 0 : 1);

// ── classification ──────────────────────────────────────────────────────────

/** Records one missing property as a gap, plus the members the test uses on it when it is new. */
function classify(name, typeName, node, where, similar) {
  if (FIXTURE_ARGS.test(typeName)) {
    addGap('FIXTURE', name, where, similar);
    for (const m of membersUsed(node)) addGap('METHOD', `${name}.${m}`, where);
    return;
  }
  const facade = FACADES[typeName];
  if (facade && name.endsWith(facade.suffix)) {
    const key = `${facade.fixture}.${name}`;
    addGap(facade.kind, key, where, similar);
    const inherited = baseMembers(facade.base);
    for (const m of membersUsed(node))
      if (!inherited.has(m)) addGap('METHOD', `${key}.${m}`, where);
    return;
  }
  addGap('METHOD', `${typeLabel(typeName)}.${name}`, where, similar);
}

function addGap(kind, key, where, similar) {
  if (!gaps.has(key))
    gaps.set(key, {
      kind,
      key,
      ...(similar && { similar }),
      locations: new Set(),
    });
  gaps.get(key).locations.add(where);
}

/**
 * Members accessed on a missing property: `x.missing.member` or, for a destructured
 * `{ missing }`, every `missing.member` inside the enclosing function.
 */
function membersUsed(node) {
  const members = new Set();
  if (!node) return members;
  const parent = node.parent;

  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    const outer = parent.parent;
    if (ts.isPropertyAccessExpression(outer) && outer.expression === parent)
      members.add(outer.name.text);
    return members;
  }

  if (ts.isBindingElement(parent)) {
    const local = ts.isIdentifier(parent.name) ? parent.name.text : null;
    let fn = parent;
    while (fn && !ts.isFunctionLike(fn)) fn = fn.parent;
    if (!local || !fn?.body) return members;
    (function walk(n) {
      if (
        ts.isPropertyAccessExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === local
      )
        members.add(n.name.text);
      ts.forEachChild(n, walk);
    })(fn.body);
  }
  return members;
}

/** Public and protected members a new page/controller inherits from its base class. */
function baseMembers({ name, file }) {
  const sf = program.getSourceFile(path.join(root, file));
  const decl = sf?.statements.find(
    s => ts.isClassDeclaration(s) && s.name?.text === name,
  );
  if (!decl) return new Set();
  const type = checker.getDeclaredTypeOfSymbol(
    checker.getSymbolAtLocation(decl.name),
  );
  return new Set(checker.getPropertiesOfType(type).map(p => p.name));
}

// ── helpers ─────────────────────────────────────────────────────────────────

function collectTs(p) {
  if (!fs.existsSync(p)) {
    out.error(`gaps: path not found — ${path.relative(root, p)}`);
    process.exit(1);
  }
  if (fs.statSync(p).isFile()) return p.endsWith('.ts') ? [p] : [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .flatMap(e => collectTs(path.join(p, e.name)));
}

/** The identifier token that starts at `pos`, if any. */
function findIdentifier(sf, pos) {
  let found;
  (function walk(n) {
    if (pos < n.getStart(sf) || pos >= n.getEnd()) return;
    if (ts.isIdentifier(n) && n.getStart(sf) === pos) found = n;
    ts.forEachChild(n, walk);
  })(sf);
  return found;
}

function location(sf, pos) {
  const { line, character } = sf.getLineAndCharacterOfPosition(pos ?? 0);
  return `${path.relative(root, sf.fileName)}:${line + 1}:${character + 1}`;
}

/** Short label for a type in output: the fixtures object becomes `fixtures`. */
function typeLabel(typeName) {
  return FIXTURE_ARGS.test(typeName) ? 'fixtures' : typeName;
}

function report() {
  const list = [...gaps.values()]
    .map(g => ({ ...g, locations: [...g.locations] }))
    .sort((a, b) => a.key.localeCompare(b.key));

  if (asJson) {
    out.log(JSON.stringify({ gaps: list, other }, null, 2));
    return;
  }

  out.log(
    `gaps — ${targetFiles.length} file(s): ${list.length} gap(s), ${other.length} other error(s)`,
  );
  for (const g of list) {
    const note = g.similar ? `  (similar to: ${g.similar} — misspelling?)` : '';
    out.log(
      `  ${g.kind.padEnd(10)} ${g.key.padEnd(44)} ${g.locations[0]}${note}`,
    );
  }
  for (const o of other)
    out.log(
      `  ${'OTHER'.padEnd(10)} ${`${o.code} ${o.text}`.slice(0, 100)}  ${o.where}`,
    );
  if (list.some(g => g.similar))
    out.log(
      '\nA gap with "similar to" may be a misspelled existing member: if it is not in the plan, fix the test.',
    );
}
