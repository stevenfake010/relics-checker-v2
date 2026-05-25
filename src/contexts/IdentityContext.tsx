import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type UserId = 'userA' | 'userB'

export interface UserConfig {
  id: UserId
  label: string
  sealChar: string
  color: string
}

export const USER_CONFIGS: Record<UserId, UserConfig> = {
  userA: { id: 'userA', label: '用户甲', sealChar: '甲', color: '#C0392B' },
  userB: { id: 'userB', label: '用户乙', sealChar: '乙', color: '#2E7D5E' },
}

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
    if (stored === 'userA' || stored === 'userB') return stored
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
