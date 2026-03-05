import { memo, useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Wallet, CircleDollarSign, Tag, CalendarDays,
  Users, Mail, UserCheck, Layers, DoorOpen, ChevronDown, ChevronRight,
  LogOut, BarChart3, FolderTree, FileText, Target, TrendingUp,
  Megaphone, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'

/* ------------------------------------------------------------------ */
/*  Sidebar Config                                                     */
/* ------------------------------------------------------------------ */

interface NavLink {
  to: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
  siteOnly?: boolean
}

interface NavParent {
  key: string
  label: string
  icon: React.ElementType
  to: string            // parent's own route
  adminOnly?: boolean
  children: NavLink[]
}

type NavItem =
  | { type: 'link'; item: NavLink }
  | { type: 'parent'; item: NavParent }
  | { type: 'divider'; label: string }

const topLinks: NavLink[] = [
  { to: '/dashboard', label: 'Ozet', icon: LayoutDashboard },
  { to: '/dues', label: 'Borclarim', icon: Wallet },
  { to: '/finance', label: 'Gelir-Gider', icon: BarChart3 },
  { to: '/announcements', label: 'Duyurular', icon: Megaphone },
]

const adminParents: NavParent[] = [
  {
    key: 'dues', label: 'Aidat', icon: CircleDollarSign, to: '/admin/dues', adminOnly: true,
    children: [
      { to: '/admin/dues/types', label: 'Aidat Tipleri', icon: Tag, adminOnly: true },
      { to: '/admin/dues/periods', label: 'Donemler', icon: CalendarDays, adminOnly: true },
    ],
  },
  {
    key: 'finance', label: 'Gelir-Gider', icon: BarChart3, to: '/admin/finance', adminOnly: true,
    children: [
      { to: '/admin/finance/categories', label: 'Kategoriler', icon: FolderTree, adminOnly: true },
      { to: '/admin/finance/records', label: 'Kayitlar', icon: FileText, adminOnly: true },
      { to: '/admin/finance/budgets', label: 'Butce', icon: Target, adminOnly: true },
      { to: '/admin/finance/reports', label: 'Yillik Rapor', icon: TrendingUp, adminOnly: true },
    ],
  },
  {
    key: 'announcements', label: 'Duyurular', icon: Megaphone, to: '/admin/announcements', adminOnly: true,
    children: [],
  },
  {
    key: 'members', label: 'Uyeler', icon: Users, to: '/admin/members', adminOnly: true,
    children: [
      { to: '/admin/invitations', label: 'Davetiyeler', icon: Mail, adminOnly: true },
      { to: '/admin/applications', label: 'Onay Bekleyenler', icon: UserCheck, adminOnly: true },
    ],
  },
]

const adminStandalone: NavLink[] = [
  { to: '/admin/blocks', label: 'Bloklar', icon: Layers, adminOnly: true, siteOnly: true },
  { to: '/admin/units', label: 'Daireler', icon: DoorOpen, adminOnly: true },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AdminSidebarProps {
  onNavigate?: () => void
}

export const AdminSidebar = memo(function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { profile, activeMembership, memberships, setActiveMembership, signOut } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)

  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const orgType = activeMembership?.orgType ?? 'site'
  const initials = profile?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('') ?? ''

  /* --- Route helpers --- */
  function isActive(to: string) {
    if (to === '/dashboard' || to === '/dues' || to === '/finance' || to === '/announcements') return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  function isParentOrChildActive(parent: NavParent) {
    if (isActive(parent.to)) return true
    return parent.children.some(c => isActive(c.to))
  }

  /* --- Expand/collapse state --- */
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const p of adminParents) {
      if (p.children.length > 0 && isParentOrChildActive(p)) {
        initial.add(p.key)
      }
    }
    return initial
  })

  // Auto-expand when navigating to a child route
  useEffect(() => {
    for (const p of adminParents) {
      if (p.children.length > 0 && isParentOrChildActive(p)) {
        setExpanded(prev => {
          if (prev.has(p.key)) return prev
          const next = new Set(prev)
          next.add(p.key)
          return next
        })
      }
    }
  }, [location.pathname])

  function toggleExpanded(key: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  /* --- Collapsed mode: flyout for parent hover --- */
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null)
  const flyoutTimeout = useRef<ReturnType<typeof setTimeout>>()

  function openFlyout(key: string) {
    clearTimeout(flyoutTimeout.current)
    setFlyoutKey(key)
  }
  function closeFlyout() {
    flyoutTimeout.current = setTimeout(() => setFlyoutKey(null), 150)
  }

  /* ---------------------------------------------------------------- */
  /*  Render helpers                                                   */
  /* ---------------------------------------------------------------- */

  function renderLink(item: NavLink, indent = false) {
    const active = isActive(item.to)
    if (item.siteOnly && orgType === 'apartment') return null

    if (isCollapsed) {
      return (
        <Tooltip key={item.to}>
          <TooltipTrigger asChild>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'hidden lg:flex w-10 h-10 mx-auto items-center justify-center rounded-lg transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-colors',
          indent ? 'pl-10 pr-3' : 'px-3',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
        )}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {item.label}
      </Link>
    )
  }

  function renderParent(parent: NavParent) {
    if (parent.adminOnly && !isAdmin) return null
    const active = isActive(parent.to)
    const childActive = parent.children.some(c => isActive(c.to))
    const hasChildren = parent.children.length > 0
    const isOpen = expanded.has(parent.key)

    /* --- Collapsed mode: icon + flyout --- */
    if (isCollapsed) {
      if (!hasChildren) {
        return renderLink({ to: parent.to, label: parent.label, icon: parent.icon })
      }

      return (
        <div
          key={parent.key}
          className="relative"
          onMouseEnter={() => openFlyout(parent.key)}
          onMouseLeave={closeFlyout}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={parent.to}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'hidden lg:flex w-10 h-10 mx-auto items-center justify-center rounded-lg transition-colors',
                  active || childActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                <parent.icon className="w-4 h-4 shrink-0" />
              </Link>
            </TooltipTrigger>
            {flyoutKey !== parent.key && (
              <TooltipContent side="right" sideOffset={8}>
                {parent.label}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Flyout panel */}
          {flyoutKey === parent.key && (
            <div
              className="absolute left-full top-0 ml-2 w-48 py-1 bg-sidebar border border-sidebar-border rounded-lg shadow-xl z-50 hidden lg:block"
              onMouseEnter={() => openFlyout(parent.key)}
              onMouseLeave={closeFlyout}
            >
              <p className="px-3 py-1.5 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
                {parent.label}
              </p>
              <Link
                to={parent.to}
                onClick={() => { setFlyoutKey(null); onNavigate?.() }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                <parent.icon className="w-3.5 h-3.5" />
                Genel Bakis
              </Link>
              {parent.children.map(child => {
                if (child.siteOnly && orgType === 'apartment') return null
                const cActive = isActive(child.to)
                return (
                  <Link
                    key={child.to}
                    to={child.to}
                    onClick={() => { setFlyoutKey(null); onNavigate?.() }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors',
                      cActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                    )}
                  >
                    <child.icon className="w-3.5 h-3.5" />
                    {child.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    /* --- Expanded mode --- */
    if (!hasChildren) {
      return renderLink({ to: parent.to, label: parent.label, icon: parent.icon })
    }

    return (
      <div key={parent.key}>
        {/* Parent row: clicking icon/label navigates, clicking chevron toggles */}
        <div className="flex items-center">
          <Link
            to={parent.to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 flex items-center gap-3 py-2 px-3 rounded-l-lg text-sm font-medium transition-colors',
              active || childActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
          >
            <parent.icon className="w-4 h-4 shrink-0" />
            {parent.label}
          </Link>
          <button
            onClick={() => toggleExpanded(parent.key)}
            className={cn(
              'p-2 rounded-r-lg transition-colors',
              active || childActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/40 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
            aria-label={isOpen ? `${parent.label} daralt` : `${parent.label} genislet`}
          >
            <ChevronRight className={cn(
              'w-3.5 h-3.5 transition-transform duration-200',
              isOpen && 'rotate-90'
            )} />
          </button>
        </div>

        {/* Children */}
        <div className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="ml-4 pl-3 border-l border-sidebar-border/50 space-y-0.5 py-1">
            {parent.children.map(child => {
              if (child.siteOnly && orgType === 'apartment') return null
              const cActive = isActive(child.to)
              return (
                <Link
                  key={child.to}
                  to={child.to}
                  onClick={onNavigate}
                  aria-current={cActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 py-1.5 px-3 rounded-lg text-[13px] font-medium transition-colors',
                    cActive
                      ? 'text-sidebar-accent-foreground bg-sidebar-accent/70'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
                  )}
                >
                  <child.icon className="w-3.5 h-3.5 shrink-0" />
                  {child.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <TooltipProvider delayDuration={0}>
      <nav role="navigation" aria-label="Ana menu" className="flex flex-col h-full">
        {/* Org Switcher */}
        <div className={cn(
          'border-b border-sidebar-border',
          isCollapsed ? 'px-2 pt-4 pb-3 hidden lg:block' : 'px-4 pt-5 pb-4',
        )}>
          {memberships.length > 0 && (
            <div className="relative">
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                      className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-semibold text-sidebar-foreground transition-colors"
                    >
                      {activeMembership?.organizationName?.[0] ?? 'S'}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {activeMembership?.organizationName ?? 'Site secin'}
                  </TooltipContent>
                </Tooltip>
              ) : (
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
              )}
              {orgMenuOpen && memberships.length > 1 && (
                <div className={cn(
                  'absolute top-full mt-1 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-xl z-10',
                  isCollapsed ? 'left-full ml-2 w-48 -top-2' : 'left-0 right-0',
                )}>
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
        <div className={cn(
          'flex-1 py-4 space-y-0.5 overflow-y-auto',
          isCollapsed ? 'px-2' : 'px-3',
        )}>
          {/* Top links — visible to all */}
          {topLinks.map(item => renderLink(item))}

          {/* Admin section */}
          {isAdmin && (
            <>
              {isCollapsed ? (
                <div className="my-3 mx-1 border-t border-sidebar-border hidden lg:block" />
              ) : (
                <div className="pt-4 pb-1.5 px-3">
                  <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
                    YONETIM
                  </p>
                </div>
              )}

              {adminParents.map(parent => renderParent(parent))}
              {adminStandalone.map(item => renderLink(item))}
            </>
          )}
        </div>

        {/* Collapse toggle — desktop only */}
        <div className="hidden lg:block px-2 py-1 border-t border-sidebar-border">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center justify-center rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors',
              isCollapsed ? 'w-10 h-10 mx-auto' : 'w-full gap-2 px-3 py-2 text-xs',
            )}
            aria-label={isCollapsed ? 'Menuyu genislet' : 'Menuyu daralt'}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span>Daralt</span>
              </>
            )}
          </button>
        </div>

        {/* User footer */}
        <div className={cn(
          'border-t border-sidebar-border',
          isCollapsed ? 'px-2 py-3' : 'px-3 py-4',
        )}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 hidden lg:flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
                    {initials}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <div>
                    <p className="font-medium">{profile?.fullName}</p>
                    <p className="text-xs opacity-70 capitalize">{activeMembership?.role ?? ''}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Cikis Yap
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2 px-1">
                <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground shrink-0">
                  {initials}
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
            </>
          )}
        </div>
      </nav>
    </TooltipProvider>
  )
})
