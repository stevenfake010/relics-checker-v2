import { useState, useMemo } from 'react'
import { HERITAGE_SITES, type HeritageSite, type HeritageCategory } from '../data/heritage'
import { useHeritageCheckinSet } from '../hooks/useHeritageCheckins'
import { HeritageCard } from '../components/HeritageCard'
import { HeritageModal } from '../components/HeritageModal'
import { Layout } from '../components/Layout'
import { hasSupabase } from '../lib/supabase'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import { Avatar } from '../components/Avatar'

type CatFilter = 'all' | HeritageCategory
type SortMode = 'year-desc' | 'year-asc' | 'province'

const CATEGORIES: HeritageCategory[] = ['文化遗产', '自然遗产', '混合遗产']

const TOTAL = HERITAGE_SITES.length

export function Heritage() {
  const checkinSet = useHeritageCheckinSet()
  const [selected, setSelected] = useState<HeritageSite | null>(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<CatFilter>('all')
  const [province, setProvince] = useState<string>('')
  const [showUnvisitedOnly, setShowUnvisitedOnly] = useState(false)
  const [sort, setSort] = useState<SortMode>('year-desc')
  const [provinceExpanded, setProvinceExpanded] = useState(false)

  const allProvinces = useMemo(
    () => Array.from(new Set(HERITAGE_SITES.map((s) => s.province))).sort(),
    []
  )

  const filtered = useMemo(() => {
    let list = HERITAGE_SITES
    if (cat !== 'all') list = list.filter((s) => s.category === cat)
    if (province) list = list.filter((s) => s.province === province)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.province.toLowerCase().includes(kw) ||
          s.description.toLowerCase().includes(kw)
      )
    }
    if (showUnvisitedOnly) {
      list = list.filter(
        (s) => !checkinSet.has(`zuo:${s.id}`) && !checkinSet.has(`huang:${s.id}`)
      )
    }
    return list
  }, [cat, province, search, showUnvisitedOnly, checkinSet])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'year-desc') arr.sort((a, b) => b.yearInscribed - a.yearInscribed)
    else if (sort === 'year-asc') arr.sort((a, b) => a.yearInscribed - b.yearInscribed)
    else if (sort === 'province') arr.sort((a, b) => a.province.localeCompare(b.province, 'zh-CN'))
    return arr
  }, [filtered, sort])

  // 双人统计
  const stats = useMemo(() => {
    let zuoCount = 0
    let huangCount = 0
    let bothCount = 0
    for (const s of HERITAGE_SITES) {
      const zuo = checkinSet.has(`zuo:${s.id}`)
      const huang = checkinSet.has(`huang:${s.id}`)
      if (zuo) zuoCount++
      if (huang) huangCount++
      if (zuo && huang) bothCount++
    }
    return { zuoCount, huangCount, bothCount }
  }, [checkinSet])

  // 省份打卡进度（只列还有未打卡的，按 pending 降序）
  const provinceProgress = useMemo(() => {
    const map = new Map<string, { total: number; visited: number }>()
    for (const s of HERITAGE_SITES) {
      const cur = map.get(s.province) ?? { total: 0, visited: 0 }
      cur.total++
      if (checkinSet.has(`zuo:${s.id}`) || checkinSet.has(`huang:${s.id}`)) cur.visited++
      map.set(s.province, cur)
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d, pending: d.total - d.visited }))
      .filter((p) => p.pending > 0) // 只显示还有未打卡的省份
      .sort((a, b) => b.pending - a.pending || b.total - a.total)
  }, [checkinSet])

  const INITIAL_PROVINCE_COUNT = 6
  const displayProvinces = provinceExpanded
    ? provinceProgress
    : provinceProgress.slice(0, INITIAL_PROVINCE_COUNT)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {!hasSupabase && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: '#FFF3CD', color: '#856404', border: '1px solid #FFD700' }}
          >
            ⚠️ 未配置 Supabase，打卡数据仅保存在本地内存（刷新后清空）。
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* 双人进度卡 */}
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}
              >
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
                        <span className="text-sm" style={{ color: 'var(--color-ink)' }}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                        {n} / {TOTAL}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-surface-alt)' }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                      />
                    </div>
                  </div>
                )
              })}
              <div
                className="mt-3 pt-3 border-t text-xs"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-mist)' }}
              >
                两人都打卡：<b style={{ color: 'var(--color-vermilion)' }}>{stats.bothCount}</b> 处
              </div>
            </div>

            {/* 省份待打卡排名 */}
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}
                >
                  省份待打卡排名
                </h3>
                {provinceProgress.length > INITIAL_PROVINCE_COUNT && (
                  <button
                    onClick={() => setProvinceExpanded((v) => !v)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--color-surface-alt)',
                      color: 'var(--color-mist)',
                    }}
                  >
                    {provinceExpanded
                      ? '收起'
                      : `展开 (${provinceProgress.length - INITIAL_PROVINCE_COUNT}+)`}
                  </button>
                )}
              </div>
              {displayProvinces.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
                  🎉 所有省份都已打卡
                </p>
              ) : (
                <div className="space-y-1.5">
                  {displayProvinces.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setProvince(province === p.name ? '' : p.name)}
                      className="w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded transition-all"
                      style={{
                        backgroundColor:
                          province === p.name ? 'var(--color-vermilion-light)' : 'transparent',
                        color: province === p.name ? 'var(--color-vermilion)' : 'var(--color-ink)',
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
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            {/* 选中省份 chip */}
            {province && (
              <div
                className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--color-vermilion-light)',
                  color: 'var(--color-vermilion)',
                }}
              >
                📍 省份：{province}
                <button onClick={() => setProvince('')} className="ml-1 hover:opacity-70">
                  ✕
                </button>
              </div>
            )}

            {/* 筛选区 */}
            <div
              className="rounded-lg p-4 mb-4 space-y-3"
              style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <input
                type="text"
                placeholder="搜索遗产名称、省份、描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                }}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>类别：</span>
                {(['all', ...CATEGORIES] as CatFilter[]).map((c) => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c === 'all' ? '全部' : c}
                  </Chip>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>排序：</span>
                <Chip active={sort === 'year-desc'} onClick={() => setSort('year-desc')}>列入时间 新→旧</Chip>
                <Chip active={sort === 'year-asc'} onClick={() => setSort('year-asc')}>列入时间 旧→新</Chip>
                <Chip active={sort === 'province'} onClick={() => setSort('province')}>按省份</Chip>
                <label
                  className="ml-auto inline-flex items-center gap-1.5 text-xs cursor-pointer select-none"
                  style={{ color: 'var(--color-mist)' }}
                >
                  <input
                    type="checkbox"
                    checked={showUnvisitedOnly}
                    onChange={(e) => setShowUnvisitedOnly(e.target.checked)}
                  />
                  仅看未访问
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                  显示 {filtered.length} / {TOTAL}
                </span>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                  }}
                >
                  <option value="">所有省份</option>
                  {allProvinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            {sorted.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-mist)' }}>
                没有符合条件的遗产
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {sorted.map((s) => (
                  <HeritageCard
                    key={s.id}
                    site={s}
                    checkinSet={checkinSet}
                    onClick={() => setSelected(s)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <HeritageModal site={selected} onClose={() => setSelected(null)} />
    </Layout>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded text-xs transition-all"
      style={{
        backgroundColor: active ? 'var(--color-vermilion)' : 'var(--color-surface-alt)',
        color: active ? '#fff' : 'var(--color-ink)',
        border: `1px solid ${active ? 'var(--color-vermilion)' : 'var(--color-border)'}`,
      }}
    >
      {children}
    </button>
  )
}
