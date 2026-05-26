import { useState, useRef, useEffect } from 'react'
import { type UserId, USER_CONFIGS, useIdentity } from '../contexts/IdentityContext'
import { Avatar } from '../components/Avatar'

export function Onboarding() {
  const { setCurrentUser } = useIdentity()
  const [selectedUser, setSelectedUser] = useState<UserId | null>(null)
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectedUser) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [selectedUser])

  const handleSelect = (id: UserId) => {
    setSelectedUser(id)
    setPasscode('')
    setError(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !passcode.trim() || verifying) return

    setVerifying(true)
    setError(false)

    try {
      const resp = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, passcode: passcode.trim() }),
      })

      if (resp.ok) {
        const data = await resp.json()
        // Store token for future use
        localStorage.setItem('auth_token', data.token)
        setCurrentUser(selectedUser)
      } else {
        setError(true)
        setShaking(true)
        setTimeout(() => setShaking(false), 500)
        setTimeout(() => setError(false), 2000)
      }
    } catch {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => setError(false), 2000)
    } finally {
      setVerifying(false)
    }
  }

  const handleBack = () => {
    setSelectedUser(null)
    setPasscode('')
    setError(false)
  }

  const selectedCfg = selectedUser ? USER_CONFIGS[selectedUser] : null

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <div className="max-w-md w-full text-center">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          文化足迹
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-mist)' }}>
          禁止出境文物 · 世界遗产 · 国保单位
        </p>
        <div
          className="my-8 w-16 h-px mx-auto"
          style={{ backgroundColor: 'var(--color-vermilion)' }}
        />

        {!selectedUser ? (
          <>
            <p className="mb-8" style={{ color: 'var(--color-ink)' }}>
              选择你的身份
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(
                Object.values(USER_CONFIGS) as (typeof USER_CONFIGS)[keyof typeof USER_CONFIGS][]
              ).map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => handleSelect(cfg.id)}
                  className="flex flex-col items-center gap-4 p-8 rounded-lg border-2 transition-all hover:scale-105 active:scale-95"
                  style={{
                    borderColor: cfg.color,
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <Avatar user={cfg} size={84} active />
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: 'var(--color-ink)',
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
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
          </>
        ) : (
          <div
            className="mx-auto max-w-xs rounded-2xl p-8 transition-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              border: `2px solid ${selectedCfg!.color}20`,
              animation: shaking ? 'shake 0.4s ease-in-out' : undefined,
            }}
          >
            <button
              onClick={handleBack}
              className="mb-4 text-sm flex items-center gap-1 mx-auto transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-mist)' }}
            >
              ← 重新选择
            </button>

            <div className="flex flex-col items-center gap-3 mb-6">
              <div
                className="rounded-full p-1"
                style={{
                  background: `linear-gradient(135deg, ${selectedCfg!.color}40, ${selectedCfg!.color}10)`,
                }}
              >
                <Avatar user={selectedCfg!} size={72} active />
              </div>
              <div>
                <div
                  className="text-xl font-bold"
                  style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' }}
                >
                  {selectedCfg!.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>
                  请输入口令验证身份
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setError(false)
                  }}
                  placeholder="输入口令..."
                  disabled={verifying}
                  className="w-full px-4 py-3 rounded-xl text-center text-lg tracking-widest transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    color: 'var(--color-ink)',
                    border: `2px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
                    outline: 'none',
                    fontFamily: 'var(--font-serif)',
                    opacity: verifying ? 0.6 : 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = error ? '#ef4444' : selectedCfg!.color
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? '#ef4444' : 'var(--color-border)'
                  }}
                />
                {error && (
                  <div
                    className="absolute -bottom-6 left-0 right-0 text-xs text-center"
                    style={{ color: '#ef4444' }}
                  >
                    口令不对哦～再想想 💭
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!passcode.trim() || verifying}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all active:scale-95"
                style={{
                  backgroundColor: passcode.trim() ? selectedCfg!.color : 'var(--color-surface-alt)',
                  color: passcode.trim() ? '#fff' : 'var(--color-mist)',
                  opacity: passcode.trim() && !verifying ? 1 : 0.6,
                  cursor: passcode.trim() && !verifying ? 'pointer' : 'not-allowed',
                }}
              >
                {verifying ? '验证中...' : '验证并进入 →'}
              </button>
            </form>

            <div
              className="mt-6 text-xs leading-relaxed"
              style={{ color: 'var(--color-mist)', opacity: 0.6 }}
            >
              💡 提示：口令是你对 TA 说的话
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
