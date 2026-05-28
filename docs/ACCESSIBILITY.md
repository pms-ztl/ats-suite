# Accessibility

CDC ATS targets **WCAG 2.1 Level AA** compliance. This document explains
how we test for it, what's currently passing, and what's known to be
broken (and on the backlog to fix).

## What we test

`apps/frontend/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core)
against every public + critical authenticated page on every CI run.

A violation = test failure. The test prints the rule id + selector + a
link to the rule's docs so the developer knows exactly what to fix.

```bash
cd apps/frontend
npm run test:a11y                # runs the a11y spec
npm run test:a11y -- -g login    # only the login page
```

## Currently covered pages

| Page | Why it's covered |
|---|---|
| `/login`, `/staff/login`, `/super-admin/login` | First impression for every customer |
| `/register` | Procurement teams audit this first |
| `/forgot-password`, `/verify-email`, `/accept-invite` | Auth flows must work for everyone |
| `/session-expired` | Edge case but lands real users here |
| `/jobs` (candidate-facing job board) | Job applicants include disabled users by definition |

**Not yet covered** (planned):
- Authenticated dashboard pages — need a login fixture in the test suite
- Tenant-branded career page variants — each tenant's color palette
  needs its own contrast check

## What we've fixed

Concrete WCAG 2.1 AA issues we addressed during the Phase 32f audit:

| Rule | Fix |
|---|---|
| `image-alt` | Every `<img>` has `alt`; decorative images use `alt=""` |
| `label` | Every `<input>` has a `<Label htmlFor>` or `aria-label` |
| `button-name` | Every icon-only `<Button>` has `aria-label` (sidebar toggle, dropdown trigger, etc.) |
| `color-contrast` | Brand-color presets all pass 4.5:1 against white; muted text passes 4.5:1 against background |
| `landmark-one-main` | Dashboard layout has a single `<main id="main-content">` |
| `region` | Sidebar wrapped in `<nav>`, top bar in `<header>` |
| `skip-link` | "Skip to main content" link at the top of the dashboard layout |
| `link-name` | Every `<Link>` and `<a>` has text or `aria-label` |
| `focus-order-semantics` | Form fields use semantic tags; modal traps focus via Radix Dialog |

## Known gaps (honest list)

These will fail the a11y test today. Each has a planned fix.

| Issue | Impact | Plan |
|---|---|---|
| Tenant-branded colors may fall below 4.5:1 contrast | Tenant ADMIN responsibility, but we should validate at save-time | Add contrast check to PUT /api/branding |
| Toast notifications (Sonner) auto-dismiss in 5s — too fast for screen readers | WCAG 2.2.1 | Switch to `aria-live="polite"` toasts with no time limit |
| Some chart components (Recharts) emit SVG without `<title>` | Screen-reader users can't interpret charts | Wrap charts in a `<figure>` with descriptive `<figcaption>` |
| Date pickers (`<input type="date">`) inherit browser styling | Inconsistent keyboard nav | Replace with Radix Popover + custom keyboard handling |
| No language switcher | WCAG 3.1.1 (language of page) — `<html lang="en">` is hard-coded | i18n is a separate roadmap item |

## How we handle keyboard-only navigation

- **Tab order**: matches visual order on every page; verified manually
- **Focus visible**: Tailwind `focus-visible:ring-2 focus-visible:ring-primary` on every interactive element
- **Modal trap**: Radix Dialog handles this automatically — Tab cycles within the dialog
- **Skip link**: present on dashboard layout (Phase 19 onwards) — Tab once from page load to jump past the sidebar
- **Sidebar collapse**: keyboard-accessible toggle, not just hover

## How we handle screen readers

We test with:
- **VoiceOver** (macOS) — primary
- **NVDA** (Windows) — secondary

Per-component conventions:
- `<Button variant="ghost" size="icon">` MUST have `aria-label` (no text fallback)
- Icon decorations next to text use `aria-hidden="true"` on the icon
- Loading states use `aria-busy="true"` on the parent
- Dynamic notification counts use `aria-live="polite"`

## Browser support

WCAG conformance is tested in the same Chromium build Playwright uses.
We don't claim WCAG compliance on Internet Explorer.

| Browser | Supported | Notes |
|---|---|---|
| Chrome / Edge (Chromium) | ✅ | Primary target |
| Firefox | ✅ | Verified by Playwright on CI |
| Safari (macOS) | ✅ | Manual testing |
| Safari (iOS) | ✅ | Manual; touch targets ≥ 44×44px per WCAG 2.5.5 |
| IE 11 | ❌ | Out of support since 2022 |

## Filing an a11y bug

If you find a real-world a11y issue:

1. File a GitHub issue with the `a11y` label
2. Include: page URL, browser + screen-reader combo, what failed, what
   you expected
3. We'll triage within 1 business day and aim to fix within 30 days for
   AA violations

## Why not WCAG 2.1 Level AAA?

Level AAA includes requirements (sign language interpretation,
location-independent labels, reading-level constraints) that aren't
realistic for a B2B SaaS dashboard. We commit to AA, which is the
standard cited by:

- US Section 508 (gov procurement)
- EU EN 301 549 (gov procurement)
- ADA Title III (private accommodation)
- Most enterprise procurement RFPs

If you have an AAA requirement, contact us — we'll evaluate per use case.
