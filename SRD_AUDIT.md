# SRD Implementation Audit

**Date:** May 13, 2026  
**Branch:** develop  
**Audited by:** GitHub Copilot  

**Legend:** ✅ Built & functional — ⚠️ Partially implemented — ❌ Not built

---

## Summary

| Area | ✅ Done | ⚠️ Partial | ❌ Missing |
|---|---|---|---|
| General (G01–G12) | 4 | 3 | 5 |
| Customer – MUST (U01–U08) | 2 | 2 | 4 |
| Customer – SHOULD/COULD (U09–U16) | 0 | 4 | 4 |
| Advisor – MUST (A01–A06) | 1 | 2 | 3 |
| Advisor – SHOULD/COULD (A07–A15) | 0 | 1 | 8 |
| Manager – MUST (M01–M07) | 0 | 5 | 2 |
| Manager – SHOULD/COULD (M08–M20) | 0 | 5 | 8 |
| **Total** | **7** | **22** | **34** |

---

## General System Requirements

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-G01 | Secure login, role identification, 2FA | ❌ | Dev role-switcher in localStorage only. No login page, no real auth, no 2FA. |
| SRD-G02 | Visible help & support access on all pages | ❌ | Not present anywhere. |
| SRD-G03 | Consistent interface structure and navigation | ✅ | Sidebar, header, and layout are uniform across all pages and roles. |
| SRD-G04 | Data privacy, consent, and usage info on key pages | ❌ | No privacy notices or consent banners. |
| SRD-G05 | Customizable data visualisation with filtering | ⚠️ | Dashboard widgets are customisable and persist. Per-table filtering exists. No unified cross-module filter. |
| SRD-G06 | Unified export function for reports and visualisations | ❌ | Download icon exists on transactions page but is non-functional. |
| SRD-G07 | Global search and filtering across modules | ❌ | Each page has its own search bar. No global/universal search. |
| SRD-G08 | Consistent branding, typography, colours, components | ✅ | Alpha Finance brand, navy #054b85, Lato font, unified Tailwind component system. |
| SRD-G09 | Standardized report templates | ❌ | Not implemented. |
| SRD-G10 | Manual logout and auto-logout after inactivity | ⚠️ | Logout button exists in sidebar. No auto-logout timer. |
| SRD-G11 | Onboarding guidance for first-time users | ❌ | Not implemented. |
| SRD-G12 | Save customised dashboards and frequently used views | ✅ | Dashboard layout saved to localStorage with multiple named views (Manager Overview, FA View, Compact). |

---

## Customer / Standard User Requirements

### MUST

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-U01 | Record transactions (date, amount, merchant, payment method, category) | ❌ | Transactions page is read-only. No add functionality. |
| SRD-U02 | Create custom transaction categories and tags | ❌ | Not implemented. |
| SRD-U03 | View and access detailed transaction records | ✅ | Transactions page shows full list with type, amount, date, status. Each record is visible. Filtering by type and status works. |
| SRD-U04 | Edit and delete transaction records with confirmation | ❌ | Not implemented. |
| SRD-U05 | Income and expense summaries using charts and statistics | ⚠️ | Analytics page has cash flow bar chart and top-5 category spend. PFMS dashboard shows weekly budget progress cards. No dedicated income vs expense summary for customers. |
| SRD-U06 | Personalized financial reports and spending trend analysis | ⚠️ | Analytics page shows trends. No downloadable report or customer-specific report generation. |
| SRD-U07 | Submit financial adviser consultation requests | ❌ | Not implemented. Cases mock data exists but no customer-facing request UI. |
| SRD-U08 | Share authorized financial summary data with advisers | ⚠️ | FA can view assigned client data. No explicit consent or sharing toggle mechanism. |

### SHOULD

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-U09 | Budgeting goals and notifications for spending limits | ⚠️ | PFMS budget categories with weekly limits and progress bars exist. AlertsPanel flags overspend. No user-defined goal creation or push notifications. |
| SRD-U10 | Split bank statement transactions into spending categories | ❌ | Not implemented. |
| SRD-U11 | Transaction filtering by date, amount, category, merchant, tag | ⚠️ | Filter by transaction type and status works. No date range picker, no amount filter, no merchant or tag filter. |
| SRD-U12 | Switch between different chart types | ❌ | Chart types are fixed. No toggle. |
| SRD-U13 | Historical trend analysis including averages and savings ratios | ⚠️ | Monthly cash flow chart exists in analytics. No savings ratio calculation or rolling averages. |

### COULD

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-U14 | Save customised report templates | ❌ | Not implemented. |
| SRD-U15 | Attach notes or receipt images to transactions | ❌ | Not implemented. |
| SRD-U16 | AI receipt scanning | ❌ | Out of scope for this phase. |

---

## Financial Advisor Requirements

### MUST

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-A01 | Create consultation records (topic, date, client, summary) | ❌ | `mock-cases.ts` has full data model and seeded records, but there is no UI to create, view, or list cases. |
| SRD-A02 | View authorised client financial summaries | ✅ | FA can view their assigned clients' full detail pages: portfolio, holdings, transactions, PFMS budget & spending. Access-guarded by `canAccessClient`. |
| SRD-A03 | Generate personalized financial reports and visual charts | ⚠️ | FA has access to the Analytics page (cash flow chart, category chart, KPI tiles). No export or per-client report generation. |
| SRD-A04 | Update client information and consultation records | ⚠️ | FA can submit a **Request Change** via `RequestChangeDialog` with a note and diff preview. Manager must approve. No direct edit. No consultation record updates (no UI). |
| SRD-A05 | Delete consultation records with confirmation | ❌ | No consultation record UI exists. |
| SRD-A06 | Receive and respond to client consultation requests | ❌ | Not implemented. |

### SHOULD

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-A07 | Add internal notes and tags to client records | ❌ | Not implemented. |
| SRD-A08 | Filter and sort client list by risk level, income, or consultation date | ⚠️ | ClientTable filters by status and risk level, and sorts by name, portfolio value, or last activity. No income or consultation-date filter. |
| SRD-A09 | Notify advisers when new requests or messages arrive | ❌ | Not implemented. |
| SRD-A10 | Pre-designed templates for common advisory cases | ❌ | Not implemented. |

### COULD

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-A11 | Summaries of recent consultations | ❌ | Data in `mock-cases.ts` but no summary UI. |
| SRD-A12 | AI receipt upload and transaction extraction | ❌ | Out of scope. |
| SRD-A13 | Multiple advisers collaborate on shared client files | ❌ | Not implemented. |
| SRD-A14 | Advisers customise dashboard layouts | ❌ | Dashboard customisation is currently manager-only. FA gets a fixed view. |
| SRD-A15 | Learning hub with compliance and market information | ❌ | Not implemented. |

---

## Manager Requirements

### MUST

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-M01 | Create, view, edit, and delete team member and task records | ⚠️ | `StaffTable` renders all advisors in the dashboard widget. Client CRUD fully built. **Dedicated `/admin/staff` pages not yet built** (design planned in `STAFF_MANAGEMENT_PLAN.md`). No task record system. |
| SRD-M02 | View advisers' client lists and work statuses | ⚠️ | StaffTable shows client count, AUM, and status per adviser. No drill-down page to view one adviser's full client roster yet. |
| SRD-M03 | Assign and reassign advisers to client requests | ⚠️ | `EditClientDialog` lets manager assign any active adviser when creating/editing a client. **No dedicated reassignment flow** for existing clients (planned in `STAFF_MANAGEMENT_PLAN.md`). Manager can approve FA change requests which include adviser re-assignments. |
| SRD-M04 | Performance dashboard (satisfaction rate, completion rate, response time) | ⚠️ | Stats cards show total AUM, active clients, revenue, and average returns. Portfolio performance chart and allocation chart exist. No satisfaction rate, response time, or case completion rate metrics. |
| SRD-M05 | Anonymised team-level insights for business trend analysis | ⚠️ | Analytics page aggregates across all clients and advisers. Not explicitly anonymised. No anonymisation toggle. |
| SRD-M06 | Filtering and search by adviser, client type, or date | ⚠️ | Client list has search and filters for status and risk level. **No adviser filter. No date range filter.** |
| SRD-M07 | Notifications for complaints, adviser requests, and critical events | ⚠️ | AlertsPanel widget shows mock alerts (warning, danger, info). FA change requests are tracked and surface in the client detail page. No real-time notifications or system-level event triggers. |

### SHOULD

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-M08 | Monitor adviser workload distribution | ⚠️ | StaffTable shows each adviser's client count, AUM, and open cases. No visual workload comparison chart. |
| SRD-M09 | Summary reports by client type or income level | ❌ | Not implemented. |
| SRD-M10 | Performance trend analysis over time | ⚠️ | PortfolioChart shows 6-month AUM vs benchmark. No per-adviser or per-client trend comparison. |
| SRD-M11 | Export reports in PDF or CSV | ❌ | Not functional. |
| SRD-M12 | Internal feedback and performance notes | ❌ | Not implemented. |
| SRD-M13 | Automatic reminders for deadlines and key tasks | ❌ | Not implemented. |
| SRD-M14 | Identify overdue cases and duplicate records | ⚠️ | `mock-cases.ts` has due dates and case data. AlertsPanel surfaces alerts. No automatic detection logic. |

### COULD

| ID | Requirement | Status | Notes |
|---|---|---|---|
| SRD-M15 | Visual performance comparison dashboards | ⚠️ | Analytics page has charts. No side-by-side adviser comparison chart. |
| SRD-M16 | Smart recommendations for training and recognition | ❌ | Not implemented. |
| SRD-M17 | Team health dashboard | ❌ | Not implemented. |
| SRD-M18 | Built-in messaging between managers and advisers | ❌ | Not implemented. |
| SRD-M19 | Quarterly trend analysis reports | ❌ | Not implemented. |
| SRD-M20 | Alerts for potential risks (e.g. rising complaint rates) | ⚠️ | AlertsPanel exists but alerts are static mock data, not dynamically computed from live records. |

---

## What's Built That Isn't Explicitly in the SRD

These were architectural decisions made during development that support the platform:

| Feature | Notes |
|---|---|
| **RBAC with 3 roles** | `manager`, `fa`, `customer` — role-based page guards, conditional UI, and permission checks throughout |
| **FA Change Request flow** | FA proposes changes to a client record → manager sees pending requests on the client detail page → approve applies changes, reject dismisses |
| **Customisable dashboard** | Widget picker, drag-and-drop layout, named views, persisted to localStorage |
| **Alpha Finance branding** | Navy #054b85, Lato font, consistent component styles |
| **PFMS budget system** | Weekly discretionary budgets per category per customer, with progress tracking and over-pace detection |
| **Client detail page** | Portfolio holdings, performance tiles, transactions table, full PFMS section |
| **Mock data ecosystem** | Clients, advisors, cases, portfolios, transactions, PFMS snapshots, analytics, change requests — all seeded |

---

## Priority Build List — MUST Requirements Still Missing

These are the gaps on MUST requirements that need to be closed before the UI/UX report can present a complete system:

### 1. Authentication / Login page (SRD-G01)
A mock login screen with role selection (no real backend needed). Enough to demonstrate the concept for the report.

### 2. Staff Management pages — `/admin/staff` and `/admin/staff/[id]` (SRD-M01, M02, M03)
Already fully designed in `STAFF_MANAGEMENT_PLAN.md`. This is the next coding task.

### 3. Customer: Add a transaction (SRD-U01)
An "Add Transaction" button and dialog on the Transactions page for the customer role. Fields: date, amount, merchant, category, payment method.

### 4. Customer: Edit / Delete transactions (SRD-U04)
Edit and delete actions in the transaction row dropdown, with confirmation dialog for delete.

### 5. Customer: Submit adviser consultation request (SRD-U07)
A "Request Consultation" button on the customer dashboard that opens a simple form (topic, preferred date, message).

### 6. Adviser: Case / Consultation record UI (SRD-A01, A05)
A Cases section or tab for the FA role — list of consultation records, create/view/delete. The data model is already fully built in `mock-cases.ts` and `lib/types/admin.ts`.

---

## Pages That Exist

| Route | Who Sees It | Status |
|---|---|---|
| `/admin` | All roles (different views) | ✅ Built |
| `/admin/clients` | Manager, FA (Customer gets redirected to PFMS view) | ✅ Built |
| `/admin/clients/[id]` | Manager, FA, Customer (own record only) | ✅ Built |
| `/admin/portfolios` (Budgets) | All roles | ✅ Built |
| `/admin/transactions` | All roles | ✅ Built (read-only) |
| `/admin/analytics` | Manager, FA | ✅ Built |
| `/admin/settings` | All roles | ⚠️ UI only, not wired |
| `/admin/staff` | Manager | ❌ Not built yet |
| `/admin/staff/[id]` | Manager | ❌ Not built yet |
| Login page | All | ❌ Not built |
| Cases page | FA, Manager | ❌ Not built |
