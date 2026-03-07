import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import type { MaintenanceRequestCommentItem } from '@/types'
import { MessageCircle, Camera, X, Loader2, Send } from 'lucide-react'

interface Props {
  orgId: string
  requestId: string
  comments: MaintenanceRequestCommentItem[]
  canComment: boolean
  onCommentAdded: () => void
}

export function MaintenanceComments({ orgId, requestId, comments, canComment, onCommentAdded }: Props) {
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement | undefined>(undefined)

  function handlePhotoSelect(file: File | null) {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    } else {
      setPhoto(null)
      setPhotoPreview(null)
    }
  }

  async function handleSend() {
    if (!content.trim()) return
    setSending(true); setError('')
    try {
      const fd = new FormData()
      fd.append('content', content.trim())
      if (photo) fd.append('photo', photo)
      await api.post(
        `/organizations/${orgId}/maintenance-requests/${requestId}/comments`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setContent('')
      handlePhotoSelect(null)
      onCommentAdded()
    } catch {
      setError('Yorum gonderilemedi.')
    } finally { setSending(false) }
  }

  const initials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div>
      {/* Comment List */}
      {comments.length === 0 ? (
        <div className="py-8 text-center">
          <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Henuz yorum yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0">
                {initials(c.createdByName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.createdByName}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{c.content}</p>
                {c.photoUrl && (
                  <img
                    src={c.photoUrl}
                    alt="Yorum fotografi"
                    className="mt-2 max-w-[200px] rounded-lg border border-border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(c.photoUrl!, '_blank')}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {canComment && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          {error && (
            <p className="text-xs text-red-600 mb-2">{error}</p>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Yorum yazin..."
                rows={2}
                disabled={sending}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
              />
              {photoPreview && (
                <div className="relative inline-block mt-1">
                  <img src={photoPreview} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => handlePhotoSelect(null)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-2 border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Fotograf ekle"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !content.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                title="Gonder"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <input
            ref={fileRef as React.RefObject<HTMLInputElement>}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handlePhotoSelect(f)
              e.target.value = ''
            }}
          />
        </div>
      )}
    </div>
  )
}
