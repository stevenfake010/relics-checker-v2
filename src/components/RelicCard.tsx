import type { Relic } from '../data/types'
import { ERA_LABELS, CAT_LABELS } from '../data/meta'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import type { CheckinSet } from '../hooks/useCheckins'

interface RelicCardProps {
  relic: Relic
  checkinSet: CheckinSet
  onClick?: () => void
}

export function RelicCard({ relic, checkinSet, onClick }: RelicCardProps) {
  const checkedA = checkinSet.has(`userA:${relic.id}`)
  const checkedB = checkinSet.has(`userB:${relic.id}`)

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-medium leading-tight truncate"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {relic.name}
          </h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-mist)' }}>
            {relic.location}
          </p>
        </div>

        {/* Dual seals */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {(['userA', 'userB'] as const).map((uid) => {
            const cfg = USER_CONFIGS[uid]
            const checked = uid === 'userA' ? checkedA : checkedB
            return (
              <div
                key={uid}
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border-2"
                style={{
                  fontFamily: 'var(--font-serif)',
                  borderColor: cfg.color,
                  backgroundColor: checked ? cfg.color : 'transparent',
                  color: checked ? '#fff' : cfg.color,
                  opacity: checked ? 1 : 0.3,
                }}
                title={`${cfg.label}: ${checked ? '已打卡' : '未打卡'}`}
              >
                {cfg.sealChar}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-mist)',
          }}
        >
          {ERA_LABELS[relic.era]}
        </span>
        <span
          className="px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-mist)',
          }}
        >
          {CAT_LABELS[relic.cat]}
        </span>
        {relic.noPublicDisplay && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: '#FFF3CD',
              color: '#856404',
            }}
          >
            暂不展出
          </span>
        )}
      </div>
    </button>
  )
}
