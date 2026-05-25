import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { relics } from '../data/relics'
import { useCheckinSet } from '../hooks/useCheckins'
import { dualCompare, byEra, byCat, byMuseum } from '../logic/aggregate'
import { DualVennCard } from '../components/DualVennCard'
import { StatChartByEra } from '../components/StatChartByEra'
import { StatChartByCat } from '../components/StatChartByCat'
import { MuseumCompletion } from '../components/MuseumCompletion'
import { IdentitySwitcher } from '../components/IdentitySwitcher'

export function Stats() {
  const checkinSet = useCheckinSet()

  const stats = useMemo(() => dualCompare(relics, checkinSet), [checkinSet])
  const eraStats = useMemo(() => byEra(relics, checkinSet), [checkinSet])
  const catStats = useMemo(() => byCat(relics, checkinSet), [checkinSet])
  const museumStats = useMemo(() => byMuseum(relics, checkinSet), [checkinSet])

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
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm" style={{ color: 'var(--color-vermilion)' }}>
              ← 返回
            </Link>
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              详细统计
            </h1>
          </div>
          <IdentitySwitcher />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Venn */}
        <DualVennCard stats={stats} />

        {/* Era + Cat charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatChartByEra data={eraStats} />
          <StatChartByCat data={catStats} />
        </div>

        {/* Museum completion */}
        <MuseumCompletion data={museumStats} limit={20} />
      </div>
    </div>
  )
}
