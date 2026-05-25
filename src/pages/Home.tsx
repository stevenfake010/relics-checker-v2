import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { relics } from '../data/relics'
import { useCheckinSet } from '../hooks/useCheckins'
import { filterRelics, sortByCity, rankCitiesByPending, DEFAULT_FILTER, type FilterState } from '../logic/filter-logic'
import { dualCompare } from '../logic/aggregate'
import { ProgressBar } from '../components/ProgressBar'
import { Filters } from '../components/Filters'
import { CityRanking } from '../components/CityRanking'
import { RelicCard } from '../components/RelicCard'
import { RelicModal } from '../components/RelicModal'
import { IdentitySwitcher } from '../components/IdentitySwitcher'
import { hasSupabase } from '../lib/supabase'
import type { Relic } from '../data/types'

export function Home() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [sortMode, setSortMode] = useState<'id' | 'city'>('id')
  const checkinSet = useCheckinSet()

  const filtered = useMemo(() => filterRelics(relics, filter, checkinSet), [filter, checkinSet])
  const sorted = useMemo(() => {
    if (sortMode === 'city') return sortByCity(filtered)
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [filtered, sortMode])

  const stats = useMemo(() => dualCompare(relics, checkinSet), [checkinSet])
  const cityRanks = useMemo(() => rankCitiesByPending(relics, checkinSet), [checkinSet])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-paper)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold leading-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              禁止出境文物
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-mist)' }}>195件国家级文物打卡</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/stats" className="text-sm" style={{ color: 'var(--color-vermilion)' }}>
              统计 →
            </Link>
            <IdentitySwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Supabase warning */}
        {!hasSupabase && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: '#FFF3CD', color: '#856404', border: '1px solid #FFD700' }}
          >
            ⚠️ 未配置 Supabase，打卡数据仅保存在本地内存（刷新后清空）。请在 .env.local 中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <ProgressBar stats={stats} />
            <CityRanking ranks={cityRanks} limit={8} />
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
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
              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>排序：</span>
                <button
                  onClick={() => setSortMode('id')}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: sortMode === 'id' ? 'var(--color-vermilion)' : 'var(--color-surface-alt)',
                    color: sortMode === 'id' ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  编号
                </button>
                <button
                  onClick={() => setSortMode('city')}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: sortMode === 'city' ? 'var(--color-vermilion)' : 'var(--color-surface-alt)',
                    color: sortMode === 'city' ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  城市
                </button>
              </div>
            </div>

            {/* Grid */}
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
          </main>
        </div>
      </div>

      {/* Modal */}
      <RelicModal relic={selectedRelic} onClose={() => setSelectedRelic(null)} />
    </div>
  )
}

function ThemeToggle() {
  const toggle = () => {
    const html = document.documentElement
    const current = html.getAttribute('data-theme')
    html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
      style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-ink)' }}
      title="切换主题"
    >
      ◑
    </button>
  )
}
