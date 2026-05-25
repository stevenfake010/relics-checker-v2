import { useEffect } from 'react'
import type { Relic } from '../data/types'
import { ERA_LABELS, CAT_LABELS } from '../data/meta'
import { useIdentity, USER_CONFIGS } from '../contexts/IdentityContext'
import { useCheckinSet, useToggleCheckin } from '../hooks/useCheckins'

interface RelicModalProps {
  relic: Relic | null
  onClose: () => void
}

export function RelicModal({ relic, onClose }: RelicModalProps) {
  const { currentUser } = useIdentity()
  const checkinSet = useCheckinSet()
  const { mutate: toggleCheckin } = useToggleCheckin()

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!relic) return null

  const checkedA = checkinSet.has(`userA:${relic.id}`)
  const checkedB = checkinSet.has(`userB:${relic.id}`)

  const handleToggle = () => {
    if (!currentUser) return
    const checked = checkinSet.has(`${currentUser}:${relic.id}`)
    toggleCheckin({ userId: currentUser, relicId: relic.id, checked })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,20,16,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
          style={{ color: 'var(--color-mist)' }}
        >
          ✕
        </button>

        {/* ID badge */}
        <div className="mb-1 text-xs" style={{ color: 'var(--color-mist)' }}>
          No. {relic.id}
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold mb-1 pr-8"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          {relic.name}
        </h2>

        {/* Location */}
        <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>
          📍 {relic.location}
        </p>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-4">
          <Tag>{ERA_LABELS[relic.era]}</Tag>
          <Tag>{CAT_LABELS[relic.cat]}</Tag>
          {relic.noPublicDisplay && <Tag accent>暂不公开展出</Tag>}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-ink)' }}>
          {relic.desc}
        </p>

        {/* Exhibitions */}
        {relic.exhibitions && relic.exhibitions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-mist)' }}>
              展览记录
            </h3>
            <ul className="space-y-1">
              {relic.exhibitions.map((ex, i) => (
                <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--color-ink)' }}>
                  <span style={{ color: 'var(--color-mist)' }}>
                    {ex.year === '常设' ? '常设' : ex.year + '年'}
                  </span>
                  <span>{ex.venue}</span>
                  <span style={{ color: 'var(--color-mist)' }}>·</span>
                  <span style={{ color: 'var(--color-mist)' }}>{ex.show}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dual Seal Status */}
        <div
          className="flex items-center justify-between p-4 rounded-lg mb-4"
          style={{ backgroundColor: 'var(--color-surface-alt)' }}
        >
          {(['userA', 'userB'] as const).map((uid) => {
            const cfg = USER_CONFIGS[uid]
            const checked = uid === 'userA' ? checkedA : checkedB
            return (
              <div key={uid} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-base font-bold border-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    borderColor: cfg.color,
                    backgroundColor: checked ? cfg.color : 'transparent',
                    color: checked ? '#fff' : cfg.color,
                  }}
                >
                  {cfg.sealChar}
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--color-ink)' }}>
                    {cfg.label}
                  </div>
                  <div className="text-xs" style={{ color: checked ? cfg.color : 'var(--color-mist)' }}>
                    {checked ? '已打卡 ✓' : '未打卡'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Check-in button (only for current user) */}
        {currentUser ? (
          <button
            onClick={handleToggle}
            className="w-full py-3 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor: checkinSet.has(`${currentUser}:${relic.id}`)
                ? 'var(--color-surface-alt)'
                : 'var(--color-vermilion)',
              color: checkinSet.has(`${currentUser}:${relic.id}`)
                ? 'var(--color-vermilion)'
                : '#fff',
              border: `1px solid var(--color-vermilion)`,
            }}
          >
            {checkinSet.has(`${currentUser}:${relic.id}`)
              ? `✓ 已打卡（${USER_CONFIGS[currentUser].label}）— 点击取消`
              : `打卡 — ${USER_CONFIGS[currentUser].label}`}
          </button>
        ) : (
          <p className="text-sm text-center" style={{ color: 'var(--color-mist)' }}>
            请先选择身份才能打卡
          </p>
        )}
      </div>
    </div>
  )
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs"
      style={{
        backgroundColor: accent ? '#FFF3CD' : 'var(--color-surface-alt)',
        color: accent ? '#856404' : 'var(--color-mist)',
      }}
    >
      {children}
    </span>
  )
}
