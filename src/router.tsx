import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AdminRegisterPage } from '@/pages/auth/AdminRegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { SetupWizardPage } from '@/pages/setup/SetupWizardPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MembersPage } from '@/pages/admin/MembersPage'
import { InvitationsPage } from '@/pages/admin/InvitationsPage'
import { ApplicationsPage } from '@/pages/admin/ApplicationsPage'
import { BlocksPage } from '@/pages/admin/BlocksPage'
import { UnitsPage } from '@/pages/admin/UnitsPage'
import { DuesHomePage } from '@/pages/admin/DuesHomePage'
import { DueTypesPage } from '@/pages/admin/DueTypesPage'
import { DuesPeriodsPage } from '@/pages/admin/DuesPeriodsPage'
import { DuesPeriodDetailPage } from '@/pages/admin/DuesPeriodDetailPage'
import { MyDuesPage } from '@/pages/MyDuesPage'
import { FinanceHomePage } from '@/pages/admin/FinanceHomePage'
import { FinanceCategoriesPage } from '@/pages/admin/FinanceCategoriesPage'
import { FinanceRecordsPage } from '@/pages/admin/FinanceRecordsPage'
import { FinanceBudgetPage } from '@/pages/admin/FinanceBudgetPage'
import { FinanceAnnualReportPage } from '@/pages/admin/FinanceAnnualReportPage'
import { MyFinancePage } from '@/pages/MyFinancePage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading, activeMembership } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Yükleniyor...</span></div>
  if (!session) return <Navigate to="/login" replace />
  if (!activeMembership && !['/home', '/setup'].includes(location.pathname))
    return <Navigate to="/home" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { activeMembership } = useAuth()
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  if (!isAdmin) return <Navigate to="/home" replace />
  return <>{children}</>
}

function RequireAdminOnly({ children }: { children: React.ReactNode }) {
  const { activeMembership } = useAuth()
  if (activeMembership?.role !== 'admin') return <Navigate to="/admin/dues" replace />
  return <>{children}</>
}

function PublicHome() {
  const { session, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><span className="text-zinc-600 text-sm">Yükleniyor…</span></div>
  if (session) return <Navigate to="/home" replace />
  return <LandingPage />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<PublicHome />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-register" element={<AdminRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/apply-success" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Başvurunuz Alındı</h1>
              <p className="text-gray-500">Yönetici onayladığında bildirim alacaksınız.</p>
            </div>
          </div>
        } />

        {/* Kurulum sihirbazı — session gerekli, membership gerekmez */}
        <Route path="/setup" element={<RequireAuth><SetupWizardPage /></RequireAuth>} />

        {/* Hub sayfası */}
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/select-org" element={<Navigate to="/home" replace />} />

        {/* Korumalı — tüm kullanıcılar */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/dues" element={<RequireAuth><MyDuesPage /></RequireAuth>} />

        {/* Admin & Board Member */}
        <Route path="/admin/members" element={<RequireAuth><RequireAdmin><MembersPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/invitations" element={<RequireAuth><RequireAdmin><InvitationsPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/applications" element={<RequireAuth><RequireAdmin><ApplicationsPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/blocks" element={<RequireAuth><RequireAdmin><BlocksPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/units" element={<RequireAuth><RequireAdmin><UnitsPage /></RequireAdmin></RequireAuth>} />

        {/* Aidat — admin & board_member */}
        <Route path="/admin/dues" element={<RequireAuth><RequireAdmin><DuesHomePage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/dues/periods" element={<RequireAuth><RequireAdmin><DuesPeriodsPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/dues/periods/:periodId" element={<RequireAuth><RequireAdmin><DuesPeriodDetailPage /></RequireAdmin></RequireAuth>} />

        {/* Aidat Tipleri — sadece admin */}
        <Route path="/admin/dues/types" element={<RequireAuth><RequireAdmin><RequireAdminOnly><DueTypesPage /></RequireAdminOnly></RequireAdmin></RequireAuth>} />

        {/* Gelir-Gider — admin & board_member */}
        <Route path="/admin/finance" element={<RequireAuth><RequireAdmin><FinanceHomePage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/finance/categories" element={<RequireAuth><RequireAdmin><RequireAdminOnly><FinanceCategoriesPage /></RequireAdminOnly></RequireAdmin></RequireAuth>} />
        <Route path="/admin/finance/records" element={<RequireAuth><RequireAdmin><FinanceRecordsPage /></RequireAdmin></RequireAuth>} />
        <Route path="/admin/finance/budgets" element={<RequireAuth><RequireAdmin><RequireAdminOnly><FinanceBudgetPage /></RequireAdminOnly></RequireAdmin></RequireAuth>} />
        <Route path="/admin/finance/reports" element={<RequireAuth><RequireAdmin><FinanceAnnualReportPage /></RequireAdmin></RequireAuth>} />

        {/* Sakin gelir-gider şeffaflık görünümü */}
        <Route path="/finance" element={<RequireAuth><MyFinancePage /></RequireAuth>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
