import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AnnouncementForm } from '@/components/announcements/AnnouncementForm'
import { ReadStats } from '@/components/announcements/ReadStats'
import { priorityLabels, priorityClasses, categoryLabels, categoryClasses } from '@/components/announcements/AnnouncementCard'
import { formatDateTime, formatFileSize, safeParse } from '@/lib/format'
import type { AnnouncementDetail, AttachmentInfo } from '@/types'
import { ArrowLeft, Pin, User, Calendar, Clock, Target, Paperclip, Download, Pencil, Trash2, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminAnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [detail, setDetail] = useState<AnnouncementDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadDetail = useCallback(async () => {
    if (!orgId || !id) return
    setLoading(true); setError('')
    try {
      const r = await api.get<AnnouncementDetail>(`/organizations/${orgId}/announcements/${id}`)
      setDetail(r.data)
    } catch {
      setError('Duyuru bulunamadı.')
    } finally { setLoading(false) }
  }, [orgId, id])

  useEffect(() => { loadDetail() }, [loadDetail])

  async function handlePin() {
    if (!orgId || !detail) return
    try {
      await api.patch(`/organizations/${orgId}/announcements/${detail.id}/pin`, { isPinned: !detail.isPinned })
      setDetail(prev => prev ? { ...prev, isPinned: !prev.isPinned } : prev)
    } catch { setError('Sabitleme işlemi başarısız oldu.') }
  }

  async function handleDelete() {
    if (!orgId || !detail) return
    setDeleting(true)
    try {
      await api.delete(`/organizations/${orgId}/announcements/${detail.id}`)
      navigate('/admin/announcements')
    } catch { setError('Duyuru silinemedi.') }
    finally { setDeleting(false) }
  }

  const attachments = safeParse<AttachmentInfo[]>(detail?.attachmentUrls, [])
  const targetIds = safeParse<string[]>(detail?.targetIds, [])

  function getTargetLabel(): string {
    if (!detail) return ''
    if (detail.targetType === 'all') return 'Tüm site'
    if (detail.targetType === 'block') return `${targetIds.length} blok`
    if (detail.targetType === 'role') return targetIds.map(r => {
      if (r === 'admin') return 'Admin'
      if (r === 'board_member') return 'Yönetim Kurulu'
      return 'Sakin'
    }).join(', ')
    return ''
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-8 w-2/3 bg-muted rounded" />
          <div className="h-4 w-1/3 bg-muted rounded" />
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
          <button onClick={() => navigate('/admin/announcements')} className="mt-3 text-sm text-primary hover:underline">
            Duyurulara Dön
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Back */}
      <button
        onClick={() => navigate('/admin/announcements')}
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
          {detail.status === 'draft' && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              Taslak
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
              <span>Yayınlanma: {formatDateTime(detail.publishedAt)}</span>
            </div>
          )}
          {detail.expiresAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Son geçerlilik: {formatDateTime(detail.expiresAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Hedef: {getTargetLabel()}</span>
          </div>
        </div>

        {/* Separator */}
        <hr className="border-border mb-6" />

        {/* Body */}
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground mb-6">
          {detail.body}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <>
            <hr className="border-border mb-4" />
            <div className="mb-6">
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
                      onClick={(e) => e.stopPropagation()}
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

        {/* Admin Actions */}
        <div className="flex items-center gap-2 mb-6 pt-2 border-t">
          <button
            onClick={handlePin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            {detail.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            {detail.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
          </button>
          {detail.status === 'draft' && (
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Düzenle
            </button>
          )}
          <button
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>

        {/* Read Stats */}
        {detail.status === 'published' && (
          <ReadStats announcementId={detail.id} targetMemberCount={detail.targetMemberCount} />
        )}
      </div>

      {/* Edit Form */}
      <AnnouncementForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadDetail}
        editData={detail}
      />

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(false)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Duyuruyu Sil</h3>
            <p className="text-sm text-muted-foreground mb-4">Bu duyuruyu silmek istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
