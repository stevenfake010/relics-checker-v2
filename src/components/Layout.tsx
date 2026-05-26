import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { IdentitySwitcher } from './IdentitySwitcher'

interface LayoutProps {
  children: ReactNode
  /** 隐藏 TabBar（如 Onboarding 页） */
  hideTabs?: boolean
}

const TABS = [
  { to: '/', label: '🏛️ 文物', exact: true },
  { to: '/heritage', label: '🌏 世界遗产' },
  { to: '/stats', label: '📊 统计' },
]

export function Layout({ children, hideTabs = false }: LayoutProps) {
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
          <div className="flex items-center gap-4">
            <div>
              <h1
                className="text-lg font-bold leading-tight"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                文化足迹
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
                禁止出境文物 + 世界遗产
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IdentitySwitcher />
            <ThemeToggle />
          </div>
        </div>

        {!hideTabs && (
          <nav
            className="max-w-5xl mx-auto px-4 flex items-center gap-1 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.exact}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm transition-all relative ${
                    isActive ? 'font-medium' : 'opacity-70 hover:opacity-100'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--color-vermilion)' : 'var(--color-ink)',
                  borderBottom: isActive
                    ? '2px solid var(--color-vermilion)'
                    : '2px solid transparent',
                  marginBottom: '-1px',
                })}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      {children}
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
