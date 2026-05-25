import { useState } from 'react'
import type { CityRank } from '../logic/filter-logic'

interface CityRankingProps {
  ranks: CityRank[]
  /** 默认展示数量，超过会折叠 */
  initialLimit?: number
  /** 当前选中的城市（高亮） */
  activeCity?: string | null
  /** 点击城市标签时回调；再次点击同一城市相当于取消 */
  onSelectCity?: (city: string | null) => void
}

export function CityRanking({
  ranks,
  initialLimit = 6,
  activeCity = null,
  onSelectCity,
}: CityRankingProps) {
  const [expanded, setExpanded] = useState(false)
  const displayed = expanded ? ranks : ranks.slice(0, initialLimit)
  const maxPending = ranks[0]?.pending ?? 1

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            🗺️ 待打卡城市排名
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>
            按"常设+非书画"未打卡数排序
          </p>
        </div>
        {activeCity && (
          <button
            onClick={() => onSelectCity?.(null)}
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: 'var(--color-vermilion)',
              color: '#fff',
            }}
            title="清除城市筛选"
          >
            清除 ×
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayed.map((rank, i) => {
          const isActive = activeCity === rank.city
          return (
            <button
              key={rank.city}
              onClick={() => onSelectCity?.(isActive ? null : rank.city)}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded transition-colors hover:bg-opacity-50"
              style={{
                backgroundColor: isActive ? 'var(--color-vermilion-light)' : 'transparent',
              }}
            >
              <span
                className="w-5 text-xs text-right flex-shrink-0"
                style={{ color: i < 3 ? 'var(--color-vermilion)' : 'var(--color-mist)' }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm flex-shrink-0 w-14 truncate"
                style={{
                  color: isActive ? 'var(--color-vermilion)' : 'var(--color-ink)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {rank.city}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface-alt)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(rank.pending / maxPending) * 100}%`,
                    backgroundColor: 'var(--color-vermilion)',
                  }}
                />
              </div>
              <span
                className="text-xs flex-shrink-0 w-16 text-right"
                style={{ color: 'var(--color-mist)' }}
              >
                待 <b style={{ color: 'var(--color-vermilion)' }}>{rank.pending}</b>/{rank.total}
              </span>
            </button>
          )
        })}
        {ranks.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-mist)' }}>
            🎉 全部打卡完了
          </p>
        )}
      </div>

      {ranks.length > initialLimit && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full mt-3 text-xs py-1.5 rounded border"
          style={{
            color: 'var(--color-mist)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'transparent',
          }}
        >
          {expanded ? '收起' : `展开更多（共 ${ranks.length} 个）`}
        </button>
      )}
    </div>
  )
}
