import { useState } from 'react'
import { api } from '@/lib/api'
import { Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  orgId: string
  requestId: string
  existingRating: number | null
  existingComment: string | null
  canRate: boolean
  onRated: () => void
}

export function MaintenanceRating({ orgId, requestId, existingRating, existingComment, canRate, onRated }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Already rated — show readonly
  if (existingRating) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-500/5 p-4">
        <p className="text-sm font-medium text-foreground mb-2">Degerlendirmeniz</p>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              className={cn(
                'w-5 h-5',
                i <= existingRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          ))}
        </div>
        {existingComment && (
          <p className="text-sm text-muted-foreground mt-1">"{existingComment}"</p>
        )}
      </div>
    )
  }

  // Can't rate
  if (!canRate) return null

  async function handleSubmit() {
    if (rating === 0) { setError('Lutfen bir puan secin.'); return }
    setSaving(true); setError('')
    try {
      await api.post(`/organizations/${orgId}/maintenance-requests/${requestId}/rate`, {
        rating,
        comment: comment.trim() || null,
      })
      onRated()
    } catch {
      setError('Degerlendirme gonderilemedi.')
    } finally { setSaving(false) }
  }

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-500/5 p-4">
      <p className="text-sm font-medium text-foreground mb-1">
        Arizaniz cozuldu! Hizmeti degerlendirir misiniz?
      </p>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {/* Stars */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                'w-7 h-7 transition-colors cursor-pointer',
                i <= (hover || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
              )}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Yorum (opsiyonel)"
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-2"
      />

      <button
        onClick={handleSubmit}
        disabled={saving || rating === 0}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Gonderiliyor...' : 'Gonder'}
      </button>
    </div>
  )
}
