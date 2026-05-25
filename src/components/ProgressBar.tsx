import { USER_CONFIGS } from '../contexts/IdentityContext'
import type { DualCompareResult } from '../logic/aggregate'

interface ProgressBarProps {
  /** 全部 195 件统计 */
  stats: DualCompareResult
  /** 常设可达统计（非书画+非noPublicDisplay+有常设） */
  permStats: DualCompareResult
}

export function ProgressBar({ stats, permStats }: ProgressBarProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* 全部打卡进度 */}
      <Section title="全部打卡进度" total={stats.total} stats={stats} />

      <div
        className="my-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      />

      {/* 常设可达进度 */}
      <Section
        title="常设可达打卡"
        subtitle="非书画 · 非暂不展出 · 有常设"
        total={permStats.total}
        stats={permStats}
      />
    </div>
  )
}

function Section({
  title,
  subtitle,
  total,
  stats,
}: {
  title: string
  subtitle?: string
  total: number
  stats: DualCompareResult
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-sm" style={{ color: 'var(--color-mist)' }}>
          共 {total} 件
        </span>
      </div>

      {(['zuo', 'huang'] as const).map((uid) => {
        const cfg = USER_CONFIGS[uid]
        const checked = uid === 'zuo' ? stats.checkedA : stats.checkedB
        const pct = total > 0 ? (checked / total) * 100 : 0

        return (
          <div key={uid} className="mb-2 last:mb-0">
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
                {checked} / {total}
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
