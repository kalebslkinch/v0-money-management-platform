/**
 * team-insights.ts
 *
 * Pure computation layer that derives anonymised team-level insights from the
 * relational data: clients → PFMS snapshots → advisor assignments.
 *
 * No PII (names, emails) is included in the returned shapes — only cohort
 * labels, counts, and aggregated financial metrics.
 */

import { mockClients } from '@/lib/data/mock-clients'
import { mockAdvisors } from '@/lib/data/mock-advisors'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import type {
  TeamInsightData,
  CohortBudgetSummary,
  CategoryPressurePoint,
  TeamHealthTrendPoint,
} from '@/lib/types/admin'
import type { CurrentUser } from '@/lib/auth/user-context'
import { getVisibleClients } from '@/lib/utils/role-filters'

// ─── Helper: derive cohort budget summary ────────────────────────────────────

function buildCohortSummary(label: string, clientIds: string[]): CohortBudgetSummary {
  if (clientIds.length === 0) {
    return {
      label,
      clientCount: 0,
      onTrackCount: 0,
      onTrackPct: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalProjected: 0,
      avgIncomeUtilisation: 0,
    }
  }

  let totalBudget = 0
  let totalSpent = 0
  let totalProjected = 0
  let onTrackCount = 0
  let totalIncomeUtilisation = 0

  for (const id of clientIds) {
    const snapshot = getPFMSSnapshotForCustomer(id)
    const clientBudget = snapshot.categories.reduce((s, c) => s + c.weeklyBudget, 0)
    const clientSpent = snapshot.categories.reduce((s, c) => s + c.spent, 0)
    const clientProjected = snapshot.categories.reduce((s, c) => s + c.projectedSpend, 0)

    totalBudget += clientBudget
    totalSpent += clientSpent
    totalProjected += clientProjected

    if (clientProjected <= clientBudget) {
      onTrackCount++
    }

    // Income utilisation: how much of disposable spend is consumed (by projection)
    if (snapshot.availableToSpend > 0) {
      totalIncomeUtilisation += (clientProjected / snapshot.availableToSpend) * 100
    }
  }

  return {
    label,
    clientCount: clientIds.length,
    onTrackCount,
    onTrackPct: Math.round((onTrackCount / clientIds.length) * 100),
    totalBudget: Math.round(totalBudget),
    totalSpent: Math.round(totalSpent),
    totalProjected: Math.round(totalProjected),
    avgIncomeUtilisation: Math.round(totalIncomeUtilisation / clientIds.length),
  }
}

// ─── Helper: derive category pressure ────────────────────────────────────────

function buildCategoryPressure(clientIds: string[]): CategoryPressurePoint[] {
  const categoryMap: Record<string, { budget: number; projected: number; overCount: number }> = {}

  for (const id of clientIds) {
    const snapshot = getPFMSSnapshotForCustomer(id)
    for (const cat of snapshot.categories) {
      if (!categoryMap[cat.label]) {
        categoryMap[cat.label] = { budget: 0, projected: 0, overCount: 0 }
      }
      categoryMap[cat.label].budget += cat.weeklyBudget
      categoryMap[cat.label].projected += cat.projectedSpend
      if (cat.projectedSpend > cat.weeklyBudget) {
        categoryMap[cat.label].overCount++
      }
    }
  }

  return Object.entries(categoryMap)
    .map(([category, { budget, projected, overCount }]) => ({
      category,
      totalBudget: Math.round(budget),
      totalProjected: Math.round(projected),
      overspendRatio: budget > 0 ? Math.round(((projected - budget) / budget) * 1000) / 10 : 0,
      overBudgetCount: overCount,
    }))
    .sort((a, b) => b.overspendRatio - a.overspendRatio)
}

// ─── Helper: build 6-week trend ───────────────────────────────────────────────

function buildHealthTrend(
  adv001Ids: string[],
  adv002Ids: string[],
): TeamHealthTrendPoint[] {
  // All snapshots carry a `history` array of 6 weekly entries
  const WEEKS = ['Apr 8', 'Apr 15', 'Apr 22', 'Apr 29', 'May 6', 'May 13']

  return WEEKS.map((weekLabel, weekIndex) => {
    function teamOnTrackPct(ids: string[]): number {
      if (ids.length === 0) return 0
      let onTrack = 0
      for (const id of ids) {
        const snapshot = getPFMSSnapshotForCustomer(id)
        const histEntry = snapshot.history?.[weekIndex]
        if (!histEntry) continue
        const budget = Object.values(histEntry.categories).reduce((s, c) => s + c.budget, 0)
        const spent = Object.values(histEntry.categories).reduce((s, c) => s + c.spent, 0)
        if (spent <= budget) onTrack++
      }
      return Math.round((onTrack / ids.length) * 100)
    }

    const adv001Pct = teamOnTrackPct(adv001Ids)
    const adv002Pct = teamOnTrackPct(adv002Ids)
    const allIds = [...adv001Ids, ...adv002Ids]
    const overallPct = allIds.length > 0
      ? Math.round((adv001Ids.length * adv001Pct + adv002Ids.length * adv002Pct) / allIds.length)
      : 0

    return { weekLabel, adv001Pct, adv002Pct, overallPct }
  })
}

// ─── Main export: compute all team insights ───────────────────────────────────

export function computeTeamInsights(user: CurrentUser): TeamInsightData {
  const visibleClients = getVisibleClients(user)
  const visibleIds = visibleClients.map(c => c.id)

  // ── Advisor team cohorts ──────────────────────────────────────────────────
  // Only include advisors whose clients are in scope for this user
  const adv001 = mockAdvisors.find(a => a.id === 'ADV001')
  const adv002 = mockAdvisors.find(a => a.id === 'ADV002')

  const adv001VisibleIds = (adv001?.clientIds ?? []).filter(id => visibleIds.includes(id))
  const adv002VisibleIds = (adv002?.clientIds ?? []).filter(id => visibleIds.includes(id))

  const advisorTeams: CohortBudgetSummary[] = []
  if (adv001VisibleIds.length > 0) {
    advisorTeams.push(buildCohortSummary(adv001 ? adv001.name + ' Team' : 'Team A', adv001VisibleIds))
  }
  if (adv002VisibleIds.length > 0) {
    advisorTeams.push(buildCohortSummary(adv002 ? adv002.name + ' Team' : 'Team B', adv002VisibleIds))
  }

  // ── Risk tier cohorts ─────────────────────────────────────────────────────
  const lowIds = visibleClients.filter(c => c.budgetHealth === 'on_track').map(c => c.id)
  const moderateIds = visibleClients.filter(c => c.budgetHealth === 'at_risk').map(c => c.id)
  const highIds = visibleClients.filter(c => c.budgetHealth === 'over_budget').map(c => c.id)

  const riskCohorts: CohortBudgetSummary[] = [
    buildCohortSummary('On Track', lowIds),
    buildCohortSummary('At Risk', moderateIds),
    buildCohortSummary('Over Budget', highIds),
  ].filter(c => c.clientCount > 0)

  // ── Category pressure ─────────────────────────────────────────────────────
  const categoryPressure = buildCategoryPressure(visibleIds)

  // ── 6-week health trend ───────────────────────────────────────────────────
  const healthTrend = buildHealthTrend(adv001VisibleIds, adv002VisibleIds)

  // ── Top-level KPIs ────────────────────────────────────────────────────────
  const totalOnTrack = visibleIds.filter(id => {
    const s = getPFMSSnapshotForCustomer(id)
    const budget = s.categories.reduce((sum, c) => sum + c.weeklyBudget, 0)
    const projected = s.categories.reduce((sum, c) => sum + c.projectedSpend, 0)
    return projected <= budget
  }).length

  const overallOnTrackPct = visibleIds.length > 0
    ? Math.round((totalOnTrack / visibleIds.length) * 100)
    : 0

  const topPressureCategory = categoryPressure[0]?.category ?? 'N/A'

  return {
    advisorTeams,
    riskCohorts,
    categoryPressure,
    healthTrend,
    overallOnTrackPct,
    totalClientsAnalysed: visibleIds.length,
    topPressureCategory,
  }
}
