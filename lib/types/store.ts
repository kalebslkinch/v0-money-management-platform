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
  /** Optional receipt image (SRD-U15). */
  receipt?: ReceiptAttachment
  /**
   * If present, the transaction has been split across multiple categories
   * (SRD-U10). The sum of all split amounts MUST equal `amount`.
   */
  splits?: TransactionSplit[]
  /** True when transaction was created from receipt OCR (SRD-U16/A12). */
  fromReceiptScan?: boolean
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

// ─── Team members (manager-managed staff records) ─────────────────────────────
export type TeamMemberRole = 'senior_advisor' | 'advisor' | 'junior_advisor'
export type TeamMemberStatus = 'active' | 'on_leave' | 'inactive'

export interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  role: TeamMemberRole
  department?: string
  status: TeamMemberStatus
  joinedAt: string      // ISO date
  createdAt: string
  updatedAt: string
}

// ─── Customer complaints (SRD-U09) ────────────────────────────────────────────
export type ComplaintCategory =
  | 'service'
  | 'billing'
  | 'technical'
  | 'advisor'
  | 'other'

export type ComplaintStatus = 'submitted' | 'under_review' | 'resolved' | 'closed'

export interface Complaint {
  id: string
  clientId: string
  clientName: string
  category: ComplaintCategory
  subject: string
  description: string
  status: ComplaintStatus
  referenceNumber: string
  createdAt: string
  updatedAt: string
}

// ─── Performance notes (SRD-M12) ──────────────────────────────────────────────
export type PerformanceNoteCategory =
  | 'feedback'
  | 'commendation'
  | 'improvement'
  | 'performance'
  | 'general'

export interface PerformanceNote {
  id: string
  memberId: string          // TeamMember id this note belongs to
  memberName: string
  category: PerformanceNoteCategory
  content: string
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
}

// ─── Task records (manager-managed tasks) ─────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface TaskRecord {
  id: string
  title: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string      // ISO date
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

// ─── Receipt attachments (SRD-U15) ────────────────────────────────────────────
export interface ReceiptAttachment {
  /** Stored as a data: URL (prototype). In production, an object-storage URL. */
  dataUrl: string
  filename: string
  mimeType: string
  /** Bytes (post base64-decode). */
  size: number
  uploadedAt: string
}

// ─── Transaction split allocations (SRD-U10) ──────────────────────────────────
export interface TransactionSplit {
  id: string
  categoryId: string
  categoryLabel: string
  amount: number
  note?: string
}

// ─── Adviser internal client notes (SRD-A07) ──────────────────────────────────
export interface ClientNote {
  id: string
  clientId: string
  authorId: string
  authorName: string
  content: string
  tags: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

// ─── Saved report templates (SRD-G09, SRD-U14) ────────────────────────────────
export type ReportTemplateScope = 'customer' | 'fa' | 'manager' | 'shared'

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  /** Audience this template applies to. */
  scope: ReportTemplateScope
  /** Optional owner — null for built-in/standardised templates. */
  ownerId?: string
  ownerName?: string
  /** Free-form configuration: dateRange, chartType, filters, columns… */
  config: Record<string, unknown>
  /** Built-in templates ship with the app and cannot be deleted. */
  builtIn: boolean
  createdAt: string
  updatedAt: string
}

// ─── Direct messaging (SRD-M18, SRD-A09) ──────────────────────────────────────
export type MessageThreadKind = 'manager_advisor' | 'advisor_advisor'

export interface MessageThread {
  id: string
  kind: MessageThreadKind
  subject: string
  /** User ids participating. Order is not significant. */
  participantIds: string[]
  /** Display names mirrored from participants for prototype convenience. */
  participantNames: string[]
  /** Optional client this thread is about (e.g. collaboration). */
  clientId?: string
  clientName?: string
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export interface DirectMessage {
  id: string
  threadId: string
  authorId: string
  authorName: string
  authorRole: 'manager' | 'fa'
  body: string
  createdAt: string
  readBy: string[]
}

// ─── Onboarding completion (SRD-G11) ──────────────────────────────────────────
export interface OnboardingState {
  userId: string
  role: 'manager' | 'fa' | 'customer'
  completed: boolean
  dismissedAt?: string
  completedAt?: string
}

// ─── Two-factor authentication (SRD-G01) ──────────────────────────────────────
export interface TwoFactorSettings {
  userId: string
  enabled: boolean
  /** Mock secret label – never used for real auth. */
  method: 'authenticator' | 'sms' | 'email'
  enrolledAt?: string
}

// ─── Auto-logout settings (SRD-G10) ───────────────────────────────────────────
export interface SessionSettings {
  userId: string
  /** Idle minutes after which the user is automatically signed out. */
  idleTimeoutMinutes: number
}
