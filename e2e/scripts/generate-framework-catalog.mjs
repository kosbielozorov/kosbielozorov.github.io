#!/usr/bin/env node
/**
 * Generates specs/framework-catalog.md — a compact, always-regenerated view of the concrete
 * Page/Component/Modal/Controller classes under app/. Never hand-edit the output; re-run
 * `npm run catalog:generate` instead. Source of truth is always the code (class-level JSDoc
 * summary + public method signatures); this file exists only to make "does something like this
 * already exist?" answerable without opening every candidate class.
 *
 * Line/regex-based, not AST-based — deliberately simple and dependency-free.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outFile = path.join(root, 'specs', 'framework-catalog.md');

const SECTIONS = [
  {
    title: 'Pages',
    dir: 'app/ui/pages',
    exclude: ['PageManager.ts', 'PageHolder.ts', 'BasePage.ts'],
  },
  {
    title: 'Components',
    dir: 'app/ui/components',
    exclude: ['Base.component.ts'],
  },
  { title: 'Modals', dir: 'app/ui/modals', exclude: ['Base.modal.ts'] },
  {
    title: 'API Controllers',
    dir: 'app/api/controllers',
    exclude: ['ControllersManager.ts', 'Base.controller.ts'],
  },
];

/**
 * Base classes every concrete class inherits from. Listed first so "does something like this
 * already exist?" covers inherited members (`open`, `expectOpened`, `mainTitle`, …) too.
 */
const BASE_FILES = [
  'app/ui/pages/PageHolder.ts',
  'app/ui/components/Base.component.ts',
  'app/ui/pages/BasePage.ts',
  'app/ui/modals/Base.modal.ts',
  'app/api/controllers/Base.controller.ts',
];

const FIELD_RE =
  /^(?:public\s+)?(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*(?::\s*([^=;]+?))?\s*[=;]/;
const ABSTRACT_RE = /^(?:public\s+)?abstract\s+([^;{]+)/;

const CLASS_RE =
  /^export\s+(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)(?:\s+extends\s+([A-Za-z_$][\w$.]*))?/;

function listFiles(dir, exclude) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter(f => f.endsWith('.ts') && !exclude.includes(f))
    .sort();
}

/** Walks backward from a class declaration line to its immediately-preceding JSDoc block. */
function extractSummaryAbove(lines, classLineIdx) {
  let i = classLineIdx - 1;
  while (i >= 0 && lines[i].trim() === '') i--;
  if (i < 0) return null;

  const soleLine = lines[i].trim();
  if (
    soleLine.startsWith('/**') &&
    soleLine.endsWith('*/') &&
    soleLine.length > 4
  ) {
    const body = soleLine
      .replace(/^\/\*\*/, '')
      .replace(/\*\/$/, '')
      .trim();
    return body || null;
  }

  if (soleLine !== '*/') return null;
  const end = i;
  let start = -1;
  for (let j = end; j >= Math.max(0, end - 40); j--) {
    if (lines[j].trim().startsWith('/**')) {
      start = j;
      break;
    }
  }
  if (start === -1) return null;
  const body = lines
    .slice(start, end + 1)
    .map(l =>
      l
        .trim()
        .replace(/^\/\*\*/, '')
        .replace(/\*\/$/, '')
        .replace(/^\*/, '')
        .trim(),
    )
    .filter(Boolean)
    .join(' ');
  return body || null;
}

/**
 * Splits a class body into top-level member chunks (property or method), skipping comments/strings.
 * A single-pass char scanner (comments/strings/brace-depth in one walk) is inherently branchy;
 * splitting it into smaller functions would only pass shared scanner state back and forth.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
function splitTopLevelMembers(classBody) {
  const members = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  const n = classBody.length;
  while (i < n) {
    const ch = classBody[i];
    if (ch === '/' && classBody[i + 1] === '/') {
      while (i < n && classBody[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && classBody[i + 1] === '*') {
      i += 2;
      while (i < n && !(classBody[i] === '*' && classBody[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === '`' || ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      while (i < n && classBody[i] !== quote) {
        if (classBody[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') {
      depth++;
      i++;
      continue;
    }
    if (ch === '}') {
      // Only a closing `}` can end a member (a method body, or an object-literal-returning
      // arrow property) — a closing `)`/`]` mid-expression (e.g. `.getByRole('x', {...})`)
      // must NOT split, or every property whose initializer calls a function would fracture.
      depth--;
      i++;
      if (depth === 0) {
        members.push(classBody.slice(start, i));
        start = i;
      }
      continue;
    }
    if (ch === ')' || ch === ']') {
      depth--;
      i++;
      continue;
    }
    if (ch === ';' && depth === 0) {
      members.push(classBody.slice(start, i + 1));
      start = i + 1;
      i++;
      continue;
    }
    i++;
  }
  const tail = classBody.slice(start).trim();
  if (tail) members.push(tail);
  return members;
}

const METHOD_RE =
  /^(?:(?:private|protected|public|static|readonly)\s+)*(async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/;

/** Strips a leading JSDoc block or a run of leading `//` comment lines before member code. */
function stripLeadingComments(text) {
  let s = text;
  for (;;) {
    const trimmed = s.replace(/^\s+/, '');
    if (trimmed.startsWith('/*')) {
      const end = trimmed.indexOf('*/');
      if (end === -1) return trimmed;
      s = trimmed.slice(end + 2);
      continue;
    }
    if (trimmed.startsWith('//')) {
      const nl = trimmed.indexOf('\n');
      s = nl === -1 ? '' : trimmed.slice(nl + 1);
      continue;
    }
    return trimmed;
  }
}

function extractParams(text, openParenIdx) {
  let depth = 0;
  let i = openParenIdx;
  for (; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) break;
    }
  }
  return { params: text.slice(openParenIdx + 1, i), closeIdx: i };
}

function methodFromChunk(rawChunk) {
  const chunk = stripLeadingComments(rawChunk);
  const m = METHOD_RE.exec(chunk);
  if (!m) return null;
  const isAsync = Boolean(m[1]);
  const name = m[2];
  if (name === 'constructor') return null;
  const openParenIdx = chunk.indexOf('(', m.index);
  const { params, closeIdx } = extractParams(chunk, openParenIdx);
  const afterParams = chunk.slice(closeIdx + 1);
  const braceIdx = afterParams.indexOf('{');
  if (braceIdx === -1) return null; // not a method body (e.g. a property typed as a function)
  let returnType = afterParams.slice(0, braceIdx).trim();
  if (returnType.startsWith(':')) returnType = returnType.slice(1).trim();
  const flatParams = params.replace(/\s+/g, ' ').trim().replace(/,\s*$/, '');
  const sig = `${isAsync ? 'async ' : ''}${name}(${flatParams})${returnType ? `: ${returnType}` : ''}`;
  return sig;
}

function isModifierExcluded(chunk) {
  return /^(?:private|protected)\b/.test(stripLeadingComments(chunk));
}

function findClassBody(text, afterIdx) {
  const openIdx = text.indexOf('{', afterIdx);
  if (openIdx === -1) return null;
  let depth = 1;
  let i = openIdx + 1;
  for (; i < text.length && depth > 0; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
  }
  return { openIdx, closeIdx: i - 1 };
}

/** Public fields and abstract members of a class body's visible (non-private) chunks. */
function collectFieldsAndAbstracts(chunks, fields, abstracts) {
  for (const c of chunks.map(stripLeadingComments)) {
    const a = ABSTRACT_RE.exec(c);
    if (a) {
      abstracts.push(a[1].replace(/\s+/g, ' ').trim());
      continue;
    }
    const f = FIELD_RE.exec(c);
    // A field, not a method: no `(` before its `=` / `;` (an initializer may call functions).
    const paren = c.indexOf('(');
    if (f && (paren === -1 || paren > c.search(/[=;]/)))
      fields.push(f[2] ? `${f[1]}: ${f[2].trim()}` : f[1]);
  }
}

function parseFile(dir, file) {
  const relPath = `${dir}/${file}`;
  const fullPath = path.join(root, dir, file);
  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split(/\r?\n/);

  const classes = [];
  let searchFrom = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = CLASS_RE.exec(lines[i]);
    if (!m) continue;
    const name = m[1];
    const extendsName = m[2] ?? null;
    const summary = extractSummaryAbove(lines, i);

    const lineStartIdx = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
    const body = findClassBody(text, Math.max(lineStartIdx, searchFrom));
    let methods = [];
    const fields = [];
    const abstracts = [];
    if (body) {
      const classBody = text.slice(body.openIdx + 1, body.closeIdx);
      const chunks = splitTopLevelMembers(classBody);
      const visible = chunks.filter(c => !isModifierExcluded(c));
      methods = visible.map(methodFromChunk).filter(Boolean).sort();
      collectFieldsAndAbstracts(visible, fields, abstracts);
      searchFrom = body.closeIdx + 1;
    }

    classes.push({
      name,
      extends: extendsName,
      summary,
      methods,
      fields,
      abstracts,
      file: relPath,
    });
  }
  return classes;
}

let totalClasses = 0;
let missingSummary = 0;
const sectionsOut = [];

const bases = BASE_FILES.filter(f => fs.existsSync(path.join(root, f))).flatMap(
  f => parseFile(path.dirname(f), path.basename(f)),
);
const list = (items, empty) =>
  items.length ? items.map(i => `  - \`${i}\``).join('\n') : `  - ${empty}`;
sectionsOut.push(
  `## Base classes (inherited — reuse before adding)\n\n${bases
    .map(c =>
      [
        `### ${c.name}`,
        '',
        `- **File:** \`${c.file}\``,
        `- **Extends:** \`${c.extends ?? '—'}\``,
        '',
        '**Must implement (abstract):**',
        list(c.abstracts, '(none)'),
        '',
        '**Public fields:**',
        list(c.fields, '(none)'),
        '',
        '**Public methods:**',
        list(c.methods, '(none)'),
      ].join('\n'),
    )
    .join('\n\n')}`,
);

for (const section of SECTIONS) {
  const files = listFiles(section.dir, section.exclude);
  const classes = files.flatMap(f => parseFile(section.dir, f));
  totalClasses += classes.length;

  const body = classes
    .map(c => {
      if (!c.summary) missingSummary += 1;
      const summaryLine =
        c.summary ?? '⚠️ no class summary yet — see `jsdoc` skill';
      const methodsList =
        c.methods.length > 0
          ? c.methods.map(m => `  - \`${m}\``).join('\n')
          : '  - (no public methods)';
      return [
        `### ${c.name}`,
        '',
        `- **File:** \`${c.file}\``,
        `- **Extends:** \`${c.extends ?? '—'}\``,
        `- **Summary:** ${summaryLine}`,
        '',
        '**Public methods:**',
        methodsList,
      ].join('\n');
    })
    .join('\n\n');

  sectionsOut.push(`## ${section.title}\n\n${body || '_(none found)_'}`);
}

const header = `# Framework Catalog (generated)

> **Auto-generated by \`npm run catalog:generate\` — do not hand-edit.** Source of truth is the
> code (class-level JSDoc summary + method signatures); this file is a compressed lookup for the
> \`generate-pom-skeleton\` / \`generate-controller-skeleton\` "Check existing code first" step, not
> documentation in its own right. Regenerate before relying on it — it is cheap and deterministic:
> \`npm run catalog:generate\`.

Generated: ${new Date().toISOString()}
Scanned: ${SECTIONS.map(s => s.dir).join(', ')} (+ ${bases.length} base classes)
Classes: ${totalClasses} (${missingSummary} missing a class-level summary)
`;

const content = `${header}\n${sectionsOut.join('\n\n')}\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, content, 'utf8');

// eslint-disable-next-line no-console
console.log(
  `generate-framework-catalog: wrote ${path.relative(root, outFile)} — ${totalClasses} classes, ${missingSummary} missing a class-level summary.`,
);
