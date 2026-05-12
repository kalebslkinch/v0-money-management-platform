'use client'

import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils/format'
import { TrendingUp } from 'lucide-react'

interface PortfolioChartProps {
  data: { month: string; value: number; benchmark: number }[]
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  const latestValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const changePercent = ((latestValue - previousValue) / previousValue * 100).toFixed(1)
  
  return (
    <div className="col-span-1 lg:col-span-2 rounded-2xl bg-card border border-border/50 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="relative p-6 pb-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-2/5" />
        <div className="relative flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Portfolio Performance</h3>
            <p className="text-sm text-muted-foreground">Total AUM vs market benchmark</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(latestValue, true)}</div>
            <div className="flex items-center gap-1 text-sm text-chart-2 justify-end">
              <TrendingUp className="size-4" />
              <span>+{changePercent}%</span>
            </div>
          </div>
        </div>
        
        {/* Time period tabs */}
        <div className="flex gap-1 mt-6">
          {['1W', '1M', '3M', '1Y', 'ALL'].map((period, i) => (
            <button
              key={period}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                i === 3 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6 pt-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="oklch(0.72 0.19 145)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="oklch(0.72 0.19 145)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0 0)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="oklch(0.65 0 0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, true)}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                width={55}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-3 shadow-xl">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary" />
                            <span className="text-sm">AUM: <span className="font-semibold">{formatCurrency(payload[0].value as number)}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Benchmark: {formatCurrency(payload[1].value as number)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="oklch(0.5 0 0)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#benchmarkGradient)"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.75 0.18 195)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-gradient-to-r from-primary to-chart-2" />
            <span className="text-muted-foreground">Total AUM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-muted-foreground/50" />
            <span className="text-muted-foreground">S&P 500 Benchmark</span>
          </div>
        </div>
      </div>
    </div>
  )
}
