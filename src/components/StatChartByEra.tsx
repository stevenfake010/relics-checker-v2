import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { EraStats } from '../logic/aggregate'
import { ERA_LABELS } from '../data/meta'
import { USER_CONFIGS } from '../contexts/IdentityContext'

interface StatChartByEraProps {
  data: EraStats[]
}

export function StatChartByEra({ data }: StatChartByEraProps) {
  const cfgA = USER_CONFIGS.userA
  const cfgB = USER_CONFIGS.userB

  const chartData = data.map((d) => ({
    era: ERA_LABELS[d.era],
    total: d.total,
    [cfgA.label]: d.checkedA,
    [cfgB.label]: d.checkedB,
  }))

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-mist)' }}>
        按朝代打卡统计
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="era"
            tick={{ fontSize: 11, fill: 'var(--color-mist)' }}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-mist)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={cfgA.label} fill={cfgA.color} />
          <Bar dataKey={cfgB.label} fill={cfgB.color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
