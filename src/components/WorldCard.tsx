import type { WorldSite } from '../data/world'
import type { WorldCheckinSet } from '../hooks/useWorldCheckins'
import { CheckinAvatars } from './CheckinAvatars'

interface WorldCardProps {
  site: WorldSite
  checkinSet: WorldCheckinSet
  onClick?: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  文化遗产: { bg: '#FFF0E5', fg: '#A23B2C' },
  自然遗产: { bg: '#E8F5E9', fg: '#2E7D32' },
  混合遗产: { bg: '#EDE7F6', fg: '#5E35B1' },
}

export function WorldCard({ site, checkinSet, onClick }: WorldCardProps) {
  const catColor = CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS['文化遗产']

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border overflow-hidden transition-all hover:shadow-md focus:outline-none focus:ring-2 p-3 flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header: rank + title + avatars */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span
            className="flex-shrink-0 inline-flex items-center justify-center rounded text-[11px] font-bold mt-0.5"
            style={{
              minWidth: '22px',
              height: '20px',
              padding: '0 4px',
              backgroundColor: 'var(--color-vermilion)',
              color: '#fff',
            }}
          >
            {site.rank}
          </span>
          <h3
            className="text-sm font-medium leading-snug line-clamp-2 min-w-0"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {site.name}
          </h3>
        </div>
        <CheckinAvatars checkinSet={checkinSet} itemId={site.id} size={20} />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        <span
          className="px-1.5 py-0.5 rounded text-[10px]"
          style={{ backgroundColor: catColor.bg, color: catColor.fg }}
        >
          {site.category}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-mist)' }}>
          {site.yearInscribed}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: 'var(--color-mist)' }}>
        <span>📍 {site.country}</span>
        <span>·</span>
        <span>{site.region}</span>
      </div>
    </button>
  )
}
