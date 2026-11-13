# Flaky management

## Detection

- Fails intermittently locally or in CI; passes on retry without code change
- Sensitive to order, timing, shared data, or animation
- Use `trace-triage` for a minimal bundle; re-check live with `playwright-cli` → MCP when app is up

## Fix order (Framework contract Healing)

1. POM / component / modal locators and methods
2. Shared `app/constants/*` only if selector is reused
3. Test last (assert/flow), never drop tags

## Allowed wait strategies

- Web-first `expect(...)`
- `locator.waitFor()`, `page.waitForLoadState()` as appropriate
- Sanctioned `Component.wait()` only when no UI/network signal exists

Forbidden: new `waitForTimeout`, XPath, disabling asserts to go green.

## Quarantine

```text
1. Tag @quarantine (title + tag: [])
2. Link ticket; owner; expiry date in ticket or comment
3. CI release/full gate: --grep-invert @quarantine
4. Remove tag when root-caused and stable (e.g. 5/5)
```

## Retries

- Prefer healing over retries
- If CI retries exist, keep them small and report flake metrics — do not hide systemic issues
