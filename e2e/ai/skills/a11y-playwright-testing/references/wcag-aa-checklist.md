# WCAG 2.2 AA — short automation checklist

Automation covers a subset. Use for regression gates; pair with manual AT for release sign-off.

## Perceivable

- [ ] Meaningful images have alt (or decorative empty alt)
- [ ] Text contrast ~4.5:1 (normal) / 3:1 (large) — axe helps; gradients may false-positive
- [ ] Content not conveyed by color alone

## Operable

- [ ] All interactive controls reachable via keyboard
- [ ] Visible focus indicator
- [ ] Modals trap focus and restore to trigger
- [ ] No keyboard trap outside intentional widgets
- [ ] Target size / focus-not-obscured (2.2) where applicable

## Understandable

- [ ] Inputs have accessible names (`getByLabel` works)
- [ ] Errors identified and associated with fields
- [ ] Consistent navigation/labels on critical flows

## Robust

- [ ] Correct roles/names (axe + role-based locators succeed)
- [ ] No broken ARIA (prefer native HTML over ARIA hacks)

## External

- https://www.w3.org/WAI/WCAG22/quickref/
- https://www.w3.org/WAI/ARIA/apg/
- https://dequeuniversity.com/rules/axe/
