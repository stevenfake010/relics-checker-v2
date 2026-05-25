import type { CityRank } from '../logic/filter-logic'

interface CityRankingProps {
  ranks: CityRank[]
  limit?: number
}

export function CityRanking({ ranks, limit = 10 }: CityRankingProps) {
  const displayed = ranks.slice(0, limit)
  const maxPending = displayed[0]?.pendingBoth ?? 1

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-mist)' }}>
        待打卡城市排名
      </h3>
      <div className="space-y-2">
        {displayed.map((rank, i) => (
          <div key={rank.city} className="flex items-center gap-2">
            <span
              className="w-5 text-xs text-right flex-shrink-0"
              style={{ color: i < 3 ? 'var(--color-vermilion)' : 'var(--color-mist)' }}
            >
              {i + 1}
            </span>
            <span className="text-sm flex-shrink-0 w-16 truncate" style={{ color: 'var(--color-ink)' }}>
              {rank.city}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface-alt)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(rank.pendingBoth / maxPending) * 100}%`,
                  backgroundColor: 'var(--color-vermilion)',
                }}
              />
            </div>
            <span className="text-xs flex-shrink-0 w-12 text-right" style={{ color: 'var(--color-mist)' }}>
              {rank.total - rank.pendingBoth}/{rank.total}
            </span>
          </div>
        ))}
        {ranks.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-mist)' }}>
            暂无数据
          </p>
        )}
      </div>
    </div>
  )
}
