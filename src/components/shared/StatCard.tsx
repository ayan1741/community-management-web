import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: { value: string; direction: 'up' | 'down' }
  footnote?: string
}

export function StatCard({ label, value, icon: Icon, trend, footnote }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
        {trend && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full',
            trend.direction === 'up'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
          )}>
            {trend.direction === 'up'
              ? <ArrowUpRight className="w-3.5 h-3.5" />
              : <ArrowDownRight className="w-3.5 h-3.5" />
            }
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      </div>
      {footnote && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{footnote}</p>
      )}
    </div>
  )
}
