# Testomat.io MCP — capability map

**This is a map, not an API contract.** Names below reflect the current
`@testomatio/mcp` server. Always confirm against the live tool schemas before
calling — see SKILL.md → _Discover before calling_.

Source: https://github.com/testomatio/mcp

## Connecting

```bash
npx -y @testomatio/mcp@latest --token <TOKEN> --project <PROJECT_ID> --tools core
```

MCP client config. **The interpolation syntax differs per host** — a config copied
between them fails silently, with the literal `${...}` passed as the token:

| Host        | File                            | Syntax                      |
| ----------- | ------------------------------- | --------------------------- |
| Claude Code | `.mcp.json` at the project root | `${VAR}`, `${VAR:-default}` |
| Cursor      | `.cursor/mcp.json`              | `${env:VAR}`                |

```json
{
  "mcpServers": {
    "testomatio": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@testomatio/mcp@latest",
        "--token",
        "${TESTOMATIO_MCP_TOKEN}",
        "--project",
        "${TESTOMATIO_PROJECT}",
        "--tools",
        "${TESTOMATIO_TOOLS:-core}"
      ],
      "env": {
        "TESTOMATIO_BASE_URL": "${TESTOMATIO_BASE_URL:-https://app.testomat.io}"
      }
    }
  }
}
```

Host environment variable names are your choice when they are interpolated into
CLI flags, as above — the server only sees the flag values. For env-only
configuration the server expects:

| Variable                                               | Purpose                               |
| ------------------------------------------------------ | ------------------------------------- |
| `TESTOMATIO_PROJECT_TOKEN` (or `TESTOMATIO_API_TOKEN`) | MCP access token                      |
| `TESTOMATIO_PROJECT_ID`                                | Target project                        |
| `TESTOMATIO_BASE_URL`                                  | Defaults to `https://app.testomat.io` |
| `TESTOMATIO_TOOLS`                                     | Tool profile; defaults to `full`      |

**Do not confuse** the MCP token with `TESTOMATIO` — the reporter API key used by
CI to publish results. Different purpose, different place, never interchangeable.

Set the host variables in your shell or OS keychain — never in a committed `.env`.
In Claude Code a project `.mcp.json` server stays at _pending approval_ until you
accept the workspace trust prompt; check state with `claude mcp list` or `/mcp`.

If the repository generates its host configs from a single definition (this one ships
`ai/mcp/servers.json` + `npm run sync:ai`), edit that definition instead of the host
files — hand edits there are overwritten and flagged as drift.

## Tool profiles (`--tools`)

| Profile | Exposes                                                          | Use when                                |
| ------- | ---------------------------------------------------------------- | --------------------------------------- |
| `read`  | Read-only core entities                                          | Exploration, coverage questions, TQL    |
| `core`  | Core CRUD + project info                                         | Normal automation work (default choice) |
| `full`  | Everything incl. steps, snippets, labels, rungroups, attachments | Only when the task needs them           |

## Entities

Each supports the CRUD set `*_list`, `*_get`, `*_create`, `*_update`, `*_delete`:

`tests` · `suites` · `plans` · `runs` · `testruns` · `rungroups` · `steps` ·
`snippets` · `labels` · `issues`

Read-only: `tags_list` / `tags_get`, `milestones_list` / `milestones_get`

Scoped helpers: `<entity>_issues_link` / `_unlink`, `<entity>_attachments_list` /
`_upload` / `_delete` (tests, suites, runs, testruns, plans — availability varies).

Global helpers:

| Tool           | Purpose                                                                              |
| -------------- | ------------------------------------------------------------------------------------ |
| `project_info` | Project configuration, metadata, features, CI profiles — also the connectivity check |
| `tql_help`     | Live TQL fields, syntax and examples — **prefer this over any TQL written here**     |

Enterprise analytics ship separately: `analytics_tests` (flaky analysis),
`analytics_stats` (success rate over time).

## Common parameters

| Parameter          | Meaning                                                                             |
| ------------------ | ----------------------------------------------------------------------------------- |
| `tql`              | Filter/search input — supported on `tests_list` and `runs_list`                     |
| `page`, `per_page` | Pagination — always page through rather than assuming one response holds everything |
| `verbose: true`    | Full objects instead of slim responses                                              |
| `fields: [...]`    | Select specific response fields — keeps context small                               |
| `status_event`     | Run status transitions (finish, launch, rerun)                                      |
| `file_path`        | Local path for attachment upload                                                    |

Default to slim responses with `fields`; request `verbose` only when a slim record
lacks what you need.

## TQL

Call `tql_help` first. Illustrative only:

```
tag IN ['@smoke']
priority == 'high'
tag == 'smoke' and state == 'manual'
severity == 'critical' or label == 'ux'
```

Reference: https://docs.testomat.io/advanced/tql/

## Version drift

Older servers exposed different names for the same capabilities:

| Capability         | Older           | Current              |
| ------------------ | --------------- | -------------------- |
| Connectivity check | `system_ping`   | `project_info`       |
| Find tests         | `tests_search`  | `tests_list` + `tql` |
| Find suites        | `suites_search` | `suites_list`        |

If a documented name is missing from the live schema, look for the equivalent
capability rather than reporting failure.
