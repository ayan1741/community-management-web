import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { AppRouter } from '@/router'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <AppRouter />
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
