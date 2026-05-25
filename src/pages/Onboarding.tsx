import { type UserId, USER_CONFIGS, useIdentity } from '../contexts/IdentityContext'
import { Avatar } from '../components/Avatar'

export function Onboarding() {
  const { setCurrentUser } = useIdentity()

  const handleSelect = (id: UserId) => {
    setCurrentUser(id)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ backgroundColor: 'var(--color-paper)' }}>
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
          禁止出境文物
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-mist)' }}>
          195件国家禁止出境文物打卡
        </p>
        <div className="my-8 w-16 h-px mx-auto" style={{ backgroundColor: 'var(--color-vermilion)' }} />
        <p className="mb-8" style={{ color: 'var(--color-ink)' }}>
          选择你的身份开始打卡
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(Object.values(USER_CONFIGS) as typeof USER_CONFIGS[keyof typeof USER_CONFIGS][]).map((cfg) => (
            <button
              key={cfg.id}
              onClick={() => handleSelect(cfg.id)}
              className="flex flex-col items-center gap-4 p-8 rounded-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: cfg.color,
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <Avatar user={cfg} size={84} active />
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' }}>
                  {cfg.label}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-mist)' }}>
                  {cfg.fullName}
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-8 text-sm" style={{ color: 'var(--color-mist)' }}>
          两人可独立使用，打卡记录云端同步
        </p>
      </div>
    </div>
  )
}
