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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 transition-colors duration-300">
            KomşuNet
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all duration-200"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* Content */}
      <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className={`w-full ${maxWidth}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
