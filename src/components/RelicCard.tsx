import type { Relic } from '../data/types'
import { ERA_LABELS, CAT_LABELS } from '../data/meta'
import type { CheckinSet } from '../hooks/useCheckins'
import { hasPermanentExhibition, getLatestExhibitionYear } from '../logic/filter-logic'
import { CheckinAvatars } from './CheckinAvatars'

interface RelicCardProps {
  relic: Relic
  checkinSet: CheckinSet
  onClick?: () => void
}

export function RelicCard({ relic, checkinSet, onClick }: RelicCardProps) {
  const isPainting = relic.cat === 'painting'
  const perm = hasPermanentExhibition(relic)
  const latestYear = getLatestExhibitionYear(relic)

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

        {/* Dual avatars */}
        <CheckinAvatars checkinSet={checkinSet} itemId={relic.id} size={28} gapClassName="gap-1.5" />
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

        {/* 常设/非常设 标签 */}
        {perm && !isPainting && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
          >
            常设
          </span>
        )}
        {perm && isPainting && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}
          >
            常设·书画
          </span>
        )}
        {!perm && latestYear && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}
            title={`最近一次展出：${latestYear} 年`}
          >
            {latestYear}年展出
          </span>
        )}
        {!perm && !latestYear && relic.noPublicDisplay && (
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
