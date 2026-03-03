import type { ReportBasis } from '@/types'

const STORAGE_PREFIX = 'reportBasis_'

export function getStoredBasis(orgId: string): ReportBasis {
  try {
    const val = localStorage.getItem(`${STORAGE_PREFIX}${orgId}`)
    return val === 'cash' ? 'cash' : 'period'
  } catch {
    return 'period'
  }
}

export function storeBasis(orgId: string, basis: ReportBasis) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${orgId}`, basis)
  } catch { /* quota exceeded — ignore */ }
}

interface ReportBasisToggleProps {
  value: ReportBasis
  onChange: (basis: ReportBasis) => void
}

export function ReportBasisToggle({ value, onChange }: ReportBasisToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-0.5 text-sm">
      <button
        type="button"
        onClick={() => onChange('period')}
        className={`rounded-md px-3 py-1 font-medium transition-colors ${
          value === 'period'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Dönem Bazlı
      </button>
      <button
        type="button"
        onClick={() => onChange('cash')}
        className={`rounded-md px-3 py-1 font-medium transition-colors ${
          value === 'cash'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Nakit Bazlı
      </button>
    </div>
  )
}
