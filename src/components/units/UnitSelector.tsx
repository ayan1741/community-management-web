import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { UnitDropdownItem } from '@/types'

interface UnitSelectorProps {
  units: UnitDropdownItem[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
}

export function UnitSelector({
  units,
  value,
  onChange,
  placeholder = 'Daire seçin...',
}: UnitSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = units.find(u => u.id === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = units.filter(
    u =>
      u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      u.blockName.toLowerCase().includes(search.toLowerCase()),
  )

  const grouped = filtered.reduce<Record<string, UnitDropdownItem[]>>((acc, u) => {
    if (!acc[u.blockName]) acc[u.blockName] = []
    acc[u.blockName].push(u)
    return acc
  }, {})

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch('') }}
        className="h-10 w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors"
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span>{selected.blockName} — {selected.unitNumber}</span>
            {selected.isOccupied && (
              <span className="text-xs text-amber-600 font-medium">· Dolu</span>
            )}
          </span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <span
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-40 max-h-64 flex flex-col">
          <div className="p-2 border-b border-slate-100 shrink-0">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Daire ara..."
              className="w-full h-8 px-2.5 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div className="overflow-y-auto">
            {Object.keys(grouped).length === 0 && (
              <p className="px-3 py-4 text-sm text-center text-slate-400">Sonuç yok</p>
            )}
            {Object.entries(grouped).map(([blockName, blockUnits]) => (
              <div key={blockName}>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {blockName}
                </p>
                {blockUnits.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { onChange(u.id); setOpen(false) }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                      value === u.id ? 'bg-blue-50 text-blue-700' : 'text-slate-900'
                    }`}
                  >
                    <span>{u.unitNumber}</span>
                    {u.isOccupied && (
                      <span className="text-xs text-amber-600 font-medium">Dolu</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
