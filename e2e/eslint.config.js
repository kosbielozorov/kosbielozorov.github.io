import fs from 'node:fs';
import path from 'node:path';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import playwright from 'eslint-plugin-playwright';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Framework contract as lint rules — ai/instructions/02-architecture.md.
 * Prose alone cannot stop an AI agent (or a human) from breaking these.
 */
const CONTRACT_DOC = 'Framework contract: ai/instructions/02-architecture.md';

const NO_XPATH = {
  selector: 'Literal[value=/^(xpath=|\\/\\/)/]',
  message: `XPath locators are forbidden. ${CONTRACT_DOC}`,
};

const NO_REGEX_CLASS_ASSERTION = {
  selector: "CallExpression[callee.property.name='toHaveClass'] Literal[regex]",
  message: `Use toContainClass('active') instead of toHaveClass(/active/). ${CONTRACT_DOC}`,
};

const NO_RAW_LOCATOR_IN_TEST = {
  selector:
    'CallExpression[callee.property.name=/^(locator|getBy[A-Za-z]+|\\$\\$?)$/]',
  message: `No raw selectors in tests — call a Page Object method instead. ${CONTRACT_DOC}`,
};

/** A Testomatio test id as Testomatio writes it: `@T` + 8 lowercase chars, e.g. `@T8acca9cb`. */
const TEST_ID = /^@T[a-z0-9]{8}$/;
/** Anything shaped like an id that is not a valid one: `@T[ID]`, `@T<testId>`, `@T123`, … */
const ID_SHAPED = /^@T[[<a-z0-9]/;
const UNLINKED = '@unlinked';
const TEST_CALLEE_MODIFIERS = new Set(['only', 'skip', 'fail', 'fixme']);

/** Reads a string from a plain or expression-free template literal; otherwise `null`. */
function staticString(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string')
    return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return null;
}

/** True for `test(...)` and `test.only|skip|fail|fixme(...)` — not describe/step/hooks. */
function isTestDeclaration(callee) {
  if (callee.type === 'Identifier') return callee.name === 'test';
  return (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'test' &&
    callee.property.type === 'Identifier' &&
    TEST_CALLEE_MODIFIERS.has(callee.property.name)
  );
}

/**
 * Test-id policy — ai/instructions/03-writing-tests.md → Testomatio Integration.
 * Every test carries exactly one of: a real `@T<id>`, or `@unlinked` (no TMS case yet).
 * A `@…` token in the title must also be in `tag: []`, and a `@T<id>` in `tag: []` must
 * also be in the title (Testomatio reads the title). `@unlinked` is tag-only.
 */
const testIdTagRule = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const report = (node, text) =>
      context.report({ node, message: `${text} ${CONTRACT_DOC}` });

    return {
      CallExpression(node) {
        if (!isTestDeclaration(node.callee) || node.arguments.length < 2)
          return;
        const title = staticString(node.arguments[0]);
        if (title === null) return; // e.g. test.fail(condition, reason)

        const options = node.arguments[1];
        const tagProp =
          options.type === 'ObjectExpression'
            ? options.properties.find(
                p => p.type === 'Property' && p.key.name === 'tag',
              )
            : undefined;
        if (!tagProp) {
          report(
            node,
            `Test "${title}" has no \`tag\` option — add \`{ tag: ['@T<id>'] }\` or \`{ tag: ['${UNLINKED}'] }\`.`,
          );
          return;
        }

        const tagNodes =
          tagProp.value.type === 'ArrayExpression'
            ? tagProp.value.elements
            : [tagProp.value];
        const tags = tagNodes.map(staticString);
        if (tags.includes(null)) {
          report(tagProp, '`tag` must hold string literals only.');
          return;
        }

        const ids = tags.filter(t => TEST_ID.test(t));
        const malformed = tags.filter(
          t => ID_SHAPED.test(t) && !TEST_ID.test(t),
        );
        for (const id of malformed)
          report(
            tagProp,
            `\`${id}\` is not a Testomatio test id (expected \`@T\` + 8 chars, e.g. \`@T8acca9cb\`) — a template placeholder? Resolve the real id via testomatio-mcp or use \`${UNLINKED}\`.`,
          );
        const unlinked = tags.includes(UNLINKED);
        if (malformed.length === 0 && ids.length + (unlinked ? 1 : 0) !== 1) {
          report(
            tagProp,
            `Test "${title}" needs exactly one of a real \`@T<id>\` or \`${UNLINKED}\` in \`tag\` (found ${ids.length} id(s)${unlinked ? ` and ${UNLINKED}` : ''}). Never invent ids.`,
          );
        }

        const titleTags = title.match(/@\S+/g) ?? [];
        if (titleTags.includes(UNLINKED))
          report(node.arguments[0], `Keep \`${UNLINKED}\` out of the title.`);
        for (const t of titleTags.filter(t => !tags.includes(t)))
          report(tagProp, `Title tag \`${t}\` is missing from \`tag: []\`.`);
        for (const id of ids.filter(id => !titleTags.includes(id)))
          report(node.arguments[0], `\`${id}\` must also be in the title.`);
      },
    };
  },
};

const SPEC_SOURCE = /^(specs\/[\w./-]+\.md)#(\d+\.\d+)$/;
const specCache = new Map();

const WORK_DIR = path.join(import.meta.dirname, '.work');

/** Reads a spec once per lint run; `null` when the file does not exist. */
function readFileCached(file) {
  if (!specCache.has(file))
    specCache.set(
      file,
      fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null,
    );
  return specCache.get(file);
}

/**
 * Resolves a `specs/<feature>.md` source. A draft under `.work/<feature>/` may also cite a spec
 * draft lying next to it (a dry run keeps the spec there until it goes live); a file under
 * `tests/` never may — `.work/` is not committed.
 */
function readSpec(relPath, lintedFile) {
  const live = readFileCached(path.join(import.meta.dirname, relPath));
  if (live !== null || !lintedFile.startsWith(WORK_DIR + path.sep)) return live;
  return readFileCached(
    path.join(path.dirname(lintedFile), path.basename(relPath)),
  );
}

/** The named property of a test's options object literal, if any. */
function optionProp(options, name) {
  return options?.type === 'ObjectExpression'
    ? options.properties.find(p => p.type === 'Property' && p.key.name === name)
    : undefined;
}

const APP_MAP_SOURCE = /^specs\/app-map\.md#(Z-\d+)$/;
const CHARACTERIZATION_DIR = path.join(
  import.meta.dirname,
  'tests',
  'characterization',
);
const CHARACTERIZATION_TAG = '@characterization';
/** The only assertions characterization scaffolding may use (BasePage / BaseController). */
const SCAFFOLDING_ASSERTIONS = new Set([
  'expectAriaSnapshot',
  'expectResponseShape',
]);

/** The generic page of `PageManager` — scaffolding may use it, a functional test may not. */
const SCAFFOLDING_ONLY_MEMBERS = new Set(['anyPage']);

/**
 * Scaffolding: a test under `tests/characterization/`, or a dry-run draft
 * `.work/<feature>/*.characterization.test.ts` (it moves there at go-live).
 */
function isCharacterizationFile(lintedFile) {
  return (
    lintedFile.startsWith(CHARACTERIZATION_DIR + path.sep) ||
    (lintedFile.startsWith(WORK_DIR + path.sep) &&
      lintedFile.endsWith('.characterization.test.ts'))
  );
}

/** A characterization test cites its zone in `specs/app-map.md`; nothing else may. */
function checkZoneSource(desc, node, report, lintedFile) {
  const zone = desc === null ? null : APP_MAP_SOURCE.exec(desc)?.[1];
  if (!isCharacterizationFile(lintedFile)) {
    report(
      node,
      'Only characterization scaffolding (tests/characterization/) may cite `specs/app-map.md` — a functional test cites a confirmed scenario.',
    );
    return;
  }
  if (!zone) {
    report(
      node,
      "A characterization test's source must be its zone: 'specs/app-map.md#Z-<n>'.",
    );
    return;
  }
  const map = readSpec('specs/app-map.md', lintedFile);
  if (map === null) report(node, '`specs/app-map.md` does not exist.');
  else if (!new RegExp(`^###\\s+${zone}\\s`, 'm').test(map))
    report(node, `\`specs/app-map.md\` has no zone \`### ${zone}\`.`);
}

/** Checks one `source` description: the test's own `@T<id>`, or an existing spec scenario. */
function checkSourceValue(desc, node, options, report, lintedFile) {
  if (
    isCharacterizationFile(lintedFile) ||
    desc?.startsWith('specs/app-map.md')
  ) {
    checkZoneSource(desc, node, report, lintedFile);
    return;
  }
  if (desc !== null && TEST_ID.test(desc)) {
    const tagProp = optionProp(options, 'tag');
    const tags =
      tagProp?.value.type === 'ArrayExpression'
        ? tagProp.value.elements.map(staticString)
        : [staticString(tagProp?.value)];
    if (!tags.includes(desc))
      report(
        node,
        `Source \`${desc}\` must be this test's own \`@T<id>\` tag.`,
      );
    return;
  }

  const match = desc === null ? null : SPEC_SOURCE.exec(desc);
  if (!match) {
    report(
      node,
      "Source must be a string literal: 'specs/<feature>.md#<N.M>' or the test's own '@T<id>'.",
    );
    return;
  }
  const [, specPath, scenario] = match;
  const spec = readSpec(specPath, lintedFile);
  if (spec === null) {
    report(node, `Source spec \`${specPath}\` does not exist.`);
    return;
  }
  const heading = new RegExp(
    `^####\\s+${scenario.replace('.', '\\.')}\\s`,
    'm',
  );
  if (!heading.test(spec))
    report(node, `\`${specPath}\` has no scenario \`#### ${scenario}\`.`);
}

/**
 * Traceability — ai/instructions/02-architecture.md → Map and oracle.
 * Every test names its requirement (the oracle of its expected values) in exactly one
 * `{ type: 'source', description }` annotation:
 *   - `specs/<feature>.md#<N.M>` — the file exists and has a `#### N.M` scenario heading;
 *   - `@T<id>` — the TMS case is the requirement; it must be the test's own `@T<id>` tag.
 */
const testSourceRule = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const report = (node, text) =>
      context.report({ node, message: `${text} ${CONTRACT_DOC}` });

    return {
      CallExpression(node) {
        if (!isTestDeclaration(node.callee) || node.arguments.length < 2)
          return;
        const title = staticString(node.arguments[0]);
        if (title === null) return;

        const options = node.arguments[1];
        const annotationProp = optionProp(options, 'annotation');
        const entries = !annotationProp
          ? []
          : annotationProp.value.type === 'ArrayExpression'
            ? annotationProp.value.elements
            : [annotationProp.value];
        const sources = entries.filter(
          e =>
            e?.type === 'ObjectExpression' &&
            staticString(optionProp(e, 'type')?.value) === 'source',
        );
        if (sources.length !== 1) {
          report(
            annotationProp ?? node,
            `Test "${title}" needs exactly one \`{ type: 'source', description: 'specs/<feature>.md#<N.M>' }\` annotation (found ${sources.length}).`,
          );
          return;
        }

        const descNode = optionProp(sources[0], 'description')?.value;
        const desc = staticString(descNode);
        checkSourceValue(
          desc,
          descNode ?? sources[0],
          options,
          report,
          context.filename,
        );
      },
    };
  },
};

/** The string tags of a test's options, or `[]`. */
function optionTags(options) {
  const tagProp = optionProp(options, 'tag');
  if (!tagProp) return [];
  return tagProp.value.type === 'ArrayExpression'
    ? tagProp.value.elements.map(staticString)
    : [staticString(tagProp.value)];
}

/** Name of the called function or method: `expect(…)` → `expect`, `a.b.expectX(…)` → `expectX`. */
function calleeName(callee) {
  if (callee.type === 'Identifier') return callee.name;
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier'
  )
    return callee.property.name;
  return null;
}

/**
 * Characterization scaffolding — ai/instructions/02-architecture.md → Characterization scaffolding.
 * A test under `tests/characterization/` carries `@characterization` and asserts only through
 * `expectAriaSnapshot()` / `expectResponseShape()`: it pins current behaviour, it is never an
 * oracle. A test anywhere else must not carry `@characterization`.
 */
const characterizationRule = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const inScaffolding = isCharacterizationFile(context.filename);
    const report = (node, text) =>
      context.report({ node, message: `${text} ${CONTRACT_DOC}` });

    return {
      MemberExpression(node) {
        if (
          !inScaffolding &&
          node.property.type === 'Identifier' &&
          SCAFFOLDING_ONLY_MEMBERS.has(node.property.name)
        )
          report(
            node,
            `\`${node.property.name}\` is for characterization scaffolding only — a functional test uses the page's own Page Object.`,
          );
      },
      Property(node) {
        if (
          !inScaffolding &&
          node.parent.type === 'ObjectPattern' &&
          node.key.type === 'Identifier' &&
          SCAFFOLDING_ONLY_MEMBERS.has(node.key.name)
        )
          report(
            node,
            `\`${node.key.name}\` is for characterization scaffolding only — a functional test uses the page's own Page Object.`,
          );
      },
      CallExpression(node) {
        const name = calleeName(node.callee);
        if (
          inScaffolding &&
          name?.startsWith('expect') &&
          !SCAFFOLDING_ASSERTIONS.has(name)
        ) {
          report(
            node,
            `Characterization scaffolding asserts only with ${[...SCAFFOLDING_ASSERTIONS].join(' / ')} — \`${name}\` makes a current value an oracle. Confirm it and write a functional test instead.`,
          );
          return;
        }
        if (!isTestDeclaration(node.callee) || node.arguments.length < 2)
          return;
        if (staticString(node.arguments[0]) === null) return;
        const tagged = optionTags(node.arguments[1]).includes(
          CHARACTERIZATION_TAG,
        );
        if (inScaffolding && !tagged)
          report(
            node,
            `A test under tests/characterization/ needs the \`${CHARACTERIZATION_TAG}\` tag.`,
          );
        if (!inScaffolding && tagged)
          report(
            node,
            `\`${CHARACTERIZATION_TAG}\` belongs only to tests under tests/characterization/.`,
          );
      },
    };
  },
};

const FIXTURES_FILE = path.join(
  import.meta.dirname,
  'app',
  'fixtures',
  'index.ts',
);

/** Names of the `opened<Page>` fixtures declared in the primary fixture file. */
function openedFixtures() {
  const source = readFileCached(FIXTURES_FILE) ?? '';
  return new Set(
    [...source.matchAll(/^\s*(opened[A-Z]\w*)\s*:\s*async\b/gm)].map(m => m[1]),
  );
}

/** `homePage` for `await homePage.open()` or `await pageManager.homePage.open()`; else `null`. */
function bareOpenTarget(statement) {
  const call =
    statement?.type === 'ExpressionStatement' &&
    statement.expression.type === 'AwaitExpression'
      ? statement.expression.argument
      : null;
  if (
    call?.type !== 'CallExpression' ||
    call.arguments.length > 0 ||
    call.callee.type !== 'MemberExpression' ||
    call.callee.property.type !== 'Identifier' ||
    call.callee.property.name !== 'open'
  )
    return null;
  const target = call.callee.object;
  if (target.type === 'Identifier') return target.name;
  if (
    target.type === 'MemberExpression' &&
    target.object.type === 'Identifier' &&
    target.object.name === 'pageManager' &&
    target.property.type === 'Identifier'
  )
    return target.property.name;
  return null;
}

/**
 * Opened-page fixture — ai/instructions/02-architecture.md → Imports and fixtures.
 * Once `opened<Page>` exists in the primary fixture file, a test does not start with a bare
 * `await <page>.open()`: it takes `{ opened<Page>: <page> }`. An `open()` after another statement
 * (setup before the load) or with an argument (another path) is left alone. The fixture itself is
 * added only when three or more tests need it (YAGNI) — a judgement for the reviewer, not lint.
 */
const openedPageFixtureRule = {
  meta: { type: 'suggestion', schema: [] },
  create(context) {
    const fixtures = openedFixtures();
    return {
      CallExpression(node) {
        if (fixtures.size === 0 || !isTestDeclaration(node.callee)) return;
        const body = node.arguments.at(-1);
        if (
          !['ArrowFunctionExpression', 'FunctionExpression'].includes(
            body?.type,
          ) ||
          body.body.type !== 'BlockStatement'
        )
          return;
        const [first] = body.body.body;
        const target = bareOpenTarget(first);
        if (target === null) return;
        const fixture = `opened${target[0].toUpperCase()}${target.slice(1)}`;
        if (fixtures.has(fixture))
          context.report({
            node: first,
            message: `Take the \`${fixture}\` fixture (\`{ ${fixture}: ${target} }\`) instead of opening \`${target}\` as the first step. ${CONTRACT_DOC}`,
          });
      },
    };
  },
};

const contractPlugin = {
  rules: {
    'test-id-tag': testIdTagRule,
    'test-source': testSourceRule,
    characterization: characterizationRule,
    'opened-page-fixture': openedPageFixtureRule,
  },
};

/**
 * Every Framework-contract rule for `*.test.ts`. None needs type information, so
 * `npm run handoff -- check` also runs exactly this set on drafts under `.work/`
 * (excluded from the TypeScript project) before Gate 2.
 */
export const TEST_CONTRACT_PLUGINS = { playwright, contract: contractPlugin };
export const TEST_CONTRACT_RULES = {
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: '@playwright/test',
          message: `Import test/expect from @fixtures. ${CONTRACT_DOC}`,
        },
      ],
    },
  ],
  // Sanctioned wrapper is Component.wait() — never a direct call from a test.
  'playwright/no-wait-for-timeout': 'error',
  'no-restricted-syntax': [
    'error',
    NO_XPATH,
    NO_REGEX_CLASS_ASSERTION,
    NO_RAW_LOCATOR_IN_TEST,
  ],
  'contract/test-id-tag': 'error',
  'contract/test-source': 'error',
  'contract/characterization': 'error',
  'contract/opened-page-fixture': 'error',
};

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.min.js',
      'test-results/',
      'playwright-report/',
      'playwright/.cache/',
      'coverage/',
      '*.d.ts',
      'lighthouse/',
      '.auth/',
      'uploads/',
      'package-lock.json',
      '.work/',
      '.playwright-cli/',
    ],
  },

  // Base JavaScript configuration
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'error',
      'no-var': 'error',
    },
  },

  // TypeScript configuration
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...config.rules,
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
    },
  })),

  // SonarJS configuration
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      sonarjs,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-dead-store': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/unused-import': 'error',
      'sonarjs/no-unused-function-argument': 'error',
    },
  },

  // Playwright test files configuration
  {
    files: [
      'tests/**/*.{js,ts}',
      '**/*.spec.{js,ts}',
      '**/*.test.{js,ts}',
      'framework/**/*.{js,ts}',
      'app/**/*.{js,ts}',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      // Рекомендовані правила Playwright
      'playwright/expect-expect': 'off', // Відключаємо для складних тестів
      'playwright/max-nested-describe': 'warn',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-conditional-expect': 'warn',
      'playwright/no-conditional-in-test': 'off', // Відключаємо для framework файлів
      'playwright/no-element-handle': 'warn',
      'playwright/no-eval': 'warn',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'warn',
      'playwright/no-nested-step': 'warn',
      'playwright/no-networkidle': 'error',
      'playwright/no-page-pause': 'warn',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-standalone-expect': 'error',
      'playwright/no-unsafe-references': 'error',
      'playwright/no-useless-await': 'warn',
      'playwright/no-useless-not': 'warn',
      'playwright/no-wait-for-selector': 'warn',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/valid-describe-callback': 'error',
      'playwright/valid-expect': 'error',
      'playwright/valid-expect-in-promise': 'error',
      'playwright/valid-title': 'error',
    },
  },

  // Playwright test files (тільки тести) - більш строгі правила
  {
    files: ['tests/**/*.{js,ts}', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
    plugins: {
      playwright,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
      },
    },
    rules: {
      'playwright/no-conditional-in-test': 'warn', // Включаємо для тестів
      'playwright/no-skipped-test': 'warn',
    },
  },

  // Framework contract — application layer and any shared test code
  {
    files: [
      'app/**/*.ts',
      'tests/**/*.ts',
      'helpers/**/*.ts',
      'utils/**/*.ts',
      'lib/**/*.ts',
      'data/**/*.ts',
    ],
    rules: {
      'no-restricted-syntax': ['error', NO_XPATH, NO_REGEX_CLASS_ASSERTION],
    },
  },

  // Framework contract — test files only (stricter than the app layer).
  // `tests/ui/auth.setup.ts` is deliberately out of scope: the contract allows it
  // to import from @playwright/test.
  {
    files: ['tests/**/*.test.ts'],
    plugins: TEST_CONTRACT_PLUGINS,
    rules: {
      ...TEST_CONTRACT_RULES,
      // Tags must be string literals (contract/test-id-tag), so '@regression' or '@bug-<id>' on
      // three tests would trip this rule; repeated test data is idiomatic in tests anyway
      // (ai/instructions/01-fundamental-principles.md — a little duplication over a wrong abstraction).
      'sonarjs/no-duplicate-string': 'off',
    },
  },

  eslintConfigPrettier,
];
