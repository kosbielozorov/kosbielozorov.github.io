---
name: framework-design-review
description: Reviews the diff since a fixed point for semantic design smells in app/** (controllers, Page Objects, fixtures, lib) — the ones ESLint/sonarjs cannot catch mechanically. Never touches tests/** (repeated test structure there is idiomatic, not a smell). Read-only: reports findings, never edits. Use after adding or refactoring a controller, Page Object, fixture, or shared helper under app/, or when asked to review framework code quality/design.
---

# Framework design review

Reviews **design**, not correctness or spec-completeness. Those are separate concerns with
separate tools in this repo — see [Relationship to other gates](#relationship-to-other-gates).
This skill exists for exactly one gap: nothing else in this repo reads `app/**` for _semantic_
smells — the ones that need judgment, not a regex.

## Scope (hard boundary)

- **In scope:** `app/api/controllers/**`, `app/ui/pages/**`, `app/ui/components/**`,
  `app/ui/modals/**`, `app/fixtures/**`, `app/constants/**`, package-root `lib/**`, `helpers/**`,
  `utils/**`.
- **Never in scope: `tests/**`.** Per `ai/instructions/01-fundamental-principles.md`, _"DRY ≠
  Over-abstraction — a little duplication is better than a complex or wrong abstraction"_ —
  repeated `test.describe`/arrange-act-assert shape across test files is the idiom this repo has
  deliberately chosen, not a Duplicated Code smell. Flagging it would fight the project's own
  stated principle. If the diff touches only `tests/**`, say so and stop — nothing to review.
- If the diff touches both, review only the `app/**` (+ `lib/`/`helpers/`/`utils/`) hunks; mention
  the `tests/**` files exist but were out of scope, don't review them.

## Pin the fixed point

Same mechanic as any diff review: the user supplies a fixed point (commit, branch, tag, or
`main`). If they didn't, ask. Compute `git diff <fixed-point>...HEAD -- app/ lib/ helpers/ utils/`
(three-dot, against the merge-base) and `git log <fixed-point>..HEAD --oneline -- app/ lib/
helpers/ utils/`. Confirm the ref resolves and the scoped diff is non-empty before going further —
an empty in-scope diff is itself the finding ("nothing under app/** changed since <fixed-point>"),
not a reason to widen scope.

## Why this list, not the full Fowler set

`code-review`-style reviews elsewhere often carry the full twelve-smell Fowler baseline. Half of
it is already caught **mechanically** on every run by `eslint.config.js`'s `sonarjs` block —
re-running it here would be noise, not signal:

| Already mechanical (skip)                    | Rule                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| Duplicated Code (near-identical logic)       | `sonarjs/no-duplicate-string`, `sonarjs/no-identical-functions` |
| Repeated Switches / collapsible conditionals | `sonarjs/no-small-switch`, `sonarjs/no-collapsible-if`          |
| Excess branching complexity                  | `sonarjs/cognitive-complexity`                                  |

Only review the smells below — the ones that require understanding _intent_, which static
analysis structurally cannot do.

## The checklist (semantic smells only)

Each entry: _what it is_ → _how it shows up in this framework_ → _how to fix_.

- **Mysterious Name**: a controller method, fixture, or Page Object field whose name doesn't
  reveal what it does or holds (`handleIt`, `data2`, a boolean named `flag`). → rename; if no
  honest name comes, the design is murky.
- **Feature Envy**: a controller method that reaches into another controller's response shape
  more than its own, or a Page Object method that manipulates another page's locators instead of
  delegating to it. → move the method to the object it envies, or call through that object's
  interface instead of reaching past it.
- **Data Clumps**: the same few parameters travel together across multiple controller methods or
  fixtures (e.g. `id`, `userId`, `status` always passed as a trio) without being bundled into one
  type. → give them a named type, pass that.
- **Primitive Obsession**: a raw string/number standing in for a domain concept that recurs across
  controllers (a bare `status: string` instead of a narrow union of the known values, a raw
  endpoint path string repeated instead of a shared constant/builder). → give the concept its own
  small type, reuse the existing convention if one exists before inventing a new one.
- **Shotgun Surgery**: one conceptual change (e.g. a new response field, a new query parameter)
  forced edits across many controllers/fixtures in this diff for the same reason. → gather what
  changes together — often back into `BaseController` or `ControllersManager` — so future changes
  of the same kind touch one place.
- **Divergent Change**: one file in the diff is edited for several unrelated reasons (e.g.
  `Base.controller.ts` picks up both a new assertion helper and an unrelated body-parsing tweak).
  → split so each module changes for one reason.
- **Speculative Generality**: a parameter, option, or hook added for a need the current diff
  doesn't exercise ("just in case a future controller needs it"). → delete it; this directly
  restates `01-fundamental-principles.md`'s YAGNI section, so treat it as a hard finding, not a
  judgement call.
- **Message Chains**: long navigation through nested objects the caller shouldn't depend on
  (`pageManager.loginPage.header.userMenu.settingsPanel.themeToggle.click(...)`) instead of a
  method on the first object. → hide the walk behind one method.
- **Middle Man**: a controller or Page Object method that only forwards to another method with no
  added behavior. → cut it, call the real target directly.
- **Refused Bequest**: a controller or Page Object subclass that overrides or ignores most of what
  `BaseController` / `BasePage` / `BaseModal` gives it. → drop the inheritance, use composition, or
  move the ignored behavior out of the base.

Every finding is a labelled heuristic, never a hard violation (Speculative Generality is the one
explicit exception, since YAGNI is already a hard rule here) — skip anything you're not confident
reads as the named smell rather than a stylistic difference.

## Output

Report directly (no file write — this is a point-in-time review, not a tracked gap). Per finding:
**file + line**, the **smell name**, a short quote of the hunk, and a one-line fix suggestion.
Group by file, most-impactful first. Cap at 15 findings; if there are more, say how many were cut
and why (e.g. "12 more Mysterious Name hits in the same file, same pattern — fix the first 3 as a
template"). Close with a one-line summary: files reviewed, total findings, worst one.

## Hard constraints

- **Read-only.** Never edit `app/**`, `lib/**`, `helpers/**`, `utils/**`, or any other file.
  Report findings; the user or a follow-up pass applies them.
- **Never review `tests/**`** under this skill, even if asked in the same breath — redirect a
  test-quality question to a manual read or `/code-review`-style ad hoc discussion; this skill's
  checklist is calibrated for `app/**` and will misfire on intentionally-repetitive test code.
- Don't re-report anything `npm run lint` / `npm run lint:contract` already flags — if unsure
  whether a rule covers it, check `eslint.config.js` before writing the finding up.
- Don't invent a design fix beyond what the diff calls for — no new abstractions "for the future"
  (Speculative Generality applies to your own suggestions too).

## Relationship to other gates

- **`selector-governance`** — locator policy, not covered here even when the locator lives in a
  Page Object under `app/ui/**`.
- **`jsdoc`** — documentation correctness; this skill may note a `Mysterious Name` finding on the
  same method a missing-JSDoc finding would also catch, but the two skills don't overlap otherwise.
- **`trace-triage`** — failure diagnosis; unrelated axis, different trigger (a failing test, not a
  diff to review).
