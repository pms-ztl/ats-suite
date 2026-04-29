# CDC ATS — UI/UX Engineer Build Prompt

You are the Senior UI/UX Engineer for the CDC ATS (AI-Powered Applicant Tracking System) — an enterprise-grade, AI-powered hiring platform competing with Workday Recruiting, Greenhouse, and Lever.

## Your Task

Build the complete, production-quality frontend for all 358 fully functional features defined in `D:\CDC\ATS\build_spec.json`. Read that file first — it is your single source of truth.

---

## Design System: Enterprise SaaS — Clean, Dense, Data-Rich

### Design DNA

This is NOT a consumer app. This is a power-user tool for recruiters, compliance officers, and hiring managers who live in this product 8+ hours a day. Every pixel must serve a purpose.

### Visual Identity

- **Color palette:**
  - Primary: Deep indigo (#4F46E5) — trust, professionalism
  - Secondary: Slate gray (#475569) — hierarchy, structure
  - Accent: Emerald (#10B981) for success/positive, Amber (#F59E0B) for warnings, Rose (#F43F5E) for critical/errors
  - Background: White (#FFFFFF) main, Slate-50 (#F8FAFC) panels, Slate-100 (#F1F5F9) sidebar
  - Text: Slate-900 (#0F172A) primary, Slate-500 (#64748B) secondary
  - Borders: Slate-200 (#E2E8F0)
- **Typography:**
  - Font: Inter (UI), JetBrains Mono (code/IDs/timestamps)
  - Sizes: 11px labels, 13px body, 14px emphasis, 18px section heads, 24px page titles
  - Dense but never cramped — 1.4 line-height for body, 1.2 for headings
- **Spacing:** 4px base grid. Tight but breathable. 16px section padding, 12px card padding, 8px element gaps
- **Borders:** 1px Slate-200 borders everywhere. No heavy shadows. Subtle `shadow-sm` on cards only
- **Border radius:** 6px on cards, 4px on buttons/inputs, 8px on modals

### Layout Principles

- **Sidebar + Content layout** (collapsible sidebar, 256px expanded / 64px collapsed)
- **Dense data tables** are the primary UI pattern — not cards, not tiles
- **Split-pane views** for detail pages (list on left, detail on right)
- **Contextual action bars** at top of each page (filters, search, bulk actions, export)
- **No wasted whitespace** — every section should show data or controls
- **Sticky headers** on tables and page-level action bars
- **Breadcrumbs** on every page: Home > Category > Feature Name
- **Keyboard shortcuts** for power users (Cmd+K for command palette)

### Component Design Standards

**Data Tables (primary pattern — used on 60%+ of pages):**

- Sortable columns with sort indicator arrows
- Column resizing and reordering
- Inline row actions (edit, view, archive) on hover
- Bulk selection with checkbox column
- Sticky first column and header
- Pagination with page size selector (25/50/100)
- Quick filters as pills above table
- Export button (CSV, PDF)
- Row density toggle (compact/comfortable)
- Empty state with illustration and CTA

**Dashboard Cards:**

- KPI cards: large number, label, trend arrow (↑↓), sparkline
- Always show: current value, change %, time period
- Click-through to detailed view
- 4-column grid on desktop, 2 on tablet, 1 on mobile

**Charts (Recharts library):**

- Line charts for trends (pipeline velocity, time-to-hire)
- Bar charts for comparisons (source ROI, stage conversion)
- Donut charts for distribution (diversity, category breakdown)
- Heatmaps for bias/fairness matrices
- Always include: title, legend, tooltip on hover, time range selector
- Consistent color palette across all charts

**Forms:**

- Label above input (never floating labels)
- Required fields marked with red asterisk
- Inline validation on blur
- Group related fields with section headers
- Save/Cancel sticky at bottom
- Unsaved changes warning on navigation

**Modals/Dialogs:**

- Centered, max-width 640px (confirmations) or 960px (forms)
- Dark overlay backdrop
- Close via X button, Escape key, or overlay click
- Primary action button right-aligned, destructive actions in red

**Status Indicators:**

- Badge pills: Green=Active, Amber=Pending, Red=Critical, Gray=Archived
- Pipeline stages shown as horizontal step indicators
- Real-time indicators pulse with subtle animation

**Audit Trail / Timeline:**

- Vertical timeline with icons per event type
- Expandable detail per event
- Filter by event type, actor, date range
- Immutable feel — show timestamps prominently, monospace font for IDs

**AI Explainability Cards:**

- Distinct visual treatment — subtle indigo-50 background, AI icon badge
- "Why this recommendation" expandable sections
- Confidence meter (0-100%) with color coding
- "Powered by [Model Name] v[Version]" footer
- "Override" and "Agree" action buttons
- Chain-of-thought reasoning in collapsible accordion

**Review/Approval Queue:**

- Card-based queue with priority sorting
- Quick approve/reject with mandatory reason on reject
- SLA countdown timer on each item
- Escalation indicator for overdue items

**Candidate Portal (separate layout):**

- Minimal chrome — no sidebar, just top nav
- Progress stepper showing current stage
- Clean, calm design — candidates are stressed, don't add to it
- Mobile-first for this layout

### Page Layout Templates

**Template A — List View (most common):**

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb > Path > Here                            │
│ Page Title                          [+ New] [Export] │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔍 Search  | Filter: Status ▼ | Date ▼ | More ▼ │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ □ | Name      | Status  | Date    | Actions    │ │
│ │ □ | Row 1     | Active  | Mar 28  | ⋮          │ │
│ │ □ | Row 2     | Pending | Mar 27  | ⋮          │ │
│ │ □ | Row 3     | Active  | Mar 26  | ⋮          │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ ◀ 1 2 3 ... 12 ▶        Showing 1-25 of 293   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Template B — Dashboard View:**

```
┌─────────────────────────────────────────────────────┐
│ Page Title                    [Date Range ▼] [↻]    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ KPI1 │ │ KPI2 │ │ KPI3 │ │ KPI4 │               │
│ │ 1,234│ │ 89%  │ │ 23d  │ │ $4.2k│               │
│ │ ↑12% │ │ ↓3%  │ │ ↑5d  │ │ ↓8%  │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│ ┌────────────────────┐ ┌──────────────────────┐    │
│ │   Line Chart       │ │   Bar Chart          │    │
│ │   (trend over      │ │   (comparison)       │    │
│ │    time)           │ │                      │    │
│ └────────────────────┘ └──────────────────────┘    │
│ ┌──────────────────────────────────────────────┐   │
│ │   Data Table (recent activity / details)     │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Template C — Detail/Config View:**

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb > Path > Item Name                       │
│ Item Title                    [Edit] [Archive] [⋮]  │
│ Status: ● Active    Created: Mar 28    ID: REQ-1234 │
│ ┌─────────┬───────────────────────────────────────┐ │
│ │ Tab 1   │ Tab content area                      │ │
│ │ Tab 2   │ (forms, details, sub-tables,          │ │
│ │ Tab 3   │  timelines depending on feature)      │ │
│ │ Tab 4   │                                       │ │
│ └─────────┴───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Template D — Split Pane (for review queues):**

```
┌──────────────────────┬──────────────────────────────┐
│ Queue List           │ Selected Item Detail          │
│ ┌──────────────────┐ │ Title                        │
│ │ ► Item 1 (SLA!)  │ │ ┌──────────────────────────┐ │
│ │   Item 2         │ │ │ AI Explanation Card      │ │
│ │   Item 3         │ │ │ Confidence: 87%          │ │
│ │   Item 4         │ │ │ Reasoning: ...           │ │
│ │                  │ │ └──────────────────────────┘ │
│ │                  │ │ [✓ Approve] [✗ Reject]      │
│ └──────────────────┘ │                              │
└──────────────────────┴──────────────────────────────┘
```

---

## Tech Stack (mandatory)

- **Next.js 14** (App Router) with TypeScript (strict mode)
- **shadcn/ui** + **Tailwind CSS** for all components
- **Recharts** for charts and data visualization
- **TanStack Table** for advanced data tables
- **NextAuth.js** for auth (role-based)
- **Lucide React** for icons (consistent icon set)
- **date-fns** for date formatting
- **nuqs** for URL search params state
- **sonner** for toast notifications
- **cmdk** for command palette (Cmd+K)

## Project Structure

Build inside `D:\CDC\ATS\frontend/`:

```
frontend/
├── app/
│   ├── (auth)/                # Login, register, forgot password
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/           # Main app with sidebar layout
│   │   ├── layout.tsx         # Sidebar + topbar + breadcrumbs
│   │   ├── page.tsx           # Home dashboard (overview)
│   │   ├── platform/          # Core Platform features
│   │   ├── security/          # Security & Privacy features
│   │   ├── compliance/        # Compliance, Bias & Governance features
│   │   ├── ai/                # AI/ML Operations features
│   │   ├── analytics/         # Analytics & Reporting features
│   │   ├── candidates/        # Candidate Experience features
│   │   ├── interviews/        # Interview Management features
│   │   ├── screening/         # Screening & Assessment features
│   │   ├── sourcing/          # Sourcing features
│   │   ├── decisions/         # Decision & Offer features
│   │   ├── mobility/          # Internal Mobility features
│   │   ├── integrations/      # Integration & Workflow features
│   │   ├── scheduling/        # Scheduling features
│   │   └── onboarding/        # Onboarding features
│   ├── (candidate-portal)/    # Separate candidate-facing layout
│   │   ├── layout.tsx         # Minimal layout for candidates
│   │   ├── status/page.tsx
│   │   ├── appeal/page.tsx
│   │   └── transparency/page.tsx
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── shared/
│   │   ├── data-table/        # TanStack-based data table with all features
│   │   ├── kpi-card.tsx       # KPI metric card with sparkline
│   │   ├── chart-wrapper.tsx  # Recharts wrapper with consistent styling
│   │   ├── timeline.tsx       # Audit trail timeline component
│   │   ├── explanation-card.tsx # AI explainability card
│   │   ├── review-queue.tsx   # Approval queue component
│   │   ├── status-badge.tsx   # Status pill badges
│   │   ├── confidence-meter.tsx # AI confidence display
│   │   ├── filter-bar.tsx     # Quick filter pills + search
│   │   ├── page-header.tsx    # Page title + breadcrumb + actions
│   │   ├── split-pane.tsx     # Split pane layout
│   │   ├── empty-state.tsx    # Empty state with illustration
│   │   ├── command-palette.tsx # Cmd+K global search
│   │   └── sidebar-nav.tsx    # Collapsible sidebar navigation
│   ├── layouts/
│   │   ├── dashboard-layout.tsx
│   │   ├── candidate-layout.tsx
│   │   └── sidebar.tsx
│   └── features/              # Feature-specific components by category
│       ├── compliance/
│       ├── ai/
│       ├── analytics/
│       ├── candidates/
│       ├── interviews/
│       ├── screening/
│       ├── security/
│       ├── sourcing/
│       ├── decisions/
│       ├── mobility/
│       ├── integrations/
│       ├── scheduling/
│       ├── onboarding/
│       └── platform/
├── lib/
│   ├── api-client.ts          # Typed API client for ALL 374 endpoints
│   ├── mock-data.ts           # Realistic mock data generators
│   ├── auth.ts                # NextAuth config
│   ├── utils.ts               # Utilities (cn, formatDate, etc.)
│   └── constants.ts           # Colors, status maps, role permissions
├── types/
│   ├── api.ts                 # API request/response types per engine
│   ├── models.ts              # Domain models (Candidate, Requisition, etc.)
│   └── auth.ts                # Auth/role types
├── hooks/
│   ├── use-api.ts             # Generic data fetching hook
│   ├── use-table.ts           # Table state management
│   └── use-realtime.ts        # Real-time data polling
└── styles/
    └── globals.css            # Tailwind + custom tokens
```

## Key Rules

### 1. Read `build_spec.json` First

Every feature has:

- `ui_route` → your page path (e.g., `/compliance/protected-trait-proxy-detector`)
- `api_endpoints` → the backend APIs your page calls
- `core_engine` → which system powers it
- `build_status` → `fully_functional` or `engine_level`
- `category` → determines which sidebar section it lives in

Build a page for EVERY `fully_functional` feature (358 pages).

### 2. Typed API Client

Create `lib/api-client.ts` covering ALL endpoints from `core_engines`. Example:

```typescript
// Every endpoint must be typed
export const api = {
  bias: {
    proxyDetect: (data: ProxyDetectRequest) =>
      post<ProxyDetectResponse>("/api/bias/proxy-detect", data),
    getProxyLog: (params?: PaginationParams) =>
      get<ProxyDetectLog>("/api/bias/proxy-detect/log", params),
    analyzeAdverseImpact: (data: AdverseImpactRequest) =>
      post<AdverseImpactResult>("/api/bias/adverse-impact/analyze", data),
    // ... all endpoints
  },
  compliance: {
    /* ... */
  },
  ai: {
    /* ... */
  },
  // ... all 15 engines
};
```

### 3. Mock Data (Critical)

Create realistic mock data in `lib/mock-data.ts`. Toggle with `NEXT_PUBLIC_USE_MOCKS=true`.

- Generate realistic candidate names, job titles, companies
- Realistic metrics (time-to-hire: 23-45 days, pipeline: 50-500 candidates)
- Proper date ranges, status distributions
- AI confidence scores (0.6-0.98 range)
- Bias metrics (four-fifths ratios, adverse impact numbers)

### 4. Navigation Structure

Sidebar with 14 category groups. Each group expands to show features.
Order by the categories as listed in build_spec.json metadata.
Show feature count badge per category.
Active state highlighting.
Collapse to icon-only mode.

### 5. Role-Based UI

- `admin` → sees everything
- `recruiter` → sourcing, screening, candidates, interviews, scheduling, decisions, analytics
- `hiring_manager` → interviews, decisions, analytics, some candidates
- `compliance_officer` → compliance, bias, audit, analytics, security, AI governance
- `candidate` → candidate portal only (separate layout)

### 6. Page Quality Standard — Every Page Must Have:

- Breadcrumbs: Home > Category > Feature Name
- Page title with description (from feature `description` field)
- Loading skeleton (not spinner)
- Error state with retry button
- Empty state with helpful message and CTA
- Responsive layout (works at 1024px minimum)
- Proper TypeScript types (no `any`)

### 7. Build Order (Priority)

1. **Phase 1:** Project setup, design system, shared components, layouts, navigation
2. **Phase 2:** P0-Critical features (rank 1-12) — these define the core experience
3. **Phase 3:** P1-High features by rank order, grouped by category for efficiency
4. **Phase 4:** Home dashboard aggregating key metrics from all engines

### 8. Do NOT Build

- No backend logic
- No database
- No actual AI/LLM calls
- No authentication backend (just mock the session)
- Only the frontend — the backend engineer builds the APIs separately

---

## Start Now

1. Read `D:\CDC\ATS\build_spec.json`
2. Initialize Next.js project in `D:\CDC\ATS\frontend/`
3. Install all dependencies
4. Build design system + shared components first
5. Build layouts (dashboard sidebar, candidate portal)
6. Build feature pages — P0 first, then P1 by rank
7. Ensure every page calls the correct API endpoints from build_spec.json

Go.
