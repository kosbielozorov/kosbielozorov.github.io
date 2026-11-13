# Mutation catalog — wrong-app probes

A fixed set of ways to make the app **wrong** from the outside, for the `adversarial-tester` and
`adversarial-judge` subagents. The app's code is not in this package, so nothing is mutated in its
source: each probe serves the test a wrong value, a wrong response or a broken action, and runs the
test's own steps and assertions. **Green probe = surviving mutant = the test would miss that bug.**

The operators make attacks systematic and comparable between runs: walk the list for every value the
scenario's **Expected** lines name, instead of inventing attacks ad hoc.

## Rules

1. **Oracle first.** Apply an operator only when the requirement makes the mutated result **wrong**
   (the scenario's **Expected** lines or the TMS case). If the requirement does not distinguish the
   mutant from the real app (e.g. reordering a list whose order is not specified), skip it — it is an
   equivalent mutant, not a finding.
2. **One operator per probe.** One change, so a green probe names exactly one weakness. Exception:
   a claim that is itself a combination (e.g. "starts in the target state **and** the click does
   nothing") gets one probe with exactly those operators, tagged `[D4+B1]`.
3. **Mutate the real response.** `route.fetch()` the real response and change one thing; never
   hand-write a whole body (that changes many things at once).
4. **Prove the mutant is live.** Before the test's own assertions, assert that the wrong value is
   really on screen (or the route really fired). A probe that is green because the mutation never
   applied proves nothing.
5. **Tag the probe** with the operator id in its title: `probe [R2] <test title> accepts one item fewer`.
6. **Budget.** At most 12 probes per feature per run, highest-risk Expected lines first (money,
   permissions, stored data, then boundaries, then texts). Say which operators were skipped for budget.
7. Probes live under `.work/review/<feature>/` (judge: `.work/review/<feature>/judge/`) and run with
   `npx playwright test -c playwright.probe.config.ts <path>`.

## Operators

### V — altered expected value (call the test's own POM / controller assertion)

| Id  | Mutation                                                     | Catches                                |
| --- | ------------------------------------------------------------ | -------------------------------------- |
| V1  | Text truncated (drop the last word / last character)         | substring / `toContainText` match      |
| V2  | Text with extra content (prefix or suffix)                   | substring / `toContainText` match      |
| V3  | Text with changed case or punctuation                        | case-insensitive or loose RegExp       |
| V4  | Number off by one (count, amount, index)                     | `> 0`, `toBeGreaterThan`, ranges       |
| V5  | Neighbour status code (200→201, 400→422, 404→410)            | status-family checks (`ok()`, `< 400`) |
| V6  | Empty value (`''`, `0`, `[]`) where the requirement says one | visibility-only, `toBeTruthy()`        |

### R — wrong network response (`page.route` + `route.fetch()`; API data in UI tests)

| Id  | Mutation                                                    | Catches                                  |
| --- | ----------------------------------------------------------- | ---------------------------------------- |
| R1  | Collection emptied (`[]`)                                   | `length > 0` absent, list never asserted |
| R2  | Collection ±1 item (drop or duplicate one)                  | count not asserted                       |
| R3  | One field `null` or removed                                 | field shown but its value not asserted   |
| R4  | One field's value changed (V1–V4 applied to the field)      | value not asserted, only presence        |
| R5  | Boolean / enum flipped (`true`→`false`, `active`→`blocked`) | state shown but not asserted             |
| R6  | Order reversed — **only** when the requirement fixes order  | order not asserted                       |
| R7  | Status 2xx → 500 with the same body                         | UI ignores errors; test checks body only |

```ts
await page.route('**/api/items*', async route => {
  const response = await route.fetch();
  const body = await response.json();
  body.items.pop(); // [R2] one item fewer
  await route.fulfill({ response, json: body });
});
```

### D — wrong server-rendered document (`page.route` on the page URL, edit the HTML)

`page.route` does not intercept the target of a redirect (e.g. a form post that redirects to
`/secure`). For such a page, mutate the DOM with `page.addInitScript` on `DOMContentLoaded`, guarded
by `location.pathname`.

| Id  | Mutation                                                   | Catches                                |
| --- | ---------------------------------------------------------- | -------------------------------------- |
| D1  | A text the requirement names changed (V1–V3 applied to it) | text not asserted, or asserted loosely |
| D2  | An element the requirement names removed                   | test passes on absence / wrong locator |
| D3  | An element duplicated                                      | over-broad locator, count not asserted |
| D4  | Initial state flipped (`checked`, `disabled`, `selected`)  | precondition not asserted              |

```ts
await page.route('**/checkboxes', async route => {
  const response = await route.fetch();
  const body = (await response.text()).replace(
    '<input type="checkbox">',
    '<input type="checkbox" checked>',
  ); // [D4]
  await route.fulfill({ response, body });
});
```

### B — broken action (the UI looks right, the action does nothing)

| Id  | Mutation                                                                     | Catches                                   |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| B1  | Click is a no-op (`addInitScript` that `preventDefault`s the click)          | outcome not asserted after the action     |
| B2  | The action's request is aborted (`route.abort()`)                            | test asserts UI state the app pre-renders |
| B3  | The action's request succeeds but the response is ignored (R7 body with 200) | only the request was asserted             |

## Reading a result

- **Probe green** → the mutant survived → **[PROVED]** (operator id, wrong value, the Expected line it
  contradicts).
- **Probe red on the test's assertion** → the mutant was killed → "Hunted, nothing broke".
- **Probe red for another reason** (route never matched, locator timeout before the assertion) → the
  probe proves nothing; fix the probe or record the attack as not run. Never count it as killed.
- **App unreachable** → nothing is proved either way; the finding stays **[REASONED]**.
