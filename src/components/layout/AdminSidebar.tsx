import { memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Wallet, CircleDollarSign, Tag, CalendarDays,
  Users, Mail, UserCheck, Layers, DoorOpen, ChevronDown,
  LogOut, BarChart3, FolderTree, FileText, Target, TrendingUp,
  Megaphone,
} from 'lucide-react'
import { useState } from 'react'

type SidebarItem =
  | { type: 'link'; to: string; label: string; icon: React.ElementType; adminOnly?: boolean; siteOnly?: boolean; indent?: boolean }
  | { type: 'group'; label: string }

const sidebarConfig: SidebarItem[] = [
  { type: 'link', to: '/dashboard', label: 'Ozet', icon: LayoutDashboard },
  { type: 'link', to: '/dues', label: 'Borclarim', icon: Wallet },
  { type: 'link', to: '/finance', label: 'Gelir-Gider', icon: BarChart3 },
  { type: 'link', to: '/announcements', label: 'Duyurular', icon: Megaphone },

  { type: 'group', label: 'YONETIM' },
  { type: 'link', to: '/admin/dues', label: 'Aidat', icon: CircleDollarSign, adminOnly: true },
  { type: 'link', to: '/admin/dues/types', label: 'Aidat Tipleri', icon: Tag, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/dues/periods', label: 'Donemler', icon: CalendarDays, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/finance', label: 'Gelir-Gider', icon: BarChart3, adminOnly: true },
  { type: 'link', to: '/admin/finance/categories', label: 'Kategoriler', icon: FolderTree, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/finance/records', label: 'Kayitlar', icon: FileText, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/finance/budgets', label: 'Butce', icon: Target, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/finance/reports', label: 'Yillik Rapor', icon: TrendingUp, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/announcements', label: 'Duyurular', icon: Megaphone, adminOnly: true },
  { type: 'link', to: '/admin/members', label: 'Uyeler', icon: Users, adminOnly: true },
  { type: 'link', to: '/admin/invitations', label: 'Davetiyeler', icon: Mail, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/applications', label: 'Onay Bekleyenler', icon: UserCheck, adminOnly: true, indent: true },
  { type: 'link', to: '/admin/blocks', label: 'Bloklar', icon: Layers, adminOnly: true, siteOnly: true },
  { type: 'link', to: '/admin/units', label: 'Daireler', icon: DoorOpen, adminOnly: true },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export const AdminSidebar = memo(function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { profile, activeMembership, memberships, setActiveMembership, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)

  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const orgType = activeMembership?.orgType ?? 'site'

  function isActive(to: string) {
    if (to === '/dashboard' || to === '/dues' || to === '/finance' || to === '/announcements') return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav role="navigation" aria-label="Ana menu" className="flex flex-col h-full">
      {/* Org Switcher */}
      <div className="px-4 pt-5 pb-4 border-b border-sidebar-border">
        {memberships.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setOrgMenuOpen(!orgMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 text-left transition-colors"
            >
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                {activeMembership?.organizationName ?? 'Site secin'}
              </span>
              <ChevronDown className={cn(
                'w-3 h-3 text-sidebar-foreground/50 shrink-0 ml-2 transition-transform',
                orgMenuOpen && 'rotate-180'
              )} />
            </button>
            {orgMenuOpen && memberships.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-xl z-10">
                {memberships.map((m) => (
                  <button
                    key={m.organizationId}
                    onClick={() => { setActiveMembership(m); setOrgMenuOpen(false); onNavigate?.() }}
                    className={cn(
                      'w-full px-3 py-2 text-xs text-left text-sidebar-foreground hover:bg-sidebar-primary/20 hover:text-sidebar-primary-foreground first:rounded-t-lg last:rounded-b-lg transition-colors',
                      m.organizationId === activeMembership?.organizationId && 'bg-sidebar-primary/10 text-sidebar-primary-foreground font-medium'
                    )}
                  >
                    {m.organizationName}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {sidebarConfig.map((item, i) => {
          if (item.type === 'group') {
            // Don't show group header if no admin items visible
            if (!isAdmin) return null
            return (
              <div key={`group-${i}`} className="pt-4 pb-1.5 px-3">
                <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
                  {item.label}
                </p>
              </div>
            )
          }

          if (item.adminOnly && !isAdmin) return null
          if (item.siteOnly && orgType === 'apartment') return null

          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.indent ? 'px-3 pl-9' : 'px-3',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground shrink-0">
            {profile?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">
              {profile?.fullName}
            </p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{activeMembership?.role ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cikis Yap
        </button>
      </div>
    </nav>
  )
})
