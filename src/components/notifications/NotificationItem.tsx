import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import type { NotificationItem as NItem } from '@/types'
import { Megaphone, Wallet, CreditCard, UserCheck } from 'lucide-react'

const typeIcons: Record<string, React.ElementType> = {
  announcement: Megaphone,
  due_reminder: Wallet,
  payment: CreditCard,
  application: UserCheck,
}

const typeColors: Record<string, string> = {
  announcement: 'text-blue-500',
  due_reminder: 'text-amber-500',
  payment: 'text-green-500',
  application: 'text-purple-500',
}

function navigateToReference(notification: NItem, navigate: (path: string) => void) {
  const { referenceType, referenceId } = notification
  switch (referenceType) {
    case 'announcement':
      navigate(`/announcements/${referenceId}`)
      break
    case 'unit_due':
    case 'payment':
      navigate('/dues')
      break
    case 'application':
      navigate('/admin/applications')
      break
    default:
      navigate('/notifications')
  }
}

interface NotificationItemProps {
  item: NItem
  onMarkRead?: (id: string) => void
}

export function NotificationItemRow({ item, onMarkRead }: NotificationItemProps) {
  const navigate = useNavigate()
  const Icon = typeIcons[item.type] ?? Megaphone

  function handleClick() {
    if (!item.isRead) onMarkRead?.(item.id)
    navigateToReference(item, navigate)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors',
        !item.isRead && 'bg-primary/5'
      )}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0 w-2">
        {!item.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>

      {/* Icon */}
      <div className={cn('mt-0.5 shrink-0', typeColors[item.type] ?? 'text-muted-foreground')}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !item.isRead ? 'font-medium text-foreground' : 'text-foreground')}>
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
    </button>
  )
}
