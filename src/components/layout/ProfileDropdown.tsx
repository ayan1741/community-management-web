import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

export function ProfileDropdown() {
  const { profile, activeMembership, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initials = profile?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('') ?? ''

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-9 px-1.5 rounded-full border border-border bg-card/60 hover:bg-muted transition-all duration-200"
        aria-label="Profil menusu"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
          {initials}
        </div>
        <span className="text-sm font-medium text-foreground hidden md:block max-w-[120px] truncate pr-1">
          {profile?.fullName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl z-50 py-1">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">{profile?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{activeMembership?.role ?? ''}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cikis Yap
          </button>
        </div>
      )}
    </div>
  )
}
