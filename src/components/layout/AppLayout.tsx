import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  Home, Users, Mail, FileText, LogOut, Building2, ChevronDown,
  Layers, DoorOpen, CircleDollarSign, CalendarDays, Wallet,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
  indent?: boolean
}

const navItems: NavItem[] = [
  { to: '/dashboard',            label: 'Ana Sayfa',   icon: Home },
  { to: '/admin/blocks',         label: 'Bloklar',     icon: Layers,           adminOnly: true },
  { to: '/admin/units',          label: 'Daireler',    icon: DoorOpen,         adminOnly: true },
  { to: '/admin/members',        label: 'Üyeler',      icon: Users,            adminOnly: true },
  { to: '/admin/invitations',    label: 'Davetler',    icon: Mail,             adminOnly: true },
  { to: '/admin/applications',   label: 'Başvurular',  icon: FileText,         adminOnly: true },
  { to: '/admin/dues',           label: 'Aidat',       icon: CircleDollarSign, adminOnly: true },
  { to: '/admin/dues/periods',   label: 'Dönemler',    icon: CalendarDays,     adminOnly: true, indent: true },
  { to: '/dues',                 label: 'Borcum',      icon: Wallet },
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

  // Aktif link: tam eşleşme veya prefix (alt sayfalar için)
  function isActive(to: string) {
    if (to === '/dashboard' || to === '/dues') return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-950 flex flex-col shrink-0">
        {/* Logo + Organization */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">yönetim</span>
          </div>

          {/* Organization switcher */}
          {memberships.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left transition-colors"
              >
                <span className="text-xs font-medium text-slate-300 truncate">
                  {activeMembership?.organizationName ?? 'Site seçin'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-2" />
              </button>
              {orgMenuOpen && memberships.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  {memberships.map((m) => (
                    <button
                      key={m.organizationId}
                      onClick={() => { setActiveMembership(m); setOrgMenuOpen(false) }}
                      className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-700 hover:text-white first:rounded-t-lg last:rounded-b-lg transition-colors"
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
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, adminOnly, indent }) => {
            if (adminOnly && !isAdmin) return null
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  indent ? 'px-3 pl-7' : 'px-3',
                  active
                    ? 'bg-slate-800 text-white border-l-2 border-blue-500 pl-[10px]'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {profile?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {profile?.fullName}
              </p>
              <p className="text-xs text-slate-400 capitalize">{activeMembership?.role ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto bg-slate-50">
        {children}
      </main>
    </div>
  )
}
