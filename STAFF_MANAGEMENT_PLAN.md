# Staff Management Section — Implementation Plan

## Overview

The goal is to give the manager a first-class staff management section: a top-level view of all advisors, individual staff profile pages with their assigned client roster, and the ability to add new staff, edit existing records, reassign clients between advisors, and deactivate or remove staff members. This document describes every change required across data, permissions, routing, and UI — in the order they should be built.

---

## What the Manager Needs

1. **Staff list** — overview table of all advisors with name, role, status, client count, AUM, and performance.
2. **Staff profile page** — per-advisor deep-dive: contact info, role/status, assigned client roster, and performance metrics.
3. **Add staff** — create a new advisor record with name, email, phone, role, and status.
4. **Edit staff** — update any of those fields, including promoting/demoting role or toggling status (active, on leave, inactive).
5. **Reassign a single client** — from a client's record or the advisor's client list, move one client to a different advisor in a single action.
6. **Bulk reassign** — when deactivating or removing a staff member, transfer all their clients to one or more receiving advisors in a single flow.
7. **Remove staff** — permanently delete an advisor record; only allowed if they have zero clients, or as part of a bulk-reassign-then-remove flow.

---

## Data Layer Changes

### `lib/data/mock-advisors.ts`

The existing `mockAdvisors` array and `Advisor` type are already solid. The only additions needed are two helper functions that do not currently exist:

- `reassignClient(clientId, fromAdvisorId, toAdvisorId)` — removes the client ID from one advisor's `clientIds` array and appends it to the other's. Also updates `totalAUM` on both records by looking up the client's `portfolioValue`.
- `reassignAllClients(fromAdvisorId, toAdvisorId)` — loops `reassignClient` for every client on the departing advisor.

Both helpers mutate the in-memory arrays (acceptable for mock data; they mirror what a real API call would do). They also need to call the corresponding update on `mockClients` to keep `advisor` and `advisorId` fields in sync — the two data sources must stay coherent.

### `lib/data/mock-clients.ts`

Add a `updateClientAdvisor(clientId, advisorId, advisorName)` helper that patches the named client in place. This is what `reassignClient` will call internally.

### `lib/auth/role-permissions.ts`

Add two new permissions to the `Permission` union and grant them to `manager` only:

- `manageStaff` — create/edit/delete staff records.
- `reassignClients` — move clients between advisors.

---

## New Pages

### `/admin/staff` — Staff List (`pages/admin/staff/index.tsx`)

The existing `StaffTable` component is already implemented and already links each row to `/admin/staff/[id]`. This page is basically a shell: fetch all advisors, render a stat-card row (total staff, active staff, total AUM across all advisors, average monthly performance), then render `StaffTable`. An "Add Staff" button in the header is only shown when the logged-in user has the `manageStaff` permission. Clicking it opens `EditStaffDialog`.

The page is protected by `RouteGuard allowedRoles={['manager']}` — FAs and customers never see staff.

### `/admin/staff/[id]` — Staff Profile (`pages/admin/staff/[id].tsx`)

A per-advisor page that mirrors the structure of the existing client detail page. Sections:

1. **Header card** — avatar, name, role badge, status badge, contact details (email, phone), join date, action buttons (Edit, Deactivate/Activate, Remove).
2. **Performance panel** — monthly / quarterly / yearly return tiles pulled from `advisor.performance`.
3. **Client roster** — reuse the existing `ClientTable` component, passing only the clients whose IDs appear in `advisor.clientIds`. Each client row has a "Reassign" action in its dropdown that opens `ReassignClientDialog`.
4. **AUM summary** — sum of portfolio values across assigned clients, plus a count of active vs inactive vs pending clients.

The page uses `getStaticPaths` + `getStaticProps` (same pattern as the client detail page) to pre-render all four advisor pages at build time. It accepts `?edit=true` as a query param so that the Edit button on the staff list can navigate directly to the profile and auto-open the edit dialog.

---

## New Components

### `components/admin/edit-staff-dialog.tsx`

Handles both Add (staff=null) and Edit (staff=Advisor) modes. Fields:

| Field | Input Type | Validation |
|---|---|---|
| Full Name | text | required |
| Email | email | required |
| Phone | text | optional |
| Role | Select (senior_advisor / advisor / junior_advisor) | required |
| Status | Select (active / on_leave / inactive) | required |

On save for a new advisor, generate an ID as `ADV${Date.now()}` and set `joinDate` to today. `clientIds`, `totalAUM`, `performance`, and `activeCaseCount` initialise to safe defaults (empty array, 0, zeroes, 0).

The prop signature mirrors the existing `EditClientDialog` pattern: `advisor: Advisor | null`, `open: boolean`, `onOpenChange`, `onSave`.

### `components/admin/reassign-client-dialog.tsx`

A focused single-purpose dialog. Props: `client: Client`, `open: boolean`, `onOpenChange`, `onSave: (clientId, toAdvisorId) => void`.

It shows:
- The client being moved (name, current advisor).
- A Select listing all active advisors **excluding the current one**.
- A confirmation button that becomes enabled once a target advisor is chosen.

This dialog is used both from the staff profile page and from the client detail page (where a manager should also be able to reassign).

### `components/admin/bulk-reassign-dialog.tsx`

Used exclusively during the staff removal flow. Props: `advisor: Advisor`, `open: boolean`, `onOpenChange`, `onConfirm: (toAdvisorId) => void`.

Shows a warning that all N clients will be moved, a Select for the receiving advisor (all active advisors except the one being removed), and a destructive "Reassign All & Remove" confirm button. This is a two-step flow: first reassign, then remove — the component calls `onConfirm` with the chosen advisor ID and the parent handles both operations in sequence.

### `components/admin/staff-table.tsx` — Updates

The existing `StaffTable` is read-only. Add optional `onEdit?: (advisor: Advisor) => void` and `onRemove?: (advisor: Advisor) => void` props. When provided, a `MoreHorizontal` actions dropdown appears on each row with "Edit" and "Remove" items — same pattern as the updated `ClientTable`.

---

## Sidebar Navigation Update

Add a "Staff" nav item to `admin-sidebar.tsx` between Clients and Budgets. It is only rendered when `hasPermission(effectiveRole, 'manageStaff')` — i.e., manager only. Use the `UserCog` icon from lucide-react.

```
Dashboard
Clients
Staff          ← new, manager-only
Budgets
Transactions
Analytics
Settings
```

---

## Client Detail Page Update

On `/admin/clients/[id]`, the manager should see a "Reassign Advisor" button in the client header card (next to Edit Client). This opens `ReassignClientDialog` with the current client pre-populated. After confirming, the page re-fetches (or locally updates) `client.advisor` / `client.advisorId` so the UI reflects the change without a full reload.

---

## State Management Approach

This platform is mock-data-only with no backend, so all mutations live in module-level arrays in the `lib/data/` files. The pattern established by the client CRUD work applies here too:

- Pages hold local `useState` copies of the data they display.
- On save/delete/reassign, the page state is updated optimistically.
- Shared helpers (`reassignClient`, `updateClientAdvisor`) keep the two mock stores consistent so that a navigation to another page still shows the updated data within the same browser session.

This is intentionally simple. When a real API is introduced, only the helper functions need to be swapped out — the component interfaces stay unchanged.

---

## Permissions Guard Strategy

All staff management routes check `hasPermission(role, 'manageStaff')` at the component level using `RouteGuard`. Additionally:

- The "Add Staff", "Edit", and "Remove" buttons are conditionally rendered only when the permission is present.
- The `ReassignClientDialog` is only reachable when `hasPermission(role, 'reassignClients')` is true.
- An FA navigating directly to `/admin/staff` is redirected to `/admin` by `RouteGuard`.

This means no staff management surface is reachable by FAs or customers at any level — URL, component, or data.

---

## Build Sequence

The items are ordered so that each step is independently deployable and leaves the build passing at every stage.

1. **Data helpers** — add `reassignClient`, `reassignAllClients`, `updateClientAdvisor`, and the two new permissions. No UI changes yet; build still passes.
2. **`EditStaffDialog`** — new component with no consumers yet.
3. **`ReassignClientDialog`** — new component with no consumers yet.
4. **`BulkReassignDialog`** — new component with no consumers yet.
5. **`StaffTable` update** — add optional `onEdit`/`onRemove` props; existing usages with no props are unaffected.
6. **Sidebar "Staff" nav item** — adds the link; page doesn't exist yet so clicking it returns a 404, but the build passes.
7. **`/admin/staff` list page** — wires up stat cards, `StaffTable`, and "Add Staff" with `EditStaffDialog`.
8. **`/admin/staff/[id]` profile page** — wires up all three dialogs, client roster, and performance panels.
9. **Client detail page "Reassign" button** — small addition to the existing header card.
10. **Build verification** — `pnpm build` exit 0, all pages pre-rendered.

---

## What Is Explicitly Out of Scope Here

- Role-based login switching (already handled by the dev role switcher).
- Case management (a separate feature area).
- Real authentication or API calls.
- Email notifications on reassignment.
- Audit log or history of reassignments.

These can be addressed in later iterations without touching any of the interfaces defined above.
