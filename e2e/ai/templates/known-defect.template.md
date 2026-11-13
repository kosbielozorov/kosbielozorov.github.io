# <BUG-ID> — <what is wrong, in one line>

<!-- Copy to specs/known-defects/<BUG-ID>-<slug>.md. One file per known product defect. It is a brief
     a human or an AI coding agent can fix the bug from, without the conversation that found it.
     Linked from the spec's **Known defects** line; deleted when the bug is fixed and the pin removed. -->

- **Severity:** <high | medium | low> — <who is hurt, how>
- **Found:** <YYYY-MM-DD>, <how: feature / zone, `specs/<feature>.md` F-n or O-n>
- **Pinned test:** `<test file>` → _<test title>_ (`test.fail`, `@bug-<BUG-ID>`), scenario <N.M> — or
  "none" for a defect no test pins (e.g. a content typo)
- **Paths:** relative to <the repo root of the app | this package>

## Expected

> <the spec's Expected line(s), verbatim — the oracle; never weaken it to match the app>

## Actual

<what the app does, with evidence: values, sizes, hashes, the failing assertion's Received>

## Reproduce

```bash
<one command — usually the pinned test with -g, or a shell check>
```

<or the manual steps>

## Where

<files and lines that cause it; the relevant code excerpt>

## Suggested fix

<the smallest change that meets Expected; options with a recommendation; what to check by hand
(other pages, languages, viewports); what must not change>

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-<BUG-ID>` tag, remove the line under the spec's **Known
  defects**, and delete this file.
- The feature's tests are green; `npm run verify` passes; the app's own lint / build pass.
- <anything the owner must review by hand>

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
