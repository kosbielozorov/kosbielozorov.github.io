---
name: jsdoc
description: Generate clean JSDoc blocks for functions, methods, and class-level summaries. Use when creating or editing public POM/component/modal/controller methods or helpers, when creating a new POM/controller class (needs its one-line class summary), or when the user asks for /doc, JSDoc, method documentation, parameter descriptions, default parameter notes, remarks, or usage examples.
---

# JSDoc

Generate JSDoc that matches real behavior. Apply this skill whenever you **create or edit** a public method/function in POM / component / modal / controller / helper code — not only when the user types `/doc`.

**SSoT for when JSDoc is required:** `ai/instructions/02-architecture.md` → **Page Object methods**. This skill defines the **block format** only.

When the user asks for documentation only (e.g. `/doc`), return **only** the JSDoc block unless they explicitly ask for explanation, review notes, or file edits. When creating/editing code, insert the block above the method as part of the change.

## Workflow

1. Read the function or method signature and the nearby implementation.
2. Write a short summary that matches the real behavior (user-facing action for POM methods; what the request does for controller methods).
3. If parameters exist, add one `@param` line for each parameter with an explicit `{type}`.
4. Use explicit types from the code first. If a type is not written, infer it only when it is obvious from the context.
5. If a parameter has a default value, document it in both places:
   - use optional/default syntax when useful, for example `[timeout=5000]` or `[message='...']`
   - mention the default in the description, for example `(default: 'Login page should be loaded')` or `Defaults to 5000.`
6. Add `@returns` with an explicit `{type}` when the return value is meaningful and can be determined confidently.
7. **Add `@remarks`** for methods with real behavior — branching, side effects, retries, waits, preconditions, or failure conditions. For trivial methods, add 1–2 factual sentences only if they say something the summary/`@param` don't already say; if there is nothing to add beyond a restatement, **omit the tag** rather than write filler. Never invent caveats. Exception: pure delegate methods use `@see` instead — see "Delegate Methods" below.
8. Add `@example` when parameters exist or when usage is not trivial. A short `//` comment above the call is allowed when it clarifies intent.
9. Keep the output concise, readable, and ready to paste / commit.

## Project constraints (POM / controllers)

- Document only parameters and return values the method itself accepts or returns.
- Do **not** invent `@param page` when `page` comes from the constructor / `PageHolder`.
- Do **not** invent `@param request` when `request` comes from the constructor / `BaseController`.
- Prefer a short user-facing (POM) or request-facing (controller) summary; do not narrate every locator/line in the summary.
- English inside JSDoc.

## Tag Order (required)

```text
summary
@param (each parameter)
@returns (when useful)
@remarks (default; omit only per "When to omit" below) / @see (pure delegates only)
@example (when useful)
```

Never place `@remarks` (or `@see`, for delegates) before `@param` / `@returns`.

## Type Rules

- Always include brace types in `@param` and `@returns`.
- Prefer concrete primitive types when obvious: `string`, `number`, `boolean`.
- Use collection/object types when obvious: `string[]`, `number[]`, `Record<string, unknown>`.
- Use promise types when obvious from `async` behavior: `Promise<void>`, `Promise<boolean>`, `Promise<APIResponse>`, and similar.
- If the exact type is not explicit and not obvious, do not guess aggressively; use a safe fallback such as `unknown`.

## Param / Returns Style

- Required form:
  - `@param {string} username - The username to log in with.`
  - `@param {string} [message='Login page should be loaded'] - Optional custom assertion message. Defaults to 'Login page should be loaded'.`
  - `@returns {Promise<APIResponse>} The raw API response for the caller to inspect or assert on.`
- Infer meaning from the signature and implementation; do not invent parameters.

## Remarks Rules

- **`@remarks` is required whenever it adds information** beyond the summary and `@param`/`@returns` — which is true for most non-trivial methods. Omit it only when there is genuinely nothing to add (see "When to omit" below); do not pad with a restated summary just to satisfy a rule.
- Rationale: short remarks beat tribal knowledge — they help humans onboard, keep agents from guessing intent, and reduce regressions during refactors.
- Place `@remarks` after `@param` / `@returns` and before `@example`.
- Keep remarks factual and tied to the implementation; do not invent caveats.
- For simple methods: 1–2 short sentences is enough (e.g. assertion target, when callers should use it, default wait/assert style) — but only if that adds something the summary doesn't already say.
- For complex methods (branching, UI/request steps, waits, asserts, throws): use a bullet list:
  - early-return / idempotent behavior
  - main interaction steps (open, fill, click, wait — or request, then assert)
  - assertions / network waits / response checks
  - failure / throw conditions
- Do not duplicate the summary or `@param` text inside `@remarks` — add the _how / when / what fails_ layer instead.

### When to omit `@remarks`

Skip the tag only when the summary + `@param`/`@returns` already fully describe the method and
a remark would be pure restatement (for example: a single request with no branching, no
wait/retry logic, no precondition beyond "call after the controller is constructed"). If you catch
yourself writing a sentence that just rephrases the summary in different words, delete the tag
instead. When in doubt, keep it — the bar is "adds nothing," not "feels short."

## Delegate Methods (facade pattern)

A method qualifies as a pure delegate only if its entire body is a single forwarding call
— `return this.someComponent.method(...args);` (or the `await` equivalent) — with no
branching, no extra logic, no side effects of its own.

For these methods only:

- Replace `@remarks` with `@see {@link Component.methodName}` pointing at the method that
  actually implements the behavior.
- Keep summary, `@param`, `@returns` as usual — they describe the public contract callers see.
- Keep `@example` when useful — it is what test authors see in autocomplete/hover, and it is
  cheap (one call site, no behavioral prose).
- Never write your own `@remarks` prose on a delegate — that duplicates (and can drift from)
  the real implementation's documentation. If the method has ANY logic beyond forwarding the
  call, it does not qualify — give it full `@remarks` (or omit per the rule above) like any
  other method.

Tag order for delegates: `summary → @param → @returns → @see → @example`.

### Delegate Template

```ts
/**
 * Opens the app's login form via the header menu instead of navigating directly.
 *
 * @param {string} username - Username to log in with.
 * @param {string} password - Password to log in with.
 * @see {@link LoginPage.login} for implementation details.
 *
 * @example
 * await headerMenu.loginAs('tomsmith', 'SuperSecretPassword!');
 */
async loginAs(username: string, password: string) {
  return this.loginPage.login(username, password);
}
```

## Output Rules

- Return a complete JSDoc block (or insert it above the method when editing files).
- Do not add prose before or after the block unless the user asks for it (standalone `/doc` mode).
- Keep a blank line between summary, tag groups, remarks, and examples.
- Do not invent behavior, side effects, or return values that are not supported by the code.

## Template

```ts
/**
 * Brief summary of what the method does.
 *
 * @param {string} username - Username to log in with (case-sensitive).
 * @returns {Promise<void>} Resolves once the form has been submitted.
 *
 * @remarks
 *  - Fills the username/password fields, then clicks the submit button.
 *  - Does not itself assert the outcome — call `expectFlashMessage` after.
 *
 * @example
 * // Log in with valid credentials
 * await loginPage.login('tomsmith', 'SuperSecretPassword!');
 */
```

## Class-level summary (POM / controller classes)

A **separate, smaller** requirement from everything above — one line, no tags, no `@remarks`
machinery. Required once per class, directly above `export class X extends Y` (or
`export default class`), for every concrete class under `app/ui/pages/`, `app/ui/components/`,
`app/ui/modals/`, `app/api/controllers/*.controller.ts`. Not required for the shared base/facade
classes already documented in `ai/project.md`'s **Architecture** table (`PageHolder`, `Component`,
`BasePage`, `BaseModal`, `BaseController`, `PageManager`, `ControllersManager`).

Why: `npm run catalog:generate` extracts this line into `specs/framework-catalog.md` — the
compact reference `generate-pom-skeleton` / `generate-controller-skeleton` read in their "Check
existing code first" step, so a class without a summary is invisible to that check and more
likely to get accidentally duplicated.

Format:

```ts
/**
 * Generic UI example against the-internet.herokuapp.com/login.
 * Swap for your own app's login (or first) page when adopting the boilerplate.
 */
export class LoginPage extends BasePage {
```

Rules:

- One to two sentences: what the class **represents or covers** (the page/area/endpoint group),
  not implementation detail and not a restatement of the class name.
- No `@param` / `@remarks` / `@example` — that apparatus is for methods only.
- Add it when the class is created; update it only when the class's actual scope changes (a new
  major responsibility folded in or split out) — not on every unrelated edit to the file.

## Quick Checklist

- Summary matches real behavior.
- Tag order is summary → `@param` → `@returns` → `@remarks` → `@example`.
- Every `@param` and `@returns` has an explicit `{type}`.
- Default parameters are documented clearly.
- `@remarks` is present unless it would be pure restatement (1–2 sentences for simple methods; bullets for complex flow); pure delegates use `@see` instead.
- An example is included when parameters exist or usage is non-trivial.
- No fake `@param page` / `@param request` for constructor-injected values.
- The final block is easy to read and ready to paste.
