import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { SelectOrganizationPage } from '@/pages/SelectOrganizationPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MembersPage } from '@/pages/admin/MembersPage'
import { InvitationsPage } from '@/pages/admin/InvitationsPage'
import { ApplicationsPage } from '@/pages/admin/ApplicationsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading, memberships, activeMembership } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Yükleniyor...</span></div>
  if (!session) return <Navigate to="/login" replace />
  if (memberships.length > 1 && !activeMembership) return <Navigate to="/select-org" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { activeMembership } = useAuth()
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/apply-success" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Başvurunuz Alındı</h1>
              <p className="text-gray-500">Yönetici onayladığında bildirim alacaksınız.</p>
            </div>
          </div>
        } />

        {/* Organization seçimi */}
        <Route path="/select-org" element={<RequireAuth><SelectOrganizationPage /></RequireAuth>} />

        {/* Korumalı */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin/members" element={<RequireAuth><RequireAdmin><MembersPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/invitations" element={<RequireAuth><RequireAdmin><InvitationsPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/applications" element={<RequireAuth><RequireAdmin><ApplicationsPage /></RequireAdmin></RequireAuth>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
