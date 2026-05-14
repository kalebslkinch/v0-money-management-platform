/**
 * Pre-designed advisory case templates (SRD-A10).
 *
 * These are read-only seed templates the adviser can pick from when creating
 * a new consultation. They prefill the topic and a structured summary so the
 * adviser only needs to fill in client-specific specifics.
 */

export interface AdvisoryCaseTemplate {
  id: string
  label: string
  category: 'planning' | 'review' | 'onboarding' | 'compliance' | 'risk'
  topic: string
  /** Markdown-ish summary outline. */
  summaryOutline: string
  /** Suggested follow-up tasks (used by the consultation form). */
  followUpTasks: string[]
}

export const ADVISORY_CASE_TEMPLATES: AdvisoryCaseTemplate[] = [
  {
    id: 'tpl-annual-review',
    label: 'Annual Portfolio Review',
    category: 'review',
    topic: 'Annual portfolio review',
    summaryOutline: [
      'Review of allocation versus target.',
      'Performance vs. benchmark over the past 12 months.',
      'Risk profile re-assessment (no change / change).',
      'Recommended rebalancing actions.',
      'Next review scheduled for: ',
    ].join('\n'),
    followUpTasks: ['Send rebalance proposal', 'Schedule next annual review'],
  },
  {
    id: 'tpl-budget-coaching',
    label: 'Budget Coaching Session',
    category: 'planning',
    topic: 'Budget coaching session',
    summaryOutline: [
      'Reviewed weekly budget vs. actual spending.',
      'Top three pressure categories: ',
      'Agreed savings target: ',
      'Spending limits to enable: ',
      'Action items for the client: ',
    ].join('\n'),
    followUpTasks: ['Enable spending alerts for top categories', 'Re-check in 4 weeks'],
  },
  {
    id: 'tpl-onboarding',
    label: 'New Client Onboarding',
    category: 'onboarding',
    topic: 'New client onboarding',
    summaryOutline: [
      'Confirmed identity verification and KYC.',
      'Captured income, assets, and liabilities.',
      'Risk tolerance questionnaire score: ',
      'Initial financial goals: ',
      'Data-sharing consent captured (yes / no): ',
    ].join('\n'),
    followUpTasks: ['Send welcome pack', 'Set first 90-day check-in'],
  },
  {
    id: 'tpl-retirement-plan',
    label: 'Retirement Planning',
    category: 'planning',
    topic: 'Retirement planning consultation',
    summaryOutline: [
      'Current pension pot value: ',
      'Target retirement age: ',
      'Projected income gap: ',
      'Recommended contribution increase: ',
      'Tax-efficient wrappers reviewed: ',
    ].join('\n'),
    followUpTasks: ['Model alternative scenarios', 'Confirm contribution change'],
  },
  {
    id: 'tpl-risk-reassessment',
    label: 'Risk Profile Re-assessment',
    category: 'risk',
    topic: 'Risk profile re-assessment',
    summaryOutline: [
      'Trigger for review (life event / market move / scheduled): ',
      'Updated risk capacity: ',
      'Updated risk tolerance: ',
      'Recommended portfolio risk tier (low / moderate / high): ',
      'Client agreement captured: ',
    ].join('\n'),
    followUpTasks: ['Update client risk tier in CRM', 'Reissue suitability letter'],
  },
  {
    id: 'tpl-compliance-disclosure',
    label: 'Compliance Disclosure Update',
    category: 'compliance',
    topic: 'Compliance disclosure update',
    summaryOutline: [
      'Disclosure delivered: ',
      'Client acknowledgement captured: ',
      'Date of next required disclosure: ',
      'Notes / questions raised: ',
    ].join('\n'),
    followUpTasks: ['File disclosure acknowledgement', 'Diary next review'],
  },
]

export function getAdvisoryCaseTemplateById(id: string): AdvisoryCaseTemplate | undefined {
  return ADVISORY_CASE_TEMPLATES.find(template => template.id === id)
}
