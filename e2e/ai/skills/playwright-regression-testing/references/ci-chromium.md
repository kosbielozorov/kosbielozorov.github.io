# CI notes (chromium-first)

This project runs Chrome/chromium by default (`npm test` → `--project=chromium`). Do not expand matrix to Firefox/WebKit unless asked.

## Suggested jobs

1. **Smoke** — `npx playwright test --project=chromium --grep @smoke`
2. **PR sanity** — `--grep @critical` and/or `@sanity`
3. **Nightly full** — `--grep @regression --grep-invert @quarantine` (+ optional `@a11y` job)
4. **Shard** full when needed: `--shard=n/m` + merge reports

## Artifacts

- Keep traces/screenshots on failure for `trace-triage`
- Fail the gate on smoke/sanity; quarantine must not silently ship

## Config tips

- Align `workers` / sharding with runner size
- Isolation + unique data (`03-writing-tests.md`) before adding more retries
- Env/secrets via CI secrets + `.env.example` vars — never commit credentials
