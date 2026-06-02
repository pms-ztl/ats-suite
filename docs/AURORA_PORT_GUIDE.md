# Aurora exact-port guide (read this fully before porting)

You are porting ONE Claude Design prototype into the real Next.js app as an
exact-layout, backend-wired App Router page. Reproduce the prototype's LAYOUT
faithfully (structure, spacing, hierarchy, the exact components and copy), then
replace its mock data with real data from the gateway.

## Foundation you MUST reuse (do not reinvent)

- `@/components/aurora-icon` -> `Icon` (`<Icon name="users" size={16} />`; names
  are strings from a fixed set: home, grid, users, briefcase, radar, scan,
  calendar, gavel, fileText, sparkles, listChecks, cpu, chart, shield, scroll,
  userCog, plug, card, settings, lifebuoy, mobility, server, terminal, rocket,
  building, inbox, search, bell, sun, moon, command, plus, check, x, chevR,
  chevD, chevExpand, chevsL, arrowUpRight, dot, enter, logout, bolt, eye, flag,
  clock, copy, swatch, type, layers, motion, shapes) and `Logo`.
- `@/components/aurora-kit` -> `Btn` (variant primary|ai|soft|ghost|danger|
  outlineAi, size sm|md|lg, icon, trailIcon), `Pill` (tone, bg, icon, mono),
  `StatusBadge` (kind: pass|review|fail|open|draft), `ScoreRing` (value 0..100,
  band, label), `Confidence` (value 0..1), `CountUp`, `Spark`, `Reveal` (i),
  `Greeting` (title, sub), `CommandHero` (title, sub, stats[], live), `KPICard`
  (k, i), `KpiRow` (kpis, cols), `SectionCard` (title, icon, action, onAction,
  pad, headRight), `Funnel`, `TrendArea`, `Donut`, `Timeline`, `PendingList`.
- `@/components/aurora` -> `Button`, `StatusBadge` (status-based variant),
  `AIChip`, `Card` (material glass|clay|flat), `Skeleton`, `ConfidenceMeter`,
  `EmptyState` (title, body, actions?), `ErrorState` (title, body, code,
  onRetry).
- `@/lib/use-data` -> `useData<T>(fetcher)` returns `{ data, loading, error, reload }`.
- `@/lib/types` -> entity + enum types (Requisition, Candidate, ScreeningVerdict,
  Interview, Offer, Decision, ReviewItem, FairnessMetric, and the enums).
- `@/hooks/use-current-user` -> `useCurrentUser()` returns `{ user }` with
  `user.name`, `user.email`, `user.role` (ADMIN|RECRUITER|HIRING_MANAGER|
  COMPLIANCE_OFFICER|CANDIDATE), `user.tenant?.plan`.
- `@/lib/api` existing typed functions (PREFER these): `listScreening`,
  `getVerdict(id)`, `listCandidates`, `getCandidate(id)`, `listRequisitions`,
  `getRequisition(id)`, `generateJD(title)`, `createRequisition(b)`,
  `listDecisions`, `recordDecision(b)`, `listReviewQueue`, `listInterviews`,
  `listOffers`, `approveOffer(id)`, `getFunnel`, `getAdverseImpact`,
  `getDashboardKpis`.

## CRITICAL: color token rule

The prototypes use inline styles like `style={{ background: "var(--brand)" }}`.
In THIS app the palette tokens (`--brand`, `--surface`, `--ink-2`, `--ok`,
`--warn`, `--danger`, `--ai`, `--info`, `--line`, and every `*-tint`/`*-2`/
`*-ink`/`on-*` variant) hold BARE oklch channels (Tailwind-only) and are NOT
valid colors on their own. When you keep an inline style, you MUST use the
full-color companion `var(--c-NAME)`:

- `var(--brand)` -> `var(--c-brand)`, `var(--ink-2)` -> `var(--c-ink-2)`,
  `var(--surface-2)` -> `var(--c-surface-2)`, `var(--ok-tint)` -> `var(--c-ok-tint)`, etc.
- Inside `color-mix(in oklab, var(--brand) 16%, var(--surface))` BOTH refs get
  the `--c-` prefix.
- Do NOT prefix effect/sizing/motion tokens (they are already valid): `--glass`,
  `--glass-2`, `--glass-edge`, `--glass-line`, `--glass-blur`, `--e1`,`--e2`,`--e3`,
  `--ring`, `--r`,`--r-sm`,`--r-lg`,`--r-xl`,`--r-2xl`,`--r-pill`, `--fs-*`,
  `--t`,`--t-fast`,`--t-slow`, `--ease-out`,`--ease-io`,`--ease-spring`,
  `--font-sans`,`--font-mono`, `--topbar`,`--side`,`--rail`, `--on-brand`/`--on-ai`
  (these ARE palette -> DO prefix: `var(--c-on-brand)`).
- Tailwind utility classes are unaffected: `bg-brand`, `text-ink-2`,
  `border-line`, `bg-surface-2`, `text-danger`, `bg-ai-tint` all work as-is.

## Layout rule

- Dashboard pages live under `app/(dashboard)/...`. The dashboard layout ALREADY
  renders `<main className="p-6">`. So your page's outer element is a plain
  `<div className="mx-auto w-full max-w-[1200px]">` (or the width the prototype
  used). Do NOT add your own `<main>` and do NOT add `p-6`.
- Standalone pages (auth, candidate-portal, marketing, error) provide their own
  full-page shell, follow the prototype.

## Mock -> real data

- Replace the prototype's `window.DASH`, `window.DATA`, hardcoded arrays, etc.
  with real data via `useData` + a `@/lib/api` function. If no api function
  fits, fetch inline with this helper (DO NOT edit lib/api.ts):

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}
```

- Always handle three states: `loading` -> `<Skeleton/>`, `error` ->
  `<ErrorState .../>`, empty -> `<EmptyState .../>`. Map defensively (the real
  payload may be `{data:[...]}` or `[...]`; coerce with `res?.data ?? res`).
- Decorative/illustrative chrome (hero copy, section labels, icon choices,
  static marketing content) stays as the prototype has it.

## Hard rules

- First line: `"use client";` (these pages use hooks/handlers).
- NO em dashes or en dashes anywhere in UI copy or comments. Use a comma, a
  period, or " · ". (The product forbids them.)
- Keep accessibility the prototype had (aria-label, alt, roles, focusable).
- Buttons/links that navigate use `<a href="...">` or next/link; keep them real.
- DO NOT edit shared files: `lib/api.ts`, `components/aurora-kit.tsx`,
  `components/aurora-icon.tsx`, `components/aurora.tsx`, `app/globals.css`,
  `tailwind.config.ts`, anything under `components/layouts/`. Only WRITE your
  assigned page file(s).
- Verify before finishing: from `apps/frontend` run
  `npx tsc -p tsconfig.json --noEmit` and ensure YOUR file introduces no type
  errors. Fix any that your file causes.

## Canonical example

Read `app/(dashboard)/page.tsx` (the dashboard home) for the exact pattern:
kit imports, `useData` wiring, `--c-` inline tokens, the outer `<div mx-auto
max-w>` wrapper, role-awareness, and loading/empty/error states.
