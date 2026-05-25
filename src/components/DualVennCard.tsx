import type { DualCompareResult } from '../logic/aggregate'
import { USER_CONFIGS } from '../contexts/IdentityContext'

interface DualVennCardProps {
  stats: DualCompareResult
}

export function DualVennCard({ stats }: DualVennCardProps) {
  const cfgA = USER_CONFIGS.userA
  const cfgB = USER_CONFIGS.userB

  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-mist)' }}>
        打卡重叠分析
      </h3>

      {/* Venn diagram (simplified visual) */}
      <div className="flex items-center justify-center gap-0 mb-6 relative h-28">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center opacity-70"
          style={{ backgroundColor: cfgA.color, zIndex: 1 }}
        >
          <span className="text-white text-sm font-bold">{stats.onlyA}</span>
        </div>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center opacity-70 -ml-8"
          style={{ backgroundColor: cfgB.color, zIndex: 1 }}
        >
          <span className="text-white text-sm font-bold">{stats.onlyB}</span>
        </div>
        {/* Overlap label */}
        <div
          className="absolute text-white text-sm font-bold z-10"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {stats.checkedBoth}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem label={`仅${cfgA.label}打卡`} value={stats.onlyA} color={cfgA.color} />
        <StatItem label={`仅${cfgB.label}打卡`} value={stats.onlyB} color={cfgB.color} />
        <StatItem label="共同打卡" value={stats.checkedBoth} color="var(--color-gold)" />
        <StatItem label="均未打卡" value={stats.neitherChecked} color="var(--color-mist)" />
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>{label}</div>
    </div>
  )
}
