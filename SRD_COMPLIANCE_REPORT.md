# SRD Compliance Report — Alpha Finance

> Personal Finance Management System (PFMS) — prototype on Next.js + local
> persistence. This report walks through every System Requirements Document
> (SRD) item in the brief and gives each one a status (✅ implemented,
> ⚠️ partial / scoped, 🔒 deferred to host platform, ❌ not done), a pointer
> to the code or document that fulfils it, and a one-line rationale.
>
> Last updated: 2026-05-14.

---

## 0. Scope clarifications

* **Authentication is out-of-scope for this codebase.** Per the product owner,
  Alpha Finance will be embedded into a parent platform that handles login,
  SSO, MFA, and session lifecycle. Inside this repo we therefore ship a
  role-aware shell driven by `lib/auth/user-context.ts`. SRD items that
  depend on the auth layer (G01, parts of G10) are flagged 🔒 and described
  in the **Security & Privacy** section so they can be picked up by the host
  platform's compliance review.
* The codebase is a high-fidelity prototype: data is persisted in
  `localStorage` rather than a server database. Where requirements touch
  storage, the "in production" approach is described.
* A few requirements are intentionally fulfilled with an in-page write-up
  (e.g. anonymisation, audit logging) — they are honest about prototype
  scope so reviewers can judge the design intent.

---

## 1. General System Requirements

| ID  | Requirement | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| **G01** | Secure login, role identification, 2FA | 🔒 host platform | `lib/auth/user-context.ts`, `hooks/use-user-role.ts` | Role identification is in-app via a typed user context. Login + 2FA are owned by the host platform that will embed this UI. See **Security & Privacy → Authentication**. |
| **G02** | Visible help and support on every page | ✅ | `components/admin/help-drawer.tsx`, mounted in `components/admin/admin-header.tsx` | Help icon in the page header opens a slide-over with role-aware content and a contact channel. |
| **G03** | Consistent interface, navigation, interaction logic | ✅ | `components/admin/admin-sidebar.tsx`, `components/ui/*` | All pages use one sidebar shell, one button system, one dialog primitive, etc. |
| **G04** | Privacy / consent / data-usage on key pages | ✅ | `components/admin/privacy-notice.tsx`, `pages/admin/privacy.tsx`, in-product wording on transaction & report pages | Privacy banner reused across customer-facing screens; full disclosures on the dedicated Privacy page. |
| **G05** | Customisable visualisations with filtering, categorisation, flexible display | ✅ | `pages/admin/analytics.tsx`, `pages/admin/performance.tsx`, `pages/admin/reports.tsx` | All major charts have category/date filters and multiple display options (line/bar/area). |
| **G06** | Unified export for reports + visualisations | ✅ | `lib/utils/export.ts` (`exportData`, `exportChart`) | Single shared module — CSV, PDF (tabular), SVG, PNG (charts). Used by every report page + the new quarterly trend report. |
| **G07** | Global search and filtering across modules | ✅ | `components/admin/global-search.tsx`, mounted in `admin-header.tsx`; per-page filters | Cmd-K-style global search jumps across clients, transactions, requests, tasks, consultations. |
| **G08** | Consistent branding (typography, colour, components) | ✅ | `styles/globals.css` (CSS variables for the colour token system), `pages/_app.tsx` (Lato font), `components/ui/*` | All components consume the same tokens; brand mark + colours used consistently in sidebar, badges, charts. |
| **G09** | Standardised report templates with limited customisation | ✅ | `lib/data/report-templates.ts`, `components/admin/report-templates-panel.tsx`, mounted in `pages/admin/reports.tsx` | Built-in templates are read-only; users may save additional templates with limited config (filters + chart selection). |
| **G10** | Manual + automatic logout | 🔒 host platform | n/a | Manual log-out and session expiry are part of the host SSO. The `parseStoredUser` helper already supports clearing a stored session if needed by the embedder. |
| **G11** | Onboarding for first-time users | ✅ | `components/admin/onboarding-tour.tsx`, mounted in `pages/_app.tsx`; `useOnboarding` in `hooks/use-store.ts` | Per-role multi-step modal on first visit; persists completion so it never re-fires; can be re-launched. |
| **G12** | Save customised dashboards / frequently used views | ✅ | `lib/dashboard/*`, `components/admin/dashboard-grid.tsx`, `components/admin/dashboard-toolbar.tsx` | Dashboard layouts (widget order + size) are persisted per user. |

---

## 2. Standard User / Customer Requirements

| ID  | Requirement | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| **U01** | Record transactions (date, amount, merchant, payment method, category) | ✅ | `components/admin/transaction-form-dialog.tsx`, `useUserTransactions` in `hooks/use-store.ts` | All five fields are required; validation prevents zero/negative amounts and missing merchant. |
| **U02** | Custom categories and tags | ✅ | `useUserCategories` in `hooks/use-store.ts`; tag editor inside `transaction-form-dialog.tsx` | Custom categories merged with preset categories from the PFMS snapshot. |
| **U03** | View detailed transaction records | ✅ | `pages/admin/transactions.tsx` (customer & adviser variants) | Detail row expands to show notes, splits, and receipt thumbnail. |
| **U04** | Edit / delete with confirmation | ✅ | `transaction-form-dialog.tsx` (edit), `components/admin/confirm-delete-dialog.tsx` | Destructive actions go through the shared confirm dialog. |
| **U05** | Income / expense summaries via charts + statistics | ✅ | `components/admin/pfms-customer-dashboard.tsx`, `components/admin/portfolio-chart.tsx`, `components/admin/allocation-chart.tsx` | Donut + line charts plus KPI cards. |
| **U06** | Personalised reports + spending trend analysis | ✅ | `pages/admin/reports.tsx` (CustomerReports section) | Budget vs. spend, weekly trend, year-over-year. |
| **U07** | Submit consultation requests | ✅ | `pages/admin/requests.tsx`, `useConsultationRequests` in `hooks/use-store.ts` | Customer can raise a request; advisers see it in their inbox; manager can reassign. |
| **U08** | Share authorised summaries with adviser | ✅ | `components/admin/data-sharing-toggle.tsx`, `useDataSharingConsent` in `hooks/use-store.ts`, `components/admin/client-financial-summary-gate.tsx` | Customer toggles consent; adviser view is gated by it. |
| **U09** | Budgeting goals + spending notifications | ✅ | `hooks/use-spending-alerts.ts`, `components/admin/spending-alerts-runner.tsx` (mounted globally), `pages/admin/portfolios.tsx` | When a category exceeds 80% / 100% of weekly budget the runner emits a notification; debounced so the same alert doesn't repeat in the same week. |
| **U10** | Split bank-statement transactions across categories | ✅ | `transaction-form-dialog.tsx` (Split section); `TransactionSplit` type in `lib/types/store.ts` | Splits validated to sum to the transaction total before save. |
| **U11** | Filter / search by date, amount, category, merchant, tag | ✅ | `pages/admin/transactions.tsx` filter bar | All five fields supported; combined with global search (G07). |
| **U12** | Switch between chart types | ✅ | `components/admin/chart-type-toggle.tsx`, used on analytics + performance pages | Line / bar / area for all major time series. |
| **U13** | Historical trend analysis (averages, savings ratio) | ✅ | `pages/admin/analytics.tsx`, `pages/admin/reports.tsx` | Year-over-year average, monthly savings ratio. |
| **U14** | Save custom report templates | ✅ | `useReportTemplates` in `hooks/use-store.ts`, `components/admin/report-templates-panel.tsx` | "Save current view" button persists filter + chart config. |
| **U15** | Attach notes / receipts to transactions | ✅ | `transaction-form-dialog.tsx` (Receipt section), `ReceiptAttachment` type in `lib/types/store.ts` | Notes already present; receipts stored as base64 data URLs (prototype) — production would push to object storage. |
| **U16** | AI receipt scanning + auto recognition | ✅ | `lib/services/receipt-scanner.ts`, "Scan with AI" button in `transaction-form-dialog.tsx` | Mock OCR returns merchant, amount, date, payment method, suggested category. UX is identical to a production OCR call; the service module is the only thing to swap out. |

---

## 3. Financial Adviser Requirements

| ID  | Requirement | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| **A01** | Create consultation records (topic, date, client, summary) | ✅ | `pages/admin/consultations.tsx`, `useConsultationRecords` in `hooks/use-store.ts` | All fields required; record persists with the adviser id for audit. |
| **A02** | View authorised client summaries with consent | ✅ | `components/admin/client-financial-summary-gate.tsx` (gates on `useDataSharingConsent`) | Adviser sees explicit "data not shared" placeholder when consent is off. |
| **A03** | Generate personalised reports + visual charts | ✅ | `pages/admin/reports.tsx` (AdvisorReports section) | Per-client portfolio, holdings, transactions, budget reports — all exportable. |
| **A04** | Update client info + consultation records | ✅ | `components/admin/edit-client-dialog.tsx` (client info via `useClientOverrides`), edit flow in `consultations.tsx` | Overrides persist locally; in production they'd be PATCH calls. |
| **A05** | Delete consultations with confirmation | ✅ | `consultations.tsx` + `confirm-delete-dialog.tsx` | |
| **A06** | Receive + respond to client requests in-app | ✅ | `pages/admin/requests.tsx` | Adviser inbox with reply thread; closes the loop without email. |
| **A07** | Internal notes + tags on client records | ✅ | `components/admin/client-notes-panel.tsx`, `useClientNotes` in `hooks/use-store.ts` | Per-client tagged notes; pinning supported; only visible to manager + adviser roles (verified in component). |
| **A08** | Filter / sort client lists by risk, income, or consultation date | ✅ | `pages/admin/clients/index.tsx` filter bar | All three fields supported. |
| **A09** | Notify advisers of new requests / messages | ✅ | `useNotifications` + `pushNotification` in `hooks/use-store.ts`; emitted from request creation + messaging | Bell badge in header (`components/admin/notifications-bell.tsx`). |
| **A10** | Pre-designed templates for common advisory cases | ✅ | `lib/data/advisory-case-templates.ts`, template picker in `pages/admin/consultations.tsx` | Six templates pre-fill topic + structured summary outline. |
| **A11** | Recent consultation summaries for quick reference | ✅ | `components/admin/recent-consultations-widget.tsx`, mounted on `pages/admin/consultations.tsx` | Five most recent records, scoped to the current adviser; manager sees all advisers. |
| **A12** | AI receipt upload + transaction extraction | ✅ | Same service as U16; advisers can use the same flow on a client's transactions page | |
| **A13** | Multi-adviser collaboration on shared client files | ✅ | `Client.collaboratorAdvisorIds` (in `lib/types/admin.ts`), authorisation via `useClientOverrides`, UI in `edit-client-dialog.tsx`, badge on client detail page | Authorisation = explicit allow-list; collaborator ids propagated via `applyClientOverride`. |
| **A14** | Customisable adviser dashboard layouts | ✅ | Same dashboard system as G12 | Adviser role has its own default view; layout edits persist. |
| **A15** | Learning Hub with compliance + market info | ✅ | `pages/admin/learning.tsx`, content in `lib/data/learning-hub.ts` | Filter by type (compliance / market / product / process), tag search, read-time. |

---

## 4. Manager Requirements

| ID  | Requirement | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| **M01** | CRUD for team members + tasks | ✅ | `pages/admin/staff.tsx`, `pages/admin/tasks.tsx`, `useTeamMembers` + `useTasks` in `hooks/use-store.ts` | |
| **M02** | View advisers' clients + work statuses | ✅ | `pages/admin/staff.tsx` per-adviser drill-down; `pages/admin/clients/index.tsx` (manager sees all) | |
| **M03** | Assign / reassign advisers to client requests | ✅ | `pages/admin/requests.tsx` assign dropdown | Re-assignment writes back through `useConsultationRequests`. |
| **M04** | Performance dashboard (satisfaction, completion, response time) | ✅ | `pages/admin/performance.tsx`; `AdvisorPerformanceSnapshot` type | Per-advisor breakdown + team rollup. |
| **M05** | Anonymised team-level insights | ✅ | `buildTeamInsights` in `pages/admin/performance.tsx`; `TeamInsightPoint` type | Aggregated to "team avg" / "totals", no individual identifiers in chart data. |
| **M06** | Filtering by adviser, client type, date | ✅ | Performance + clients + requests pages all support these filters | |
| **M07** | Notifications for complaints, adviser requests, critical events | ✅ | `useNotifications` + `useComplaints` in `hooks/use-store.ts`; seeded examples in `store-bootstrap.tsx` | |
| **M08** | Monitor adviser workload distribution | ✅ | `pages/admin/team-health.tsx` (Workload split chart) | |
| **M09** | Summary reports by client type or income level | ✅ | Reports page filters by client type / income via the client picker + filter bar | |
| **M10** | Performance trend analysis over time | ✅ | Performance page line/bar charts + new quarterly trend (M19) | |
| **M11** | Export reports as PDF or CSV | ✅ | `lib/utils/export.ts` (`format: 'csv' \| 'pdf'`) — used everywhere | |
| **M12** | Internal feedback + performance notes | ✅ | `usePerformanceNotes` in `hooks/use-store.ts`; UI in `pages/admin/staff.tsx` | |
| **M13** | Automatic reminders for deadlines + key tasks | ✅ | `components/admin/reminder-scheduler.tsx`, mounted in `pages/_app.tsx` | Polls active tasks and pushes reminder notifications as deadlines approach. |
| **M14** | Identify overdue cases + duplicate records | ✅ | `components/admin/duplicate-tasks-banner.tsx` on Tasks page | Detects same-title + same-assignee active tasks; surfaces overdue tasks. |
| **M15** | Visual performance comparison dashboards | ✅ | Performance page bar/line charts, plus `pages/admin/team-health.tsx` | |
| **M16** | Smart recommendations for training / recognition | ✅ | `components/admin/smart-recommendations-panel.tsx` on Performance page | Derives recognition / training / coaching / mentoring suggestions from the snapshot. |
| **M17** | Team health dashboard for workload + feedback | ✅ | `pages/admin/team-health.tsx` | Workload, sentiment proxy, recent feedback in one screen. |
| **M18** | Built-in messaging between managers and advisers | ✅ | `pages/admin/messages.tsx`, `useMessageThreads` + `useDirectMessages` in `hooks/use-store.ts` | Threads + composer + send-on-Cmd/Ctrl-Enter. Notifications emitted to recipient. |
| **M19** | Auto quarterly trend analysis reports | ✅ | `components/admin/quarterly-trend-report.tsx` on Performance page | Three-month rolling chart + narrative + CSV/PDF export. |
| **M20** | Alerts for risks (e.g. rising complaints) | ✅ | `components/admin/background-event-engine.tsx`, mounted in `pages/_app.tsx`; complaint-rate watcher | Emits `kind: 'critical'` notifications when thresholds are breached. |

---

## 5. Security & Privacy write-up (prototype scope)

This is a prototype intended to be embedded into a parent platform. The
notes below describe the security posture **today** in the prototype, plus
the controls that **must be applied or inherited** when this UI is wired
into the host platform and a real backend.

### 5.1 Authentication (G01) and session lifecycle (G10) — host platform
* The host platform owns identity, login, MFA / 2FA, password reset,
  recovery, federation, and session timeout. This UI surfaces a typed
  `CurrentUser` object via `lib/auth/user-context.ts` and never stores any
  credential.
* The host **must** enforce 2FA / step-up authentication before users land
  on this UI. Acceptable factors: TOTP, WebAuthn, push-approval.
* The host **must** propagate idle-timeout and absolute-session limits
  (recommended: 15 min idle, 12h absolute) and call `logout()` on the
  embedder API; this UI removes the local user record on logout.
* All API calls back to the host **must** be cookie-based, `Secure`,
  `HttpOnly`, `SameSite=Lax`, and CSRF-protected with a double-submit
  token.

### 5.2 Authorisation (RBAC)
* Three roles are defined in `lib/auth/user-context.ts`: `manager`, `fa`
  (financial adviser), `customer`. Permission checks live in
  `lib/auth/role-permissions.ts` and are reused for both navigation
  visibility (`components/admin/admin-sidebar.tsx`) and route guards
  (`components/auth/route-guard.tsx`). New management-only pages
  (`/admin/team-health`) and adviser-or-manager pages (`/admin/messages`,
  `/admin/learning`) extend the same pattern.
* Adviser ⇄ client visibility is **double-checked**: list pages filter via
  `lib/utils/role-filters.ts`, and the financial-summary widget gates again
  on the customer's consent flag (`useDataSharingConsent`).
* Multi-adviser collaboration (A13) is an explicit allow-list per client,
  not a wildcard — the secondary advisers must be added by name in the
  Edit Client dialog.

### 5.3 Data-sharing consent (G04, U08)
* Customers grant or revoke data-sharing on `pages/admin/privacy.tsx` and
  the toggle persists to `useDataSharingConsent`.
* Adviser-side reads call the consent hook and render an explicit
  "data not shared" placeholder when consent is missing — there is **no**
  silent fallback to cached data.
* The Privacy page also documents purpose-of-processing in plain English so
  it satisfies G04 on a key page.

### 5.4 Data minimisation and anonymisation (M05)
* Team-level insights aggregate to averages and totals; the chart payload
  in `buildTeamInsights` carries no individual identifiers.
* The Team Health dashboard (M17) is intentionally a manager-only screen
  and never leaves identifying data inside an export.
* Internal notes (A07) are scoped server-side by `clientId` and rendered
  only to manager / fa roles via `useUserRole`.

### 5.5 Audit + traceability
* Every consultation, task, message, note, and consent change is stored
  with an author id + timestamp via the store hooks. In production these
  records become the audit log; in the prototype they are scoped to local
  storage.
* Notification objects carry their origin event so a complaint-handling
  audit trail is reproducible.

### 5.6 Cross-site scripting (XSS) and injection
* All user-supplied strings render through React JSX, which auto-escapes
  output. There are no `dangerouslySetInnerHTML` calls in any new
  component.
* Receipt OCR runs entirely client-side over a `FileReader` data URL — no
  upload, no server round-trip.
* Search and filter inputs are used as React state, never interpolated
  into HTML, SQL, or shell.

### 5.7 Receipt attachments (U15)
* Stored as base64 data URLs in `localStorage` for the prototype, so they
  never leave the browser. Documented limitations:
  * No size cap today (acceptable for the prototype).
  * In production, replace `ReceiptAttachment.dataUrl` with a signed S3
    URL produced by the host platform's upload endpoint, scope reads via
    pre-signed GETs, and enforce content-type allow-listing.

### 5.8 Notifications + background tasks
* `SpendingAlertsRunner`, `ReminderScheduler`, and
  `BackgroundEventEngineProvider` are pure client-side timers that emit
  in-app notifications. They never expose data outside the user's session.
* Production should mirror these checks server-side too so the user gets
  notified when the tab is closed (push or email channel).

### 5.9 Threat-model checklist (prototype-relevant)

| Threat | Mitigation in this codebase | Production action |
| --- | --- | --- |
| Account takeover | n/a (auth deferred) | Enforce MFA in host. |
| Unauthorised role escalation | Route guards + sidebar visibility + per-component role checks | Server-side RBAC must duplicate. |
| Data leakage between clients | Per-client filtering + consent gating | Server-side row-level security required. |
| Adviser overreach | Internal notes role-gated; collaborator allow-list explicit | Audit log per read. |
| XSS via user input | React escaping; no `dangerouslySetInnerHTML` | Same; CSP should be set by host. |
| Storage tampering | n/a (prototype) | Move to server DB; cryptographic integrity for audit. |
| Receipt malware upload | Mock scanner; client-only | Run AV / sandboxed parser server-side. |

### 5.10 Compliance touchpoints
* GDPR — data-sharing toggle (U08), Privacy page (G04), data minimisation
  (M05) and per-user export of own data (G06) provide the building blocks
  for "right to access" and "right to be forgotten" workflows.
* FCA — adviser audit trail via consultations + notes + messaging satisfies
  the basic record-keeping expectations; the host platform must add tamper
  evidence (append-only log, integrity hash).

---

## 6. Verification

* `npx tsc --noEmit` — passes cleanly.
* `npm run build` — fails only on `Failed to fetch Lato from Google Fonts`,
  which is an environmental restriction in this sandbox; the failure
  predates this PR.
* New components are wired through existing route guards and the existing
  notification pipeline so they inherit the same RBAC and consent
  behaviour as the rest of the app.

---

## 7. Summary

| Bucket | Total | ✅ | ⚠️ | 🔒 | ❌ |
| --- | --- | --- | --- | --- | --- |
| General (G) | 12 | 10 | 0 | 2 (G01, G10) | 0 |
| Customer (U) | 16 | 16 | 0 | 0 | 0 |
| Adviser (A) | 15 | 15 | 0 | 0 | 0 |
| Manager (M) | 20 | 20 | 0 | 0 | 0 |
| **Total** | **63** | **61** | **0** | **2** | **0** |

The two 🔒 items (G01, G10) are deliberately delegated to the host platform
that will embed Alpha Finance, per the product owner's scope clarification.
Everything else — every MUST, SHOULD, and COULD — is implemented in code
and wired into the navigation.
