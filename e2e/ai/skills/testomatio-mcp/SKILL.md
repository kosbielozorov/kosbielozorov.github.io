---
name: testomatio-mcp
description: >-
  Work with a Testomat.io (Testomatio) MCP server in any repository or test
  framework: resolve real @S/@T ids, fetch a test case before automating it,
  search cases with TQL, and sync code tests back into the TMS without
  duplicating. Use when the user mentions Testomat, Testomatio, TMS, test
  management, @T/@S ids, "create test by @T", "push tests to Testomat", suite
  sync, test plans, or TQL. Not for UI selectors, DOM, or locator healing.
---

# Testomat.io MCP

Framework-agnostic playbook for the Testomat.io MCP server. Works with Playwright,
CodeceptJS, Cypress, Jest, pytest, or anything else — the TMS side is identical;
only how ids are written into code differs.

## Scope

**In scope:** resolving and creating real `@S` / `@T` ids; reading a case's title,
description and steps before automating it; TQL search; suites, plans, runs,
labels; linking issues.

**Out of scope — this server cannot help with:** UI selectors and locators, DOM
snapshots, clicks, live page triage, or healing a broken locator. A case's _steps
text_ describes **what** to assert; it is never a selector. Use a browser tool for
that (in this repo: `playwright-cli`, then Playwright MCP).

## 1. Discover before calling (required)

Tool names have changed across server versions — older builds expose
`tests_search` / `suites_search` / `system_ping`, current ones expose
`tests_list` (with `tql`) / `suites_list` / `project_info`. **Never call a tool
name from memory or from this document.**

1. List the live server's tools and read their input schemas.
2. Match the capability you need against `references/tools.md`.
3. Call with the exact names and arguments from the live schema.
4. Smoke check: `project_info` (older: `system_ping`) — confirms token, project and reachability.

If no Testomat.io MCP server is connected, say so and stop — do not fabricate ids
or fall back to guessing. Setup is in `references/tools.md` → **Connecting**.

## 2. Ask the server, not this file

- **TQL syntax** — call `tql_help` when available; it returns the fields and
  operators the connected version actually supports. Treat any TQL in this skill
  as an illustration only.
- **Project conventions** — call `project_info` for configuration and features.

## 3. Safety

A TMS is shared team state, not a scratch pad.

| Action                                               | Rule                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| Read (`*_list`, `*_get`, `tql_help`, `project_info`) | Free to call                                                   |
| Create (`*_create`)                                  | Search first; create only when genuinely missing               |
| Update / delete (`*_update`, `*_delete`, `*_unlink`) | **Ask the user first** — state exactly what changes and its id |
| Bulk operations                                      | Never implicitly; confirm scope and count                      |

Prefer launching the server with `--tools read` or `--tools core` unless the task
needs writes. Never print, commit, or paste a token — pass it through the host
environment, and keep the MCP token separate from the CI reporter key.

## 4. Where ids go in code

Resolve the project's tag convention **before** editing files:

1. The project binding, if the repo has one (`ai/project.md` → _Test management / tags_).
2. Otherwise, an existing test in the repo — match what is already there.
3. Otherwise, ask. Do not invent a placement convention.

Common shapes:

| Framework              | Suite id                                               | Test id                                    |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Playwright             | `test.describe('Feature @S<id>', { tag: ['@S<id>'] })` | `test('Case @T<id>', { tag: ['@T<id>'] })` |
| CodeceptJS             | `Feature('Feature @S<id>')`                            | `Scenario('Case @T<id>')`                  |
| Mocha / Cypress / Jest | `describe('Feature @S<id>')`                           | `it('Case @T<id>')`                        |
| pytest                 | module/class docstring or marker                       | `def test_case():  # @T<id>`               |

Ids are written exactly as Testomatio prints them — prefix + 8 characters, no brackets
(`@T8acca9cb`, `@S1a2b3c4d`). `<id>` in the table above marks the slot.

Category tags (`@smoke`, `@regression`, …) are **not** a substitute for `@S` / `@T`.

**No case yet** (in this repo): the test carries `@unlinked` in `tag: []` — never a fake id. After
**Workflow B** creates the case, retag: replace `@unlinked` with the real `@T<id>` in `tag: []`, add
the id to the title, change nothing else, and run `npm run lint:contract`. Other repos: follow their
binding.

## 5. Workflows

Full checklists: `references/workflows.md`.

| Goal                                                             | Workflow                     |
| ---------------------------------------------------------------- | ---------------------------- |
| User gives a `@T` id and wants it automated                      | **A — fetch before writing** |
| Code test exists, TMS case does not                              | **B — sync code → TMS**      |
| "What should we automate / what is flaky / what is in this plan" | **C — query with TQL**       |

**Workflow A is mandatory** when a `@T` is supplied: fetch the case and build from
its description. Writing a test from an id alone produces automation that does not
match the documented case.

## Do NOT

- Call a tool name without reading its live schema first.
- Invent `@S` / `@T` ids, or leave fake placeholders (`@T[ID]`). Use the binding's "no id yet" tag (here `@unlinked`).
- Create a suite or test without searching for an existing one.
- Update or delete TMS entities without explicit user confirmation.
- Commit tokens, or put the MCP token in a test package `.env`.
- Use this server for selectors, DOM, or locator healing.
