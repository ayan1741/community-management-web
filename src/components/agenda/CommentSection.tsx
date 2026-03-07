import { useState } from 'react'
import { Trash2, Send } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'
import type { AgendaCommentItem } from '@/types'

interface CommentSectionProps {
  comments: AgendaCommentItem[]
  currentUserId: string
  isAdmin: boolean
  onAdd: (content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
}

export function CommentSection({ comments, currentUserId, isAdmin, onAdd, onDelete }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      await onAdd(content.trim())
      setContent('')
    } catch { /* handled by parent */ }
    finally { setSending(false) }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Yorumlar ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Henuz yorum yapilmamis.</p>
      ) : (
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-4">
          {comments.map(c => (
            <div key={c.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                    {c.userName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <span className="text-xs font-medium text-foreground">{c.userName}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                </div>
                {!c.isDeleted && (c.userId === currentUserId || isAdmin) && (
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-muted-foreground hover:text-red-600 transition-colors"
                    aria-label="Yorumu sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {c.isDeleted ? (
                <p className="text-sm text-muted-foreground italic">Bu yorum silindi.</p>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="Yorumunuzu yazin..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="self-end px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          aria-label="Yorum gonder"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
