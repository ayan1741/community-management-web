import { Info } from 'lucide-react'

interface StatusSummaryProps {
  lines: string[]
}

export function StatusSummary({ lines }: StatusSummaryProps) {
  if (lines.length === 0) return null

  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-info/10 flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-info" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Durum Ozeti</h3>
      </div>
      <ul className="space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
