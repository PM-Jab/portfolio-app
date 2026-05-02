'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const TYPE_COLORS: Record<string, string> = {
  'Stock': '#3b82f6',
  'Cryptocurrency': '#f97316',
  'Cash': '#22c55e',
  'Gold': '#eab308',
  'Bond': '#a855f7',
  'Real Estate': '#ef4444',
}

export interface PieSlice {
  name: string
  value: number
}

export function PortfolioPieChart({ data }: { data: PieSlice[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No transaction data yet
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={64}
          outerRadius={96}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? '#6b7280'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            const numericValue = typeof value === 'number' ? value : 0

            return [
              `$${numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${((numericValue / total) * 100).toFixed(1)}%)`,
              'Cost Basis',
            ]
          }}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: '0.75rem' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
