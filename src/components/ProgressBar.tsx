import { USER_CONFIGS } from '../contexts/IdentityContext'
import type { DualCompareResult } from '../logic/aggregate'

interface ProgressBarProps {
  stats: DualCompareResult
}

export function ProgressBar({ stats }: ProgressBarProps) {
  const pctA = stats.total > 0 ? (stats.checkedA / stats.total) * 100 : 0
  const pctB = stats.total > 0 ? (stats.checkedB / stats.total) * 100 : 0

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium" style={{ color: 'var(--color-mist)' }}>
          打卡进度
        </h2>
        <span className="text-sm" style={{ color: 'var(--color-mist)' }}>
          共 {stats.total} 件
        </span>
      </div>

      {(['userA', 'userB'] as const).map((uid) => {
        const cfg = USER_CONFIGS[uid]
        const checked = uid === 'userA' ? stats.checkedA : stats.checkedB
        const pct = uid === 'userA' ? pctA : pctB

        return (
          <div key={uid} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded text-xs font-bold border flex items-center justify-center"
                  style={{
                    borderColor: cfg.color,
                    color: cfg.color,
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {cfg.sealChar}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-ink)' }}>
                  {cfg.label}
                </span>
              </div>
              <span className="text-sm font-medium" style={{ color: cfg.color }}>
                {checked} / {stats.total}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface-alt)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: cfg.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
