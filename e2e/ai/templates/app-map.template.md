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

Risk is **impact × exposure**, then **dependents** (skill `characterize-feature` → **Ranking**):

- **impact** — what breaks for whom (money, permissions, stored data, or another reason in words);
- **exposure** — who passes through it: `every visitor` (the entry page, global navigation, sign-in),
  `most`, `few`. A zone every visitor passes is at least `medium`;
- **dependents** — zones reached only through this one. A zone is at least as risky as its riskiest
  dependent: a broken menu hides every page behind it.

**Z-0 Smoke** comes first: breadth before depth — the whole app shallowly, before any zone deeply.

### Z-0 Smoke

- Entry points: the entry page (or the first screen after sign-in); every route of this map; the
  global navigation (each item → its target)
- Risk: high — impact: nothing else is reachable when it breaks; exposure: every visitor;
  dependents: all zones
- Status: <unexplored | observed | scaffolded | partial | covered>
- Covered: <only when partial / covered by existing `@smoke` tests: which entry points → where>
- Spec: <`specs/smoke.md` once observed, else —>
- Scaffolding: <`tests/characterization/smoke.test.ts` while it exists, else —>
- Notes: <skipped at Gate A by <who>, <YYYY-MM-DD>: <why> — only when the human chose to skip it>

### Z-1 <Zone name>

- Entry points: <pages `/path`, forms, API `METHOD /path`, exported handlers>
- Risk: <high | medium | low> — impact: <money | permissions | stored data | other: why>; exposure:
  <every visitor | most | few>; dependents: <Z-n reached only through this zone | —>
- Status: <unexplored | observed | scaffolded | partial | covered>
- Covered: <only when partial: entry points held by functional tests → `specs/<feature>.md`>
- Spec: <`specs/<feature>.md` once observed, else —>
- Scaffolding: <`tests/characterization/<zone>.test.ts` while it exists, else —>
- Notes: <data dependence, test account used, anything a later run must know>
