import { useState, useMemo } from 'react'
import { GUOBAO_SITES, GUOBAO_CATEGORIES, type GuobaoSite, type GuobaoCategory } from '../data/guobao'
import { useGuobaoCheckinSet } from '../hooks/useGuobaoCheckins'
import { GuobaoCard } from '../components/GuobaoCard'
import { GuobaoModal } from '../components/GuobaoModal'
import { Layout } from '../components/Layout'
import { hasSupabase } from '../lib/supabase'
import { USER_CONFIGS } from '../contexts/IdentityContext'
import { Avatar } from '../components/Avatar'

type CatFilter = 'all' | GuobaoCategory
type BatchFilter = 'all' | 1 | 2

const TOTAL = GUOBAO_SITES.length

export function Guobao() {
  const checkinSet = useGuobaoCheckinSet()
  const [selected, setSelected] = useState<GuobaoSite | null>(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<CatFilter>('all')
  const [batch, setBatch] = useState<BatchFilter>('all')
  const [province, setProvince] = useState('')
  const [checkedByA, setCheckedByA] = useState<boolean | null>(null)
  const [checkedByB, setCheckedByB] = useState<boolean | null>(null)

  const allProvinces = useMemo(
    () => Array.from(new Set(GUOBAO_SITES.map((s) => s.province))).sort(),
    []
  )

  const filtered = useMemo(() => {
    let list: GuobaoSite[] = GUOBAO_SITES
    if (cat !== 'all') list = list.filter((s) => s.category === cat)
    if (batch !== 'all') list = list.filter((s) => s.batch === batch)
    if (province) list = list.filter((s) => s.province === province)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.province.toLowerCase().includes(kw) ||
          s.city.toLowerCase().includes(kw) ||
          s.era.toLowerCase().includes(kw)
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
  }, [cat, batch, province, search, checkedByA, checkedByB, checkinSet])

  const stats = useMemo(() => {
    let zuoCount = 0, huangCount = 0, bothCount = 0
    for (const s of GUOBAO_SITES) {
      const zuo = checkinSet.has(`zuo:${s.id}`)
      const huang = checkinSet.has(`huang:${s.id}`)
      if (zuo) zuoCount++
      if (huang) huangCount++
      if (zuo && huang) bothCount++
    }
    return { zuoCount, huangCount, bothCount }
  }, [checkinSet])

  const provinceProgress = useMemo(() => {
    const map = new Map<string, { total: number; visited: number }>()
    for (const s of GUOBAO_SITES) {
      const cur = map.get(s.province) ?? { total: 0, visited: 0 }
      cur.total++
      if (checkinSet.has(`zuo:${s.id}`) || checkinSet.has(`huang:${s.id}`)) cur.visited++
      map.set(s.province, cur)
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d, pending: d.total - d.visited }))
      .filter((p) => p.pending > 0)
      .sort((a, b) => b.pending - a.pending || b.total - a.total)
  }, [checkinSet])

  const [provinceExpanded, setProvinceExpanded] = useState(false)
  const INITIAL_PROVINCE_COUNT = 6
  const displayProvinces = provinceExpanded
    ? provinceProgress
    : provinceProgress.slice(0, INITIAL_PROVINCE_COUNT)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {!hasSupabase && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FFF3CD', color: '#856404', border: '1px solid #FFD700' }}>
            ⚠️ 未配置 Supabase，打卡数据仅保存在本地内存（刷新后清空）。
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}>
                国保打卡
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium" style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}>
                  省份待打卡排名
                </h3>
                {provinceProgress.length > INITIAL_PROVINCE_COUNT && (
                  <button
                    onClick={() => setProvinceExpanded((v) => !v)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-mist)' }}
                  >
                    {provinceExpanded ? '收起' : `展开 (${provinceProgress.length - INITIAL_PROVINCE_COUNT}+)`}
                  </button>
                )}
              </div>
              {displayProvinces.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-mist)' }}>🎉 所有省份都已打卡</p>
              ) : (
                <div className="space-y-1.5">
                  {displayProvinces.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setProvince(province === p.name ? '' : p.name)}
                      className="w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded transition-all"
                      style={{
                        backgroundColor: province === p.name ? 'var(--color-vermilion-light)' : 'transparent',
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
            {province && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{ backgroundColor: 'var(--color-vermilion-light)', color: 'var(--color-vermilion)' }}>
                📍 省份：{province}
                <button onClick={() => setProvince('')} className="ml-1 hover:opacity-70">✕</button>
              </div>
            )}

            <div className="rounded-lg p-4 mb-4 space-y-3" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}>
              <input
                type="text"
                placeholder="搜索名称、省份、城市、时代..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>类别：</span>
                {(['all', ...GUOBAO_CATEGORIES] as CatFilter[]).map((c) => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c === 'all' ? '全部' : c}
                  </Chip>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>批次：</span>
                <Chip active={batch === 'all'} onClick={() => setBatch('all')}>全部</Chip>
                <Chip active={batch === 1} onClick={() => setBatch(1)}>第一批 (1961)</Chip>
                <Chip active={batch === 2} onClick={() => setBatch(2)}>第二批 (1982)</Chip>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>打卡：</span>
                <ToggleChip label="佑" value={checkedByA} onChange={setCheckedByA} />
                <ToggleChip label="宝" value={checkedByB} onChange={setCheckedByB} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                  显示 {filtered.length} / {TOTAL}
                </span>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
                >
                  <option value="">所有省份</option>
                  {allProvinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-mist)' }}>没有符合条件的国保单位</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {filtered.map((s) => (
                  <GuobaoCard key={s.id} site={s} checkinSet={checkinSet} onClick={() => setSelected(s)} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <GuobaoModal site={selected} onClose={() => setSelected(null)} />
    </Layout>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function ToggleChip({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }
  const display = value === null ? `${label}：全部` : value ? `${label}：已打卡` : `${label}：未打卡`
  const color = value === null ? 'var(--color-mist)' : value ? 'var(--color-jade)' : 'var(--color-vermilion)'
  return (
    <button onClick={cycle} className="text-xs px-2 py-1 rounded border transition-all"
      style={{ borderColor: color, color, backgroundColor: 'var(--color-surface)' }}>
      {display}
    </button>
  )
}
