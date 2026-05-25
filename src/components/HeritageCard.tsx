import { useState } from 'react'
import type { HeritageSite } from '../data/heritage'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import type { HeritageCheckinSet } from '../hooks/useHeritageCheckins'
import { Avatar } from './Avatar'

interface HeritageCardProps {
  site: HeritageSite
  checkinSet: HeritageCheckinSet
  onClick?: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  文化遗产: { bg: '#FFF0E5', fg: '#A23B2C' },
  自然遗产: { bg: '#E8F5E9', fg: '#2E7D32' },
  混合遗产: { bg: '#EDE7F6', fg: '#5E35B1' },
}

export function HeritageCard({ site, checkinSet, onClick }: HeritageCardProps) {
  const checkedA = checkinSet.has(`zuo:${site.id}`)
  const checkedB = checkinSet.has(`huang:${site.id}`)
  const [imgError, setImgError] = useState(false)
  const catColor = CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS['文化遗产']

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border overflow-hidden transition-all hover:shadow-md focus:outline-none focus:ring-2 group"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* 配图 */}
      <div
        className="relative h-40 w-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface-alt)' }}
      >
        {!imgError ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
            style={{ backgroundColor: catColor.bg, color: catColor.fg }}
          >
            <div className="text-3xl mb-1">🏛️</div>
            <div
              className="text-sm font-medium px-2 line-clamp-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {site.name}
            </div>
          </div>
        )}

        {/* 年份角标 */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {site.yearInscribed}
        </div>

        {/* 头像角标 */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {(['zuo', 'huang'] as const).map((uid) => {
            const cfg = USER_CONFIGS[uid]
            const checked = uid === 'zuo' ? checkedA : checkedB
            return (
              <Avatar
                key={uid}
                user={cfg}
                size={26}
                active={checked}
                dimWhenInactive
                title={`${cfg.label}：${checked ? '已打卡' : '未打卡'}`}
                style={{
                  boxShadow: checked
                    ? `0 0 0 1.5px ${cfg.color}, 0 2px 6px rgba(0,0,0,0.25)`
                    : '0 1px 3px rgba(0,0,0,0.25)',
                  border: checked ? `1px solid ${cfg.color}` : '1px solid rgba(255,255,255,0.5)',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* 内容 */}
      <div className="p-3">
        <h3
          className="text-base font-medium leading-snug line-clamp-2 mb-1.5"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          {site.name}
        </h3>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: catColor.bg, color: catColor.fg }}
          >
            {site.category}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
            {site.province}
          </span>
        </div>

        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: 'var(--color-mist)' }}
        >
          {site.description}
        </p>
      </div>
    </button>
  )
}
