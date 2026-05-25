import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type UserId = 'zuo' | 'huang'

export interface UserConfig {
  id: UserId
  label: string      // 完整称呼，例如「佑」「宝」
  sealChar: string   // 印章上的单字
  fullName: string   // 全名，例如「左小佑」
  color: string      // 主色
}

export const USER_CONFIGS: Record<UserId, UserConfig> = {
  zuo:   { id: 'zuo',   label: '佑', sealChar: '佑', fullName: '左小佑', color: '#A23B2C' },
  huang: { id: 'huang', label: '宝', sealChar: '宝', fullName: '黄小宝', color: '#3B6B5E' },
}

export const USER_LIST: UserConfig[] = [USER_CONFIGS.zuo, USER_CONFIGS.huang]

interface IdentityContextValue {
  currentUser: UserId | null
  setCurrentUser: (id: UserId) => void
  clearUser: () => void
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

const STORAGE_KEY = 'relics-checker-user'

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserId | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zuo' || stored === 'huang') return stored
    // 兼容旧 userA/userB 数据
    if (stored === 'userA') return 'zuo'
    if (stored === 'userB') return 'huang'
    return null
  })

  const setCurrentUser = (id: UserId) => {
    localStorage.setItem(STORAGE_KEY, id)
    setCurrentUserState(id)
  }

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUserState(null)
  }

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, currentUser)
    }
  }, [currentUser])

  return (
    <IdentityContext.Provider value={{ currentUser, setCurrentUser, clearUser }}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
