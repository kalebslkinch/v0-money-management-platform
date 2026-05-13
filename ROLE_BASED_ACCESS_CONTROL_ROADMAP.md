# Role-Based Access Control Implementation Roadmap

## Executive Summary

This document outlines a comprehensive plan for implementing role-based access control (RBAC) across the PMFS Wealth Platform. The system will support three distinct user roles—**Manager**, **Financial Advisor (FA)**, and **Customer**—each with specific access permissions, feature visibility, and data isolation requirements. All role information will be stored in localStorage with automatic initialization on first run.

---

## Part 1: Authentication & Role Management System

### 1.1 LocalStorage User Context

**File**: `lib/auth/user-context.ts` (NEW)

- **Initialization**: On first app load (check `_app.tsx`), if no user role exists in localStorage, automatically create and store a default user with role `"manager"`
- **User Object Structure**:
  ```typescript
  {
    userId: string
    role: "manager" | "fa" | "customer"
    name: string
    email: string
    advisorId?: string (for FA role only, links to their advisor record)
    clientId?: string (for customer role only, links to their client record)
    lastUpdated: timestamp
  }
  ```
- **Development Helper**: Add a localStorage reset function for easy role switching during development
- **Hook Creation**: `hooks/use-user-role.ts` to expose current user context throughout the app

**Conditions to Handle:**
- Initialize on first run vs. subsequent runs
- Validate stored role exists and is valid
- Provide method to programmatically change role (for testing)
- Persist role changes across page refreshes

---

## Part 2: Navigation & Routing Structure

### 2.1 AdminSidebar Navigation (`components/admin/admin-sidebar.tsx`)

**Current Navigation Items:**
- Dashboard
- Clients
- Portfolios
- Transactions
- Analytics
- Settings

**Role-Based Visibility:**

| Item | Manager | FA | Customer |
|------|---------|----|----|
| Dashboard | ✅ Full | ✅ Filtered | ✅ Personal |
| Clients | ✅ All | ✅ Assigned Only | ❌ Hidden |
| Portfolios | ✅ All | ✅ Assigned Clients | ✅ Personal |
| Transactions | ✅ All | ✅ Assigned Clients | ✅ Personal |
| Analytics | ✅ Full Firm-Wide | ✅ Personal Metrics | ❌ Hidden |
| Settings | ✅ Full Admin | ✅ Personal Only | ✅ Personal Only |

**Conditional Logic Locations:**
- `navigationItems` array filtering based on user role
- Individual menu item rendering with conditional display
- Active state highlighting should respect role-filtered items
- Sidebar collapse/expand state should be role-agnostic but content-aware

**Implementation Notes:**
- Remove/hide navigation items entirely for restricted roles (not just disable)
- Update active route detection to account for filtered navigation
- Maintain consistent sidebar styling across all roles

---

## Part 3: Dashboard Page & Components

### 3.1 Main Dashboard (`pages/admin/index.tsx` & `components/admin/dashboard-grid.tsx`)

**Role-Based Dashboard Variations:**

**Manager Dashboard:**
- Full widget flexibility
- Customizable layout
- Widgets showing: firm-wide stats, all client portfolios, team performance, market analysis
- Access to all underlying data

**FA Dashboard:**
- Widget grid for personal metrics
- Widgets showing: assigned clients portfolio, personal performance, client activity, personal transactions
- Cannot see other advisors' data
- Cannot access widget customization (optional - could allow but filtered to their data)

**Customer Dashboard:**
- Simple personalized view
- Widgets showing: portfolio balance, recent transactions, asset allocation, performance metrics
- Only their own data visible
- Minimal customization options

**Conditional Implementation Points:**

1. **`DashboardGrid` Component** (`components/admin/dashboard-grid.tsx`):
   - Filter `sortedWidgets` based on role
   - Hide edit mode controls for customers
   - Disable drag-and-drop for customers
   - Pass role-specific data to each widget

2. **Widget Registry** (`lib/dashboard/widget-registry.tsx`):
   - Create role-aware widget filtering
   - Some widgets available only to manager (e.g., "All Clients Overview")
   - Some widgets filtered for FA (e.g., "Team Performance" → "My Performance")
   - Some widgets simplified for customers (e.g., "Portfolio" → "My Portfolio")

3. **Individual Widgets**:
   - Stats cards: Show only accessible data
   - Charts: Filter data based on role
   - Tables: Show only filtered rows/columns based on role
   - Action buttons: Hide edit/manage buttons for customers

4. **DashboardToolbar** (`components/admin/dashboard-toolbar.tsx`):
   - Hide "Add Widget" button for customers
   - Hide layout customization options for customers
   - Show role-appropriate options for FA

**Data Flow Concerns:**
- Ensure widgets receive role context
- Mock data filtering happens at component level
- Future API calls should be filtered server-side

---

## Part 4: Clients Management Section

### 4.1 Clients List Page (`pages/admin/clients/index.tsx` & `components/admin/client-table.tsx`)

**Visibility & Access:**

| Feature | Manager | FA | Customer |
|---------|---------|----|----|
| Clients Page | ✅ Full Access | ✅ Assigned Only | ❌ Not Visible |
| View All Clients | ✅ Yes | ❌ No | ❌ N/A |
| Add Client Button | ✅ Yes | ❌ No | ❌ N/A |
| Client Table | ✅ All Clients | ✅ Assigned Clients | ❌ N/A |
| Edit Client Details | ✅ Yes | ⚠️ Assigned Only | ❌ N/A |
| Delete Client | ✅ Yes | ❌ No | ❌ N/A |
| Export Client Data | ✅ Yes | ✅ Assigned Only | ❌ N/A |

**Conditional Implementation Points:**

1. **Page Route Protection** (`pages/admin/clients/index.tsx`):
   - Redirect customer role to dashboard
   - Show "Unauthorized" message for non-managers/FA attempting full access
   - Navigate FA directly to their assigned clients (filter applied)

2. **ClientTable Component** (`components/admin/client-table.tsx`):
   - Filter data based on role
   - For FA: Use `advisorId` from user context to filter `mockClients`
   - Show/hide columns based on role (e.g., advisor name hidden for FA)
   - Conditional row actions (edit/delete buttons based on role)
   - Pagination should work on filtered data

3. **Quick Stats Section**:
   - "Total Clients": Show all for manager, count assigned for FA
   - "Active Clients": Filter appropriately
   - "Total AUM": Aggregate based on visible clients only

4. **Add Client Button**:
   - Display only for manager
   - Opens modal/form (future implementation)
   - FA cannot create new clients

5. **Search/Filter Functionality**:
   - Search should only look within accessible clients
   - Filter dropdowns (status, risk level, etc.) work on filtered dataset

---

### 4.2 Individual Client Detail Page (`pages/admin/clients/[id].tsx`)

**Access Control Logic:**

| Operation | Manager | FA | Customer |
|-----------|---------|----|----|
| View Own Profile | ✅ Yes | ✅ Yes | ✅ Yes |
| View Assigned Client | ✅ Yes | ✅ Yes (if assigned) | ❌ No |
| View Any Client | ✅ Yes | ❌ No | ❌ No |
| Edit Client Info | ✅ Yes | ⚠️ Assigned Only | ❌ No |
| View Client Portfolio | ✅ Yes | ✅ (if assigned) | ✅ (own only) |
| View Client Transactions | ✅ Yes | ✅ (if assigned) | ✅ (own only) |
| View Client Notes/Cases | ✅ Yes | ✅ (if assigned) | ✅ (limited) |

**Conditional Implementation Points:**

1. **Route Access Control** (`pages/admin/clients/[id].tsx`):
   - Extract client ID from URL params
   - Check if current user has access to this client
   - Manager: Always allow
   - FA: Check if `client.advisorId === currentUser.advisorId`
   - Customer: Only allow if `client.id === currentUser.clientId`
   - Redirect to unauthorized page if access denied

2. **Profile Section**:
   - Show full details for manager
   - Show details for FA but restrict edit capabilities
   - Show limited details for customer (likely viewing self)
   - Hide advisor assignment dropdown for FA
   - Hide internal notes/flags from customer view

3. **Portfolio Section**:
   - Show full portfolio for manager and FA
   - Show portfolio for customer (their own)
   - Hide rebalancing recommendations from customer (optional)

4. **Transactions Section**:
   - Show all transactions for manager
   - Show transactions for FA if assigned
   - Show transactions for customer (their own only)
   - Hide internal transaction notes from customer

5. **Action Buttons**:
   - "Edit Client" button: Manager only
   - "Manage Portfolio" button: Manager and FA (if assigned)
   - "View Cases" button: Manager and FA (if assigned), customer sees related items
   - "Export Data" button: Manager and FA (if assigned)
   - Contact buttons (email/phone): Available to all but behavior differs

6. **Advisor Assignment Section**:
   - Show current advisor for all roles
   - Manager can reassign advisor
   - FA sees own name (read-only)
   - Customer sees their advisor info (read-only)

---

## Part 5: Portfolios Section

### 5.1 Portfolios List Page (`pages/admin/portfolios.tsx`)

**Data Visibility:**

| Data Element | Manager | FA | Customer |
|---------|---------|----|----|
| All Portfolios | ✅ Yes | ❌ No | ❌ No |
| Assigned Client Portfolios | ✅ Yes | ✅ Yes | ❌ No |
| Own Portfolio | ✅ Yes | ✅ Yes | ✅ Yes |
| Portfolio Performance Charts | ✅ All | ✅ Assigned | ✅ Own |
| Rebalancing Recommendations | ✅ Yes | ✅ Yes | ❌ No |
| Benchmark Comparison | ✅ Yes | ✅ Yes | ✅ Yes |

**Conditional Implementation Points:**

1. **Page Route Protection**:
   - Customer accessing `/admin/portfolios` should redirect to dashboard or personal portfolio view

2. **Portfolio List Filtering**:
   - Manager: Shows all portfolios from all clients
   - FA: Shows only portfolios of assigned clients
   - Customer: Redirect to personal portfolio (maybe a sub-route like `/portfolio` without admin prefix)

3. **Summary Stats**:
   - "Total AUM": Manager shows all, FA shows assigned clients sum, Customer shows personal
   - Charts: Filtered based on role
   - Client names in table: All visible for manager, own for FA, hidden for customer

4. **Rebalancing Widget**:
   - Show recommendations for manager (all clients)
   - Show recommendations for FA (assigned clients)
   - Hide from customer or show simple version

5. **Export/Download**:
   - Manager: Full export with all data
   - FA: Export only assigned client portfolios
   - Customer: Export own portfolio

---

## Part 6: Transactions Section

### 6.1 Transactions Page (`pages/admin/transactions.tsx`)

**Access Control:**

| Feature | Manager | FA | Customer |
|---------|---------|----|----|
| View All Transactions | ✅ Yes | ❌ No | ❌ No |
| View Assigned Transactions | ✅ Yes | ✅ Yes | ❌ No |
| View Own Transactions | ✅ Yes | ✅ Yes | ✅ Yes |
| Filter by Client | ✅ All Clients | ✅ Assigned Clients | ❌ Self Only |
| Filter by Type | ✅ Yes | ✅ Yes | ✅ Yes |
| Modify Transaction | ✅ Yes (admin) | ✅ Limited | ❌ No |
| Approve Transaction | ✅ Yes | ❌ No | ❌ No |
| Download Report | ✅ Yes | ✅ Assigned | ✅ Own |

**Conditional Implementation Points:**

1. **Transaction List Filtering**:
   - Manager: Show all transactions from all clients
   - FA: Filter transactions where client is in their assigned clients list
   - Customer: Filter transactions where clientId matches their clientId

2. **Table Columns**:
   - Manager: All columns visible (client name, type, amount, advisor, status, etc.)
   - FA: All columns visible except advisor name (is self)
   - Customer: Limited columns (type, amount, date, status, description)

3. **Search/Filter Section**:
   - "Client" filter: Dropdown of all clients for manager, assigned clients for FA, disabled for customer
   - "Type" filter: Available to all
   - "Status" filter: Available to all
   - "Date Range" filter: Available to all

4. **Transaction Details/Expansion**:
   - Manager: Full details visible
   - FA: Full details for assigned clients
   - Customer: Limited details (hide advisor notes, internal status flags)

5. **Action Buttons**:
   - "Approve" (if pending): Manager only
   - "Download" (receipt/confirmation): All roles but filtered to their data
   - "Edit" (if allowable): Manager and FA (if assigned) - customer never
   - "Flag for Review": Manager and FA (if assigned)

---

## Part 7: Analytics Section

### 7.1 Analytics Dashboard (`pages/admin/analytics.tsx`)

**Data Visibility:**

| Metric | Manager | FA | Customer |
|---------|---------|----|----|
| Firm-wide Revenue | ✅ Yes | ❌ No | ❌ No |
| Personal Revenue/Fees | ✅ (personal) | ✅ (own) | ❌ No |
| Total Clients Growth | ✅ All | ❌ No | ❌ No |
| Personal Client Growth | ✅ (personal) | ✅ (own) | ❌ No |
| AUM Distribution | ✅ All | ❌ No | ❌ No |
| Personal AUM | ✅ (personal) | ✅ (own) | ❌ No |
| Performance vs Benchmark | ✅ All | ✅ Personal | ✅ Personal |
| Risk Analysis | ✅ Firm-wide | ✅ Assigned Clients | ✅ Own Portfolio |

**Conditional Implementation Points:**

1. **Page Route Protection**:
   - Customer accessing `/admin/analytics` should redirect to dashboard
   - Show unauthorized message

2. **KPI Summary Cards**:
   - Manager: Firm-wide metrics (total revenue, total AUM, client count, team metrics)
   - FA: Personal metrics (personal revenue, assigned clients count, personal AUM, performance)
   - Customer: N/A (page not accessible)

3. **Charts & Graphs**:
   - **Revenue Chart**: Manager shows all, FA shows personal only
   - **Client Growth Chart**: Manager shows total, FA shows personal assigned client growth
   - **AUM Distribution Pie Chart**: Manager shows all clients, FA shows only assigned
   - **Risk Distribution**: Manager shows firm-wide risk, FA shows assigned clients risk
   - **Performance Charts**: Manager shows all, FA shows personal performance

4. **Data Aggregations**:
   - All calculations should filter based on role and accessible data
   - For FA: Use their advisorId to filter client data
   - Time period selectors work on filtered data

5. **Export Functionality**:
   - Manager: Export all analytics
   - FA: Export personal analytics
   - Timestamp included in exports

---

## Part 8: Settings & Profile

### 8.1 Settings Page (`pages/admin/settings.tsx`)

**Configuration Access:**

| Setting | Manager | FA | Customer |
|---------|---------|----|----|
| Personal Profile | ✅ Full Edit | ✅ Full Edit | ✅ Full Edit |
| Change Password | ✅ Yes | ✅ Yes | ✅ Yes |
| Change Email | ✅ Yes | ✅ Yes | ✅ Yes |
| Notification Settings | ✅ Yes | ✅ Yes | ✅ Yes |
| Two-Factor Auth | ✅ Yes | ✅ Yes | ✅ Yes |
| API Keys (if applicable) | ✅ Yes | ❌ No | ❌ No |
| Team Management | ✅ Yes | ❌ No | ❌ No |
| Firm Settings | ✅ Yes | ❌ No | ❌ No |
| Advisor Assignment | ✅ Only Edit | ❌ View Only | ⚠️ View Only |
| User Role Management | ✅ Yes | ❌ No | ❌ No |

**Conditional Implementation Points:**

1. **Profile Section**:
   - All roles can edit their own profile
   - Show name, email, phone, photo
   - Manager sees "Role: Manager" (read-only)
   - FA sees "Role: Financial Advisor" and "Assigned Clients" count (read-only)
   - Customer sees "Role: Customer" (read-only)

2. **Account Settings**:
   - Password change: Available to all
   - Email change: Available to all (with verification)
   - Phone change: Available to all
   - Notification preferences: Available to all

3. **Security Settings**:
   - Two-factor authentication: Available to all
   - Active sessions: Manager can manage all, FA and Customer manage own
   - Login history: Show personal history for all roles

4. **Advanced Settings** (Manager only):
   - API Keys section: Manager only
   - Webhook configurations: Manager only
   - Team member management: Manager only
   - Firm settings (branding, compliance, etc.): Manager only
   - User role assignments: Manager only (future feature)

5. **Advisor Settings** (FA only):
   - Commission tracking: FA can view personal
   - Target settings: FA can view personal
   - Client assignment list: FA can view own assignments (read-only in settings, editable by manager)

6. **Development Helper**:
   - Add a "Developer Settings" section in Manager-only area
   - Include "Switch User Role" button for testing different roles locally
   - Display current role and localStorage user object for debugging

---

## Part 9: Header & Navigation Components

### 9.1 AdminHeader (`components/admin/admin-header.tsx`)

**Conditional Display:**

1. **Title/Page Header**:
   - Dynamic based on current page (no role change needed)
   - Maintain consistency across roles

2. **Search Bar**:
   - Manager: Search across all data (clients, transactions, portfolios)
   - FA: Search limited to assigned client data
   - Customer: Search limited to own data
   - Implement role-aware search filtering

3. **Notifications Bell**:
   - Manager: Firm-wide notifications (large deposits, compliance alerts, team alerts)
   - FA: Personal and assigned client notifications
   - Customer: Account and portfolio notifications
   - Filter notification list based on role

4. **Live Indicator**:
   - Show for all roles (indicates system status)
   - No role-based changes needed

5. **User Menu/Dropdown** (if added):
   - All roles see "Profile" and "Settings"
   - Only manager sees "Admin Panel" or additional admin links
   - "Logout" / "Switch Role" (dev mode) available to all

---

## Part 10: Data Components & Tables

### 10.1 Client Table (`components/admin/client-table.tsx`)

**Column Visibility:**

| Column | Manager | FA | Customer |
|---------|---------|----|----|
| Client Name | ✅ | ✅ | ❌ |
| Email | ✅ | ✅ | ❌ |
| Phone | ✅ | ✅ | ❌ |
| Portfolio Value | ✅ | ✅ | ❌ |
| Risk Level | ✅ | ✅ | ❌ |
| Status | ✅ | ✅ | ❌ |
| Joined Date | ✅ | ✅ | ❌ |
| Last Activity | ✅ | ✅ | ❌ |
| Advisor Name | ✅ | ❌ | ❌ |
| Actions | ✅ (All) | ✅ (Limited) | ❌ |

**Conditional Implementation Points:**

1. **Column Rendering**:
   - Use role context to conditionally render columns
   - Skip "Advisor Name" column for FA view
   - Table component receives role prop for dynamic column configuration

2. **Row Filtering**:
   - Manager: All rows visible
   - FA: Filter rows where `advisorId` matches current user's `advisorId`
   - Customer: Not applicable (doesn't see this table)

3. **Action Buttons/Icons**:
   - Manager: View, Edit, Delete, Export buttons
   - FA: View and Edit (if assigned) buttons, no Delete
   - Customer: No action buttons

4. **Sorting & Pagination**:
   - Sorting: Available to all, sorts filtered data
   - Pagination: Works on filtered dataset
   - Row count: Shows accurate count for filtered data

---

### 10.2 Transaction Table

**Similar to Client Table:**
- Column filtering based on role
- Row filtering (client-based)
- Action buttons conditional on role
- Status badges visible to all (but context differs)

---

## Part 11: Widget System Integration

### 11.1 Widget Availability by Role

**Widget Registry (`lib/dashboard/widget-registry.tsx`):**

Create role-based widget configurations:

```
MANAGER WIDGETS:
- All Clients Overview
- Team Performance
- Firm AUM Distribution
- Revenue Trends
- Compliance Status
- Portfolio Allocation (All)
- Top Clients by AUM
- Activity Feed (Firm-wide)

FA WIDGETS:
- My Clients Overview
- My Performance
- Assigned Clients AUM
- My Revenue
- My Client Portfolio Allocation
- Recent Client Activity
- Performance vs Benchmark (Personal)

CUSTOMER WIDGETS:
- Portfolio Overview
- Asset Allocation
- Performance Chart
- Recent Transactions
- Holdings
- Performance vs Benchmark (Personal)
```

**Implementation:**
- Widget wrapper receives role context
- Filter available widgets in widget picker
- Pass role-specific data to widget rendering
- Hide edit/customization for customers

---

## Part 12: Mock Data Filtering

### 12.1 Data Access Layer

**For each mock data source:**
- `mockClients`: Filter by manager (all), FA (assigned), customer (self)
- `mockTransactions`: Filter by role and client access
- `mockPortfolios`: Filter by role and client access
- `mockAdvisors`: Filter visibility (manager sees all, FA sees self, customer sees own advisor)
- `mockAnalytics`: Aggregate based on accessible data

**Implementation Pattern:**
```typescript
// Create utility functions
export function getVisibleClients(userRole: string, userId: string, advisorId?: string) {
  if (userRole === 'manager') return mockClients
  if (userRole === 'fa') return mockClients.filter(c => c.advisorId === advisorId)
  if (userRole === 'customer') return [] // not used for customer
}

export function getVisibleTransactions(userRole: string, userId: string, clientId?: string, advisorId?: string) {
  // similar filtering logic
}
```

---

## Part 13: Error Handling & Access Denied States

### 13.1 Unauthorized Access Handling

**Implementation Points:**
1. Route guards in `_app.tsx` or individual page files
2. Redirect unauthorized users to:
   - Dashboard (for same-section access denied)
   - Unauthorized page (for major section denial)
   - Login/home page (for critical security issues)

3. Visual feedback:
   - Toast notification explaining denial
   - Inline message component
   - Empty states for no data access

**Locations needing protection:**
- `/admin/clients` - Deny customer
- `/admin/analytics` - Deny customer
- `/admin/clients/[id]` - Verify ownership/assignment
- `/admin` dashboard - Show role-specific data

---

## Part 14: Local Storage & Session Management

### 14.1 User Role Context Setup

**File Structure Needed:**
```
lib/
  auth/
    user-context.ts        (NEW - User object & defaults)
    role-permissions.ts    (NEW - Role capability matrix)

hooks/
  use-user-role.ts         (NEW - Hook to access user context)
  use-role-permissions.ts  (NEW - Helper hook for permission checks)

pages/
  _app.tsx                 (MODIFY - Initialize user on first load)
```

**Initialization Logic (`_app.tsx`):**
```typescript
useEffect(() => {
  const storedUser = localStorage.getItem('pmfs_user')
  if (!storedUser) {
    const defaultUser = {
      userId: 'manager-default',
      role: 'manager',
      name: 'James Wilson',
      email: 'james.wilson@pmfs.com',
    }
    localStorage.setItem('pmfs_user', JSON.stringify(defaultUser))
  }
}, [])
```

**Development Mode Helper:**
- Add ability to programmatically change role via localStorage
- Create debug panel accessible from settings (manager only)
- Log role changes to console

---

## Part 15: Future Authentication Integration Points

These conditionals will make API integration easier:

1. **Backend API Calls**: Will naturally filter data server-side using user role
2. **API Endpoints**: Can use role header or token claim to filter
3. **Database Queries**: Server-side filtering ensures data security
4. **Caching**: Role-specific cache keys

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create user context and localStorage setup
- [ ] Create user role hook
- [ ] Create role permissions utility
- [ ] Initialize user on first app load
- [ ] Create developer settings panel

### Phase 2: Navigation & Routing
- [ ] Update AdminSidebar with role-based navigation
- [ ] Add route guards in _app.tsx or page files
- [ ] Create unauthorized page component
- [ ] Test navigation access for each role

### Phase 3: Dashboard & Main Pages
- [ ] Update dashboard page routing
- [ ] Filter dashboard widgets by role
- [ ] Update Clients page access control
- [ ] Update Portfolios page access control
- [ ] Update Transactions page access control
- [ ] Update Analytics page access control

### Phase 4: Components & Data
- [ ] Filter client table by role
- [ ] Filter transaction table by role
- [ ] Update mock data filtering utilities
- [ ] Update notifications by role
- [ ] Update search functionality by role

### Phase 5: Settings & UX
- [ ] Update Settings page by role
- [ ] Add role indicator in header
- [ ] Update profile sections by role
- [ ] Add role switching for dev (manager only)

### Phase 6: Testing & Polish
- [ ] Test full user flow for each role
- [ ] Test edge cases (unauthorized access attempts)
- [ ] Verify data isolation between roles
- [ ] Performance testing with filters
- [ ] Document any behavioral differences

---

## Technical Considerations

### Performance
- Filter mock data early in component tree
- Memoize permission checks
- Avoid re-filtering on every render
- Consider caching filtered datasets during session

### Security
- Always filter data in components (frontend)
- Later, enforce filtering server-side
- Never expose unauthorized data in props
- Log access attempts in dev mode

### Maintainability
- Keep role logic centralized in utility functions
- Use consistent permission checking patterns
- Document role-specific features
- Create reusable "ProtectedComponent" wrapper

### Testing
- Test each role's access independently
- Test unauthorized access scenarios
- Test role-switching functionality
- Test edge cases (deleted clients, expired data, etc.)

---

## Summary of Conditional Points by File

### Files Needing Modifications (Phase 1-3)

| File | Conditionals | Complexity |
|------|--------------|------------|
| `_app.tsx` | Initialize user role, role-based layout routing | Medium |
| `admin-sidebar.tsx` | Filter navigation items by role | Medium |
| `pages/admin/index.tsx` | Filter dashboard widgets, show role-specific title | Low |
| `pages/admin/clients/index.tsx` | Route guard, filter client list, hide add button | Medium |
| `pages/admin/clients/[id].tsx` | Route guard (access check), filter displayed fields | High |
| `pages/admin/portfolios.tsx` | Route guard, filter portfolio list | Low |
| `pages/admin/transactions.tsx` | Route guard, filter transactions, hide edit buttons | Medium |
| `pages/admin/analytics.tsx` | Route guard, filter metrics/charts | High |
| `pages/admin/settings.tsx` | Show/hide settings sections by role | Low |
| `admin-header.tsx` | Filter notifications, show role-aware search | Low |
| `client-table.tsx` | Filter rows/columns by role, hide actions | Medium |
| `widget-registry.tsx` | Filter available widgets by role | High |

### New Files to Create

1. `lib/auth/user-context.ts` - User object structure and defaults
2. `lib/auth/role-permissions.ts` - Permission matrix and helpers
3. `hooks/use-user-role.ts` - Hook to access user context
4. `components/auth/role-guard.tsx` - Component wrapper for route protection
5. `lib/utils/role-filters.ts` - Data filtering utilities by role

---

## Notes for Development

- Start with the "manager" role as baseline (current state)
- Add FA role restrictions gradually
- Add customer role last (most restricted)
- Use React Context to avoid prop drilling
- Consider Theme Provider integration for role-specific themes (future)
- Add console logging for role changes in development
- Create a role-switcher component for testing (development only)

