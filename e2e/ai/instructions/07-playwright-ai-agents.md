# Playwright AI Agents Integration

Playwright **planner / generator / healer** plus live UI via **playwright-cli → Playwright MCP**. Same canon for every AI tool: binding + Framework contract — do not restate them here.

## Mandatory sources

1. `../project.md` — paths, fixtures, placement, tags
2. `02-architecture.md` → **Framework contract** (+ **Healing**)
3. `03-writing-tests.md` / `06-examples.md` as needed
4. `05-ai-usage.md` — skills catalog; Testomatio = TMS only (not locators)

Agent definitions (`playwright-test-planner`, `playwright-test-generator`, `playwright-test-healer`) are
**generated, not vendored** — this repo ships none of those three. Their location depends on the
loop: `.claude/agents/*.md` for `--loop claude`, elsewhere for other hosts.

**Vendored, not generated:** four real subagents this repo does ship — three read-only, one that
writes only throw-away probes — all
user-gated when they need something they can't get locally:

- `.claude/agents/api-coverage-reviewer.md` — compares `tests/api/**` against an OpenAPI spec when
  one exists, or against the `app/api/controllers/**` method inventory when none does (it asks
  before silently falling back — see the agent's own "Step 0"); rewrites
  `specs/api-coverage-gap-plan.md`.
- `.claude/agents/ui-coverage-reviewer.md` — compares `tests/ui/**` against `specs/*.md` scenarios
  plus the `PageManager`-registered method surface; rewrites `specs/ui-coverage-gap-plan.md`.
- `.claude/agents/test-code-reviewer.md` — reviews changed `tests/**` against the Framework
  contract (oracle, test ids, isolation, layering), **re-runs** `typecheck` / `lint:contract` /
  `format:check` and the changed tests itself, and returns `ready` / `changes needed` /
  `offline verified; runtime blocked`. Read-only; writes nothing. Use before a commit or PR that
  touches tests, and after every heal.
- `.claude/agents/adversarial-tester.md` — tries to prove that changed tests would stay **green
  against a wrong app**: weak assertions (partial match, visibility-only, status-only) and scenario
  **Expected** lines without an assertion. Proves each with a throw-away probe under
  `.work/review/<feature>/*.probe.ts`, run by `npx playwright test -c playwright.probe.config.ts`
  (**[PROVED]**), or argues it (**[REASONED]**). The probe's wrong value must contradict the
  requirement. Never edits project files. Reduced scope for now: test strength only — it does not yet
  explore the app against the requirement. Opt-in: risky features, or tests you are about to trust.
  Probes are built from the operators in `ai/instructions/09-mutation-catalog.md`.
- `.claude/agents/adversarial-judge.md` — judges **one** [REASONED] finding of the
  `adversarial-tester` with fresh, minimal context (only the claim, the test and its scenario — not
  the tester's argument). Tries to prove or refute it with up to 4 catalog probes under
  `.work/review/<feature>/judge/`; returns `proved` / `refuted` / `out of scope` / `stands`. Only `stands` reaches the
  user. Run by the orchestrator, one per finding.

The two coverage reviewers can optionally cross-check against Testomat.io's live test-case list (via `testomatio-mcp`
→ Workflow C) for cases that exist in the TMS but were never written down locally — but neither
fetches this on its own: TMS data can be stale, so each agent's report _offers_ the cross-check
and waits for the user to opt in, scoped to the suite/feature already found (never a full-project
pull). Use them after adding/changing tests, not as a substitute for `playwright-test-creator`.

## Setup (optional)

```bash
npx playwright init-agents --loop claude   # or vscode | codex | copilot | opencode
```

Two things to know before running it in this repo:

- It **overwrites `.mcp.json`** with its own `playwright-test` entry — without the `--config` flag
  this package needs. Run it in a scratch directory and copy the agent files over, or run
  `npm run sync:ai` afterwards to restore the generated config.
- It also writes `seed.spec.ts` and `specs/README.md`, and the generated agents know nothing about
  the **Framework contract** — they will produce raw-selector tests unless the contract is in the
  prompt. Point them at `02-architecture.md` explicitly.

## Workflow

1. **Planner** → `specs/*.md`; optional seed `tests/seed.spec.ts`; name fixtures + Page Objects from binding; include `@S` / `@T` + category tags; target `tests/**/*.test.ts` (or `tests/<feature>/`).
2. **Generator** → implement from the plan using fixtures + POM; match a live sibling test when one exists; obey contract.
3. **Healer** → contract **Healing**: classify first (test / product / data / environment); for `test` — POM → shared constants (if reused) → test last; never change expected values, drop tags, add `waitForTimeout` or switch to `@playwright/test` imports.

### Layout (this package)

```
<test package>/
  tests/**/*.test.ts
  specs/                    # plans (when introduced)
  app/{fixtures,ui/pages,ui/components,ui/modals,api/controllers,api/schemas,constants}
  app/config                # create when first needed
  helpers/   utils/   lib/  # package-root shared code (lib: reporters, etc.)
  AGENTS.md                 # entry point (stays at package root)
  ai/project.md             # binding
  ai/{instructions,skills,templates}/
```

### Agent-specific MUST NOT / MUST

- **MUST NOT:** drop tags; invent `@S`/`@T` (use `@unlinked`); copy expected values from the app; use `e2e/` or `.spec.js` for tests (`testMatch` is `**/*.test.ts`); put raw selectors in tests; use Testomatio MCP for locators.
- **MUST:** check existing POM/methods first; register new pages on `PageManager`; live UI via CLI→MCP below.

## playwright-cli and Playwright MCP (required)

Skill sources: `ai/skills/playwright-cli`, `trace-triage`, `selector-governance`.

### Priority (same everywhere)

1. **`playwright-cli`** (primary) — snapshot, click, fill, triage, selector discovery
2. **Playwright MCP** (fallback) — when CLI unavailable / insufficient, or MCP-only tools needed

Both ship with `@playwright/test`; nothing extra to install. The CLI is `npx playwright cli …`
when no global `playwright-cli` is present. The MCP server wired here is `playwright-test`
(`planner_*` / `generator_*` / `test_*` / `browser_*`) — see `ai/mcp/README.md`.

| Situation                                         | Prefer                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Ad-hoc UI / selectors / confirm state             | **1.** CLI → **2.** MCP `browser_*`                                                                          |
| Reproduce failing step                            | **1.** CLI → **2.** MCP                                                                                      |
| Planner / Generator (`planner_*` / `generator_*`) | **MCP** (MCP-only)                                                                                           |
| Run / debug one test                              | `npx playwright test` / CLI; else MCP `test_run` / `test_debug` (Chrome/chromium unless user asks otherwise) |
| Post-failure                                      | **trace-triage** + live re-check CLI→MCP                                                                     |

### Rules

1. Do not invent DOM from screenshots/memory when CLI or MCP can open the page.
2. Snapshot first (`playwright-cli snapshot`, else MCP `browser_snapshot`); use snapshot refs.
3. Obey **Framework contract** (`02-architecture.md`).
4. Live CLI/MCP does not replace reading `test-results/` when that is all you have.
5. Skills catalog: `05-ai-usage.md`.
