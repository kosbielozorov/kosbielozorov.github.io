# Keyboard and focus (this framework)

Drive interactions through POM methods. Locators live on the page/modal class — tests assert focus/visibility only.

## Form tab order (shape)

```typescript
test(
  'login is keyboard operable @T<testId>',
  { tag: ['@T<testId>', '@a11y'] },
  async ({ pageManager: { loginPage }, page }) => {
    await loginPage.open();
    await page.keyboard.press('Tab');
    await expect(loginPage.emailField).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordField).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.submitButton).toBeFocused();
  },
);
```

## Dialog trap / restore (shape)

Use `BaseModal` / concrete `*.modal.ts`. Assert:

1. After open — focus inside dialog (`getByRole('dialog')` scoped controls on the modal)
2. Tab cycles within dialog
3. Escape closes; focus returns to trigger

Do not use RegExp in locators (`Framework contract`). Prefer exact accessible names from live snapshot (CLI→MCP).

## Skip link

Only if the product has one. First Tab → skip link focused → Enter → main landmark focused (`tabindex="-1"` on main if needed — product fix, not `waitForTimeout`).
