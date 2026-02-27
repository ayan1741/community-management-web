import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Home, Users, Mail, FileText, LogOut, Building2, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Ana Sayfa', icon: Home },
  { to: '/admin/members', label: 'Üyeler', icon: Users, adminOnly: true },
  { to: '/admin/invitations', label: 'Davetler', icon: Mail, adminOnly: true },
  { to: '/admin/applications', label: 'Başvurular', icon: FileText, adminOnly: true },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, activeMembership, memberships, setActiveMembership, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)

  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo + Organization */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Yönetim</span>
          </div>

          {/* Organization switcher */}
          {memberships.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-left"
              >
                <span className="text-xs font-medium text-gray-700 truncate">
                  {activeMembership?.organizationName ?? 'Site seçin'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
              </button>
              {orgMenuOpen && memberships.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {memberships.map((m) => (
                    <button
                      key={m.organizationId}
                      onClick={() => { setActiveMembership(m); setOrgMenuOpen(false) }}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {m.organizationName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, adminOnly }) => {
            if (adminOnly && !isAdmin) return null
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              {profile?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {profile?.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{activeMembership?.role ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
