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
  // CLT005 – Amanda Foster (low risk, £890k, pending onboarding)
  CLT005: {
    clientId: 'CLT005',
    totalValue: 890000,
    holdings: [
      { asset: 'Treasury Bonds', ticker: 'TLT', type: 'bond', value: 356000, allocation: 40.0, change: 3.1 },
      { asset: 'Municipal Bonds', ticker: 'MUB', type: 'bond', value: 178000, allocation: 20.0, change: 2.6 },
      { asset: 'Total Stock Market ETF', ticker: 'VTI', type: 'etf', value: 133500, allocation: 15.0, change: 9.5 },
      { asset: 'Short-Term Bond Fund', ticker: 'SHY', type: 'bond', value: 133500, allocation: 15.0, change: 1.2 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 89000, allocation: 10.0, change: 0 },
    ],
    performance: { daily: 0.08, weekly: 0.4, monthly: 0.9, yearly: 4.8 },
  },
  // CLT007 – Jennifer Walsh (moderate risk, £1.65m; equity drifted to 58% per CASE004)
  CLT007: {
    clientId: 'CLT007',
    totalValue: 1650000,
    holdings: [
      { asset: 'S&P 500 ETF', ticker: 'SPY', type: 'etf', value: 495000, allocation: 30.0, change: 8.5 },
      { asset: 'Growth Fund', ticker: 'VUG', type: 'etf', value: 264000, allocation: 16.0, change: 15.2 },
      { asset: 'Microsoft Corp.', ticker: 'MSFT', type: 'stock', value: 198000, allocation: 12.0, change: 15.3 },
      { asset: 'Bond Fund', ticker: 'AGG', type: 'bond', value: 462000, allocation: 28.0, change: 2.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 231000, allocation: 14.0, change: 0 },
    ],
    performance: { daily: 0.52, weekly: 2.1, monthly: 4.5, yearly: 18.2 },
  },
  // CLT008 – Christopher Lee (low risk, £980k, inactive)
  CLT008: {
    clientId: 'CLT008',
    totalValue: 980000,
    holdings: [
      { asset: 'Treasury Bonds', ticker: 'TLT', type: 'bond', value: 392000, allocation: 40.0, change: 3.1 },
      { asset: 'Bond Fund', ticker: 'AGG', type: 'bond', value: 245000, allocation: 25.0, change: 2.5 },
      { asset: 'Total Stock Market ETF', ticker: 'VTI', type: 'etf', value: 196000, allocation: 20.0, change: 9.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 147000, allocation: 15.0, change: 0 },
    ],
    performance: { daily: 0.10, weekly: 0.5, monthly: 1.1, yearly: 5.4 },
  },
  // CLT009 – Maria Garcia (moderate risk, £3.1m)
  CLT009: {
    clientId: 'CLT009',
    totalValue: 3100000,
    holdings: [
      { asset: 'Vanguard S&P 500 ETF', ticker: 'VOO', type: 'etf', value: 775000, allocation: 25.0, change: 8.2 },
      { asset: 'Microsoft Corp.', ticker: 'MSFT', type: 'stock', value: 465000, allocation: 15.0, change: 15.3 },
      { asset: 'Total Stock Market ETF', ticker: 'VTI', type: 'etf', value: 620000, allocation: 20.0, change: 9.5 },
      { asset: 'Bond Fund', ticker: 'AGG', type: 'bond', value: 620000, allocation: 20.0, change: 2.5 },
      { asset: 'Real Estate Fund', ticker: 'VNQ', type: 'real-estate', value: 310000, allocation: 10.0, change: -1.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 310000, allocation: 10.0, change: 0 },
    ],
    performance: { daily: 0.38, weekly: 1.6, monthly: 3.1, yearly: 13.2 },
  },
  // CLT011 – Patricia Moore (low risk, £560k)
  CLT011: {
    clientId: 'CLT011',
    totalValue: 560000,
    holdings: [
      { asset: 'Treasury Bonds', ticker: 'TLT', type: 'bond', value: 224000, allocation: 40.0, change: 3.1 },
      { asset: 'Municipal Bonds', ticker: 'MUB', type: 'bond', value: 168000, allocation: 30.0, change: 2.6 },
      { asset: 'Bond Fund', ticker: 'AGG', type: 'bond', value: 112000, allocation: 20.0, change: 2.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 56000, allocation: 10.0, change: 0 },
    ],
    performance: { daily: 0.06, weekly: 0.3, monthly: 0.7, yearly: 3.8 },
  },
  // CLT012 – Daniel Brown (moderate risk, £2.1m)
  CLT012: {
    clientId: 'CLT012',
    totalValue: 2100000,
    holdings: [
      { asset: 'S&P 500 ETF', ticker: 'SPY', type: 'etf', value: 630000, allocation: 30.0, change: 8.5 },
      { asset: 'International ETF', ticker: 'VXUS', type: 'etf', value: 315000, allocation: 15.0, change: 4.2 },
      { asset: 'Apple Inc.', ticker: 'AAPL', type: 'stock', value: 315000, allocation: 15.0, change: 12.5 },
      { asset: 'Bond Fund', ticker: 'AGG', type: 'bond', value: 630000, allocation: 30.0, change: 2.5 },
      { asset: 'Cash & Equivalents', type: 'cash', value: 210000, allocation: 10.0, change: 0 },
    ],
    performance: { daily: 0.32, weekly: 1.4, monthly: 2.9, yearly: 11.8 },
  },
}

export function getPortfolioByClientId(clientId: string): Portfolio | undefined {
  return mockPortfolios[clientId]
}
