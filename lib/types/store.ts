// ─── User-recorded transactions (SRD-U01, SRD-U04) ────────────────────────────
export type PaymentMethod = 'card' | 'bank-transfer' | 'direct-debit' | 'cash' | 'other'

export interface UserTransaction {
  id: string
  clientId: string
  date: string                // ISO date
  amount: number              // positive
  merchant: string
  paymentMethod: PaymentMethod
  categoryId: string          // built-in or custom category id
  categoryLabel: string
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Custom categories & tags (SRD-U02) ───────────────────────────────────────
export interface UserCategory {
  id: string
  clientId: string
  label: string
  color?: string
  essential: boolean
  createdAt: string
}

// ─── Consultation requests (SRD-U07, SRD-A06) ─────────────────────────────────
export type ConsultationRequestStatus = 'open' | 'assigned' | 'responded' | 'closed'

export interface ConsultationRequest {
  id: string
  clientId: string
  clientName: string
  topic: string
  message: string
  preferredDate?: string
  status: ConsultationRequestStatus
  assignedAdvisorId?: string
  assignedAdvisorName?: string
  createdAt: string
  updatedAt: string
  responses: ConsultationResponse[]
}

export interface ConsultationResponse {
  id: string
  authorId: string
  authorName: string
  authorRole: 'manager' | 'fa' | 'customer'
  message: string
  createdAt: string
}

// ─── Consultation records (SRD-A01, SRD-A04, SRD-A05) ─────────────────────────
export interface ConsultationRecord {
  id: string
  topic: string
  date: string
  clientId: string
  clientName: string
  advisorId: string
  advisorName: string
  summary: string
  createdAt: string
  updatedAt: string
}

// ─── Data sharing consent (SRD-U08, SRD-A02, SRD-G04) ─────────────────────────
export interface DataSharingConsent {
  clientId: string
  shareWithAdvisor: boolean
  shareSpending: boolean
  shareBudgets: boolean
  shareTransactions: boolean
  updatedAt: string
}

// ─── Notifications (SRD-M07) ──────────────────────────────────────────────────
export type NotificationKind = 'complaint' | 'request' | 'critical' | 'info'
export type NotificationAudience = 'manager' | 'fa' | 'customer' | 'all'

export interface AppNotification {
  id: string
  kind: NotificationKind
  audience: NotificationAudience
  audienceUserId?: string
  title: string
  message: string
  href?: string
  read: boolean
  createdAt: string
}

// ─── Manager performance (SRD-M04, SRD-M05) ───────────────────────────────────
export interface AdvisorPerformanceSnapshot {
  advisorId: string
  advisorName: string
  satisfactionRate: number      // 0-100
  completionRate: number        // 0-100
  avgResponseTimeHours: number
  openCases: number
  resolvedCases: number
}

export interface TeamInsightPoint {
  month: string
  avgSatisfaction: number
  avgCompletion: number
  avgResponseHours: number
  totalCases: number
}
