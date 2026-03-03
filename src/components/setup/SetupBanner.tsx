import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, X } from 'lucide-react'

const SETUP_KEY = 'komsunet_setup'

export function SetupBanner() {
  const [visible] = useState(() => {
    try {
      return !!localStorage.getItem(SETUP_KEY)
    } catch {
      return false
    }
  })
  const [dismissed, setDismissed] = useState(false)

  if (!visible || dismissed) return null

  function dismiss() {
    localStorage.removeItem(SETUP_KEY)
    setDismissed(true)
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-primary/10 border border-primary/30 px-5 py-4">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Site kurulumunuzu tamamlayın</p>
          <p className="text-xs text-primary mt-0.5">
            Blok, daire ve sakin davetlerini ekleyerek sistemi kullanmaya başlayın.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/setup"
          className="text-sm font-medium text-primary hover:text-primary bg-card border border-primary/30 rounded-lg px-3 py-1.5 transition-colors"
        >
          Kurulumu Tamamla
        </Link>
        <button
          onClick={dismiss}
          className="p-1 text-primary/50 hover:text-primary transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
