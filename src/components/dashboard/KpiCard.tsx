import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  className?: string
}

export function KpiCard({ label, value, icon, trend, className }: KpiCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-5 flex items-center gap-4',
      className
    )}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-xl font-bold text-foreground">{value}</p>
          {trend && (
            <span className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
