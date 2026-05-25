import { ERA_LABELS, CAT_LABELS } from '../data/meta'
import type { Era, Cat } from '../data/types'
import type { FilterState } from '../logic/filter-logic'

interface FiltersProps {
  filter: FilterState
  onChange: (f: FilterState) => void
  totalShown: number
  totalAll: number
}

export function Filters({ filter, onChange, totalShown, totalAll }: FiltersProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filter, [key]: val })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="搜索文物名称、展馆..."
          value={filter.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-ink)',
          }}
        />
      </div>

      {/* Era */}
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--color-mist)' }}>朝代</label>
        <div className="flex flex-wrap gap-1">
          <FilterChip active={filter.era === 'all'} onClick={() => set('era', 'all')}>全部</FilterChip>
          {(Object.entries(ERA_LABELS) as [Era, string][]).map(([k, v]) => (
            <FilterChip key={k} active={filter.era === k} onClick={() => set('era', k)}>{v}</FilterChip>
          ))}
        </div>
      </div>

      {/* Cat */}
      <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--color-mist)' }}>类别</label>
        <div className="flex flex-wrap gap-1">
          <FilterChip active={filter.cat === 'all'} onClick={() => set('cat', 'all')}>全部</FilterChip>
          {(Object.entries(CAT_LABELS) as [Cat, string][]).map(([k, v]) => (
            <FilterChip key={k} active={filter.cat === k} onClick={() => set('cat', k)}>{v}</FilterChip>
          ))}
        </div>
      </div>

      {/* Checkin filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <ToggleFilter
          label="佑"
          value={filter.checkedByA}
          onChange={(v) => set('checkedByA', v)}
        />
        <ToggleFilter
          label="宝"
          value={filter.checkedByB}
          onChange={(v) => set('checkedByB', v)}
        />
        <span className="ml-auto text-xs" style={{ color: 'var(--color-mist)' }}>
          显示 {totalShown} / {totalAll}
        </span>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function ToggleFilter({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }

  const display = value === null ? `${label}：全部` : value ? `${label}：已打卡` : `${label}：未打卡`
  const color = value === null ? 'var(--color-mist)' : value ? 'var(--color-jade)' : 'var(--color-vermilion)'

  return (
    <button
      onClick={cycle}
      className="text-xs px-2 py-1 rounded border transition-all"
      style={{
        borderColor: color,
        color,
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {display}
    </button>
  )
}
