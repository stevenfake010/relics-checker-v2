import { useState, useMemo } from 'react'
import { WORLD_SITES, WORLD_CATEGORIES, type WorldSite, type WorldCategory } from '../data/world'
import { useWorldCheckins, useWorldCheckinSet } from '../hooks/useWorldCheckins'
import { usePersistedState } from '../hooks/usePersistedState'
import { WorldCard } from '../components/WorldCard'
import { WorldModal } from '../components/WorldModal'
import { Layout } from '../components/Layout'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import { Avatar } from '../components/Avatar'
import { Chip, ToggleChip } from '../components/FilterControls'
import { QueryState } from '../components/QueryState'

type CatFilter = 'all' | WorldCategory

const TOTAL = WORLD_SITES.length

export function World() {
  const checkinsQuery = useWorldCheckins()
  const checkinSet = useWorldCheckinSet()
  const [selected, setSelected] = useState<WorldSite | null>(null)
  const [search, setSearch] = usePersistedState('filters:world:search', '')
  const [cat, setCat] = usePersistedState<CatFilter>('filters:world:cat', 'all')
  const [region, setRegion] = usePersistedState('filters:world:region', '')
  const [country, setCountry] = usePersistedState('filters:world:country', '')
  const [checkedByA, setCheckedByA] = usePersistedState<boolean | null>('filters:world:zuo', null)
  const [checkedByB, setCheckedByB] = usePersistedState<boolean | null>('filters:world:huang', null)

  const allRegions = useMemo(
    () => Array.from(new Set(WORLD_SITES.map((s) => s.region))).sort(),
    []
  )
  const allCountries = useMemo(
    () => Array.from(new Set(WORLD_SITES.map((s) => s.country))).sort(),
    []
  )

  const filtered = useMemo(() => {
    let list: WorldSite[] = WORLD_SITES
    if (cat !== 'all') list = list.filter((s) => s.category === cat)
    if (region) list = list.filter((s) => s.region === region)
    if (country) list = list.filter((s) => s.country === country)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.nameEn.toLowerCase().includes(kw) ||
          s.country.toLowerCase().includes(kw) ||
          s.region.toLowerCase().includes(kw)
      )
    }
    if (checkedByA !== null) {
      list = list.filter((s) => {
        const checked = checkinSet.has(`zuo:${s.id}`)
        return checkedByA ? checked : !checked
      })
    }
    if (checkedByB !== null) {
      list = list.filter((s) => {
        const checked = checkinSet.has(`huang:${s.id}`)
        return checkedByB ? checked : !checked
      })
    }
    return list
  }, [cat, region, country, search, checkedByA, checkedByB, checkinSet])

  const stats = useMemo(() => {
    let zuoCount = 0, huangCount = 0, bothCount = 0
    for (const s of WORLD_SITES) {
      const zuo = checkinSet.has(`zuo:${s.id}`)
      const huang = checkinSet.has(`huang:${s.id}`)
      if (zuo) zuoCount++
      if (huang) huangCount++
      if (zuo && huang) bothCount++
    }
    return { zuoCount, huangCount, bothCount }
  }, [checkinSet])

  const regionProgress = useMemo(() => {
    const map = new Map<string, { total: number; visited: number }>()
    for (const s of WORLD_SITES) {
      const cur = map.get(s.region) ?? { total: 0, visited: 0 }
      cur.total++
      if (checkinSet.has(`zuo:${s.id}`) || checkinSet.has(`huang:${s.id}`)) cur.visited++
      map.set(s.region, cur)
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d, pending: d.total - d.visited }))
      .sort((a, b) => b.pending - a.pending || b.total - a.total)
  }, [checkinSet])

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
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}>
                世界遗产打卡
              </h3>
              {(['zuo', 'huang'] as const).map((uid) => {
                const cfg = USER_CONFIGS[uid]
                const n = uid === 'zuo' ? stats.zuoCount : stats.huangCount
                const pct = TOTAL > 0 ? (n / TOTAL) * 100 : 0
                return (
                  <div key={uid} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar user={cfg} size={22} active />
                        <span className="text-sm" style={{ color: 'var(--color-ink)' }}>{cfg.label}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-mist)' }}>{n} / {TOTAL}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                      <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                    </div>
                  </div>
                )
              })}
              <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-mist)' }}>
                两人都打卡：<b style={{ color: 'var(--color-vermilion)' }}>{stats.bothCount}</b> 处
              </div>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}>
                大区待打卡
              </h3>
              <div className="space-y-1.5">
                {regionProgress.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setRegion(region === p.name ? '' : p.name)}
                    className="w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded transition-all"
                    style={{
                      backgroundColor: region === p.name ? 'var(--color-vermilion-light)' : 'transparent',
                      color: region === p.name ? 'var(--color-vermilion)' : 'var(--color-ink)',
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ color: 'var(--color-mist)' }}>
                      待打卡 <b style={{ color: 'var(--color-vermilion)' }}>{p.pending}</b>
                      <span className="opacity-60"> / {p.total}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            {(region || country) && (
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                {region && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: 'var(--color-vermilion-light)', color: 'var(--color-vermilion)' }}>
                    🌐 {region}
                    <button onClick={() => setRegion('')} className="ml-1 hover:opacity-70">✕</button>
                  </div>
                )}
                {country && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: 'var(--color-vermilion-light)', color: 'var(--color-vermilion)' }}>
                    📍 {country}
                    <button onClick={() => setCountry('')} className="ml-1 hover:opacity-70">✕</button>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg p-4 mb-4 space-y-3" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}>
              <input
                type="text"
                placeholder="搜索名称、英文名、国家、大区..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>类型：</span>
                {(['all', ...WORLD_CATEGORIES] as CatFilter[]).map((c) => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c === 'all' ? '全部' : c}
                  </Chip>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>打卡：</span>
                <ToggleChip label="佑" value={checkedByA} onChange={setCheckedByA} />
                <ToggleChip label="宝" value={checkedByB} onChange={setCheckedByB} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t gap-2 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                  显示 {filtered.length} / {TOTAL}
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
                  >
                    <option value="">所有大区</option>
                    {allRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
                  >
                    <option value="">所有国家</option>
                    {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-mist)' }}>没有符合条件的世界遗产</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {filtered.map((s) => (
                  <WorldCard key={s.id} site={s} checkinSet={checkinSet} onClick={() => setSelected(s)} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <WorldModal site={selected} onClose={() => setSelected(null)} />
    </Layout>
  )
}
