import { AuthProvider } from '@/contexts/AuthContext'
import { AppRouter } from '@/router'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}
