import { useState, useMemo } from 'react'
import { relics } from '../data/relics'
import { useCheckins, useCheckinSet } from '../hooks/useCheckins'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  filterRelics, sortByCity, sortByPermanentPriority, rankCitiesByPending,
  isCountedForPermanent, DEFAULT_FILTER,
  type FilterState,
} from '../logic/filter-logic'
import { dualCompare } from '../logic/aggregate'
import { ProgressBar } from '../components/ProgressBar'
import { Filters } from '../components/Filters'
import { CityRanking } from '../components/CityRanking'
import { RelicCard } from '../components/RelicCard'
import { RelicModal } from '../components/RelicModal'
import { Layout } from '../components/Layout'
import { QueryState } from '../components/QueryState'
import type { Relic } from '../data/types'

export function Home() {
  const checkinsQuery = useCheckins()
  const [filter, setFilter] = usePersistedState<FilterState>('filters:relics', DEFAULT_FILTER)
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [sortMode, setSortMode] = usePersistedState<'id' | 'city' | 'permanent'>('sort:relics', 'id')
  const checkinSet = useCheckinSet()

  // 选中城市时，自动用"常设优先"排序
  const effectiveSortMode = filter.city ? 'permanent' : sortMode

  const filtered = useMemo(() => filterRelics(relics, filter, checkinSet), [filter, checkinSet])
  const sorted = useMemo(() => {
    if (effectiveSortMode === 'city') return sortByCity(filtered)
    if (effectiveSortMode === 'permanent') return sortByPermanentPriority(filtered)
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [filtered, effectiveSortMode])

  // 全部 195 件统计
  const stats = useMemo(() => dualCompare(relics, checkinSet), [checkinSet])

  // 常设可达统计（非书画+非noPublicDisplay+有常设）
  const permRelics = useMemo(() => relics.filter(isCountedForPermanent), [])
  const permStats = useMemo(() => dualCompare(permRelics, checkinSet), [permRelics, checkinSet])

  // 城市排名
  const cityRanks = useMemo(
    () => rankCitiesByPending(relics, checkinSet, 'zuo', checkinSet, 'huang'),
    [checkinSet]
  )

  const handleSelectCity = (city: string | null) => {
    setFilter((prev) => ({ ...prev, city }))
    // 若刚选中城市，滚动到结果区
    if (city) {
      setTimeout(() => {
        document.getElementById('relic-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  if (!checkinsQuery.data && (checkinsQuery.isPending || checkinsQuery.isError)) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <QueryState
            isLoading={checkinsQuery.isPending}
            isError={checkinsQuery.isError}
            error={checkinsQuery.error}
            onRetry={() => {
              void checkinsQuery.refetch()
            }}
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <ProgressBar stats={stats} permStats={permStats} />
            <CityRanking
              ranks={cityRanks}
              initialLimit={6}
              activeCity={filter.city}
              onSelectCity={handleSelectCity}
            />
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            {/* 城市筛选标签 */}
            {filter.city && (
              <div
                className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--color-vermilion-light)',
                  color: 'var(--color-vermilion)',
                }}
              >
                🗺️ 城市筛选：{filter.city}
                <button
                  onClick={() => handleSelectCity(null)}
                  className="ml-1 hover:opacity-70"
                  title="清除"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Filters */}
            <div
              className="rounded-lg p-4 mb-4"
              style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <Filters
                filter={filter}
                onChange={setFilter}
                totalShown={filtered.length}
                totalAll={relics.length}
              />
              <div
                className="flex items-center gap-2 mt-3 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                  排序：
                </span>
                {(['id', 'city', 'permanent'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        effectiveSortMode === mode
                          ? 'var(--color-vermilion)'
                          : 'var(--color-surface-alt)',
                      color: effectiveSortMode === mode ? '#fff' : 'var(--color-ink)',
                    }}
                  >
                    {mode === 'id' ? '编号' : mode === 'city' ? '城市' : '常设优先'}
                  </button>
                ))}
                {filter.city && (
                  <span className="text-xs ml-1" style={{ color: 'var(--color-mist)' }}>
                    （城市筛选下默认按常设优先排序）
                  </span>
                )}
              </div>
            </div>

            {/* Grid */}
            <div id="relic-grid">
              {sorted.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--color-mist)' }}>
                  没有符合条件的文物
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sorted.map((r) => (
                    <RelicCard
                      key={r.id}
                      relic={r}
                      checkinSet={checkinSet}
                      onClick={() => setSelectedRelic(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      <RelicModal relic={selectedRelic} onClose={() => setSelectedRelic(null)} />
    </Layout>
  )
}
