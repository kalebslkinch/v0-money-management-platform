/**
 * Adviser financial summary access control (SRD-A02, SRD-G04).
 *
 * An adviser MAY view a client's financial summary only when ALL of the
 * following are true:
 *  1. The adviser has the `viewClientFinancialSummary` permission.
 *  2. The client is assigned to that adviser (authorisation boundary).
 *  3. The client has explicitly granted `shareWithAdvisor` consent.
 *
 * The consent fields further control which data sections are surfaced:
 *  - shareSpending      → recent transactions tab
 *  - shareBudgets       → category budgets tab
 *  - shareTransactions  → full transaction history tab
 */

import { mockClients } from '@/lib/data/mock-clients'
import { readConsentSync } from '@/hooks/use-store'
import type { DataSharingConsent } from '@/lib/types/store'
import { hasPermission } from '@/lib/auth/role-permissions'
import type { UserRole } from '@/lib/auth/user-context'

export interface AdviserAccessResult {
  /** True when all access conditions are met */
  canView: boolean
  /** True when the adviser lacks the role permission entirely */
  noPermission: boolean
  /** True when the client is not assigned to this adviser */
  notAssigned: boolean
  /** True when the client has not granted shareWithAdvisor consent */
  consentDenied: boolean
  /** Resolved consent record (useful even if canView is false) */
  consent: DataSharingConsent
}

/**
 * Evaluate whether `adviserId` is allowed to view `clientId`'s financial
 * summary, given the caller's `role`.
 *
 * Designed for both server-side and client-side use; reads localStorage
 * only when running in a browser environment (falls back to denied).
 */
export function resolveAdviserAccess(
  role: UserRole,
  adviserId: string,
  clientId: string,
): AdviserAccessResult {
  const consent = readConsentSync(clientId)

  const noPermission = !hasPermission(role, 'viewClientFinancialSummary')

  // Managers can see any client; FA must own the client record
  const client = mockClients.find(c => c.id === clientId)
  const notAssigned = role === 'fa' ? client?.advisorId !== adviserId : false

  const consentDenied = !consent.shareWithAdvisor

  const canView = !noPermission && !notAssigned && !consentDenied

  return { canView, noPermission, notAssigned, consentDenied, consent }
}
