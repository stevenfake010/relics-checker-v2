import { useEffect, useState } from 'react'
import type { HeritageSite } from '../data/heritage'
import { useIdentity, USER_CONFIGS } from '../contexts/IdentityContext'
import { useHeritageCheckinSet, useToggleHeritageCheckin } from '../hooks/useHeritageCheckins'
import { Avatar } from './Avatar'

interface HeritageModalProps {
  site: HeritageSite | null
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  文化遗产: { bg: '#FFF0E5', fg: '#A23B2C' },
  自然遗产: { bg: '#E8F5E9', fg: '#2E7D32' },
  混合遗产: { bg: '#EDE7F6', fg: '#5E35B1' },
}

export function HeritageModal({ site, onClose }: HeritageModalProps) {
  const { currentUser } = useIdentity()
  const checkinSet = useHeritageCheckinSet()
  const { mutate: toggleCheckin } = useToggleHeritageCheckin()
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [site?.id])

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
        className="w-full max-w-lg rounded-xl overflow-hidden relative max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div
          className="relative w-full h-56"
          style={{ backgroundColor: 'var(--color-surface-alt)' }}
        >
          {!imgError ? (
            <img
              src={site.imageUrl}
              alt={site.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ backgroundColor: catColor.bg, color: catColor.fg }}
            >
              <div className="text-5xl mb-2">🏛️</div>
              <div className="text-sm font-medium px-4 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
                {site.name}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          >
            ✕
          </button>

          <div
            className="absolute bottom-3 left-3 px-2.5 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            列入：{site.yearInscribed} 年
          </div>
        </div>

        <div className="p-6">
          <h2
            className="text-xl font-bold leading-snug mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {site.name}
          </h2>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: catColor.bg, color: catColor.fg }}
            >
              {site.category}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-mist)' }}>
              📍 {site.province}
            </span>
          </div>

          <p
            className="text-sm leading-relaxed mb-6 italic"
            style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' }}
          >
            {site.description}
          </p>

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
                    <div className="text-xs font-medium" style={{ color: 'var(--color-ink)' }}>
                      {cfg.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: checked ? cfg.color : 'var(--color-mist)' }}
                    >
                      {checked ? '已访问 ✓' : '未访问'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {currentUser ? (
            <button
              onClick={handleToggle}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: checkinSet.has(`${currentUser}:${site.id}`)
                  ? 'var(--color-surface-alt)'
                  : 'var(--color-vermilion)',
                color: checkinSet.has(`${currentUser}:${site.id}`)
                  ? 'var(--color-vermilion)'
                  : '#fff',
                border: `1px solid var(--color-vermilion)`,
              }}
            >
              {checkinSet.has(`${currentUser}:${site.id}`)
                ? `✓ 已访问（${USER_CONFIGS[currentUser].label}）— 点击取消`
                : `打卡 — ${USER_CONFIGS[currentUser].label}`}
            </button>
          ) : (
            <p className="text-sm text-center" style={{ color: 'var(--color-mist)' }}>
              请先选择身份才能打卡
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
