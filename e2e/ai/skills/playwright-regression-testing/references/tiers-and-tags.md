# Tiers and tags

## Mapping to this repo

| Goal                     | Prefer tags                     | Placement                         |
| ------------------------ | ------------------------------- | --------------------------------- |
| Commit / fast gate       | `@smoke`                        | Critical happy paths only         |
| PR confidence            | `@critical`, optional `@sanity` | Core features; still lean         |
| Nightly / release        | `@regression`                   | Broad coverage                    |
| A11y gate (optional job) | `@a11y`                         | See `a11y-playwright-testing`     |
| Known flake (temp)       | `@quarantine`                   | Must have ticket + expiry         |
| Long-running             | `@slow`                         | Exclude from smoke; allow in full |

Always keep real `@S` / `@T` from Testomatio alongside category tags.

## Selection strategies

- **Change-based:** map `git diff` paths → features under `tests/<feature>/` + related POM; run smoke + impacted `@regression`
- **Risk-based:** auth, payments, permissions, data loss → `@critical` / smoke
- **Time-budget:** fill remaining CI minutes with highest-risk unrun `@regression`, not random order only
- **Historical:** prefer tests that failed recently on main (when data exists)

## Naming

- File: `*.test.ts` under `tests/` or `tests/<feature>/`
- Titles: descriptive + `@T…`; describe: feature + `@S…` + category tags
