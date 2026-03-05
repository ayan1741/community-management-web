import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type GradientColor = 'green' | 'red' | 'blue' | 'purple' | 'teal' | 'orange'

const gradientMap: Record<GradientColor, string> = {
  green: 'from-emerald-500 to-emerald-400',
  red: 'from-red-500 to-red-400',
  blue: 'from-blue-600 to-blue-400',
  purple: 'from-violet-600 to-violet-400',
  teal: 'from-teal-500 to-teal-400',
  orange: 'from-amber-500 to-orange-400',
}

interface SectionCardProps {
  icon: React.ElementType
  title: string
  subtitle?: string
  gradient: GradientColor
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ icon: Icon, title, subtitle, gradient, action, children, className }: SectionCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden bg-white dark:bg-white/[0.04]',
      className
    )}>
      {/* Gradient header */}
      <div className={cn(
        'flex items-center justify-between px-5 py-3 bg-gradient-to-r text-white',
        gradientMap[gradient]
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-white/70 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 ml-3">{action}</div>}
      </div>

      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}
