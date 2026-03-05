import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import type { AnnouncementListItem, AnnouncementCategory, AnnouncementPriority } from '@/types'
import { Pin, MoreHorizontal, Pencil, Trash2, PinOff } from 'lucide-react'

const priorityLabels: Record<AnnouncementPriority, string> = {
  urgent: 'Acil',
  important: 'Önemli',
  normal: 'Normal',
}

const priorityClasses: Record<AnnouncementPriority, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  important: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const categoryLabels: Record<AnnouncementCategory, string> = {
  general: 'Genel',
  urgent: 'Acil',
  maintenance: 'Bakım',
  meeting: 'Toplantı',
  financial: 'Mali',
  other: 'Diğer',
}

const categoryClasses: Record<AnnouncementCategory, string> = {
  general: 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400',
  urgent: 'border-red-300 text-red-600 dark:border-red-600 dark:text-red-400',
  maintenance: 'border-orange-300 text-orange-600 dark:border-orange-600 dark:text-orange-400',
  meeting: 'border-purple-300 text-purple-600 dark:border-purple-600 dark:text-purple-400',
  financial: 'border-green-300 text-green-600 dark:border-green-600 dark:text-green-400',
  other: 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400',
}

export { priorityLabels, priorityClasses, categoryLabels, categoryClasses }

interface AnnouncementCardProps {
  item: AnnouncementListItem
  basePath: string
  isAdmin?: boolean
  readCount?: number
  targetMemberCount?: number
  onPin?: (id: string, pinned: boolean) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AnnouncementCard({
  item, basePath, isAdmin, readCount, targetMemberCount,
  onPin, onEdit, onDelete,
}: AnnouncementCardProps) {
  const readPct = targetMemberCount && targetMemberCount > 0
    ? Math.round(((readCount ?? 0) / targetMemberCount) * 100)
    : 0

  return (
    <Link
      to={`${basePath}/${item.id}`}
      className={cn(
        'group relative block rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow',
        item.isPinned && 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10',
        !item.isRead && !isAdmin && 'border-l-3 border-l-primary',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        {item.isPinned && <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', priorityClasses[item.priority])}>
          {priorityLabels[item.priority]}
        </span>
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs', categoryClasses[item.category])}>
          {categoryLabels[item.category]}
        </span>
        {item.status === 'draft' && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Taslak
          </span>
        )}
        {item.status === 'expired' && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Süresi Dolmuş
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={cn('text-base text-foreground', !item.isRead && !isAdmin ? 'font-semibold' : 'font-medium')}>
        {item.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <span>{item.createdByName}</span>
        <span>·</span>
        <span>{formatRelativeTime(item.publishedAt ?? item.createdAt)}</span>
      </div>

      {/* Admin: Read Progress */}
      {isAdmin && item.status === 'published' && targetMemberCount != null && targetMemberCount > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${readPct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            %{readPct} okundu ({readCount ?? 0}/{targetMemberCount})
          </span>
        </div>
      )}

      {/* Admin action menu */}
      {isAdmin && (onPin || onEdit || onDelete) && (
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.preventDefault()}
        >
          <ActionMenu
            item={item}
            onPin={onPin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </Link>
  )
}

function ActionMenu({
  item,
  onPin, onEdit, onDelete,
}: {
  item: AnnouncementListItem
  onPin?: (id: string, pinned: boolean) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open) }}
        className="flex h-8 w-8 items-center justify-center rounded-md border bg-card hover:bg-muted transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-md border bg-card shadow-lg py-1">
            {onPin && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(item.id, !item.isPinned); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                {item.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                {item.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
              </button>
            )}
            {onEdit && item.status === 'draft' && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item.id); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Düzenle
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-muted transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
