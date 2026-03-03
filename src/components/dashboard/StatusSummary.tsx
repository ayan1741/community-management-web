import { Info } from 'lucide-react'

interface StatusSummaryProps {
  lines: string[]
}

export function StatusSummary({ lines }: StatusSummaryProps) {
  if (lines.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-info" />
        <h3 className="text-sm font-semibold text-foreground">Durum Ozeti</h3>
      </div>
      <ul className="space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className="text-sm text-muted-foreground leading-relaxed">
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
