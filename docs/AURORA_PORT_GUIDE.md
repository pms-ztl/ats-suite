# Aurora VERBATIM port guide (read fully before porting)

You are porting ONE Claude Design prototype HTML file into the real Next.js app.

## THE ONE RULE: copy, do not reproduce

This is a VERBATIM port, NOT a redesign and NOT a "rebuild with kit components."
You COPY the prototype's actual markup and its actual CSS into a React page. The
rendered result must be pixel-identical to opening the .html file in a browser.

The gold-standard reference is `app/(auth)/login/page.tsx`, which is an exact port
of `claude-design/Auth.html`. OPEN IT and follow that structure exactly. The
recipe it follows:

1. **Copy the entire `<style>` block verbatim** into a `const CSS = ` template
   string. Change NOTHING about the rules except:
   - Scope every selector under a unique root class for THIS page (login used
     `.authx`). Practically: the prototype's CSS already namespaces most rules; if
     it uses bare `body{...}`, `*{...}`, `h1{...}` selectors, prefix them with your
     root class (`.authx body` becomes `.authx`, `.authx *`, `.authx h1`).
   - RENAME every `@keyframes name` to a unique prefix (login used `auth-drift`,
     `auth-reveal`, etc.) AND update every `animation:` that references them. This
     prevents collisions with globals.css keyframes.
   - Inject it once: `<style dangerouslySetInnerHTML={{ __html: CSS }} />` as the
     first child inside the root element.
   - Do NOT convert the CSS to Tailwind. Do NOT "simplify." Keep every shadow,
     gradient, transition, media query, and magic number byte-for-byte.

2. **Copy the entire `<body>` markup verbatim** as JSX. Element-for-element, class
   names preserved, copy text preserved, structure preserved. The only mechanical
   conversions allowed:
   - `class=` becomes `className=`, `for=` becomes `htmlFor=`, `tabindex` becomes
     `tabIndex`, `stroke-width` becomes `strokeWidth`, etc. (standard JSX attrs).
   - Self-close void tags (`<img ... />`, `<br />`, `<input ... />`).
   - Inline `style="a:b;c:d"` becomes `style={{ a: "b", c: "d" }}` (camelCase keys).
     Keep the SAME values. Animation delays like `style="animation-delay:.2s"`
     become `style={{ animationDelay: ".2s" }}`.
   - HTML comments `<!-- x -->` become `{/* x */}` or are dropped.
   - Inline SVGs are copied verbatim (just camelCase the attributes).
   - Keep all `aria-*`, `alt`, `role`, `viewBox`, etc.
   - Do NOT drop sections. Do NOT shorten copy. Do NOT swap the prototype's bespoke
     markup for `<Btn>`/`<Card>`/`<KpiRow>` kit components. The whole point is that
     we are NOT rebuilding with the kit. Copy the literal elements.

3. **Convert `<script>` behavior to React.** The prototypes use small inline
   scripts for tab switching, toggles, reveal-on-settle, counters, video fade-in,
   mobile menus, accordions, etc. Reproduce that behavior with `useState`/
   `useEffect`/`useRef` so it works identically. Example patterns in login:
   password show/hide, mobile menu open, `settled` class after 1.5s, video
   `onLoadedData` to fade in. If a prototype renders its content by setting
   `view.innerHTML = '...'` for tab switching, turn each tab's HTML into a JSX
   block and switch with `useState`.

4. **Wire real data where the prototype shows data.** Replace hardcoded mock
   arrays / `window.DATA` with real gateway data via `useData` + a `@/lib/api`
   function (see list below), keeping the EXACT surrounding markup and classes.
   Always render the three states INSIDE the prototype's container so layout is
   preserved: loading -> a `<Skeleton/>` (or the prototype's own skeleton markup),
   error -> `<ErrorState/>`, empty -> `<EmptyState/>`. Decorative/marketing copy
   (hero text, section labels, testimonial names, pricing tier copy) stays exactly
   as the prototype wrote it; it is part of the design.

5. **Assets:** `src="assets/x.png"` becomes `src="/assets/x.png"`. Keep remote
   CloudFront video/image URLs exactly as-is. Available local assets:
   `/assets/logo-dark.png`, `/assets/logo-light.png`, `/assets/logo-src.png`.

## Standalone vs dashboard-content (CRITICAL for correct chrome)

- **Standalone pages** (auth, marketing, error, candidate-portal, status): the
  prototype is a full page with its own background, nav, and footer. Port the
  WHOLE thing. The route has no shell layout. Root element carries your scope
  class and `min-height:100vh`.
- **Dashboard-content pages** (anything that, in the prototype, sits inside the
  left sidebar + topbar shell): the app's `app/(dashboard)/layout.tsx` ALREADY
  renders the sidebar + topbar. So you port ONLY the page's content area (the part
  the prototype swaps into its `view`/`main`/`content` region), NOT the prototype's
  sidebar or topbar. Your root element is a scoped `<div>` that holds just the
  scene markup. Drop the prototype's `<aside>`/rail/topbar entirely. Your prompt
  states which mode your file is.

## Foundation available (use only when wiring data states)

- `@/components/aurora` -> `Skeleton`, `EmptyState` (title, body, actions?),
  `ErrorState` (title, body, code, onRetry). Use these for the three data states.
- `@/lib/use-data` -> `useData<T>(fetcher)` returns `{ data, loading, error, reload }`.
- `@/hooks/use-current-user` -> `useCurrentUser()` -> `{ user }` (user.name, email,
  role ADMIN|RECRUITER|HIRING_MANAGER|COMPLIANCE_OFFICER|CANDIDATE, tenant?.plan).
- `@/lib/api` typed fns: `listScreening`, `getVerdict(id)`, `listCandidates`,
  `getCandidate(id)`, `listRequisitions`, `getRequisition(id)`, `generateJD(title)`,
  `createRequisition(b)`, `listDecisions`, `recordDecision(b)`, `listReviewQueue`,
  `listInterviews`, `listOffers`, `approveOffer(id)`, `getFunnel`,
  `getAdverseImpact`, `getDashboardKpis`, `advanceStage`, `importCandidates`,
  `runScreening`, `getReviewItem`, `resolveReview`.
- If no api fn fits, fetch inline (do NOT edit lib/api.ts):

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
  return res.json(); // coerce payloads with res?.data ?? res
}
```

## Color tokens

In VERBATIM mode you copy the prototype's OWN CSS, which defines its own variables
(e.g. login's `--ac`, `--br`). Keep those exactly. You generally will NOT touch the
app's global tokens. The ONLY time the `--c-` rule applies: if you write a NEW inline
style that references an app global palette token (`--brand`, `--ink-2`, `--surface`,
`--ok`, `--warn`, `--danger`, `--ai`, `--info`, `--line`, any `*-tint`/`*-2`/`on-*`),
you must use its full-color companion `var(--c-brand)`, etc. Effect/size tokens
(`--e1`, `--glass`, `--r`, `--fs-*`, `--t`, `--ease-out`, `--font-mono`, `--topbar`)
stay bare. Tailwind utility classes (`bg-brand`, `text-ink-2`) are unaffected.

## Hard rules

- First line: `"use client";`.
- NO em dashes and NO en dashes anywhere (copy or comments). The prototypes already
  avoid them, using " · " or commas; keep it that way. If a source somehow contains
  one, replace with " · ", a comma, or "--". This is a release blocker.
- Keep all accessibility the prototype had (aria-label, alt, role, focusable).
- Navigational links/buttons point at real routes (`<a href="/...">`).
- DO NOT edit shared files: `lib/api.ts`, `components/aurora*.tsx`,
  `app/globals.css`, `tailwind.config.ts`, anything under `components/layouts/`.
  Only WRITE your assigned page file.
- Self-check before finishing: (a) your CSS const contains the prototype's full
  style block (comparable length), (b) your JSX contains every section the
  prototype had, (c) keyframes are renamed, (d) zero em/en dashes, (e) from
  `apps/frontend` run `npx tsc -p tsconfig.json --noEmit` and fix any error YOUR
  file introduces. Report the prototype's `<style>`/`<body>` line counts and your
  file's line count so fidelity is auditable.

## Fidelity is the whole job

If your output is shorter or "cleaner" than the prototype, you did it wrong. A
correct port is approximately as long as the prototype (often longer, because the
CSS string plus JSX plus React state exceeds the original). When in doubt, copy
more, not less.
