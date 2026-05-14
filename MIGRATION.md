# Migration Guide

This document structures the codebase as a series of layers. Copy them into the new repository **in this order** — each layer depends on the previous one.

---

## Build Summary

* Initial project setup with Next.js, TypeScript and Tailwind
* Installed and configured shadcn/ui component library
* Set up global styles, colour tokens and custom utility classes
* Added type definitions for clients, transactions, portfolios and advisors
* Added types for all user-created records (tasks, notifications, consultations etc)
* Added dashboard widget and layout types
* Added customer budget and spending types for the PFMS views
* Created mock client data with portfolio values and risk profiles
* Created mock transaction history across multiple transaction types
* Created mock analytics data and chart series
* Created mock portfolio holdings per client
* Created mock customer spending snapshots and weekly budget data
* Created mock advisor and case records
* Built search index across all mock data
* Built localStorage state layer with hooks for all record types
* Added cross-tab sync so state updates reflect across open tabs
* Added user auth context with role, name and identity fields
* Built permission table for manager, adviser and customer roles
* Built useUserRole hook
* Built route guard for role-based page access
* Added dev role switcher for testing all three user views
* Built the main admin layout with collapsible sidebar
* Set up role-filtered navigation with grouped menu sections
* Added user avatar and sign-out to the sidebar footer
* Built the dashboard widget grid with drag and drop reordering
* Set up widget registry with 8 widget types and default layouts per role
* Built widget picker for adding and removing dashboard panels
* Built stats cards with KPI values and trend indicators
* Built portfolio performance and asset allocation charts
* Built recent transactions, top clients and activity feed panels
* Built daily briefing panel with auto-generated action items
* Built alerts panel
* Built global search command palette
* Built notification bell with unread count
* Built client management table with filtering and sorting
* Built edit client and delete confirmation dialogs
* Built transaction form with category and payment method fields
* Built client transactions panel
* Built consultation requests table with status workflow
* Built task management with priority, assignee and due date
* Built team member table and create/edit sheet
* Built analytics page with revenue, growth and risk charts
* Built portfolio holdings page
* Built performance notes panel
* Built PFMS customer dashboard with budget rings and spending breakdown
* Built privacy and data sharing consent page
* Built help drawer
* Added background event engine that fires random platform events
* Added reminder scheduler for task deadlines
* Added store bootstrap to seed demo data on first load

---

## Before You Start

The new repo needs the same stack:
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Next.js (Pages Router), Tailwind v4, TypeScript — already configured below

---

## Layer 1 — Project Foundation

**Copy these files to the repo root:**

```
package.json
pnpm-lock.yaml
next.config.mjs
tsconfig.json
postcss.config.mjs
components.json
next-env.d.ts
```

Then run:

```bash
pnpm install
```

---

## Layer 2 — Styles & Brand Identity  ←  CHANGE THIS

**Copy:**

```
styles/globals.css
public/
```

`styles/globals.css` is the **only file you need to touch for brand colours and fonts**. The CSS variables at the top of `:root { }` control everything.

The ones your team will actually change:

| Variable | What it controls |
|----------|-----------------|
| `--primary` | Brand colour — buttons, active states, links, chart accent |
| `--background` | Page background tone |
| `--font-sans` (in `@theme inline { }`) | Body font |

Colours use `oklch()` format. Convert any hex colour at **https://oklch.com** — paste your hex, copy the `oklch(...)` value.

**App name and logo** are in one place: `components/admin/admin-sidebar.tsx`. Search for `"Alpha Finance"` — that's the only hardcoded brand string. The logo is a `<Zap />` icon from lucide-react directly above it.

---

## Layer 3 — Type Definitions

**Copy (don't modify):**

```
lib/types/admin.ts      ← Client, Transaction, Portfolio, KPI shapes
lib/types/store.ts      ← mutable user-created record shapes
lib/types/dashboard.ts  ← widget system types
lib/types/pfms.ts       ← customer budget/spending types
```

These define the data shapes used across the entire app. No need to touch unless you change the data model.

---

## Layer 4 — Utilities & Services

**Copy (don't modify):**

```
lib/utils.ts
lib/utils/format.ts           ← currency, date, percentage formatters
lib/utils/export.ts
lib/utils/role-filters.ts
lib/utils/team-insights.ts
lib/services/adviser-financial-access.ts
lib/services/background-event-engine.ts
lib/dashboard/widget-registry.tsx
lib/dashboard/default-views.ts
lib/dashboard/briefing-engine.ts
```

---

## Layer 5 — Auth Layer  ←  INTEGRATION POINT

**Copy:**

```
lib/auth/user-context.ts        ← CurrentUser type + localStorage key
lib/auth/role-permissions.ts    ← role → permission lookup table
lib/auth/dev-role-switcher.ts   ← dev tooling only, safe to remove for production
hooks/use-user-role.ts
components/auth/route-guard.tsx
```

### How auth works in this codebase

The app reads the current user from `localStorage` under the key `pmfs_user`. The object shape it expects:

```ts
{
  userId:    string
  role:      'manager' | 'fa' | 'customer'
  name:      string
  email:     string
  advisorId?: string  // only needed for 'fa' role
  clientId?:  string  // only needed for 'customer' role
}
```

Everything downstream — sidebar menu visibility, route guards, permission checks, data filters — reads from this single object.

### To connect the real auth system

Open `hooks/use-user-role.ts`. The function `readCurrentUser()` at the top reads from `localStorage`. Replace that function body with a call to your auth provider (session cookie, JWT decode, NextAuth session, etc.) that returns an object matching `CurrentUser`. Nothing else needs changing.

```ts
// BEFORE (localStorage)
function readCurrentUser(): CurrentUser {
  const parsed = parseStoredUser(localStorage.getItem(PMFS_USER_STORAGE_KEY))
  return parsed ?? createDefaultUser()
}

// AFTER (example with NextAuth or similar)
function readCurrentUser(): CurrentUser {
  const session = getYourAuthSession()  // ← your auth call here
  return {
    userId:    session.userId,
    role:      session.role,      // must be 'manager' | 'fa' | 'customer'
    name:      session.name,
    email:     session.email,
  }
}
```

---

## Layer 6 — Mock Data  ←  CHANGE THIS

**Copy:**

```
lib/data/mock-clients.ts       ← Client[]
lib/data/mock-transactions.ts  ← Transaction[]
lib/data/mock-analytics.ts     ← KPIs and chart series
lib/data/mock-pfms.ts          ← customer budget snapshots
lib/data/mock-advisors.ts      ← Advisor[]
lib/data/mock-portfolios.ts    ← Portfolio/holdings
lib/data/mock-cases.ts         ← Case[]
lib/data/search-index.ts       ← pre-built search index (auto-reads from the above)
```

These are plain TypeScript arrays — no API calls, no database. Your team edits them directly to reflect realistic scenarios for the presentation. The type definition for each array is in `lib/types/admin.ts` or `lib/types/pfms.ts`.

---

## Layer 7 — Hooks & Client State

**Copy (don't modify):**

```
hooks/use-store.ts              ← localStorage-backed state (transactions, tasks, notes…)
hooks/use-dashboard-layout.ts
hooks/use-client-overrides.ts
hooks/use-reminder-scheduler.ts
hooks/use-mobile.ts
hooks/use-toast.ts
```

`use-store.ts` is the state layer — it persists user-created records (transactions, tasks, notes, team members) to `localStorage`. It works like a simple in-session database. You don't need to understand the internals.

---

## Layer 8 — UI Primitives

**Copy (don't modify):**

```
components/ui/          ← all files
components/theme-provider.tsx
```

These are shadcn/ui components. They're generated and aren't meant to be hand-edited.

---

## Layer 9 — Admin Components & Layout

**Copy:**

```
components/admin/       ← all files
```

App name and logo are in `admin-sidebar.tsx` — see Layer 2 for the exact lines.

---

## Layer 10 — Pages

**Copy:**

```
pages/_app.tsx
pages/_document.tsx
pages/index.tsx
pages/admin/            ← all files and subdirectories
```

---

## After Migration: Verify It Runs

```bash
pnpm dev
```

Open http://localhost:3000. You should be redirected to `/admin`. The dashboard loads with mock data and the dev role switcher (bottom of sidebar) should cycle between manager, FA, and customer views.

---

## Quick Reference — What Your Team Changes

| What | File | What to look for |
|------|------|-----------------|
| Brand colour | `styles/globals.css` | `--primary` in `:root { }` |
| Page background | `styles/globals.css` | `--background` in `:root { }` |
| Body font | `styles/globals.css` | `--font-sans` in `@theme inline { }` |
| App name | `components/admin/admin-sidebar.tsx` | Text `"Alpha Finance"` |
| Logo / icon | `components/admin/admin-sidebar.tsx` | `<Zap />` component |
| Subtitle tagline | `components/admin/admin-sidebar.tsx` | Text `"Personal Finance / Management System"` |
| Mock data | `lib/data/*.ts` | Edit the arrays directly |
| Real auth hookup | `hooks/use-user-role.ts` | `readCurrentUser()` function |
