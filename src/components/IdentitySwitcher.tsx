import { USER_CONFIGS, useIdentity } from '../contexts/IdentityContext'

export function IdentitySwitcher() {
  const { currentUser, setCurrentUser } = useIdentity()

  return (
    <div className="flex items-center gap-2">
      {(Object.values(USER_CONFIGS) as typeof USER_CONFIGS[keyof typeof USER_CONFIGS][]).map((cfg) => {
        const active = currentUser === cfg.id
        return (
          <button
            key={cfg.id}
            onClick={() => setCurrentUser(cfg.id)}
            title={`切换到${cfg.label}`}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: active ? cfg.color : 'var(--color-surface-alt)',
              color: active ? '#fff' : 'var(--color-mist)',
              border: `1px solid ${active ? cfg.color : 'var(--color-border)'}`,
            }}
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-xs border font-bold"
              style={{
                borderColor: active ? 'rgba(255,255,255,0.5)' : cfg.color,
                color: active ? '#fff' : cfg.color,
                fontFamily: 'var(--font-serif)',
              }}
            >
              {cfg.sealChar}
            </span>
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
