import type { Case } from '@/lib/types/admin'

export const mockCases: Case[] = [
  // ── ADV001 James Wilson ───────────────────────────────────────────────────
  {
    id: 'CASE001',
    clientId: 'CLT001',
    clientName: 'Sarah Mitchell',
    advisorId: 'ADV001',
    advisorName: 'James Wilson',
    type: 'annual_review',
    status: 'in_progress',
    priority: 'medium',
    title: 'Annual Portfolio Review – Q1 2024',
    description: 'Full annual review of Sarah\'s moderate-risk portfolio. Includes performance analysis, rebalancing recommendation, and updated risk tolerance assessment.',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    dueDate: '2024-01-31',
    createdBy: 'James Wilson',
    notes: [
      {
        id: 'NOTE001',
        caseId: 'CASE001',
        authorName: 'James Wilson',
        content: 'Initial review documentation compiled. Portfolio is tracking 1.2% above benchmark YTD.',
        createdAt: '2024-01-05T09:15:00Z',
        type: 'comment',
      },
      {
        id: 'NOTE002',
        caseId: 'CASE001',
        authorName: 'James Wilson',
        content: 'Client meeting scheduled for Jan 18. Sent pre-meeting questionnaire.',
        createdAt: '2024-01-10T14:00:00Z',
        type: 'comment',
      },
    ],
  },
  {
    id: 'CASE002',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    advisorId: 'ADV001',
    advisorName: 'James Wilson',
    type: 'kyc_update',
    status: 'open',
    priority: 'high',
    title: 'KYC Documentation Renewal',
    description: 'Elizabeth\'s KYC documentation is due for renewal. Passport and proof of address expired. Regulatory requirement to resolve within 30 days.',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
    dueDate: '2024-02-08',
    createdBy: 'System',
    notes: [
      {
        id: 'NOTE003',
        caseId: 'CASE002',
        authorName: 'System',
        content: 'Automated alert: KYC documents expiring within 30 days. Case created.',
        createdAt: '2024-01-08T10:00:00Z',
        type: 'status_change',
      },
    ],
  },
  {
    id: 'CASE003',
    clientId: 'CLT005',
    clientName: 'Amanda Foster',
    advisorId: 'ADV001',
    advisorName: 'James Wilson',
    type: 'onboarding',
    status: 'in_progress',
    priority: 'high',
    title: 'New Client Onboarding – Amanda Foster',
    description: 'Complete onboarding for new client Amanda Foster. Low-risk profile. Initial investment of $890,000. Requires account setup, risk assessment sign-off, and first portfolio construction.',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    dueDate: '2024-01-26',
    createdBy: 'James Wilson',
    notes: [
      {
        id: 'NOTE004',
        caseId: 'CASE003',
        authorName: 'James Wilson',
        content: 'Account application submitted. Awaiting compliance clearance.',
        createdAt: '2024-01-05T08:30:00Z',
        type: 'comment',
      },
      {
        id: 'NOTE005',
        caseId: 'CASE003',
        authorName: 'James Wilson',
        content: 'Compliance cleared. Risk assessment form sent to client.',
        createdAt: '2024-01-10T10:00:00Z',
        type: 'status_change',
      },
      {
        id: 'NOTE006',
        caseId: 'CASE003',
        authorName: 'James Wilson',
        content: 'Risk assessment returned. Client confirmed low risk tolerance. Preparing initial allocation.',
        createdAt: '2024-01-12T16:45:00Z',
        type: 'comment',
      },
    ],
  },
  {
    id: 'CASE004',
    clientId: 'CLT007',
    clientName: 'Jennifer Walsh',
    advisorId: 'ADV001',
    advisorName: 'James Wilson',
    type: 'rebalance',
    status: 'pending_review',
    priority: 'medium',
    title: 'Portfolio Rebalance – Drift Alert',
    description: 'Jennifer\'s equity allocation has drifted to 58% against her 50% target following strong market performance. Rebalancing proposal prepared and awaiting manager approval.',
    createdAt: '2024-01-11T09:30:00Z',
    updatedAt: '2024-01-13T09:00:00Z',
    dueDate: '2024-01-20',
    createdBy: 'James Wilson',
    notes: [
      {
        id: 'NOTE007',
        caseId: 'CASE004',
        authorName: 'James Wilson',
        content: 'Portfolio drift identified: equity 58% vs 50% target. Sell proposal: $195K in AAPL, rotate into bonds.',
        createdAt: '2024-01-11T09:30:00Z',
        type: 'comment',
      },
      {
        id: 'NOTE008',
        caseId: 'CASE004',
        authorName: 'James Wilson',
        content: 'Rebalancing proposal submitted for manager review.',
        createdAt: '2024-01-13T09:00:00Z',
        type: 'status_change',
      },
    ],
  },
  // ── ADV002 Emily Rodriguez ────────────────────────────────────────────────
  {
    id: 'CASE005',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    advisorId: 'ADV002',
    advisorName: 'Emily Rodriguez',
    type: 'compliance',
    status: 'escalated',
    priority: 'critical',
    title: 'Unusual Transaction Pattern – Compliance Review',
    description: 'Three large wire transfers totalling $1.2M over 5 days flagged by compliance monitoring system. Requires immediate review and AML assessment. Client has been notified that a review is underway.',
    createdAt: '2024-01-09T08:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
    dueDate: '2024-01-16',
    createdBy: 'System',
    notes: [
      {
        id: 'NOTE009',
        caseId: 'CASE005',
        authorName: 'System',
        content: 'Automated compliance flag: 3 transactions over $400K in 5-day window.',
        createdAt: '2024-01-09T08:00:00Z',
        type: 'status_change',
      },
      {
        id: 'NOTE010',
        caseId: 'CASE005',
        authorName: 'Emily Rodriguez',
        content: 'Reviewed transaction history. Client confirmed all transfers are legitimate property sales. Documentation requested.',
        createdAt: '2024-01-10T11:00:00Z',
        type: 'comment',
      },
      {
        id: 'NOTE011',
        caseId: 'CASE005',
        authorName: 'Emily Rodriguez',
        content: 'Escalated to manager pending receipt of supporting documentation from client.',
        createdAt: '2024-01-14T15:00:00Z',
        type: 'escalation',
      },
    ],
  },
  {
    id: 'CASE006',
    clientId: 'CLT004',
    clientName: 'David Kim',
    advisorId: 'ADV002',
    advisorName: 'Emily Rodriguez',
    type: 'annual_review',
    status: 'open',
    priority: 'medium',
    title: 'Annual Portfolio Review – Q1 2024',
    description: 'Scheduled annual review of David\'s moderate-risk portfolio. Last review was Jan 2023. Includes full performance breakdown, benchmark comparison, and 12-month forward allocation plan.',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    dueDate: '2024-02-15',
    createdBy: 'Emily Rodriguez',
    notes: [
      {
        id: 'NOTE012',
        caseId: 'CASE006',
        authorName: 'Emily Rodriguez',
        content: 'Case opened. Will schedule client call for first week of February.',
        createdAt: '2024-01-12T10:00:00Z',
        type: 'comment',
      },
    ],
  },
  {
    id: 'CASE007',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    advisorId: 'ADV002',
    advisorName: 'Emily Rodriguez',
    type: 'rebalance',
    status: 'resolved',
    priority: 'high',
    title: 'Emergency Rebalance – High Volatility Event',
    description: 'Crypto holdings surged to 28% of portfolio against 15% target following Bitcoin rally. Executed rebalancing per client instruction to lock in gains and restore allocation targets.',
    createdAt: '2024-01-03T07:30:00Z',
    updatedAt: '2024-01-05T14:00:00Z',
    dueDate: '2024-01-06',
    createdBy: 'Emily Rodriguez',
    notes: [
      {
        id: 'NOTE013',
        caseId: 'CASE007',
        authorName: 'Emily Rodriguez',
        content: 'Crypto position at 28%. Called client — instructed to sell $520K in BTC and rotate to equities.',
        createdAt: '2024-01-03T07:30:00Z',
        type: 'comment',
      },
      {
        id: 'NOTE014',
        caseId: 'CASE007',
        authorName: 'Emily Rodriguez',
        content: 'Trades executed. Portfolio restored to target allocation. Case closed.',
        createdAt: '2024-01-05T14:00:00Z',
        type: 'status_change',
      },
    ],
  },
  {
    id: 'CASE008',
    clientId: 'CLT010',
    clientName: 'Thomas Anderson',
    advisorId: 'ADV002',
    advisorName: 'Emily Rodriguez',
    type: 'general',
    status: 'in_progress',
    priority: 'low',
    title: 'Beneficiary Designation Update',
    description: 'Thomas has requested update to account beneficiary designations following recent marriage. Forms sent to client. Awaiting signed documentation.',
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-11T09:00:00Z',
    dueDate: '2024-01-31',
    createdBy: 'Emily Rodriguez',
    notes: [
      {
        id: 'NOTE015',
        caseId: 'CASE008',
        authorName: 'Emily Rodriguez',
        content: 'Client requested beneficiary change. Forms sent via DocuSign.',
        createdAt: '2024-01-08T14:00:00Z',
        type: 'comment',
      },
    ],
  },
  {
    id: 'CASE009',
    clientId: 'CLT012',
    clientName: 'Daniel Brown',
    advisorId: 'ADV002',
    advisorName: 'Emily Rodriguez',
    type: 'complaint',
    status: 'pending_review',
    priority: 'high',
    title: 'Client Complaint – Fee Dispute',
    description: 'Daniel raised a complaint about management fee charges in Q4 2023. Claims fees were higher than the agreed schedule. Fee statements have been pulled and the discrepancy is being investigated.',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
    dueDate: '2024-01-24',
    createdBy: 'Emily Rodriguez',
    notes: [
      {
        id: 'NOTE016',
        caseId: 'CASE009',
        authorName: 'Emily Rodriguez',
        content: 'Received written complaint from client. Q4 fee statements pulled for review.',
        createdAt: '2024-01-10T11:00:00Z',
        type: 'comment',
      },
      {
        id: 'NOTE017',
        caseId: 'CASE009',
        authorName: 'Emily Rodriguez',
        content: 'Discrepancy identified: fee schedule was updated in Oct but not reflected correctly in Nov statement. Submitted to manager for review and remediation approval.',
        createdAt: '2024-01-13T16:00:00Z',
        type: 'status_change',
      },
    ],
  },
  // ── ADV003 Marcus Hayes ───────────────────────────────────────────────────
  {
    id: 'CASE010',
    clientId: 'CLT009',
    clientName: 'Maria Garcia',
    advisorId: 'ADV001',
    advisorName: 'James Wilson',
    type: 'kyc_update',
    status: 'resolved',
    priority: 'medium',
    title: 'Identity Verification Refresh',
    description: 'Routine 3-year identity verification refresh required by regulation. All documents collected and verified.',
    createdAt: '2023-12-20T09:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
    dueDate: '2024-01-10',
    createdBy: 'System',
    notes: [
      {
        id: 'NOTE018',
        caseId: 'CASE010',
        authorName: 'James Wilson',
        content: 'Client submitted updated passport and utility bill. Verification complete.',
        createdAt: '2024-01-02T10:00:00Z',
        type: 'status_change',
      },
    ],
  },
  {
    id: 'CASE011',
    clientId: 'CLT011',
    clientName: 'Patricia Moore',
    advisorId: 'ADV001',
    advisorName: 'James Wilson',
    type: 'onboarding',
    status: 'resolved',
    priority: 'medium',
    title: 'New Client Onboarding – Patricia Moore',
    description: 'Full onboarding completed for Patricia Moore. Low-risk profile with initial investment of $560,000. Portfolio constructed and live.',
    createdAt: '2023-05-20T09:00:00Z',
    updatedAt: '2023-06-15T14:00:00Z',
    dueDate: '2023-06-20',
    createdBy: 'James Wilson',
    notes: [
      {
        id: 'NOTE019',
        caseId: 'CASE011',
        authorName: 'James Wilson',
        content: 'Onboarding complete. Portfolio live as of June 15.',
        createdAt: '2023-06-15T14:00:00Z',
        type: 'status_change',
      },
    ],
  },
  {
    id: 'CASE012',
    clientId: 'CLT008',
    clientName: 'Christopher Lee',
    advisorId: 'ADV002',
    advisorName: 'Emily Rodriguez',
    type: 'general',
    status: 'open',
    priority: 'low',
    title: 'Dormant Account – Re-engagement Attempt',
    description: 'Christopher\'s account has been inactive since December 2023. No response to emails. Phone call attempted. Case open to track re-engagement efforts before recommending account closure review.',
    createdAt: '2024-01-07T10:00:00Z',
    updatedAt: '2024-01-07T10:00:00Z',
    dueDate: '2024-02-07',
    createdBy: 'Emily Rodriguez',
    notes: [
      {
        id: 'NOTE020',
        caseId: 'CASE012',
        authorName: 'Emily Rodriguez',
        content: 'Account inactive >30 days. Sent re-engagement email. Will follow up with phone call next week.',
        createdAt: '2024-01-07T10:00:00Z',
        type: 'comment',
      },
    ],
  },
]

export function getCaseById(id: string): Case | undefined {
  return mockCases.find(c => c.id === id)
}

export function getCasesByAdvisorId(advisorId: string): Case[] {
  return mockCases.filter(c => c.advisorId === advisorId)
}

export function getCasesByClientId(clientId: string): Case[] {
  return mockCases.filter(c => c.clientId === clientId)
}

export function getCasesByStatus(status: Case['status']): Case[] {
  return mockCases.filter(c => c.status === status)
}

export function getOpenCases(): Case[] {
  return mockCases.filter(c => c.status !== 'resolved')
}

export function getCasesDueThisWeek(): Case[] {
  const now = new Date()
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + 7)
  return mockCases.filter(c => {
    if (c.status === 'resolved') return false
    const due = new Date(c.dueDate)
    return due >= now && due <= endOfWeek
  })
}

export function getAllCases(): Case[] {
  return [...mockCases]
}

export function addCase(c: Case): void {
  mockCases.push(c)
}

export function updateCase(updated: Case): void {
  const idx = mockCases.findIndex(c => c.id === updated.id)
  if (idx >= 0) mockCases[idx] = updated
}

export function deleteCase(id: string): void {
  const idx = mockCases.findIndex(c => c.id === id)
  if (idx >= 0) mockCases.splice(idx, 1)
}
