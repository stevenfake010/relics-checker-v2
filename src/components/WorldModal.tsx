import { useEffect } from 'react'
import type { WorldSite } from '../data/world'
import { useIdentity, USER_CONFIGS } from '../contexts/IdentityContext'
import { useWorldCheckinSet, useToggleWorldCheckin } from '../hooks/useWorldCheckins'
import { Avatar } from './Avatar'

interface WorldModalProps {
  site: WorldSite | null
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  文化遗产: { bg: '#FFF0E5', fg: '#A23B2C' },
  自然遗产: { bg: '#E8F5E9', fg: '#2E7D32' },
  混合遗产: { bg: '#EDE7F6', fg: '#5E35B1' },
}

export function WorldModal({ site, onClose }: WorldModalProps) {
  const { currentUser } = useIdentity()
  const checkinSet = useWorldCheckinSet()
  const { mutate: toggleCheckin } = useToggleWorldCheckin()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!site) return null

  const checkedA = checkinSet.has(`zuo:${site.id}`)
  const checkedB = checkinSet.has(`huang:${site.id}`)
  const catColor = CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS['文化遗产']

  const handleToggle = () => {
    if (!currentUser) return
    const checked = checkinSet.has(`${currentUser}:${site.id}`)
    toggleCheckin({ userId: currentUser, siteId: site.id, checked })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,20,16,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
          style={{ color: 'var(--color-mist)' }}
        >
          ✕
        </button>

        <div className="mb-1 text-xs flex items-center gap-2" style={{ color: 'var(--color-mist)' }}>
          <span
            className="inline-flex items-center justify-center rounded text-[11px] font-bold"
            style={{ minWidth: '24px', height: '20px', padding: '0 5px', backgroundColor: 'var(--color-vermilion)', color: '#fff' }}
          >
            No.{site.rank}
          </span>
          <span>旅游价值 {site.score} / 100</span>
        </div>

        <h2
          className="text-xl font-bold mb-1 pr-8"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          {site.name}
        </h2>

        <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--color-mist)' }}>
          {site.nameEn}
        </p>

        <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>
          📍 {site.country} · {site.region}
        </p>

        <div className="flex gap-2 flex-wrap mb-6">
          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: catColor.bg, color: catColor.fg }}>
            {site.category}
          </span>
          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-mist)' }}>
            {site.yearInscribed} 年入选
          </span>
        </div>

        {/* Dual status */}
        <div
          className="flex items-center justify-between p-4 rounded-lg mb-4"
          style={{ backgroundColor: 'var(--color-surface-alt)' }}
        >
          {(['zuo', 'huang'] as const).map((uid) => {
            const cfg = USER_CONFIGS[uid]
            const checked = uid === 'zuo' ? checkedA : checkedB
            return (
              <div key={uid} className="flex items-center gap-2">
                <Avatar user={cfg} size={36} active={checked} dimWhenInactive />
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--color-ink)' }}>{cfg.label}</div>
                  <div className="text-xs" style={{ color: checked ? cfg.color : 'var(--color-mist)' }}>
                    {checked ? '已打卡 ✓' : '未打卡'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action */}
        <div className="space-y-2">
          {currentUser ? (
            <button
              onClick={handleToggle}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: checkinSet.has(`${currentUser}:${site.id}`) ? 'var(--color-surface-alt)' : 'var(--color-vermilion)',
                color: checkinSet.has(`${currentUser}:${site.id}`) ? 'var(--color-vermilion)' : '#fff',
                border: '1px solid var(--color-vermilion)',
              }}
            >
              {checkinSet.has(`${currentUser}:${site.id}`)
                ? `✓ 已打卡（${USER_CONFIGS[currentUser].label}）— 点击取消`
                : `打卡 — ${USER_CONFIGS[currentUser].label}`}
            </button>
          ) : (
            <p className="text-sm text-center" style={{ color: 'var(--color-mist)' }}>请先选择身份才能打卡</p>
          )}
        </div>
      </div>
    </div>
  )
}
