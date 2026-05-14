import type { PFMSCustomerSnapshot } from '@/lib/types/pfms'

// ─── Weekly snapshot history (6 weeks) ───────────────────────────────────────
// Used by team-level trend charts. Each entry is { weekLabel, categories }.
export interface PFMSWeeklyHistory {
  weekLabel: string
  // category id → { budget, spent }
  categories: Record<string, { budget: number; spent: number }>
}

export interface PFMSCustomerSnapshotWithHistory extends PFMSCustomerSnapshot {
  history: PFMSWeeklyHistory[]
}

const snapshotsByCustomerId: Record<string, PFMSCustomerSnapshotWithHistory> = {
  // ─── CLT001 Sarah Mitchell | moderate risk | ADV001 | portfolio £2.45M ───
  CLT001: {
    customerId: 'CLT001',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 780,
    fixedCommitments: 360,
    availableToSpend: 420,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 120, spent: 84,  projectedSpend: 126, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 55,  spent: 46,  projectedSpend: 69,  essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 40,  spent: 21,  projectedSpend: 34,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 22,  spent: 18,  projectedSpend: 22,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 36,  spent: 20,  projectedSpend: 29,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-food-delivery-cap',
        title: 'Pause delivery for 2 evenings',
        description: 'You are likely to exceed your food delivery cap by Friday.',
        impact: 'Estimated save: GBP 14 this week',
        priority: 'high',
      },
      {
        id: 'act-tesco-list-mode',
        title: 'Use Tesco list mode for next shop',
        description: 'Your Tesco spend is on pace; keep impulse items under GBP 8.',
        impact: 'Keeps groceries within plan',
        priority: 'medium',
      },
      {
        id: 'act-subscriptions-review',
        title: 'Review one subscription this weekend',
        description: 'A minor trim now gives room for essentials next week.',
        impact: 'Potential monthly save: GBP 7',
        priority: 'low',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-001', merchant: 'Tesco Superstore - Croydon', categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 38.5,  date: '2026-05-13T18:30:00', channel: 'card' },
      { id: 'PFMS-TXN-002', merchant: 'Deliveroo',                  categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 22.9,  date: '2026-05-12T20:15:00', channel: 'card' },
      { id: 'PFMS-TXN-003', merchant: 'Tesco Express',              categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 16.2,  date: '2026-05-11T08:45:00', channel: 'card' },
      { id: 'PFMS-TXN-004', merchant: 'Transport for London',       categoryId: 'transport',      categoryLabel: 'Transport',     amount: 11.0,  date: '2026-05-11T07:55:00', channel: 'card' },
      { id: 'PFMS-TXN-005', merchant: 'Uber Eats',                  categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 18.4,  date: '2026-05-10T19:20:00', channel: 'card' },
      { id: 'PFMS-TXN-006', merchant: 'Spotify Premium',            categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 10.99, date: '2026-05-09T09:00:00', channel: 'direct-debit' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 120, spent: 108 }, 'food-delivery': { budget: 55, spent: 42 }, 'transport': { budget: 40, spent: 38 }, 'subscriptions': { budget: 22, spent: 22 }, 'household': { budget: 36, spent: 31 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 120, spent: 115 }, 'food-delivery': { budget: 55, spent: 58 }, 'transport': { budget: 40, spent: 35 }, 'subscriptions': { budget: 22, spent: 18 }, 'household': { budget: 36, spent: 40 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 120, spent: 92 },  'food-delivery': { budget: 55, spent: 50 }, 'transport': { budget: 40, spent: 29 }, 'subscriptions': { budget: 22, spent: 22 }, 'household': { budget: 36, spent: 28 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 120, spent: 101 }, 'food-delivery': { budget: 55, spent: 63 }, 'transport': { budget: 40, spent: 33 }, 'subscriptions': { budget: 22, spent: 18 }, 'household': { budget: 36, spent: 36 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 120, spent: 97 },  'food-delivery': { budget: 55, spent: 55 }, 'transport': { budget: 40, spent: 27 }, 'subscriptions': { budget: 22, spent: 22 }, 'household': { budget: 36, spent: 33 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 120, spent: 84 },  'food-delivery': { budget: 55, spent: 46 }, 'transport': { budget: 40, spent: 21 }, 'subscriptions': { budget: 22, spent: 18 }, 'household': { budget: 36, spent: 20 } } },
    ],
  },

  // ─── CLT002 Michael Chen | high risk | ADV002 | portfolio £5.8M ──────────
  CLT002: {
    customerId: 'CLT002',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 2200,
    fixedCommitments: 900,
    availableToSpend: 1300,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 220, spent: 195, projectedSpend: 260, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 180, spent: 210, projectedSpend: 295, essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 120, spent: 88,  projectedSpend: 118, essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 90,  spent: 85,  projectedSpend: 90,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 80,  spent: 42,  projectedSpend: 70,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt002-delivery-over',
        title: 'Food delivery is over budget',
        description: 'Spending is already 17% over the weekly food delivery cap with days remaining.',
        impact: 'Pause delivery orders to save ~GBP 90 this week',
        priority: 'high',
      },
      {
        id: 'act-clt002-grocery-pace',
        title: 'Grocery pace is high — check list',
        description: 'On current trajectory, groceries will exceed budget by GBP 40.',
        impact: 'Switch to planned shop to stay within cap',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT002-001', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 62.4,  date: '2026-05-13T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT002-002', merchant: 'Waitrose',               categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 98.5,  date: '2026-05-12T14:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT002-003', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 48.2,  date: '2026-05-11T19:45:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT002-004', merchant: 'TfL',                    categoryId: 'transport',      categoryLabel: 'Transport',     amount: 45.0,  date: '2026-05-11T08:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT002-005', merchant: 'Netflix',                categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 17.99, date: '2026-05-10T00:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT002-006', merchant: 'Amazon Fresh',           categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 62.0,  date: '2026-05-10T13:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT002-007', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 55.8,  date: '2026-05-09T19:30:00', channel: 'card' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 220, spent: 190 }, 'food-delivery': { budget: 180, spent: 172 }, 'transport': { budget: 120, spent: 105 }, 'subscriptions': { budget: 90, spent: 85 }, 'household': { budget: 80, spent: 62 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 220, spent: 215 }, 'food-delivery': { budget: 180, spent: 198 }, 'transport': { budget: 120, spent: 110 }, 'subscriptions': { budget: 90, spent: 90 }, 'household': { budget: 80, spent: 74 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 220, spent: 188 }, 'food-delivery': { budget: 180, spent: 221 }, 'transport': { budget: 120, spent: 98 },  'subscriptions': { budget: 90, spent: 85 }, 'household': { budget: 80, spent: 55 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 220, spent: 202 }, 'food-delivery': { budget: 180, spent: 242 }, 'transport': { budget: 120, spent: 115 }, 'subscriptions': { budget: 90, spent: 85 }, 'household': { budget: 80, spent: 68 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 220, spent: 210 }, 'food-delivery': { budget: 180, spent: 195 }, 'transport': { budget: 120, spent: 102 }, 'subscriptions': { budget: 90, spent: 85 }, 'household': { budget: 80, spent: 61 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 220, spent: 195 }, 'food-delivery': { budget: 180, spent: 210 }, 'transport': { budget: 120, spent: 88 },  'subscriptions': { budget: 90, spent: 85 }, 'household': { budget: 80, spent: 42 } } },
    ],
  },

  // ─── CLT003 Elizabeth Harper | low risk | ADV001 | portfolio £1.2M ───────
  CLT003: {
    customerId: 'CLT003',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 920,
    fixedCommitments: 460,
    availableToSpend: 460,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 150, spent: 112, projectedSpend: 148, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 30,  spent: 15,  projectedSpend: 24,  essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 55,  spent: 38,  projectedSpend: 52,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 18,  spent: 14,  projectedSpend: 18,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 60,  spent: 44,  projectedSpend: 58,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt003-on-track',
        title: 'All budgets on track this week',
        description: 'Your spending is within all category budgets — well managed.',
        impact: 'Projected surplus: GBP 30 vs last week',
        priority: 'low',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT003-001', merchant: 'Sainsbury\'s',           categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 65.4,  date: '2026-05-13T10:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT003-002', merchant: 'Bus & Rail Pass',        categoryId: 'transport',      categoryLabel: 'Transport',     amount: 28.0,  date: '2026-05-12T08:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT003-003', merchant: 'Tesco Superstore',       categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 32.8,  date: '2026-05-11T16:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT003-004', merchant: 'Just Eat',               categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 15.0,  date: '2026-05-10T19:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT003-005', merchant: 'Council Rates',          categoryId: 'household',      categoryLabel: 'Household',     amount: 44.0,  date: '2026-05-09T09:00:00', channel: 'direct-debit' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 150, spent: 138 }, 'food-delivery': { budget: 30, spent: 18 }, 'transport': { budget: 55, spent: 50 }, 'subscriptions': { budget: 18, spent: 14 }, 'household': { budget: 60, spent: 58 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 150, spent: 145 }, 'food-delivery': { budget: 30, spent: 22 }, 'transport': { budget: 55, spent: 52 }, 'subscriptions': { budget: 18, spent: 18 }, 'household': { budget: 60, spent: 60 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 150, spent: 120 }, 'food-delivery': { budget: 30, spent: 12 }, 'transport': { budget: 55, spent: 48 }, 'subscriptions': { budget: 18, spent: 14 }, 'household': { budget: 60, spent: 55 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 150, spent: 130 }, 'food-delivery': { budget: 30, spent: 25 }, 'transport': { budget: 55, spent: 53 }, 'subscriptions': { budget: 18, spent: 18 }, 'household': { budget: 60, spent: 57 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 150, spent: 125 }, 'food-delivery': { budget: 30, spent: 20 }, 'transport': { budget: 55, spent: 49 }, 'subscriptions': { budget: 18, spent: 14 }, 'household': { budget: 60, spent: 56 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 150, spent: 112 }, 'food-delivery': { budget: 30, spent: 15 }, 'transport': { budget: 55, spent: 38 }, 'subscriptions': { budget: 18, spent: 14 }, 'household': { budget: 60, spent: 44 } } },
    ],
  },

  // ─── CLT004 David Kim | moderate risk | ADV002 | portfolio £3.75M ────────
  CLT004: {
    customerId: 'CLT004',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 1550,
    fixedCommitments: 680,
    availableToSpend: 870,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 200, spent: 162, projectedSpend: 198, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 120, spent: 95,  projectedSpend: 122, essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 90,  spent: 61,  projectedSpend: 82,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 45,  spent: 42,  projectedSpend: 45,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 70,  spent: 54,  projectedSpend: 68,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt004-delivery-watch',
        title: 'Food delivery close to budget',
        description: 'Projected to hit cap exactly by week end — no further orders advised.',
        impact: 'Prevents overspend by GBP 2',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT004-001', merchant: 'M&S Food',               categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 88.5,  date: '2026-05-13T12:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT004-002', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 45.2,  date: '2026-05-12T20:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT004-003', merchant: 'Oyster Card Top-Up',     categoryId: 'transport',      categoryLabel: 'Transport',     amount: 40.0,  date: '2026-05-12T07:45:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT004-004', merchant: 'Tesco Superstore',       categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 55.0,  date: '2026-05-11T14:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT004-005', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 38.5,  date: '2026-05-10T19:15:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT004-006', merchant: 'Disney+',                categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 11.99, date: '2026-05-10T00:00:00', channel: 'direct-debit' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 200, spent: 178 }, 'food-delivery': { budget: 120, spent: 108 }, 'transport': { budget: 90, spent: 78 }, 'subscriptions': { budget: 45, spent: 42 }, 'household': { budget: 70, spent: 62 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 200, spent: 192 }, 'food-delivery': { budget: 120, spent: 125 }, 'transport': { budget: 90, spent: 82 }, 'subscriptions': { budget: 45, spent: 45 }, 'household': { budget: 70, spent: 68 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 200, spent: 165 }, 'food-delivery': { budget: 120, spent: 112 }, 'transport': { budget: 90, spent: 74 }, 'subscriptions': { budget: 45, spent: 42 }, 'household': { budget: 70, spent: 60 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 200, spent: 185 }, 'food-delivery': { budget: 120, spent: 118 }, 'transport': { budget: 90, spent: 80 }, 'subscriptions': { budget: 45, spent: 42 }, 'household': { budget: 70, spent: 66 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 200, spent: 175 }, 'food-delivery': { budget: 120, spent: 115 }, 'transport': { budget: 90, spent: 77 }, 'subscriptions': { budget: 45, spent: 45 }, 'household': { budget: 70, spent: 64 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 200, spent: 162 }, 'food-delivery': { budget: 120, spent: 95 },  'transport': { budget: 90, spent: 61 }, 'subscriptions': { budget: 45, spent: 42 }, 'household': { budget: 70, spent: 54 } } },
    ],
  },

  // ─── CLT005 Amanda Foster | low risk | ADV001 | portfolio £890K (pending) ─
  CLT005: {
    customerId: 'CLT005',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 640,
    fixedCommitments: 310,
    availableToSpend: 330,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 100, spent: 72,  projectedSpend: 95,  essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 25,  spent: 12,  projectedSpend: 18,  essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 35,  spent: 22,  projectedSpend: 30,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 15,  spent: 10,  projectedSpend: 15,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 40,  spent: 28,  projectedSpend: 38,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt005-budget-setup',
        title: 'Confirm budgets post-onboarding',
        description: 'Your budgets are estimated during onboarding. Review and adjust to reflect your actual patterns.',
        impact: 'Accurate budgets enable better advice',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT005-001', merchant: 'Tesco Metro',            categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 42.0,  date: '2026-05-13T11:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT005-002', merchant: 'Bus Pass',               categoryId: 'transport',      categoryLabel: 'Transport',     amount: 22.0,  date: '2026-05-12T07:30:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT005-003', merchant: 'Tesco Express',          categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 22.5,  date: '2026-05-11T18:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT005-004', merchant: 'Amazon Prime',           categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 8.99,  date: '2026-05-09T00:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT005-005', merchant: 'Domino\'s',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 12.0,  date: '2026-05-09T19:30:00', channel: 'card' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 100, spent: 88 },  'food-delivery': { budget: 25, spent: 14 }, 'transport': { budget: 35, spent: 28 }, 'subscriptions': { budget: 15, spent: 9  }, 'household': { budget: 40, spent: 36 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 100, spent: 95 },  'food-delivery': { budget: 25, spent: 18 }, 'transport': { budget: 35, spent: 30 }, 'subscriptions': { budget: 15, spent: 9  }, 'household': { budget: 40, spent: 38 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 100, spent: 80 },  'food-delivery': { budget: 25, spent: 10 }, 'transport': { budget: 35, spent: 25 }, 'subscriptions': { budget: 15, spent: 9  }, 'household': { budget: 40, spent: 34 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 100, spent: 92 },  'food-delivery': { budget: 25, spent: 20 }, 'transport': { budget: 35, spent: 28 }, 'subscriptions': { budget: 15, spent: 9  }, 'household': { budget: 40, spent: 37 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 100, spent: 85 },  'food-delivery': { budget: 25, spent: 15 }, 'transport': { budget: 35, spent: 26 }, 'subscriptions': { budget: 15, spent: 9  }, 'household': { budget: 40, spent: 35 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 100, spent: 72 },  'food-delivery': { budget: 25, spent: 12 }, 'transport': { budget: 35, spent: 22 }, 'subscriptions': { budget: 15, spent: 10 }, 'household': { budget: 40, spent: 28 } } },
    ],
  },

  // ─── CLT006 Robert Thompson | high risk | ADV002 | portfolio £4.2M ───────
  CLT006: {
    customerId: 'CLT006',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 1800,
    fixedCommitments: 720,
    availableToSpend: 1080,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 180, spent: 145, projectedSpend: 188, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 200, spent: 255, projectedSpend: 320, essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 130, spent: 98,  projectedSpend: 125, essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 110, spent: 105, projectedSpend: 110, essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 95,  spent: 60,  projectedSpend: 80,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt006-delivery-critical',
        title: 'Food delivery significantly over budget',
        description: 'Already 28% over food delivery cap. Projected to finish at 60% over.',
        impact: 'Reducing orders now saves ~GBP 120',
        priority: 'high',
      },
      {
        id: 'act-clt006-grocery-over',
        title: 'Grocery budget will be breached',
        description: 'Grocery spend projected 4% over cap by Saturday.',
        impact: 'Switch to click & collect to reduce impulse items',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT006-001', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 78.5,  date: '2026-05-13T21:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT006-002', merchant: 'M&S Food Hall',          categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 92.0,  date: '2026-05-12T13:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT006-003', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 65.0,  date: '2026-05-12T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT006-004', merchant: 'Bolt',                   categoryId: 'transport',      categoryLabel: 'Transport',     amount: 38.0,  date: '2026-05-11T22:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT006-005', merchant: 'Apple One',              categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 28.99, date: '2026-05-11T00:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT006-006', merchant: 'Just Eat',               categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 55.0,  date: '2026-05-10T19:45:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT006-007', merchant: 'Waitrose',               categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 52.8,  date: '2026-05-10T11:00:00', channel: 'card' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 180, spent: 168 }, 'food-delivery': { budget: 200, spent: 228 }, 'transport': { budget: 130, spent: 115 }, 'subscriptions': { budget: 110, spent: 105 }, 'household': { budget: 95, spent: 78 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 180, spent: 175 }, 'food-delivery': { budget: 200, spent: 245 }, 'transport': { budget: 130, spent: 122 }, 'subscriptions': { budget: 110, spent: 110 }, 'household': { budget: 95, spent: 85 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 180, spent: 155 }, 'food-delivery': { budget: 200, spent: 215 }, 'transport': { budget: 130, spent: 108 }, 'subscriptions': { budget: 110, spent: 105 }, 'household': { budget: 95, spent: 72 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 180, spent: 172 }, 'food-delivery': { budget: 200, spent: 268 }, 'transport': { budget: 130, spent: 118 }, 'subscriptions': { budget: 110, spent: 110 }, 'household': { budget: 95, spent: 80 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 180, spent: 165 }, 'food-delivery': { budget: 200, spent: 235 }, 'transport': { budget: 130, spent: 112 }, 'subscriptions': { budget: 110, spent: 105 }, 'household': { budget: 95, spent: 75 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 180, spent: 145 }, 'food-delivery': { budget: 200, spent: 255 }, 'transport': { budget: 130, spent: 98 },  'subscriptions': { budget: 110, spent: 105 }, 'household': { budget: 95, spent: 60 } } },
    ],
  },

  // ─── CLT007 Jennifer Walsh | moderate risk | ADV001 | portfolio £1.65M ───
  CLT007: {
    customerId: 'CLT007',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 1050,
    fixedCommitments: 490,
    availableToSpend: 560,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 145, spent: 118, projectedSpend: 142, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 80,  spent: 72,  projectedSpend: 98,  essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 60,  spent: 42,  projectedSpend: 58,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 35,  spent: 30,  projectedSpend: 35,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 50,  spent: 38,  projectedSpend: 48,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt007-delivery-pace',
        title: 'Food delivery pace is elevated',
        description: 'On current pace, food delivery will exceed budget by GBP 18.',
        impact: 'Skip one order this week to stay on plan',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT007-001', merchant: 'Tesco Superstore',       categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 58.2,  date: '2026-05-13T10:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT007-002', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 38.5,  date: '2026-05-12T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT007-003', merchant: 'Tesco Express',          categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 35.5,  date: '2026-05-11T17:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT007-004', merchant: 'National Rail',          categoryId: 'transport',      categoryLabel: 'Transport',     amount: 42.0,  date: '2026-05-11T08:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT007-005', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 28.0,  date: '2026-05-10T19:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT007-006', merchant: 'Sky Sports',             categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 18.0,  date: '2026-05-09T00:00:00', channel: 'direct-debit' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 145, spent: 132 }, 'food-delivery': { budget: 80, spent: 68 }, 'transport': { budget: 60, spent: 54 }, 'subscriptions': { budget: 35, spent: 30 }, 'household': { budget: 50, spent: 46 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 145, spent: 140 }, 'food-delivery': { budget: 80, spent: 85 }, 'transport': { budget: 60, spent: 58 }, 'subscriptions': { budget: 35, spent: 35 }, 'household': { budget: 50, spent: 50 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 145, spent: 122 }, 'food-delivery': { budget: 80, spent: 75 }, 'transport': { budget: 60, spent: 50 }, 'subscriptions': { budget: 35, spent: 30 }, 'household': { budget: 50, spent: 43 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 145, spent: 138 }, 'food-delivery': { budget: 80, spent: 88 }, 'transport': { budget: 60, spent: 55 }, 'subscriptions': { budget: 35, spent: 35 }, 'household': { budget: 50, spent: 48 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 145, spent: 128 }, 'food-delivery': { budget: 80, spent: 80 }, 'transport': { budget: 60, spent: 52 }, 'subscriptions': { budget: 35, spent: 30 }, 'household': { budget: 50, spent: 45 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 145, spent: 118 }, 'food-delivery': { budget: 80, spent: 72 }, 'transport': { budget: 60, spent: 42 }, 'subscriptions': { budget: 35, spent: 30 }, 'household': { budget: 50, spent: 38 } } },
    ],
  },

  // ─── CLT008 Christopher Lee | low risk | ADV002 | portfolio £980K (inactive) ─
  CLT008: {
    customerId: 'CLT008',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 700,
    fixedCommitments: 400,
    availableToSpend: 300,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 90,  spent: 0,   projectedSpend: 0,   essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 20,  spent: 0,   projectedSpend: 0,   essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 30,  spent: 0,   projectedSpend: 0,   essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 15,  spent: 9,   projectedSpend: 15,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 45,  spent: 0,   projectedSpend: 0,   essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt008-inactive',
        title: 'Account inactive — no recent transactions',
        description: 'No spend recorded this week. Subscription auto-debits are still active.',
        impact: 'Consider reviewing account status',
        priority: 'low',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT008-001', merchant: 'Amazon Prime',           categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 8.99,  date: '2026-05-09T00:00:00', channel: 'direct-debit' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 90, spent: 62 }, 'food-delivery': { budget: 20, spent: 12 }, 'transport': { budget: 30, spent: 22 }, 'subscriptions': { budget: 15, spent: 9 }, 'household': { budget: 45, spent: 40 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 90, spent: 55 }, 'food-delivery': { budget: 20, spent: 8  }, 'transport': { budget: 30, spent: 18 }, 'subscriptions': { budget: 15, spent: 9 }, 'household': { budget: 45, spent: 38 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 90, spent: 30 }, 'food-delivery': { budget: 20, spent: 0  }, 'transport': { budget: 30, spent: 10 }, 'subscriptions': { budget: 15, spent: 9 }, 'household': { budget: 45, spent: 22 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 90, spent: 15 }, 'food-delivery': { budget: 20, spent: 0  }, 'transport': { budget: 30, spent: 5  }, 'subscriptions': { budget: 15, spent: 9 }, 'household': { budget: 45, spent: 10 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 90, spent: 5  }, 'food-delivery': { budget: 20, spent: 0  }, 'transport': { budget: 30, spent: 0  }, 'subscriptions': { budget: 15, spent: 9 }, 'household': { budget: 45, spent: 0  } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 90, spent: 0  }, 'food-delivery': { budget: 20, spent: 0  }, 'transport': { budget: 30, spent: 0  }, 'subscriptions': { budget: 15, spent: 9 }, 'household': { budget: 45, spent: 0  } } },
    ],
  },

  // ─── CLT009 Maria Garcia | moderate risk | ADV001 | portfolio £3.1M ──────
  CLT009: {
    customerId: 'CLT009',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 1350,
    fixedCommitments: 590,
    availableToSpend: 760,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 185, spent: 140, projectedSpend: 178, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 90,  spent: 65,  projectedSpend: 88,  essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 75,  spent: 55,  projectedSpend: 72,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 40,  spent: 38,  projectedSpend: 40,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 65,  spent: 48,  projectedSpend: 62,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt009-on-track',
        title: 'Spending on track this week',
        description: 'All categories are within budget. Grocery and household are tracking well.',
        impact: 'Projected surplus: GBP 28 vs weekly cap',
        priority: 'low',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT009-001', merchant: 'Tesco Superstore',       categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 72.5,  date: '2026-05-13T10:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT009-002', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 32.8,  date: '2026-05-12T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT009-003', merchant: 'Shell',                  categoryId: 'transport',      categoryLabel: 'Transport',     amount: 55.0,  date: '2026-05-11T08:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT009-004', merchant: 'Tesco Metro',            categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 48.5,  date: '2026-05-11T17:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT009-005', merchant: 'Spotify',                categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 10.99, date: '2026-05-10T00:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT009-006', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 25.5,  date: '2026-05-10T19:30:00', channel: 'card' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 185, spent: 165 }, 'food-delivery': { budget: 90, spent: 78 }, 'transport': { budget: 75, spent: 68 }, 'subscriptions': { budget: 40, spent: 38 }, 'household': { budget: 65, spent: 60 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 185, spent: 178 }, 'food-delivery': { budget: 90, spent: 88 }, 'transport': { budget: 75, spent: 72 }, 'subscriptions': { budget: 40, spent: 40 }, 'household': { budget: 65, spent: 64 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 185, spent: 152 }, 'food-delivery': { budget: 90, spent: 72 }, 'transport': { budget: 75, spent: 62 }, 'subscriptions': { budget: 40, spent: 38 }, 'household': { budget: 65, spent: 55 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 185, spent: 170 }, 'food-delivery': { budget: 90, spent: 85 }, 'transport': { budget: 75, spent: 70 }, 'subscriptions': { budget: 40, spent: 38 }, 'household': { budget: 65, spent: 62 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 185, spent: 162 }, 'food-delivery': { budget: 90, spent: 80 }, 'transport': { budget: 75, spent: 66 }, 'subscriptions': { budget: 40, spent: 40 }, 'household': { budget: 65, spent: 58 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 185, spent: 140 }, 'food-delivery': { budget: 90, spent: 65 }, 'transport': { budget: 75, spent: 55 }, 'subscriptions': { budget: 40, spent: 38 }, 'household': { budget: 65, spent: 48 } } },
    ],
  },

  // ─── CLT010 Thomas Anderson | high risk | ADV002 | portfolio £7.5M ───────
  CLT010: {
    customerId: 'CLT010',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 3800,
    fixedCommitments: 1400,
    availableToSpend: 2400,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 350, spent: 280, projectedSpend: 370, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 420, spent: 510, projectedSpend: 650, essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 280, spent: 195, projectedSpend: 255, essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 180, spent: 175, projectedSpend: 180, essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 200, spent: 120, projectedSpend: 160, essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt010-delivery-critical',
        title: 'Food delivery is critically over budget',
        description: 'Already 21% over food delivery cap. Projected to finish at 55% over weekly limit.',
        impact: 'Potential overspend: GBP 230 vs cap',
        priority: 'high',
      },
      {
        id: 'act-clt010-grocery-pace',
        title: 'Grocery projected to breach cap',
        description: 'On current pace, groceries will exceed budget by GBP 20.',
        impact: 'Use planned list to avoid overspend',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT010-001', merchant: 'Deliveroo Plus',         categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 142.0, date: '2026-05-13T20:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT010-002', merchant: 'Whole Foods Market',     categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 148.5, date: '2026-05-12T14:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT010-003', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 98.5,  date: '2026-05-12T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT010-004', merchant: 'Addison Lee',            categoryId: 'transport',      categoryLabel: 'Transport',     amount: 95.0,  date: '2026-05-11T22:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT010-005', merchant: 'Apple One Premier',      categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 39.99, date: '2026-05-11T00:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT010-006', merchant: 'Waitrose Marylebone',    categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 112.0, date: '2026-05-11T13:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT010-007', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 115.5, date: '2026-05-10T20:00:00', channel: 'card' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 350, spent: 320 }, 'food-delivery': { budget: 420, spent: 468 }, 'transport': { budget: 280, spent: 245 }, 'subscriptions': { budget: 180, spent: 175 }, 'household': { budget: 200, spent: 158 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 350, spent: 340 }, 'food-delivery': { budget: 420, spent: 495 }, 'transport': { budget: 280, spent: 262 }, 'subscriptions': { budget: 180, spent: 180 }, 'household': { budget: 200, spent: 172 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 350, spent: 298 }, 'food-delivery': { budget: 420, spent: 448 }, 'transport': { budget: 280, spent: 228 }, 'subscriptions': { budget: 180, spent: 175 }, 'household': { budget: 200, spent: 145 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 350, spent: 335 }, 'food-delivery': { budget: 420, spent: 522 }, 'transport': { budget: 280, spent: 255 }, 'subscriptions': { budget: 180, spent: 180 }, 'household': { budget: 200, spent: 162 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 350, spent: 318 }, 'food-delivery': { budget: 420, spent: 488 }, 'transport': { budget: 280, spent: 240 }, 'subscriptions': { budget: 180, spent: 175 }, 'household': { budget: 200, spent: 152 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 350, spent: 280 }, 'food-delivery': { budget: 420, spent: 510 }, 'transport': { budget: 280, spent: 195 }, 'subscriptions': { budget: 180, spent: 175 }, 'household': { budget: 200, spent: 120 } } },
    ],
  },

  // ─── CLT011 Patricia Moore | low risk | ADV001 | portfolio £560K ─────────
  CLT011: {
    customerId: 'CLT011',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 620,
    fixedCommitments: 320,
    availableToSpend: 300,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 95,  spent: 68,  projectedSpend: 90,  essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 20,  spent: 8,   projectedSpend: 12,  essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 30,  spent: 20,  projectedSpend: 28,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 12,  spent: 9,   projectedSpend: 12,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 55,  spent: 40,  projectedSpend: 52,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt011-on-track',
        title: 'All categories well within budget',
        description: 'Consistent and conservative spending this week. No action required.',
        impact: 'Surplus of ~GBP 54 projected',
        priority: 'low',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT011-001', merchant: 'Lidl',                   categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 38.0,  date: '2026-05-13T09:30:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT011-002', merchant: 'Bus Pass',               categoryId: 'transport',      categoryLabel: 'Transport',     amount: 20.0,  date: '2026-05-12T07:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT011-003', merchant: 'Lidl',                   categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 22.5,  date: '2026-05-10T11:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT011-004', merchant: 'B&Q',                    categoryId: 'household',      categoryLabel: 'Household',     amount: 40.0,  date: '2026-05-10T14:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT011-005', merchant: 'Netflix',                categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 7.99,  date: '2026-05-09T00:00:00', channel: 'direct-debit' },
      { id: 'PFMS-TXN-CLT011-006', merchant: 'Pizza Hut Delivery',     categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 8.0,   date: '2026-05-09T19:00:00', channel: 'card' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 95, spent: 85 }, 'food-delivery': { budget: 20, spent: 10 }, 'transport': { budget: 30, spent: 25 }, 'subscriptions': { budget: 12, spent: 8 }, 'household': { budget: 55, spent: 50 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 95, spent: 90 }, 'food-delivery': { budget: 20, spent: 12 }, 'transport': { budget: 30, spent: 28 }, 'subscriptions': { budget: 12, spent: 8 }, 'household': { budget: 55, spent: 52 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 95, spent: 78 }, 'food-delivery': { budget: 20, spent: 8  }, 'transport': { budget: 30, spent: 22 }, 'subscriptions': { budget: 12, spent: 8 }, 'household': { budget: 55, spent: 48 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 95, spent: 88 }, 'food-delivery': { budget: 20, spent: 14 }, 'transport': { budget: 30, spent: 26 }, 'subscriptions': { budget: 12, spent: 8 }, 'household': { budget: 55, spent: 51 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 95, spent: 82 }, 'food-delivery': { budget: 20, spent: 10 }, 'transport': { budget: 30, spent: 24 }, 'subscriptions': { budget: 12, spent: 8 }, 'household': { budget: 55, spent: 50 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 95, spent: 68 }, 'food-delivery': { budget: 20, spent: 8  }, 'transport': { budget: 30, spent: 20 }, 'subscriptions': { budget: 12, spent: 9 }, 'household': { budget: 55, spent: 40 } } },
    ],
  },

  // ─── CLT012 Daniel Brown | moderate risk | ADV002 | portfolio £2.1M ──────
  CLT012: {
    customerId: 'CLT012',
    weekLabel: 'Week of 13 May',
    weeklyIncome: 1100,
    fixedCommitments: 510,
    availableToSpend: 590,
    categories: [
      { id: 'tesco-grocery',  label: 'Tesco Grocery',  weeklyBudget: 155, spent: 128, projectedSpend: 155, essential: true },
      { id: 'food-delivery',  label: 'Food Delivery',  weeklyBudget: 95,  spent: 88,  projectedSpend: 118, essential: false },
      { id: 'transport',      label: 'Transport',      weeklyBudget: 70,  spent: 52,  projectedSpend: 68,  essential: true },
      { id: 'subscriptions',  label: 'Subscriptions',  weeklyBudget: 38,  spent: 35,  projectedSpend: 38,  essential: false },
      { id: 'household',      label: 'Household',      weeklyBudget: 55,  spent: 42,  projectedSpend: 54,  essential: true },
    ],
    nextActions: [
      {
        id: 'act-clt012-delivery-over',
        title: 'Food delivery projected to overspend',
        description: 'Projected to exceed food delivery budget by GBP 23.',
        impact: 'Limit to 1 more order this week',
        priority: 'medium',
      },
    ],
    recentTransactions: [
      { id: 'PFMS-TXN-CLT012-001', merchant: 'Tesco Superstore',       categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 68.5,  date: '2026-05-13T11:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT012-002', merchant: 'Uber Eats',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 42.5,  date: '2026-05-12T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT012-003', merchant: 'Tesco Express',          categoryId: 'tesco-grocery', categoryLabel: 'Tesco Grocery', amount: 38.2,  date: '2026-05-11T18:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT012-004', merchant: 'National Rail',          categoryId: 'transport',      categoryLabel: 'Transport',     amount: 52.0,  date: '2026-05-11T08:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT012-005', merchant: 'Deliveroo',              categoryId: 'food-delivery', categoryLabel: 'Food Delivery', amount: 35.5,  date: '2026-05-10T20:00:00', channel: 'card' },
      { id: 'PFMS-TXN-CLT012-006', merchant: 'HBO Max',                categoryId: 'subscriptions', categoryLabel: 'Subscriptions', amount: 13.99, date: '2026-05-10T00:00:00', channel: 'direct-debit' },
    ],
    history: [
      { weekLabel: 'Apr 8',  categories: { 'tesco-grocery': { budget: 155, spent: 142 }, 'food-delivery': { budget: 95, spent: 88 },  'transport': { budget: 70, spent: 64 }, 'subscriptions': { budget: 38, spent: 35 }, 'household': { budget: 55, spent: 51 } } },
      { weekLabel: 'Apr 15', categories: { 'tesco-grocery': { budget: 155, spent: 150 }, 'food-delivery': { budget: 95, spent: 102 }, 'transport': { budget: 70, spent: 68 }, 'subscriptions': { budget: 38, spent: 38 }, 'household': { budget: 55, spent: 54 } } },
      { weekLabel: 'Apr 22', categories: { 'tesco-grocery': { budget: 155, spent: 130 }, 'food-delivery': { budget: 95, spent: 82 },  'transport': { budget: 70, spent: 58 }, 'subscriptions': { budget: 38, spent: 35 }, 'household': { budget: 55, spent: 46 } } },
      { weekLabel: 'Apr 29', categories: { 'tesco-grocery': { budget: 155, spent: 145 }, 'food-delivery': { budget: 95, spent: 95 },  'transport': { budget: 70, spent: 65 }, 'subscriptions': { budget: 38, spent: 38 }, 'household': { budget: 55, spent: 52 } } },
      { weekLabel: 'May 6',  categories: { 'tesco-grocery': { budget: 155, spent: 138 }, 'food-delivery': { budget: 95, spent: 90 },  'transport': { budget: 70, spent: 62 }, 'subscriptions': { budget: 38, spent: 35 }, 'household': { budget: 55, spent: 49 } } },
      { weekLabel: 'May 13', categories: { 'tesco-grocery': { budget: 155, spent: 128 }, 'food-delivery': { budget: 95, spent: 88 },  'transport': { budget: 70, spent: 52 }, 'subscriptions': { budget: 38, spent: 35 }, 'household': { budget: 55, spent: 42 } } },
    ],
  },
}

export function getPFMSSnapshotForCustomer(customerId: string): PFMSCustomerSnapshotWithHistory {
  return snapshotsByCustomerId[customerId] ?? snapshotsByCustomerId.CLT001
}

export function getAllPFMSSnapshots(): PFMSCustomerSnapshotWithHistory[] {
  return Object.values(snapshotsByCustomerId)
}

export function getPFMSSnapshotsByAdvisor(advisorClientIds: string[]): PFMSCustomerSnapshotWithHistory[] {
  return advisorClientIds
    .map(id => snapshotsByCustomerId[id])
    .filter((s): s is PFMSCustomerSnapshotWithHistory => s !== undefined)
}
