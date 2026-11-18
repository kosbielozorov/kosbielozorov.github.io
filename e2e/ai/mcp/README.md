# `ai/mcp/` — MCP servers, one definition per repo

Every AI host wants its own MCP config file, with its own top-level key and its own
variable syntax. Maintaining three files by hand means three chances to drift and a
class of failure that is invisible: a wrong interpolation is passed through as a
literal string, so the server answers _unauthorized_ instead of _misconfigured_.

So `servers.json` here is the **single source of truth**, and every host config is
generated from it.

```
ai/mcp/servers.json
   │  npm run sync:ai
   ├─→ .mcp.json          Claude Code
   ├─→ .cursor/mcp.json   Cursor
   └─→ .vscode/mcp.json   VS Code / Copilot
```

All three are written **inside this test package**. Open or `cd` here when working with tests —
nothing is placed in the surrounding repository.

`npm run verify:ai` fails if any generated file drifts from the SSoT.

---

## Quick start

**1. Export the credentials in your shell** (never in a committed file):

```bash
export TESTOMATIO_MCP_TOKEN='...'
export TESTOMATIO_PROJECT='...'
```

Put them in `~/.zshrc`, `~/.bashrc`, direnv, or your OS keychain so every session has
them. VS Code is the exception — it prompts for them and stores them itself.

**2. Generate the configs** (already committed; re-run after editing the SSoT):

```bash
npm run sync:ai
```

**3. Restart the AI tool**, then confirm it connected:

| Host        | Check                                   | First-run gate                                                                       |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| Claude Code | `claude mcp list`, or `/mcp` in session | Accept the workspace trust prompt — until then the server shows `⏸ Pending approval` |
| Cursor      | Settings → MCP                          | —                                                                                    |
| VS Code     | MCP panel                               | Prompts once per input, then caches per workspace                                    |

**4. Sanity-check the server itself** by asking the agent to call `project_info`.
It returns the project the token points at — the fastest way to catch a token that
belongs to a different project.

---

## Adding a server

Edit `servers.json` only, then run `npm run sync:ai`.

```json
{
  "servers": {
    "my-server": {
      "description": "What it is for, and which skill uses it",
      "hosts": ["claude", "cursor", "vscode"],
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "some-mcp@latest", "--token", "${MY_TOKEN}"],
      "env": { "SOME_BASE_URL": "${SOME_BASE_URL:-https://example.com}" },
      "secrets": ["MY_TOKEN"]
    }
  }
}
```

| Field             | Required | Meaning                                                                     |
| ----------------- | -------- | --------------------------------------------------------------------------- |
| `description`     | yes      | Why the server exists; name the skill that uses it                          |
| `hosts`           | yes      | Subset of `claude`, `cursor`, `vscode`. A host with no servers gets no file |
| `transport`       | yes      | `stdio` today                                                               |
| `command`, `args` | yes      | How the server is launched                                                  |
| `env`             | no       | Environment passed to the server process                                    |
| `secrets`         | no       | Variables that must never be inlined — drives VS Code's masked prompt       |

Then commit `servers.json` **and** the regenerated configs together.

---

## Variables

Write placeholders in the neutral form. `${VAR}` is required; `${VAR:-default}`
falls back when unset.

How each host receives them:

| Written in SSoT           | Claude Code     | Cursor          | VS Code                         |
| ------------------------- | --------------- | --------------- | ------------------------------- |
| `${TOKEN}` (in `secrets`) | `${TOKEN}`      | `${env:TOKEN}`  | `${input:token}`, masked prompt |
| `${VAR}`                  | `${VAR}`        | `${env:VAR}`    | `${input:var}`, plain prompt    |
| `${VAR:-value}`           | `${VAR:-value}` | `value` inlined | `value` inlined                 |

**Why defaults get inlined:** only Claude Code has a default syntax. Passing
`${env:VAR}` for an unset variable in Cursor sends the literal text to the server,
which fails in a confusing way — an inlined default just works. The cost is that a
defaulted value is no longer overridable per machine outside Claude Code. If a value
genuinely must vary per developer, declare it without a default so every host asks
for it.

Secrets are never inlined, whatever their default.

---

## Rules

- **Never hand-edit a generated config.** `verify:ai` fails on drift, and your change
  is lost at the next `sync:ai`. Edit `servers.json`.
- **Never run a formatter over the generated files.** Prettier's JSON line-breaking
  differs from the generator's, which registers as drift. `npm run format:check` is
  scoped to the test package and does not touch them; keep it that way.
- **Never commit a token.** The SSoT holds variable _names_, never values.
- **Prefer the narrowest tool profile.** For Testomat.io that is `--tools core`
  (default here) or `read`; `full` includes delete operations.

---

## Host notes worth knowing

**Claude Code — project servers auto-load in headless mode.** An interactive session
asks before starting a server from `.mcp.json`, but `claude -p`, the Agent SDK, and
cloud sessions start them without asking. Anyone who forks this repo inherits that.
To block a server everywhere, add it to `disabledMcpjsonServers` in settings.

**Claude Code — other scopes exist.** `.mcp.json` is the _project_ scope: shared via
version control. `claude mcp add --scope user` stores a server in `~/.claude.json`
instead, where it loads in all your projects and is shared with nobody. Use the user
scope for personal servers you do not want in the repo at all.

**Cursor** has no default syntax — see the table above.

**VS Code** resolves `${input:...}` from prompts and caches answers per workspace, so
its `inputs` block replaces shell environment variables entirely.

---

## Troubleshooting

| Symptom                                       | Cause                                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Server shows `Pending approval` (Claude Code) | Workspace trust prompt not accepted yet — run `claude` in the repo                                                                 |
| `unauthorized` / empty responses              | Variable unset, so the literal `${...}` was passed as the token. Check your shell env                                              |
| `verify:ai` reports drift                     | A generated file was hand-edited or reformatted — run `npm run sync:ai`                                                            |
| Server missing from one host only             | Its `hosts` list in `servers.json` excludes that host                                                                              |
| Write tools missing                           | Launched with `--tools read`                                                                                                       |
| Server works differently than this repo says  | A same-named server in your personal user scope (`~/.claude.json`, `~/.cursor/mcp.json`) can take precedence — check and remove it |
| Tool name not found                           | Server version drift — see `ai/skills/testomatio-mcp/references/tools.md`                                                          |

---

## The Playwright servers

Playwright ships two MCP servers. **No separate package is needed** — both come with
`@playwright/test`, so they are always the same version as the test runner.

| Command                              | Tools                                                     | Needs a project config |
| ------------------------------------ | --------------------------------------------------------- | ---------------------- |
| `npx playwright run-test-mcp-server` | `planner_*`, `generator_*`, `test_*`, and ~80 `browser_*` | yes (`--config`)       |
| `npx playwright mcp`                 | 24 `browser_*` only                                       | no                     |

Measured, not assumed: the test-runner server is a **superset**, with a richer browser
surface than the standalone one (verification, video, storage, cookies, network). Wiring
both would register the `browser_*` tools twice and force the agent to disambiguate
between two identical names, so only `playwright-test` is in `servers.json`.

Use `npx playwright mcp` instead when there is no Playwright project to point at — a
repo without `playwright.config.ts`, or when the config itself fails to load.

**Related commands**, if you want the official Playwright agent files rather than the
vendored ones:

```bash
npx playwright init-skills --loop claude   # installs the bundled playwright-cli skill
npx playwright init-agents --loop claude   # planner / generator / healer definitions
```

---

## Known limitations

- **`playwright-test` will not start without a valid environment.** It loads
  `playwright.config.ts`, which validates `.env` and fails fast on a missing
  `DEV_BASE_APP_URL`. That is intended — but it means the browser tools are unavailable
  too until the environment is set. `npx playwright mcp` has no such dependency.
- **Three hosts are supported.** Adding another means teaching `scripts/lib/mcp.mjs`
  its file location, top-level key, and interpolation syntax — one function, one table
  entry.
