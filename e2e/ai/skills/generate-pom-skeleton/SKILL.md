---
name: generate-pom-skeleton
description: Generates a Playwright Page Object Model skeleton under app/ui (and shared selector constants only when needed) following the project contract. Use when creating a new page object, component, or modal, or when the user asks to add POM classes and stable selectors.
---

# Generate POM skeleton

## Rules (must follow)

- Page Objects: `app/ui/pages/**/*.ts` — register new pages on `PageManager`
- Components: `app/ui/components/**/*.ts`
- Modals: `app/ui/modals/**/*.ts` (extend `BaseModal`)
- Shared selector constants (optional): `app/constants/**/*.ts` — only when the selector is reused by 2+ pages/components
- Tests must import fixtures from `@fixtures` (do not modify tests here unless asked).
- A concrete `*.page.ts` / `*.component.ts` / `*.modal.ts` imports its Base class via the matching
  alias (`@pages/BasePage`, `@components/Base.component`, `@modals/Base.modal`), **not** a relative
  `./Base...` — the file may later move into a feature subfolder.
- Follow `ai/instructions/02-architecture.md` → **Selectors and locators**.
- Read the project binding first: `ai/project.md` (real paths, base classes, fixtures).

## Check existing code first

- Run `npm run catalog:generate` (fast, deterministic — regenerates from source, never stale by
  the time you read it) and scan `specs/framework-catalog.md`'s **Pages** / **Components** /
  **Modals** sections: class summary + public method list per file, without opening every
  candidate. Open the actual file only for the one or two classes that look like a match.
- Check `app/ui/pages/PageManager.ts` for a page already registered that covers this route or area
  — add a method to it rather than creating a new file, unless the shape is genuinely a different
  page.
- Search `app/ui/components/` and `app/ui/modals/` for a component/modal already covering this
  fragment before creating a new one.

**Exists → use. Similar → extend/compose. Only create when nothing covers the need.**

## Decide what to generate

Pick one:

- **Page POM** (represents a full page): **must extend** `BasePage` (`app/ui/pages/BasePage.ts`)
- **Component POM** (reusable fragment): **must extend** `Component` (`app/ui/components/Base.component.ts`)
- **Modal POM**: **must extend** `BaseModal` (`app/ui/modals/Base.modal.ts`)

If the request is ambiguous, default by naming:

- `*Page` → Page POM (`extends BasePage`)
- `*Component` / `*Fragment` → Component POM (`extends Component`)
- `*Modal` → Modal POM (`extends BaseModal`)

## Files to create

- Page Object: `app/ui/pages/<name>.page.ts` (+ register on `PageManager`)
  — a plain field (`public homePage = new HomePage(this.page);`), **no** doc comment: the class
  JSDoc already says what the page is. Only the shipped example fields carry an `EXAMPLE` comment
  (`ai/project.md` → Examples), so a new page never copies it.
- Component: `app/ui/components/<name>.component.ts`
- Modal: `app/ui/modals/<name>.modal.ts`
- Selector constants file: **only if** selectors are shared across multiple POMs

## Default pattern (page-private locators inline)

```ts
// app/ui/pages/login.page.ts
import { expect } from '@playwright/test';

import { BasePage } from '@pages/BasePage';

export class LoginPage extends BasePage {
  public pagePath = '/login';

  private readonly emailInput = this.page.locator('input[name="email"]');
  private readonly passwordInput = this.page.locator('input[name="password"]');
  private readonly submitButton = this.page.getByRole('button', {
    name: 'Submit',
  });

  /**
   * Ensure the page is loaded.
   */
  async expectLoaded(message = 'Login page should be loaded') {
    await expect(this.submitButton, message).toBeVisible();
  }

  /**
   * Login as a user.
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

## Shared selectors (only when reused)

```ts
// app/constants/header.selectors.ts
export const headerSelectors = {
  LOGOUT_BUTTON: 'button:has-text("Logout")',
} as const;
```

```ts
// app/ui/components/header.component.ts
import { expect } from '@playwright/test';

import { headerSelectors } from '@constants/header.selectors';
import { Component } from '@components/Base.component';

export class HeaderComponent extends Component {
  readonly logoutButton = this.page.locator(headerSelectors.LOGOUT_BUTTON);

  /**
   * Ensure the component is loaded.
   */
  async expectLoaded(message = 'Header should be loaded') {
    await expect(this.logoutButton, message).toBeVisible();
  }
}
```
