import { USER_CONFIGS, useIdentity } from '../contexts/IdentityContext'
import { clearAuthToken } from '../lib/auth'
import { Avatar } from './Avatar'

export function IdentitySwitcher() {
  const { currentUser, clearUser } = useIdentity()

  const handleSwitch = () => {
    clearAuthToken()
    clearUser()
  }

  return (
    <div className="flex items-center gap-2">
      {(Object.values(USER_CONFIGS) as typeof USER_CONFIGS[keyof typeof USER_CONFIGS][]).map((cfg) => {
        const active = currentUser === cfg.id
        return (
          <button
            key={cfg.id}
            onClick={() => {
              if (!active) handleSwitch()
            }}
            title={`切换到${cfg.label}`}
            className="flex items-center gap-1.5 pl-1 pr-3 py-0.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: active ? cfg.color : 'var(--color-surface-alt)',
              color: active ? '#fff' : 'var(--color-mist)',
              border: `1px solid ${active ? cfg.color : 'var(--color-border)'}`,
            }}
          >
            <Avatar user={cfg} size={22} active={active} />
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
