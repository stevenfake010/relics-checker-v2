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
      className="w-full text-left rounded-lg border overflow-hidden transition-all hover:shadow-md focus:outline-none focus:ring-2 group flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* 配图（接近方形，约 1:1，与图源 aspect 匹配） */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '1 / 1', backgroundColor: 'var(--color-surface-alt)' }}
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
            <div className="text-4xl mb-1">🏛️</div>
            <div
              className="text-sm font-medium px-2 line-clamp-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {site.name}
            </div>
          </div>
        )}

        {/* 年份小角标（左上） */}
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
      </div>

      {/* 内容区 */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        {/* 标题 + 头像同一行 */}
        <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1">
          <h3
            className="text-sm sm:text-base font-medium leading-snug line-clamp-2 flex-1 min-w-0"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {site.name}
          </h3>
          {/* 双人头像放在标题右侧，独立空间 */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 -mt-0.5">
            {(['zuo', 'huang'] as const).map((uid) => {
              const cfg = USER_CONFIGS[uid]
              const checked = uid === 'zuo' ? checkedA : checkedB
              return (
                <Avatar
                  key={uid}
                  user={cfg}
                  size={22}
                  active={checked}
                  dimWhenInactive
                  title={`${cfg.label}：${checked ? '已打卡' : '未打卡'}`}
                />
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
          <span
            className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs"
            style={{ backgroundColor: catColor.bg, color: catColor.fg }}
          >
            {site.category}
          </span>
          <span className="text-[10px] sm:text-xs" style={{ color: 'var(--color-mist)' }}>
            {site.province}
          </span>
        </div>

        <p
          className="text-[10px] sm:text-xs leading-relaxed line-clamp-2 hidden sm:block"
          style={{ color: 'var(--color-mist)' }}
        >
          {site.description}
        </p>
      </div>
    </button>
  )
}
