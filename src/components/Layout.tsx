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
  { to: '/heritage', label: '🌏 中国世遗' },
  { to: '/world', label: '🌐 世界遗产' },
  { to: '/guobao', label: '🏯 国保' },
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
                禁止出境文物 + 世界遗产 + 国保单位 + Top100
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
            className="max-w-5xl mx-auto px-4 hidden sm:flex items-center gap-1 border-t"
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
      <div className={!hideTabs ? 'pb-20 sm:pb-0' : undefined}>{children}</div>
      {!hideTabs && <MobileTabBar />}
    </div>
  )
}

function MobileTabBar() {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-4 max-w-5xl mx-auto">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className="min-w-0 px-1 py-2 text-center text-[11px] leading-tight"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-vermilion)' : 'var(--color-mist)',
              fontWeight: isActive ? 700 : 500,
            })}
          >
            <span className="block truncate">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
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
