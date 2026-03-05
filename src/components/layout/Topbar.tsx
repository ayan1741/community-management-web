import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/contexts/AuthContext'
import { Building2, Menu, Sun, Moon, ChevronRight } from 'lucide-react'
import { ProfileDropdown } from './ProfileDropdown'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const breadcrumbMap: Record<string, string[]> = {
  '/dashboard': ['Özet'],
  '/dues': ['Borçlarım'],
  '/admin/dues': ['Yönetim', 'Aidat'],
  '/admin/dues/types': ['Yönetim', 'Aidat', 'Aidat Tipleri'],
  '/admin/dues/periods': ['Yönetim', 'Aidat', 'Dönemler'],
  '/admin/members': ['Yönetim', 'Üyeler'],
  '/admin/invitations': ['Yönetim', 'Davetiyeler'],
  '/admin/applications': ['Yönetim', 'Onay Bekleyenler'],
  '/admin/blocks': ['Yönetim', 'Bloklar'],
  '/admin/units': ['Yönetim', 'Daireler'],
  '/announcements': ['Duyurular'],
  '/admin/announcements': ['Yönetim', 'Duyurular'],
  '/notifications': ['Bildirimler'],
}

const breadcrumbPaths: Record<string, string> = {
  'Yönetim': '/dashboard',
  'Aidat': '/admin/dues',
  'Dönemler': '/admin/dues/periods',
  'Aidat Tipleri': '/admin/dues/types',
  'Üyeler': '/admin/members',
  'Davetiyeler': '/admin/invitations',
  'Onay Bekleyenler': '/admin/applications',
  'Bloklar': '/admin/blocks',
  'Daireler': '/admin/units',
  'Borçlarım': '/dues',
  'Özet': '/dashboard',
  'Bildirimler': '/notifications',
}

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { setActiveMembership } = useAuth()

  const pathname = location.pathname
  const crumbs = breadcrumbMap[pathname] ?? findDynamicBreadcrumb(pathname)

  return (
    <header
      role="banner"
      className="h-16 sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-6 border-b border-border/50 bg-background/70 backdrop-blur-2xl shrink-0"
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 lg:hidden"
          aria-label="Menü"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Logo */}
        <Link
          to="/home"
          onClick={() => setActiveMembership(null)}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
            <Building2 className="h-[18px] w-[18px] text-primary-foreground" />
          </div>
          <span className="text-[15px] font-bold text-foreground tracking-tight hidden sm:block">
            KomşuNet
          </span>
        </Link>

        {/* Separator */}
        <div className="hidden md:block w-px h-6 bg-border/60" />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden md:block">
          <ol className="flex items-center gap-1 text-sm">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1
              const path = breadcrumbPaths[crumb]

              const resolvedPath = path ?? (crumb === 'Duyurular'
                ? (pathname.startsWith('/admin/') ? '/admin/announcements' : '/announcements')
                : undefined)

              return (
                <li key={crumb} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  {isLast || !resolvedPath ? (
                    <span className="font-medium text-foreground">{crumb}</span>
                  ) : (
                    <Link
                      to={resolvedPath}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          aria-label="Tema değiştir"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </header>
  )
}

/** Fallback: dynamic routes like /admin/dues/periods/:id */
function findDynamicBreadcrumb(pathname: string): string[] {
  if (pathname.startsWith('/admin/dues/periods/')) {
    return ['Yönetim', 'Aidat', 'Dönemler', 'Detay']
  }
  if (pathname.startsWith('/admin/announcements/')) {
    return ['Yönetim', 'Duyurular', 'Detay']
  }
  if (pathname.startsWith('/announcements/')) {
    return ['Duyurular', 'Detay']
  }
  return ['Özet']
}
