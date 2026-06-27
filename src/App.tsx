import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { IdentityProvider, useIdentity } from './contexts/IdentityContext'
import { hasValidToken, clearAuthToken } from './lib/auth'
import { ToastProvider } from './components/Toast'
import { Onboarding } from './pages/Onboarding'
import { useRealtime } from './hooks/useRealtime'
import { lazy, Suspense, type ReactNode } from 'react'

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const Heritage = lazy(() => import('./pages/Heritage').then((module) => ({ default: module.Heritage })))
const World = lazy(() => import('./pages/World').then((module) => ({ default: module.World })))
const Stats = lazy(() => import('./pages/Stats').then((module) => ({ default: module.Stats })))
const Guobao = lazy(() => import('./pages/Guobao').then((module) => ({ default: module.Guobao })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
    },
  },
})

function RealtimeSetup({ children }: { children: ReactNode }) {
  useRealtime()
  return <>{children}</>
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { currentUser, clearUser } = useIdentity()

  // A selected identity is not enough — we also need a valid (non-expired)
  // auth token. Otherwise every signed image / API call 401s and silently
  // falls back to placeholder icons. If the token is missing or expired,
  // clear the ghost session and force the user back through passcode verify.
  if (!currentUser || !hasValidToken()) {
    if (currentUser && !hasValidToken()) {
      clearAuthToken()
      clearUser()
    }
    return <Onboarding />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <RealtimeSetup>
      <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--color-paper)' }} />}>
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/heritage"
            element={
              <AuthGuard>
                <Heritage />
              </AuthGuard>
            }
          />
          <Route
            path="/world"
            element={
              <AuthGuard>
                <World />
              </AuthGuard>
            }
          />
          <Route
            path="/guobao"
            element={
              <AuthGuard>
                <Guobao />
              </AuthGuard>
            }
          />
          <Route
            path="/stats"
            element={
              <AuthGuard>
                <Stats />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </RealtimeSetup>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IdentityProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </IdentityProvider>
    </QueryClientProvider>
  )
}
