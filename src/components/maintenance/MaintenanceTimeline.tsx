import { statusConfig } from '@/lib/maintenance-helpers'
import { formatDateTime } from '@/lib/format'
import type { MaintenanceRequestLogItem, MaintenanceStatus } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  items: MaintenanceRequestLogItem[]
  currentStatus: MaintenanceStatus
}

export function MaintenanceTimeline({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          const cfg = statusConfig[item.toStatus as MaintenanceStatus]
          return (
            <div key={item.id} className="relative flex gap-3">
              {/* Dot */}
              <div className={cn(
                'absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 bg-white dark:bg-gray-900 z-10',
                isLast
                  ? 'border-primary bg-primary dark:bg-primary'
                  : 'border-gray-300 dark:border-gray-600',
              )} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {cfg && (
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium', cfg.class)}>
                      {cfg.label}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.createdByName}
                </p>
                {item.note && (
                  <p className="text-sm text-foreground mt-1 bg-muted/50 rounded-lg px-3 py-2">
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
