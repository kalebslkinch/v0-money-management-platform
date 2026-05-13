# PMFS Platform — Architecture, Portability & Role-Based Routing

*A complete guide to how this codebase is structured, how to move it cleanly into any project, and how to build role-based dashboards on top of it.*

---

## Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [The Portability Problem — What Needs to Change](#2-the-portability-problem)
3. [The Ideal File Structure](#3-the-ideal-file-structure)
4. [Mock Data Layer — How to Keep It Swappable](#4-mock-data-layer)
5. [Role-Based Routing — The Three Dashboards](#5-role-based-routing)
6. [The Auth Context Pattern](#6-the-auth-context-pattern)
7. [Route Guard Architecture](#7-route-guard-architecture)
8. [How Each Role's Dashboard Differs](#8-how-each-roles-dashboard-differs)
9. [Configuration — Centralising What Changes Between Projects](#9-configuration)
10. [Step-by-Step Migration Checklist](#10-migration-checklist)

---

## 1. Current State Assessment

The project is in a strong position structurally, but it has several things hardcoded that will create friction when transferring it to another project or client demo. Here is an honest inventory:

### What is already portable

- **TypeScript types** in `lib/types/` are well-defined, comprehensive, and have no project-specific dependencies. They can be copied verbatim.
- **UI components** in `components/ui/` are all pure Radix primitives with Tailwind. They are entirely generic and require zero modification.
- **The dashboard customisation system** (`lib/types/dashboard.ts`, `lib/dashboard/`, `hooks/use-dashboard-layout.ts`) is self-contained with no domain coupling. It works for any widget-based dashboard.
- **Formatting utilities** in `lib/utils/format.ts` and `lib/utils.ts` are completely generic.
- **The widget render architecture** cleanly separates widget definitions from widget data — swapping the data layer does not require touching widget components.

### What is currently hardcoded

| Location | Hardcoded thing | Problem |
|---|---|---|
| `components/admin/admin-sidebar.tsx` | Manager name "James Wilson", role "Senior Manager" | Breaks for any real user |
| `components/admin/dashboard-toolbar.tsx` | `managerName="James"` prop default | Same |
| `pages/_app.tsx` | `router.pathname.startsWith('/admin')` is the only routing logic | No role awareness |
| `pages/index.tsx` | Hard redirect to `/admin` | Assumes only one user type |
| All pages | No authentication or permission check | Any URL is accessible |
| `lib/data/mock-analytics.ts` | KPIs derived from `mockClients` at import time | Tightly couples analytics to the mock data file |
| `components/admin/admin-sidebar.tsx` | Navigation items are hardcoded as a static array | Cannot be filtered per role without editing the component |

### What is missing entirely

- A `User` type with a `role` field
- An auth context (even a mock one) that provides the current user to the component tree
- Route guards that redirect based on role
- Three separate dashboard page routes (`/admin`, `/advisor`, `/client`)
- A login/role-selection page for demo purposes

---

## 2. The Portability Problem

The single biggest portability problem is **the absence of a data boundary**.

Right now, mock data is imported directly inside components and the widget registry:

```tsx
// lib/dashboard/widget-registry.tsx
import { kpiData, alerts, topPerformingClients } from '@/lib/data/mock-analytics'
import { getRecentTransactions } from '@/lib/data/mock-transactions'
import { mockAdvisors } from '@/lib/data/mock-advisors'
```

This means when you move to a real backend, you have to open `widget-registry.tsx` and surgically replace every import. If the data shape changes (e.g., your real API returns camelCase vs. your mock uses PascalCase), you have to fix it in every widget individually.

The fix is a **data service layer** — a set of functions with stable signatures that the widgets call, and that the mock data implements. Swapping mock for real API means replacing one file, not hunting through eight components.

Similarly, the **user identity is not a first-class concept** in the application. No component receives a "current user" — they render as if every user is the manager James Wilson. Until there is a `useCurrentUser()` hook or context, role-based routing cannot be implemented cleanly.

---

## 3. The Ideal File Structure

This is the target structure for a clean, transferable project. New items are marked with `★`:

```
lib/
  config/
    ★ app.config.ts          — Brand name, company, currency, locale
    ★ roles.ts               — Role definitions, permissions, nav items per role
  types/
    admin.ts                 — Existing domain types (Client, Advisor, etc.)
    dashboard.ts             — Widget system types (already clean)
    ★ auth.ts                — UserRole, User, Session types
  data/
    mock-clients.ts          — Unchanged
    mock-advisors.ts         — Unchanged
    mock-transactions.ts     — Unchanged
    mock-portfolios.ts       — Unchanged
    mock-cases.ts            — Unchanged
    mock-analytics.ts        — Unchanged
    ★ mock-users.ts          — Mock users with roles for the demo login screen
  services/
    ★ clients.service.ts     — getClients(), getClientById() — mock or real
    ★ analytics.service.ts   — getKPIData(), getAlerts(), getActivities()
    ★ transactions.service.ts — getTransactions(), getRecentTransactions()
    ★ advisors.service.ts    — getAdvisors(), getAdvisorById()
  dashboard/
    widget-registry.tsx      — Calls services, not mock data directly
    default-views.ts         — Unchanged

hooks/
  use-dashboard-layout.ts    — Unchanged
  ★ use-current-user.ts      — Returns the active mock user from context
  use-mobile.ts              — Unchanged
  use-toast.ts               — Unchanged

contexts/
  ★ auth.context.tsx         — MockAuthProvider, useAuth hook

components/
  admin/
    ...existing components
    ★ role-guard.tsx          — Wraps pages, redirects if wrong role
  ui/
    ...unchanged

pages/
  ★ login.tsx                — Role selector for demo (Manager / Advisor / Client)
  index.tsx                  — Redirect logic: checks role → sends to correct dashboard
  admin/
    index.tsx                — Manager dashboard (already built)
    analytics.tsx
    clients/
    ...
  ★ advisor/
    ★ index.tsx              — Advisor dashboard (their own clients, own performance)
    ★ clients/
      ★ index.tsx            — Advisor's client list (filtered to their clientIds)
      ★ [id].tsx             — Client detail (same component, different data scope)
  ★ client/
    ★ index.tsx              — Client portal dashboard (own portfolio only)
    ★ portfolio.tsx          — Own holdings and performance
    ★ transactions.tsx       — Own transaction history
```

---

## 4. Mock Data Layer

### The current pattern (direct import)

```tsx
// Bad for portability — widget is coupled to the file, not the interface
import { alerts } from '@/lib/data/mock-analytics'
export function renderWidget(widgetId) {
  if (widgetId === 'alerts-panel') return <AlertsPanel alerts={alerts} />
}
```

### The service pattern (one replacement point)

```tsx
// lib/services/analytics.service.ts

import type { Alert, Activity, KPIData } from '@/lib/types/admin'

// In mock mode: these just re-export from mock data
// In real mode: these call fetch('/api/analytics/...') with the same return type

export async function getAlerts(): Promise<Alert[]> {
  const { alerts } = await import('@/lib/data/mock-analytics')
  return alerts
}

export async function getKPIData(): Promise<KPIData> {
  const { kpiData } = await import('@/lib/data/mock-analytics')
  return kpiData
}

export async function getActivities(): Promise<Activity[]> {
  const { recentActivities } = await import('@/lib/data/mock-analytics')
  return recentActivities
}
```

When you move to a real backend, you only change `lib/services/analytics.service.ts`. The widgets, the registry, and the pages are untouched.

### The mock users file

This is what makes the demo login possible without any backend:

```tsx
// lib/data/mock-users.ts

import type { User } from '@/lib/types/auth'

export const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'James Wilson',
    email: 'james.wilson@pmfs.com',
    role: 'manager',
    advisorId: 'ADV001',   // null for manager
    clientId: null,
    avatar: null,
  },
  {
    id: 'USR002',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@pmfs.com',
    role: 'advisor',
    advisorId: 'ADV002',
    clientId: null,
    avatar: null,
  },
  {
    id: 'USR003',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    role: 'client',
    advisorId: null,
    clientId: 'CLT001',
    avatar: null,
  },
]
```

The login page renders one card per mock user. Clicking a card sets the active user in context. No password, no JWT, no backend required. This is the correct approach for a demo.

---

## 5. Role-Based Routing — The Three Dashboards

There are three user roles in this system, and each one warrants a fundamentally different UI:

### Manager (`/admin/*`)

The manager oversees the entire firm. They see:
- All clients across all advisors
- All advisors' performance
- Firm-wide KPIs and AUM
- The customisable dashboard with all 8 widgets
- Compliance alerts across the whole book
- Firm-wide transaction history

**Already built.** This is the current `/admin` dashboard.

### Advisor (`/advisor/*`)

An advisor sees only their own slice of the firm. They see:
- Their own client list (filtered by `advisorId`)
- Their own AUM and performance metrics
- Their own case load
- Transaction history for their clients only
- A simpler dashboard with advisor-relevant widgets only (no StaffTable, no firm-wide KPIs)

**Key difference from manager**: the same components are reused, but data is scoped. `getClients()` for an advisor returns `mockClients.filter(c => c.advisorId === user.advisorId)` rather than all clients.

### Client (`/client/*`)

A client sees only their own data. They see:
- Their own portfolio value and holdings
- Their own transaction history
- Their own performance vs. benchmark
- No other clients, no advisor performance data, no firm-wide anything

**Key difference**: the client portal is a read-only, simplified view. No drag-and-drop dashboard customisation is needed. The interface can be purpose-built rather than reusing the widget system.

---

## 6. The Auth Context Pattern

The auth context is the single source of truth for "who is logged in." Every component that needs to know the current user calls `useAuth()`. Nothing reads from a global variable or hardcodes a name.

```tsx
// lib/types/auth.ts

export type UserRole = 'manager' | 'advisor' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  advisorId: string | null    // set if role === 'advisor' or role === 'manager' (their own advisor record)
  clientId: string | null     // set if role === 'client'
  avatar: string | null
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (userId: string) => void   // in mock mode, just sets the user by id
  logout: () => void
}
```

```tsx
// contexts/auth.context.tsx

import React, { createContext, useContext, useState } from 'react'
import type { User, AuthState } from '@/lib/types/auth'
import { mockUsers } from '@/lib/data/mock-users'

const AuthContext = createContext<AuthState | null>(null)

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  function login(userId: string) {
    const found = mockUsers.find(u => u.id === userId)
    if (found) setUser(found)
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within MockAuthProvider')
  return ctx
}
```

Add `MockAuthProvider` to `pages/_app.tsx` wrapping everything. From that point, every component in the tree can call `useAuth()` and know exactly who is viewing the page and what role they are.

When you move to a real auth system (NextAuth, Clerk, Auth0, Supabase Auth), you replace the `MockAuthProvider` implementation and the `login()` function. The `useAuth()` hook signature stays identical, so no component changes are needed.

---

## 7. Route Guard Architecture

A route guard is a wrapper component that checks the current user's role and redirects if they should not be on this page. There are two clean ways to implement this.

### Option A: Per-page higher-order component (simplest)

```tsx
// components/admin/role-guard.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/auth.context'
import type { UserRole } from '@/lib/types/auth'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to their correct dashboard
      const redirectMap: Record<UserRole, string> = {
        manager: '/admin',
        advisor: '/advisor',
        client: '/client',
      }
      router.replace(redirectMap[user.role])
    }
  }, [isAuthenticated, user, allowedRoles, router])

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null  // Or a loading spinner
  }

  return <>{children}</>
}
```

Usage in any page:

```tsx
// pages/admin/index.tsx
export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={['manager']}>
      <AdminHeader title="Dashboard" />
      <main>...</main>
    </RoleGuard>
  )
}
```

### Option B: Centralised in `_app.tsx` (cleaner at scale)

```tsx
// pages/_app.tsx
const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/admin':               ['manager'],
  '/admin/clients':       ['manager'],
  '/admin/analytics':     ['manager'],
  '/admin/transactions':  ['manager'],
  '/admin/portfolios':    ['manager'],
  '/admin/settings':      ['manager'],
  '/advisor':             ['advisor'],
  '/advisor/clients':     ['advisor'],
  '/client':              ['client'],
  '/client/portfolio':    ['client'],
}

export default function App({ Component, pageProps, router }: AppProps) {
  const { user, isAuthenticated } = useAuth()

  // Determine if current route requires a specific role
  const requiredRoles = Object.entries(ROUTE_ROLES).find(([path]) =>
    router.pathname.startsWith(path)
  )?.[1]

  // If route is protected and user doesn't qualify, redirect
  useEffect(() => {
    if (requiredRoles && !isAuthenticated) {
      router.replace('/login')
    } else if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      const redirects: Record<UserRole, string> = {
        manager: '/admin', advisor: '/advisor', client: '/client',
      }
      router.replace(redirects[user.role])
    }
  }, [router.pathname, isAuthenticated, user])

  // ...rest of layout logic
}
```

**Recommendation**: Use Option A for this demo project. It is explicit — each page declares who can view it — which makes the codebase easy to understand when you hand it over to another developer or present it to a client. Option B has less boilerplate but is harder to follow at a glance.

---

## 8. How Each Role's Dashboard Differs

### Manager Dashboard (existing `/admin/index.tsx`)

No changes needed. The customisable dashboard is the right UX for a manager.

**Sidebar navigation**:
- Dashboard, Clients, Portfolios, Transactions, Analytics, Settings — all firm-wide

### Advisor Dashboard (new `/advisor/index.tsx`)

A simplified customisable dashboard. Same widget system, but:

- `StaffTable` widget is hidden (advisors do not manage other advisors)
- KPI data shows *their* AUM and *their* clients, not firm-wide
- `TopClients` shows only their clients
- Default view is "Morning Review" with their scoped data

**How scoping works** — the service layer:

```tsx
// lib/services/clients.service.ts

import { mockClients } from '@/lib/data/mock-clients'
import type { User } from '@/lib/types/auth'

export function getClients(currentUser: User) {
  if (currentUser.role === 'manager') return mockClients
  if (currentUser.role === 'advisor') {
    return mockClients.filter(c => c.advisorId === currentUser.advisorId)
  }
  // client role — return only their own record
  return mockClients.filter(c => c.id === currentUser.clientId)
}
```

The widget registry calls this function with the current user from context. The widgets do not need to know about scoping — they just receive their data from the registry, which receives it from the service, which applies the role filter.

**Sidebar navigation for advisor**:
- My Dashboard, My Clients, My Cases, Transactions, Settings

### Client Portal (new `/client/index.tsx`)

A fundamentally different, simpler layout. Not a widget grid — a clean single-page summary.

- Portfolio value and YTD return at the top
- Asset allocation donut
- Recent transactions (their own only)
- Document centre (if applicable)
- No customisation controls — clients do not need to rearrange their own portal

**Sidebar navigation for client**:
- Overview, My Portfolio, Transactions, Documents, Settings

---

## 9. Configuration

One of the most important changes for portability is centralising everything that changes between projects into a single config file. Right now, these things are scattered across the codebase:

- Company name ("PMFS Wealth Platform") — in the sidebar
- Currency formatting — in `format.ts` but with locale hardcoded
- Hardcoded user name ("James Wilson") — in the sidebar and toolbar
- Chart colours — in `globals.css` as CSS custom properties

The config file consolidates all of this:

```tsx
// lib/config/app.config.ts

export const APP_CONFIG = {
  // Branding
  companyName: 'PMFS Wealth Platform',
  companyShortName: 'PMFS',
  logoText: 'PW',

  // Locale & formatting
  locale: 'en-US',
  currency: 'USD',
  dateFormat: 'en-GB',  // DD/MM/YYYY

  // Feature flags
  features: {
    customisableDashboard: true,
    clientPortal: true,
    caseManagement: false,   // Set to true when the cases page is built
  },

  // Demo mode — set to false in production to remove mock login screen
  demoMode: true,
} as const
```

When you take this project and give it to a new client, you change `app.config.ts`. Nothing else.

---

## 10. Migration Checklist

This is the exact sequence of steps to take when moving this project to a new context (new client demo, or live backend).

### Phase 1 — Foundation (no visible changes to the UI)

- [ ] Create `lib/types/auth.ts` with `UserRole`, `User`, `AuthState`
- [ ] Create `lib/data/mock-users.ts` with 3 users (one per role)
- [ ] Create `contexts/auth.context.tsx` with `MockAuthProvider` and `useAuth`
- [ ] Wrap `pages/_app.tsx` with `<MockAuthProvider>`
- [ ] Create `lib/config/app.config.ts` and replace all hardcoded strings (company name, locale, currency)
- [ ] Create `lib/services/` directory with service files for clients, analytics, transactions, advisors
- [ ] Update `lib/dashboard/widget-registry.tsx` to import from services rather than mock data directly

### Phase 2 — Login & Routing

- [ ] Create `pages/login.tsx` — renders one card per `mockUsers` entry; clicking calls `login(user.id)` from `useAuth()`
- [ ] Update `pages/index.tsx` — redirect logic: unauthenticated → `/login`; authenticated: check role → send to correct dashboard
- [ ] Add `RoleGuard` to all existing `/admin/*` pages
- [ ] Create `pages/advisor/index.tsx` with `<RoleGuard allowedRoles={['advisor']}>`
- [ ] Create `pages/client/index.tsx` with `<RoleGuard allowedRoles={['client']}>`

### Phase 3 — Role-Scoped Data

- [ ] Update `use-dashboard-layout.ts` to accept a `user` parameter passed from the page
- [ ] Update `lib/dashboard/widget-registry.tsx` to call services with the current user
- [ ] Update `components/admin/admin-sidebar.tsx` — replace hardcoded name with `useAuth().user.name`
- [ ] Update role-specific default views in `lib/dashboard/default-views.ts` (hide `staff-table` for advisor role)
- [ ] Create advisor-scoped sidebar nav in `lib/config/roles.ts`

### Phase 4 — Real Backend (when moving from demo to production)

- [ ] Replace each `lib/services/*.service.ts` function body to call `fetch('/api/...')` instead of returning mock data
- [ ] Replace `MockAuthProvider` with your real auth provider (NextAuth / Clerk / Auth0)
- [ ] `useAuth()` hook signature does not change — components are untouched
- [ ] Remove `lib/data/mock-*.ts` files (or keep them as test fixtures)
- [ ] Remove `pages/login.tsx` demo login screen

---

## Summary

The work to make this project truly portable breaks into four independent concerns:

1. **Data boundary** — services layer separates "where data comes from" from "what components render." Change the service, not the component.

2. **Identity layer** — auth context makes the current user a first-class concept. Every component that cares about *who* is logged in reads from `useAuth()`. Nothing is hardcoded.

3. **Route layer** — `RoleGuard` enforces that pages are only accessible to the right roles. The login page selects the mock identity for demo purposes.

4. **Config layer** — `app.config.ts` is the only file you change when transferring to a new client. Brand name, currency, locale, feature flags — all in one place.

The current codebase already has the hardest part done: a professional, composable UI with a working customisable dashboard. The work above is additive — no existing component needs to be rewritten, only two components need minor edits (sidebar and toolbar to use `useAuth()`), and the rest is new files.
