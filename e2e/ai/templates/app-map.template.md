# App map

<!-- Copy to specs/app-map.md. Format: skill characterize-feature → App map. Check: npm run characterization:check -->

Map of a legacy app without requirements, built by `characterize-feature` (step 1). It is a list of
**observations**, never an oracle: nothing here is a requirement until a human confirms it in a
feature spec.

- Environment: <test env from ai/project.md — never prod>
- Explored: <YYYY-MM-DD>
- Sources: <UI + network | OpenAPI path | docs / TMS | app code path (read-only)>
- Access: <none (public) | saved session `<storage state>` set up by <who> | human signs in in the browser pane> — the agent never types a password
- Third-party hosts (ignored as observations): <e.g. `*.log.optimizely.com` — tracking, fails on every page>

## Approved writes

Actions during exploration that create or change data — only these may be performed (D9).

- W-1: <action, e.g. submit the contact form with test data> — approved <YYYY-MM-DD> by <who>

## Zones

One `### Z-n` per zone (a business area: a set of pages / forms / endpoints). Never renumber a zone —
characterization tests cite it as `specs/app-map.md#Z-n`.

Granularity: high risk (money, permissions, stored data) → one feature per zone; medium / low risk →
grouped by area. Keep the map at **~15 zones** at most. A group picked at Gate A is split first: the
picked feature becomes a new zone (next free id), the group keeps the rest.

### Z-1 <Zone name>

- Entry points: <pages `/path`, forms, API `METHOD /path`, exported handlers>
- Risk: <high | medium | low> — <money | permissions | stored data | other>: <why>
- Status: <unexplored | observed | scaffolded | partial | covered>
- Covered: <only when partial: entry points held by functional tests → `specs/<feature>.md`>
- Spec: <`specs/<feature>.md` once observed, else —>
- Scaffolding: <`tests/characterization/<zone>.test.ts` while it exists, else —>
- Notes: <data dependence, test account used, anything a later run must know>
