---
name: trace-triage
description: Produces a minimal failure bundle from a Playwright test failure (error, step, relevant files, and artifact paths) to reduce tokens and speed up fixing. Use when a Playwright test fails, there is a trace/report, or the user asks to triage flakes.
---

# Trace triage (minimal failure bundle)

## Goal

Turn noisy failure output into a compact bundle suitable for an AI healer.

## Bundle format

Return:

- **Failing test**: file + test title + tags
- **Error**: exact message + stack (trim to relevant lines)
- **Artifacts**: paths to trace / report / screenshots (do not inline large blobs)
- **Classification**: `test` / `product` / `data` / `environment` + the evidence (Framework contract → **Healing**). `product` = the app differs from the requirement (oracle): no heal, propose a pin. Unsure → say so
- **Suspected root causes**: 3 bullets max
- **Candidate fix locations** (in priority order — same as Framework contract **Healing**):
  1. `app/ui/pages/*` / `app/ui/components/*` / `app/ui/modals/*` (POM locator fields / methods; inline by default)
  2. `app/constants/*` (only if selector is shared / reusable template)
  3. `tests/*` (last resort)

## Rules

- Read the project binding first: `ai/project.md` (paths, fixtures); contract in `ai/instructions/02-architecture.md`.
- When the app is reachable, prefer **`playwright-cli` first**, then Playwright MCP — see `ai/instructions/07-playwright-ai-agents.md`. Do not triage only from screenshots if either can open the page.
- Do not suggest `waitForTimeout`.
- Never propose changing an expected value to match what the app shows now (Framework contract → **Map and oracle**).
- Prefer POM fixes over test edits; shared constants only when reused.
- Keep the bundle short (aim < 200 lines).
- Avoid RegExp in locators and `toHaveClass(/…/)` — use `toContainClass('active')` (Framework contract).
