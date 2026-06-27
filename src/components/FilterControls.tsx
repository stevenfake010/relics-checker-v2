import type { ReactNode } from 'react'

interface ChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

export function Chip({ active, onClick, children }: ChipProps) {
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

interface ToggleChipProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
  checkedLabel?: string
  uncheckedLabel?: string
}

export function ToggleChip({
  label,
  value,
  onChange,
  checkedLabel = '已打卡',
  uncheckedLabel = '未打卡',
}: ToggleChipProps) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }

  const display = value === null ? `${label}：全部` : value ? `${label}：${checkedLabel}` : `${label}：${uncheckedLabel}`
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
