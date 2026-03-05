import { type ReactNode } from 'react'

interface TableCardProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function TableCard({ title, subtitle, actions, children, footer, className }: TableCardProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      {children}

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  )
}
