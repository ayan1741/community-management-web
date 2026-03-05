import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { priorityLabels, priorityClasses, categoryLabels, categoryClasses } from '@/components/announcements/AnnouncementCard'
import { formatDateTime, formatFileSize, safeParse } from '@/lib/format'
import type { AnnouncementDetail, AttachmentInfo } from '@/types'
import { ArrowLeft, Pin, User, Calendar, Clock, Paperclip, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [detail, setDetail] = useState<AnnouncementDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orgId || !id) return
    setLoading(true)
    api.get<AnnouncementDetail>(`/organizations/${orgId}/announcements/${id}`)
      .then(r => setDetail(r.data))
      .catch(() => setError('Duyuru bulunamadı.'))
      .finally(() => setLoading(false))
  }, [orgId, id])

  // Mark as read when detail loads
  useEffect(() => {
    if (detail && !detail.isRead && orgId) {
      api.post(`/organizations/${orgId}/announcements/${detail.id}/mark-read`).catch(() => {})
    }
  }, [detail, orgId])

  const attachments = safeParse<AttachmentInfo[]>(detail?.attachmentUrls, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4 max-w-3xl">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-8 w-2/3 bg-muted rounded" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !detail) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">{error || 'Duyuru bulunamadı.'}</p>
          <button onClick={() => navigate('/announcements')} className="mt-3 text-sm text-primary hover:underline">
            Duyurulara Dön
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate('/announcements')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Duyurulara Dön
      </button>

      <div className="max-w-3xl">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', priorityClasses[detail.priority])}>
            {priorityLabels[detail.priority]}
          </span>
          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs', categoryClasses[detail.category])}>
            {categoryLabels[detail.category]}
          </span>
          {detail.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-500">
              <Pin className="w-3.5 h-3.5" /> Sabitlenmiş
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-4">{detail.title}</h1>

        {/* Meta */}
        <div className="space-y-1.5 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{detail.createdByName}</span>
          </div>
          {detail.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(detail.publishedAt)}</span>
            </div>
          )}
          {detail.expiresAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Son geçerlilik: {formatDateTime(detail.expiresAt)}</span>
            </div>
          )}
        </div>

        <hr className="border-border mb-6" />

        {/* Body */}
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground mb-6">
          {detail.body}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <>
            <hr className="border-border mb-4" />
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Paperclip className="w-4 h-4" />
                Ekler
              </h3>
              <div className="space-y-1">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(a.size)}</span>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      İndir
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
