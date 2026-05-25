import { useMemo, useState } from 'react'
import { relics } from '../data/relics'
import { HERITAGE_SITES } from '../data/heritage'
import { useCheckinSet } from '../hooks/useCheckins'
import { useHeritageCheckinSet } from '../hooks/useHeritageCheckins'
import { dualCompare, byEra, byCat, byMuseum } from '../logic/aggregate'
import { DualVennCard } from '../components/DualVennCard'
import { StatChartByEra } from '../components/StatChartByEra'
import { StatChartByCat } from '../components/StatChartByCat'
import { MuseumCompletion } from '../components/MuseumCompletion'
import { Layout } from '../components/Layout'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import { Avatar } from '../components/Avatar'

type Section = 'relic' | 'heritage'

export function Stats() {
  const [section, setSection] = useState<Section>('relic')
  const relicCheckinSet = useCheckinSet()
  const heritageCheckinSet = useHeritageCheckinSet()

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* 段切换 */}
        <div className="mb-4 inline-flex rounded-lg p-1" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
          <SectionButton active={section === 'relic'} onClick={() => setSection('relic')}>
            🏛️ 文物统计
          </SectionButton>
          <SectionButton active={section === 'heritage'} onClick={() => setSection('heritage')}>
            🌏 遗产统计
          </SectionButton>
        </div>

        {section === 'relic' ? (
          <RelicStats checkinSet={relicCheckinSet} />
        ) : (
          <HeritageStats checkinSet={heritageCheckinSet} />
        )}
      </div>
    </Layout>
  )
}

function SectionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-surface)' : 'transparent',
        color: active ? 'var(--color-vermilion)' : 'var(--color-mist)',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

// ===== 文物统计 =====

function RelicStats({ checkinSet }: { checkinSet: Set<string> }) {
  const stats = useMemo(() => dualCompare(relics, checkinSet), [checkinSet])
  const eraStats = useMemo(() => byEra(relics, checkinSet), [checkinSet])
  const catStats = useMemo(() => byCat(relics, checkinSet), [checkinSet])
  const museumStats = useMemo(() => byMuseum(relics, checkinSet), [checkinSet])

  return (
    <div className="space-y-6">
      <DualVennCard stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatChartByEra data={eraStats} />
        <StatChartByCat data={catStats} />
      </div>
      <MuseumCompletion data={museumStats} limit={20} />
    </div>
  )
}

// ===== 遗产统计 =====

function HeritageStats({ checkinSet }: { checkinSet: Set<string> }) {
  const TOTAL = HERITAGE_SITES.length

  const { zuoSet, huangSet, both } = useMemo(() => {
    const z = new Set<string>()
    const h = new Set<string>()
    let b = 0
    for (const s of HERITAGE_SITES) {
      const zc = checkinSet.has(`zuo:${s.id}`)
      const hc = checkinSet.has(`huang:${s.id}`)
      if (zc) z.add(s.id)
      if (hc) h.add(s.id)
      if (zc && hc) b++
    }
    return { zuoSet: z, huangSet: h, both: b }
  }, [checkinSet])

  // 按类别
  const byCategory = useMemo(() => {
    const map = new Map<string, { total: number; zuo: number; huang: number; both: number }>()
    for (const s of HERITAGE_SITES) {
      const cur = map.get(s.category) ?? { total: 0, zuo: 0, huang: 0, both: 0 }
      cur.total++
      const z = zuoSet.has(s.id)
      const h = huangSet.has(s.id)
      if (z) cur.zuo++
      if (h) cur.huang++
      if (z && h) cur.both++
      map.set(s.category, cur)
    }
    return Array.from(map.entries()).map(([name, val]) => ({ name, ...val }))
  }, [zuoSet, huangSet])

  // 按年代
  const byYear = useMemo(() => {
    const map = new Map<number, { total: number; visited: number }>()
    for (const s of HERITAGE_SITES) {
      const cur = map.get(s.yearInscribed) ?? { total: 0, visited: 0 }
      cur.total++
      if (zuoSet.has(s.id) || huangSet.has(s.id)) cur.visited++
      map.set(s.yearInscribed, cur)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, d]) => ({ year, ...d }))
  }, [zuoSet, huangSet])

  // 按省份
  const byProvince = useMemo(() => {
    const map = new Map<string, { total: number; visited: number }>()
    for (const s of HERITAGE_SITES) {
      const cur = map.get(s.province) ?? { total: 0, visited: 0 }
      cur.total++
      if (zuoSet.has(s.id) || huangSet.has(s.id)) cur.visited++
      map.set(s.province, cur)
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.total - a.total)
  }, [zuoSet, huangSet])

  return (
    <div className="space-y-6">
      {/* 总体概览 */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <h2
          className="text-lg font-medium mb-4"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          世界遗产打卡总览（共 {TOTAL} 处）
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(['zuo', 'huang'] as const).map((uid) => {
            const cfg = USER_CONFIGS[uid]
            const n = uid === 'zuo' ? zuoSet.size : huangSet.size
            return (
              <div key={uid} className="text-center">
                <div className="flex justify-center mb-2">
                  <Avatar user={cfg} size={48} active />
                </div>
                <div className="text-2xl font-bold" style={{ color: cfg.color }}>{n}</div>
                <div className="text-xs" style={{ color: 'var(--color-mist)' }}>
                  {cfg.label}已访问 ({Math.round((n / TOTAL) * 100)}%)
                </div>
              </div>
            )
          })}
          <div className="text-center">
            <div
              className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: 'var(--color-vermilion-light)' }}
            >
              💛
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-vermilion)' }}>{both}</div>
            <div className="text-xs" style={{ color: 'var(--color-mist)' }}>共同足迹</div>
          </div>
        </div>
      </div>

      {/* 按类别 */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <h3
          className="text-base font-medium mb-4"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          按类别
        </h3>
        <div className="space-y-3">
          {byCategory.map((c) => (
            <CategoryRow key={c.name} {...c} />
          ))}
        </div>
      </div>

      {/* 按省份 */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <h3
          className="text-base font-medium mb-4"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          按省份（按总数排序）
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {byProvince.map((p) => (
            <ProvinceRow key={p.name} {...p} />
          ))}
        </div>
      </div>

      {/* 按年代 */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <h3
          className="text-base font-medium mb-4"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          按列入年份
        </h3>
        <div className="space-y-1.5">
          {byYear.map((y) => (
            <YearRow key={y.year} {...y} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  name,
  total, zuo, huang, both,
}: {
  name: string
  total: number
  zuo: number
  huang: number
  both: number
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-20" style={{ color: 'var(--color-ink)' }}>{name}</span>
      <div className="flex-1 h-5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        {both > 0 && (
          <div
            className="h-full"
            style={{ width: `${(both / total) * 100}%`, backgroundColor: 'var(--color-vermilion)' }}
            title={`共同：${both}`}
          />
        )}
        {zuo - both > 0 && (
          <div
            className="h-full"
            style={{ width: `${((zuo - both) / total) * 100}%`, backgroundColor: USER_CONFIGS.zuo.color, opacity: 0.7 }}
            title={`仅佑：${zuo - both}`}
          />
        )}
        {huang - both > 0 && (
          <div
            className="h-full"
            style={{ width: `${((huang - both) / total) * 100}%`, backgroundColor: USER_CONFIGS.huang.color, opacity: 0.7 }}
            title={`仅宝：${huang - both}`}
          />
        )}
      </div>
      <span className="text-xs w-20 text-right" style={{ color: 'var(--color-mist)' }}>
        {zuo + huang - both} / {total}
      </span>
    </div>
  )
}

function ProvinceRow({ name, total, visited }: { name: string; total: number; visited: number }) {
  const pct = total > 0 ? (visited / total) * 100 : 0
  const done = visited === total
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <span className="text-sm" style={{ color: 'var(--color-ink)' }}>
        {done && '🏆 '}
        {name}
      </span>
      <div className="flex items-center gap-2">
        <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              backgroundColor: done ? '#2E7D32' : 'var(--color-vermilion)',
            }}
          />
        </div>
        <span className="text-xs w-12 text-right" style={{ color: 'var(--color-mist)' }}>
          {visited}/{total}
        </span>
      </div>
    </div>
  )
}

function YearRow({ year, total, visited }: { year: number; total: number; visited: number }) {
  const pct = total > 0 ? (visited / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-12" style={{ color: 'var(--color-ink)' }}>{year}</span>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: 'var(--color-vermilion)' }} />
      </div>
      <span className="w-12 text-right" style={{ color: 'var(--color-mist)' }}>{visited}/{total}</span>
    </div>
  )
}
