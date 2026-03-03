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
      'group relative rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] p-5 flex items-center gap-4',
      'transition-all duration-300 hover:-translate-y-0.5',
      'hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.04)]',
      className
    )}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-primary/15">
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
