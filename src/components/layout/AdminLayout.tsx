import { type ReactNode, useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { Topbar } from './Topbar'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Global subtle grid overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />

      {/* Topbar */}
      <Topbar onMenuToggle={() => setSidebarOpen(v => !v)} />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop: always visible, mobile: drawer */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-41 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-20',
            'top-0 lg:top-0 overflow-y-auto shrink-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Menüyü kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* Content — ANA SCROLL ALANI */}
        <main
          role="main"
          className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
