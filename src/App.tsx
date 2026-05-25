import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { IdentityProvider, useIdentity } from './contexts/IdentityContext'
import { ToastProvider } from './components/Toast'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { Stats } from './pages/Stats'
import { useRealtime } from './hooks/useRealtime'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function RealtimeSetup({ children }: { children: ReactNode }) {
  useRealtime()
  return <>{children}</>
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { currentUser } = useIdentity()
  if (!currentUser) return <Onboarding />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <RealtimeSetup>
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
          path="/stats"
          element={
            <AuthGuard>
              <Stats />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
