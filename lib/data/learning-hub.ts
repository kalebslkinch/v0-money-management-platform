/**
 * Adviser learning hub content (SRD-A15).
 *
 * Static curated set of compliance updates, market briefings and how-to
 * resources. In production this would be powered by a CMS; the prototype
 * surfaces the same shape so the UI is identical.
 */

export type LearningResourceType =
  | 'compliance'
  | 'market'
  | 'product'
  | 'process'

export interface LearningResource {
  id: string
  title: string
  summary: string
  type: LearningResourceType
  /** ISO date for "last updated" display + sorting. */
  publishedAt: string
  /** Estimated read time in minutes. */
  readTimeMinutes: number
  /** External or in-app link. */
  href: string
  tags: string[]
}

export const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: 'lr-fca-cobs-update',
    title: 'FCA COBS update – Suitability assessments',
    summary:
      'Summary of the latest FCA Conduct of Business Sourcebook (COBS) clarifications on suitability assessments and ongoing reviews.',
    type: 'compliance',
    publishedAt: '2024-02-12',
    readTimeMinutes: 6,
    href: '#',
    tags: ['FCA', 'COBS', 'suitability'],
  },
  {
    id: 'lr-aml-refresher',
    title: 'AML refresher – PEP and sanctions screening',
    summary:
      'Mandatory yearly refresher covering politically exposed persons (PEPs), enhanced due diligence triggers, and sanctions screening best practice.',
    type: 'compliance',
    publishedAt: '2024-01-30',
    readTimeMinutes: 12,
    href: '#',
    tags: ['AML', 'KYC', 'sanctions'],
  },
  {
    id: 'lr-q1-market-brief',
    title: 'Q1 market briefing – Inflation and rates',
    summary:
      'House view on inflation expectations and central-bank rates for the quarter, plus implications for fixed-income positioning.',
    type: 'market',
    publishedAt: '2024-01-22',
    readTimeMinutes: 8,
    href: '#',
    tags: ['macro', 'rates', 'inflation'],
  },
  {
    id: 'lr-em-equity-watch',
    title: 'Emerging markets equity watch',
    summary:
      'Country-level winners and laggards plus thematic exposures to consider for moderate and high-risk portfolios.',
    type: 'market',
    publishedAt: '2024-01-15',
    readTimeMinutes: 5,
    href: '#',
    tags: ['EM', 'equity'],
  },
  {
    id: 'lr-isa-allowance',
    title: 'ISA allowance – End-of-year planning',
    summary:
      'Checklist for using the remaining ISA allowance, Bed & ISA mechanics, and common pitfalls when timing transfers.',
    type: 'product',
    publishedAt: '2024-02-05',
    readTimeMinutes: 4,
    href: '#',
    tags: ['ISA', 'tax-year-end'],
  },
  {
    id: 'lr-platform-shortcuts',
    title: 'Platform shortcuts – Fast consultation logging',
    summary:
      'How to use case templates, quick-reference summaries, and the global search to log and find consultations in seconds.',
    type: 'process',
    publishedAt: '2024-02-01',
    readTimeMinutes: 3,
    href: '#',
    tags: ['workflow', 'productivity'],
  },
  {
    id: 'lr-collab-workflows',
    title: 'Collaborating on shared client files',
    summary:
      'How to add a secondary adviser to a client file, what they can and cannot see, and how to log collaborative actions.',
    type: 'process',
    publishedAt: '2024-01-18',
    readTimeMinutes: 5,
    href: '#',
    tags: ['collaboration', 'permissions'],
  },
]

export function getLearningResourcesByType(
  type: LearningResourceType | 'all',
): LearningResource[] {
  if (type === 'all') return [...LEARNING_RESOURCES]
  return LEARNING_RESOURCES.filter(resource => resource.type === type)
}
