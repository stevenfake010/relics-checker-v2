import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CatStats } from '../logic/aggregate'
import { CAT_LABELS } from '../data/meta'
import { USER_CONFIGS } from '../contexts/IdentityContext'

interface StatChartByCatProps {
  data: CatStats[]
}

export function StatChartByCat({ data }: StatChartByCatProps) {
  const cfgA = USER_CONFIGS.zuo
  const cfgB = USER_CONFIGS.huang

  const chartData = data.map((d) => ({
    cat: CAT_LABELS[d.cat],
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
        按类别打卡统计
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-mist)' }} />
          <YAxis
            type="category"
            dataKey="cat"
            tick={{ fontSize: 11, fill: 'var(--color-mist)' }}
            width={55}
          />
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
