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
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Site kurulumunuzu tamamlayın</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Blok, daire ve sakin davetlerini ekleyerek sistemi kullanmaya başlayın.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/setup"
          className="text-sm font-medium text-blue-700 hover:text-blue-800 bg-white border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Kurulumu Tamamla
        </Link>
        <button
          onClick={dismiss}
          className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
