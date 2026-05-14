# Team-Level Anonymised Insights: Design Essay

_Date: 13 May 2026_

---

## 1. Why This Matters

The platform currently has three distinct roles — **Manager**, **Financial Advisor (FA)**, and **Customer**. Customers see their own PFMS (Personal Financial Management System) snapshot: weekly budgets, category spend, projected overruns. Advisors see their own book of clients. Managers see everything.

The gap is **upward synthesis**: nobody above the individual customer level can see behavioural patterns across the client base in a way that drives business decisions. A manager cannot answer:

- "Which spending category is causing the most budget overruns across our team this week?"
- "Are high-net-worth clients more or less adherent to their food budgets than mid-tier clients?"
- "Which advisor's book shows the healthiest budget discipline overall?"
- "Is transport spend trending up month-on-month across the portfolio?"

Without this, the platform is a record-keeping tool. With it, it becomes a **business intelligence layer** that identifies commercial risk (clients burning savings), engagement opportunities (proactive budget coaching), and operational priorities (which advisor needs to focus on re-budgeting conversations).

---

## 2. Current State Assessment

### 2a. PFMS Data Coverage: Critical Gap

The PFMS snapshot store (`lib/data/mock-pfms.ts`) contains **only one real snapshot**: `CLT001` (Sarah Mitchell). All twelve clients fall back to her data through the fallback function:

```ts
export function getPFMSSnapshotForCustomer(customerId: string): PFMSCustomerSnapshot {
  return snapshotsByCustomerId[customerId] ?? snapshotsByCustomerId.CLT001
}
```

This means the analytics page — which iterates over all visible clients and aggregates their PFMS snapshots — is computing totals from twelve copies of Sarah Mitchell's data. Every chart on the analytics page is therefore synthetic noise, not signal.

### 2b. Analytics Page: Correct Intent, Wrong Data

`pages/admin/analytics.tsx` has the right analytical structure:
- Aggregates weekly budgets and spend across visible clients
- Detects clients "over pace" (projected > budget)
- Computes monthly cash flow from `mockTransactions`
- Identifies top spending categories

The logic is sound. The data behind it is hollow because only CLT001 has a real snapshot.

### 2c. Role-Filtered Visibility: Correct

`lib/utils/role-filters.ts` correctly scopes data by role. Managers see all 12 clients; FAs see only their book (ADV001 → CLT001, CLT003, CLT005, CLT007, CLT009, CLT011; ADV002 → CLT002, CLT004, CLT006, CLT008, CLT010, CLT012). This is the correct trust boundary for anonymised aggregations.

### 2d. No Team-Level Aggregation Layer

There is no utility, type, or UI component that:
- Groups clients into anonymised cohorts
- Calculates advisor-team-level spend trends
- Compares spending behaviour across risk tiers
- Shows week-over-week or month-over-month category trends

---

## 3. Anonymisation Model

"Anonymised" in this context means: **patterns visible, identities obscured**. We are not serving this data to external regulators; we are serving it to internal staff (managers and FAs) who have legitimate access to the underlying records. Therefore:

1. **Manager view**: Can see advisor-team-level breakdowns (e.g., "ADV001's book") without naming individual clients unless drilling down into the client table which already reveals them.
2. **FA view**: Sees their own book aggregated — no individual names in the insight cards, only cohort labels like "3 of your 6 clients", "your high-risk clients", "your essential-spend cohort".
3. **No raw PII in trend charts**: Charts show aggregated numbers (average spend per category, percentage over budget) not per-client values.
4. **Cohort labels, not names**: Instead of "Sarah Mitchell spent £84 on groceries", the system shows "Low-risk cohort avg grocery spend: £91/week".

This satisfies GDPR Article 89 (statistical purposes) and the platform's own Privacy Notice by design — the analytics surface doesn't create a new data flow, it summarises already-accessible data.

---

## 4. Relational Data Design

### 4a. What Makes Client Data Relational

Each client in this platform has multiple linked records:

| Record | Source | Link Field |
|---|---|---|
| Client profile | `mock-clients.ts` | `id` |
| PFMS weekly snapshot | `mock-pfms.ts` | `customerId` |
| Portfolio holdings | `mock-portfolios.ts` | `clientId` |
| Advisor assignment | `mock-advisors.ts` | `clientIds[]` |
| Cases | `mock-cases.ts` | `clientId` |
| Transactions | `mock-transactions.ts` | `clientId` |

The PFMS snapshot must be **consistent with the client's financial profile**:
- A client with `portfolioValue: 7,500,000` (Thomas Anderson, CLT010) should have a higher `weeklyIncome` and `availableToSpend` than CLT011 (Patricia Moore, `portfolioValue: 560,000`).
- A `high` risk client should show more volatile, discretionary-heavy spending (more food delivery, fewer essentials as proportion).
- A `low` risk client should show more conservative, essentials-heavy spending.
- A `pending` status client (CLT005, Amanda Foster) should show lower budgets reflecting onboarding uncertainty.
- An `inactive` client (CLT008, Christopher Lee) should show no recent transactions and a stale snapshot.

### 4b. Income Scaling

We derive weekly income from portfolio value as a rough proxy:

| Portfolio Range | Weekly Income Range |
|---|---|
| < £1M | £600–£900 |
| £1M–£3M | £900–£1,600 |
| £3M–£6M | £1,600–£2,800 |
| £6M+ | £2,800–£5,000 |

Fixed commitments scale with income (typically 40–55%). Available to spend is the remainder.

### 4c. Category Budget Scaling

Category budgets scale with `availableToSpend`. Risk level modifies the distribution:
- **Low risk** clients: higher grocery/household ratio, lower food delivery/entertainment.
- **Moderate risk** clients: balanced distribution.
- **High risk** clients: more discretionary spend (food delivery, subscriptions), less household.

### 4d. Business Trend Analysis: Required Metrics

The following team-level insights are needed:

**Budget Health Score** — percentage of team on-track (projected ≤ budget) per advisor
**Category Pressure Index** — which categories are most over-budget across the team
**Income vs Spend Ratio** — team-average available-to-spend utilisation
**Cohort Comparison** — how risk tiers differ in budget adherence
**Week-over-Week Trend** — simulated multi-week category spend history
**Advisor Team Comparison** — ADV001 book vs ADV002 book anonymised metrics

---

## 5. Chart Strategy

### 5a. Existing Charts (to be fixed via data)
- **Cash Movement by Month** (BarChart) — already correct logic, needs realistic transaction data
- **Top Spend Categories** (LineChart) — needs multi-client data to be meaningful

### 5b. New Charts to Add

1. **Budget Adherence by Cohort** (BarChart grouped by risk level) — shows % on-track per cohort
2. **Category Pressure Heatmap** (BarChart horizontal) — shows overspend ratio per category across team
3. **Team Budget Health Over Weeks** (LineChart) — 6-week rolling budget adherence percentage per advisor team
4. **Income Utilisation Distribution** (area chart or simple metric cards) — what fraction of available-to-spend is consumed
5. **Advisor Team Comparison** (2-bar grouped chart) — ADV001 vs ADV002 anonymised spend health scores

### 5c. Chart Data Sources

All new charts derive from:
- The expanded PFMS snapshot data (computed at page render time)
- The `mockClients` records (for cohort classification)
- The `mockAdvisors` records (for team grouping)

No new mock file is needed for chart data — everything is computed from existing relational sources. This ensures that if a real API were wired in, the same derivation logic would work.

---

## 6. Implementation Plan

### Step 1: Expand PFMS snapshots
Add unique, realistic, relationally-consistent PFMS snapshots for CLT002–CLT012 in `mock-pfms.ts`. Each snapshot must:
- Scale income to portfolio value
- Scale categories to income  
- Vary spending patterns by risk level
- Reflect client status (inactive client has stale/zero spend)

### Step 2: Add team insight types
In `lib/types/admin.ts`, add:
- `TeamBudgetSummary` — per-advisor aggregation
- `CohortBudgetSummary` — per risk-tier aggregation
- `CategoryTrend` — week-over-week category spend trend point
- `TeamInsightData` — top-level shape consumed by the UI

### Step 3: Add computation utility
Create `lib/utils/team-insights.ts` with pure functions that take the relational data (clients + snapshots) and return the derived insight shapes. This keeps the React component clean.

### Step 4: Update analytics page
Add a new **"Team Insights"** section below the existing charts in `analytics.tsx` with:
- Manager-only or FA-scoped cards
- Advisor team comparison chart  
- Cohort budget adherence chart
- Category pressure bar chart
- Budget health trend line
- Anonymised key metrics row

---

## 7. Privacy Safeguards in Implementation

- No individual client name appears in any insight card or chart
- Chart data uses cohort labels: "Low Risk", "Moderate Risk", "High Risk", "ADV001 Team", "ADV002 Team"
- A Privacy Notice callout is displayed on the insights section: "Insights show aggregated, anonymised patterns. No individual is identified."
- FAs only see insights for their own book (enforced by `getVisibleClients` scoping)
- The existing `RouteGuard` already restricts the analytics page to `manager` and `fa` roles

---

## 8. Expected Outcomes

After implementation:
- All 12 clients have unique, realistic PFMS snapshots consistent with their financial profile
- The analytics page shows accurate aggregate data (not 12× CLT001)
- Managers can compare advisor teams' budget health at a glance
- FAs can spot which spending categories need attention in their book without singling out clients
- Business trend analysis is possible: category pressure, cohort adherence, income utilisation
- All charts are populated with genuine relational data rather than fallback duplicates
