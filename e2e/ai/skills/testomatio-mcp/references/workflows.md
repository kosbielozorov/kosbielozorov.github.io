# Testomat.io MCP — workflows

Confirm every tool name against the live schema first (SKILL.md → _Discover before
calling_). Names here follow the current server.

---

## Workflow A — automate an existing case (`@T` given)

Triggered by: "create a test from @T…", "automate T8aab710e", or a test-generation
skill that received an id.

```
- [ ] 1. Normalize the id: @T8aab710e / T8aab710e / 8aab710e → 8aab710e
- [ ] 2. tests_get({ test_id }) — fetch before writing anything
- [ ] 3. suites_get({ suite_id }) when the parent suite / folder id is needed
- [ ] 4. Resolve the repo's tag convention (binding → existing test → ask)
- [ ] 5. Only now write the automation, built from the case description
```

Fields worth reading from the fetched case:

| Field                          | Use                                                               |
| ------------------------------ | ----------------------------------------------------------------- |
| `id`                           | The `@T` written into the test                                    |
| `clean_title` / `public_title` | Human-readable title                                              |
| `description`                  | Steps and expected results — the source of truth for the scenario |
| `suite_id` / `suite_title`     | File- or feature-level `@S`                                       |
| `labels`, `tags`, `priority`   | Category tags and risk tier                                       |

**If `description` is empty**, stop and ask the user what the case should verify.
Inventing steps produces automation that silently diverges from the documented case
— worse than no automation, because the TMS now claims coverage that does not exist.

---

## Workflow B — sync a code test into the TMS

Triggered by: "add these tests to Testomat", "this test has no @T", "push the suite".

```
- [ ] 1. Read the test: title, steps, file path, any existing @S / @T
- [ ] 2. suites_list — search for the suite; never create blindly
- [ ] 3. suites_create only when genuinely missing (title; optional parent_id, file)
- [ ] 4. tests_list with tql — search by title before creating
- [ ] 5. tests_create only when missing (title + suite_id; description from steps)
- [ ] 6. Write the real ids back into the code, per the repo's tag convention
- [ ] 7. Report what was created vs reused
```

Duplicate suites and cases are the main damage this workflow can do, and they are
tedious to clean up by hand. When a search is ambiguous — two plausible suites, a
near-match title — ask instead of guessing.

Pass `file` on `suites_create` — the test file's repo-relative path — when the TMS
mirrors the repo structure; it keeps the suite tied to its source file.

### Applying ids

Follow the binding. Example for a two-level Playwright layout (folder suite + file suite):

```typescript
test.describe(
  'Feature @S<folderId> @S<fileSuiteId>',
  { tag: ['@S<folderId>', '@S<fileSuiteId>'] },
  () => {
    test('Case title @T<testId>', { tag: ['@T<testId>'] }, async ({ page }) => {
      // ...
    });
  },
);
```

---

## Workflow C — query the TMS

Triggered by: "what should we automate next", "what is in this plan", "which tests
are manual", "what is flaky".

```
- [ ] 1. tql_help — read the syntax the connected version supports
- [ ] 2. tests_list / runs_list with tql, paginating via page / per_page
- [ ] 3. Narrow the response with fields to keep context small
- [ ] 4. Summarize; cite ids so the user can open the cases
```

Useful shapes (verify against `tql_help`):

| Question              | Filter idea                                              |
| --------------------- | -------------------------------------------------------- |
| Automation candidates | manual state + high priority                             |
| Smoke tier contents   | tag membership                                           |
| Regression risk       | severity or label filters                                |
| Flaky history         | `analytics_tests` when the enterprise package is present |

For "what is worth automating", the TMS answers _what exists_, not _what matters_.
Pair it with the repo's own risk discussion before committing to a plan.

---

## Failure modes

| Symptom                                                  | Likely cause                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| Tool not found                                           | Version drift — check `tools.md` → _Version drift_               |
| Empty / unauthorized response                            | Wrong token, wrong project id, or reporter key used as MCP token |
| Write tool missing                                       | Server launched with `--tools read`                              |
| Case found but `description` empty                       | Manual case never documented — ask the user                      |
| Search returns nothing for a title you can see in the UI | TQL field mismatch — re-check with `tql_help`                    |
