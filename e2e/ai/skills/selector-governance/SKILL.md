---
name: selector-governance
description: Defines selector governance for Playwright tests with this framework. Use when choosing locators, reviewing selector stability, or deciding whether to add selector constants. Must follow the framework contract in ai/instructions/02-architecture.md.
---

# Selector governance

**SSoT:** `ai/instructions/02-architecture.md` → **Selectors and locators**. Binding: `ai/project.md`. Do not invent a second selector policy.

Live discovery: **`playwright-cli` → Playwright MCP** (`07-playwright-ai-agents.md`). Testomatio MCP is **not** for locators.

## Checklist (before accepting a selector)

- Uniquely identifies one element in the intended scope?
- Stable across minor DOM/theme/responsive changes and varying test data?
- Page-private → **inline on POM field**; shared (2+ consumers) or reusable template → `app/constants/*`?
- Semantic preference (`getByRole` / `getByLabel` / `getByText` / `getByTestId`) + scoping; no XPath; no RegExp targeting; classes via `toContainClass`?
- No brittle layout coupling (`:nth-child`, deep CSS) unless no alternative?
