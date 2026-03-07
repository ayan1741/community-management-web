import { ChevronUp, Pin, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agendaStatusConfig, agendaCategoryConfig } from '@/lib/agenda-helpers'
import { formatRelativeTime } from '@/lib/format'
import type { AgendaItemListItem } from '@/types'

interface AgendaCardProps {
  item: AgendaItemListItem
  onSupport: (id: string) => void
  onClick: (id: string) => void
}

export function AgendaCard({ item, onSupport, onClick }: AgendaCardProps) {
  const st = agendaStatusConfig[item.status]
  const cat = agendaCategoryConfig[item.category]

  return (
    <div className="flex items-stretch border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
      {/* Support button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSupport(item.id) }}
        className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-gray-100 dark:border-gray-800 hover:bg-primary/5 transition-colors group"
        aria-pressed={item.hasUserSupport}
        aria-label="Destekle"
      >
        <ChevronUp className={cn(
          'w-5 h-5 transition-colors',
          item.hasUserSupport ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
        )} />
        <span className={cn(
          'text-sm font-bold',
          item.hasUserSupport ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
        )}>
          {item.supportCount}
        </span>
      </button>

      {/* Content */}
      <div
        className="flex-1 px-4 py-3 cursor-pointer min-w-0"
        onClick={() => onClick(item.id)}
      >
        <div className="flex items-center gap-2 mb-1">
          {item.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          <h3 className="text-sm font-medium text-foreground line-clamp-1">{item.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {cat && (
            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border', cat.class)}>
              {cat.label}
            </span>
          )}
          {st && (
            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium', st.class)}>
              {st.label}
            </span>
          )}
          {item.commentCount > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {item.commentCount}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {item.createdByName} · {formatRelativeTime(item.createdAt)}
        </div>
      </div>
    </div>
  )
}
