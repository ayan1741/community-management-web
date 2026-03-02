import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface AuthShellProps {
  children: ReactNode
  maxWidth?: string
}

export function AuthShell({ children, maxWidth = 'max-w-sm' }: AuthShellProps) {
  const { isDark, toggleTheme } = useTheme()

  const gridStyle = {
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background effects: glow + grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/8 dark:bg-blue-600/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0" style={gridStyle} />
        {/* Fade-out grid at edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-transparent to-slate-50/80 dark:from-zinc-950/0 dark:via-transparent dark:to-zinc-950/80" />
      </div>

      {/* Top bar — matches landing page navbar (h-16) */}
      <header className="fixed top-0 inset-x-0 z-50 transition-colors duration-300">
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/[0.06]" />
        <div className="relative mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <Building2 className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              KomşuNet
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-200"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4 pt-20">
        <div className={`w-full ${maxWidth}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
