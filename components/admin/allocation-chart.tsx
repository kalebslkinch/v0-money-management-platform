'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface AllocationChartProps {
  data: { name: string; value: number; fill: string }[]
}

const COLORS = [
  'oklch(0.75 0.18 195)',  // Primary cyan
  'oklch(0.72 0.19 145)',  // Emerald
  'oklch(0.70 0.18 310)',  // Magenta
  'oklch(0.78 0.16 85)',   // Amber
  'oklch(0.65 0.22 265)',  // Indigo
]

export function AllocationChart({ data }: AllocationChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold mb-1">Asset Allocation</h3>
        <p className="text-sm text-muted-foreground">Portfolio distribution</p>
      </div>
      
      <div className="p-6">
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">{total}%</span>
            <span className="text-xs text-muted-foreground">Allocated</span>
          </div>
        </div>
        
        {/* Legend with progress bars */}
        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.value}%`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
