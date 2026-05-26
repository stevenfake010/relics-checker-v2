import type { GuobaoSite } from '../data/guobao'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import type { GuobaoCheckinSet } from '../hooks/useGuobaoCheckins'
import { Avatar } from './Avatar'

interface GuobaoCardProps {
  site: GuobaoSite
  checkinSet: GuobaoCheckinSet
  onClick?: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  古建筑: { bg: '#FFF0E5', fg: '#A23B2C' },
  古遗址: { bg: '#E8F5E9', fg: '#2E7D32' },
  古墓葬: { bg: '#EDE7F6', fg: '#5E35B1' },
  石窟寺: { bg: '#FFF8E1', fg: '#F57F17' },
  '石刻及其他': { bg: '#E3F2FD', fg: '#1565C0' },
}

export function GuobaoCard({ site, checkinSet, onClick }: GuobaoCardProps) {
  const checkedA = checkinSet.has(`zuo:${site.id}`)
  const checkedB = checkinSet.has(`huang:${site.id}`)
  const catColor = CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS['古建筑']

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
      {/* Header: title + avatars */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3
          className="text-sm font-medium leading-snug line-clamp-2 flex-1 min-w-0"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          {site.name}
        </h3>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {(['zuo', 'huang'] as const).map((uid) => {
            const cfg = USER_CONFIGS[uid]
            const checked = uid === 'zuo' ? checkedA : checkedB
            return (
              <Avatar
                key={uid}
                user={cfg}
                size={20}
                active={checked}
                dimWhenInactive
                title={`${cfg.label}：${checked ? '已打卡' : '未打卡'}`}
              />
            )
          })}
        </div>
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
          第{site.batch === 1 ? '一' : '二'}批
        </span>
      </div>

      {/* Location + era */}
      <div className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: 'var(--color-mist)' }}>
        <span>📍 {site.province} · {site.city}</span>
        <span>·</span>
        <span>{site.era}</span>
      </div>
    </button>
  )
}
