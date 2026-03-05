import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: React.ElementType
  onAction?: () => void
  children?: ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-5" size="sm" onClick={onAction}>
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-1.5" />}
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  )
}
