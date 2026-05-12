import type { Portfolio } from '@/lib/types/admin'

export const mockPortfolios: Record<string, Portfolio> = {
  CLT001: {
    clientId: 'CLT001',
    totalValue: 2450000,
    holdings: [
      { asset: 'Apple Inc.', ticker: 'AAPL', type: 'stock', value: 450000, allocation: 18.4, change: 12.5 },
      { asset: 'Vanguard S&P 500 ETF', ticker: 'VOO', type: 'etf', value: 680000, allocation: 27.8, change: 8.2 },
      { asset: 'Microsoft Corp.', ticker: 'MSFT', type: 'stock', value: 320000, allocation: 13.1, change: 15.3 },
      { asset: 'Vanguard Bond ETF', ticker: 'BND', type: 'bond', value: 550000, allocation: 22.4, change: 2.1 },
      { asset: 'Real Estate Fund', ticker: 'VNQ', type: 'real-estate', value: 250000, allocation: 10.2, change: -1.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 200000, allocation: 8.2, change: 0 },
    ],
    performance: { daily: 0.42, weekly: 1.8, monthly: 3.2, yearly: 14.5 },
  },
  CLT002: {
    clientId: 'CLT002',
    totalValue: 5800000,
    holdings: [
      { asset: 'NVIDIA Corp.', ticker: 'NVDA', type: 'stock', value: 1200000, allocation: 20.7, change: 45.2 },
      { asset: 'Tesla Inc.', ticker: 'TSLA', type: 'stock', value: 800000, allocation: 13.8, change: -8.5 },
      { asset: 'Bitcoin ETF', ticker: 'IBIT', type: 'crypto', value: 580000, allocation: 10.0, change: 25.0 },
      { asset: 'Nasdaq 100 ETF', ticker: 'QQQ', type: 'etf', value: 1500000, allocation: 25.9, change: 12.8 },
      { asset: 'Corporate Bonds', ticker: 'LQD', type: 'bond', value: 920000, allocation: 15.9, change: 1.8 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 800000, allocation: 13.8, change: 0 },
    ],
    performance: { daily: 1.25, weekly: 4.2, monthly: 8.5, yearly: 28.3 },
  },
  CLT003: {
    clientId: 'CLT003',
    totalValue: 1200000,
    holdings: [
      { asset: 'Vanguard Total Stock', ticker: 'VTI', type: 'etf', value: 360000, allocation: 30.0, change: 9.5 },
      { asset: 'Treasury Bonds', ticker: 'TLT', type: 'bond', value: 480000, allocation: 40.0, change: 3.2 },
      { asset: 'Municipal Bonds', ticker: 'MUB', type: 'bond', value: 240000, allocation: 20.0, change: 2.8 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 120000, allocation: 10.0, change: 0 },
    ],
    performance: { daily: 0.15, weekly: 0.8, monthly: 1.5, yearly: 6.2 },
  },
  CLT004: {
    clientId: 'CLT004',
    totalValue: 3750000,
    holdings: [
      { asset: 'S&P 500 ETF', ticker: 'SPY', type: 'etf', value: 1125000, allocation: 30.0, change: 8.5 },
      { asset: 'International ETF', ticker: 'VXUS', type: 'etf', value: 562500, allocation: 15.0, change: 4.2 },
      { asset: 'Apple Inc.', ticker: 'AAPL', type: 'stock', value: 375000, allocation: 10.0, change: 12.5 },
      { asset: 'Google Inc.', ticker: 'GOOGL', type: 'stock', value: 375000, allocation: 10.0, change: 18.2 },
      { asset: 'Bond Fund', ticker: 'AGG', type: 'bond', value: 937500, allocation: 25.0, change: 2.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 375000, allocation: 10.0, change: 0 },
    ],
    performance: { daily: 0.35, weekly: 1.5, monthly: 2.8, yearly: 11.2 },
  },
  CLT006: {
    clientId: 'CLT006',
    totalValue: 4200000,
    holdings: [
      { asset: 'Amazon Inc.', ticker: 'AMZN', type: 'stock', value: 840000, allocation: 20.0, change: 22.5 },
      { asset: 'Meta Platforms', ticker: 'META', type: 'stock', value: 630000, allocation: 15.0, change: 35.8 },
      { asset: 'Nasdaq 100 ETF', ticker: 'QQQ', type: 'etf', value: 1260000, allocation: 30.0, change: 12.8 },
      { asset: 'Growth Fund', ticker: 'VUG', type: 'etf', value: 840000, allocation: 20.0, change: 15.2 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 630000, allocation: 15.0, change: 0 },
    ],
    performance: { daily: 0.95, weekly: 3.5, monthly: 6.2, yearly: 24.5 },
  },
  CLT010: {
    clientId: 'CLT010',
    totalValue: 7500000,
    holdings: [
      { asset: 'S&P 500 ETF', ticker: 'SPY', type: 'etf', value: 2250000, allocation: 30.0, change: 8.5 },
      { asset: 'Total Stock Market', ticker: 'VTI', type: 'etf', value: 1500000, allocation: 20.0, change: 9.5 },
      { asset: 'International Developed', ticker: 'VEA', type: 'etf', value: 750000, allocation: 10.0, change: 5.2 },
      { asset: 'Emerging Markets', ticker: 'VWO', type: 'etf', value: 375000, allocation: 5.0, change: -2.5 },
      { asset: 'Corporate Bonds', ticker: 'LQD', type: 'bond', value: 1500000, allocation: 20.0, change: 1.8 },
      { asset: 'Real Estate', ticker: 'VNQ', type: 'real-estate', value: 750000, allocation: 10.0, change: -1.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 375000, allocation: 5.0, change: 0 },
    ],
    performance: { daily: 0.28, weekly: 1.2, monthly: 2.5, yearly: 10.8 },
  },
}

export function getPortfolioByClientId(clientId: string): Portfolio | undefined {
  return mockPortfolios[clientId]
}
