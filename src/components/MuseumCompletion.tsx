import type { MuseumStats } from '../logic/aggregate'
import { USER_CONFIGS } from '../contexts/IdentityContext'

interface MuseumCompletionProps {
  data: MuseumStats[]
  limit?: number
}

export function MuseumCompletion({ data, limit = 15 }: MuseumCompletionProps) {
  const cfgA = USER_CONFIGS.zuo
  const cfgB = USER_CONFIGS.huang
  const displayed = data.slice(0, limit)

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-mist)' }}>
        博物馆完成度
      </h3>
      <div className="space-y-3">
        {displayed.map((m) => (
          <div key={m.museum}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs truncate" style={{ color: 'var(--color-ink)', maxWidth: '60%' }}>
                {m.museum}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                {m.total}件
              </span>
            </div>
            {/* Progress bars for A and B */}
            <div className="space-y-1">
              {([cfgA, cfgB] as const).map((cfg, i) => {
                const pct = i === 0 ? m.pctA : m.pctB
                const checked = i === 0 ? m.checkedA : m.checkedB
                return (
                  <div key={cfg.id} className="flex items-center gap-2">
                    <span
                      className="text-xs w-4 text-center font-bold"
                      style={{ color: cfg.color, fontFamily: 'var(--font-serif)' }}
                    >
                      {cfg.sealChar}
                    </span>
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-surface-alt)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--color-mist)' }}>
                      {checked}/{m.total}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
