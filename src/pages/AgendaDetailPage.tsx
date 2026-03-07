import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { CommentSection } from '@/components/agenda/CommentSection'
import { AgendaForm } from '@/components/agenda/AgendaForm'
import { agendaStatusConfig, agendaCategoryConfig, getAgendaNextStatuses } from '@/lib/agenda-helpers'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AgendaItemDetail, AgendaCommentItem, AgendaCommentsResult, AgendaCategory } from '@/types'
import {
  ArrowLeft, ChevronUp, Pin, PinOff, Pencil, Trash2,
} from 'lucide-react'

export function AgendaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { activeMembership, session } = useAuth()
  const orgId = activeMembership?.organizationId
  const userId = session?.user?.id ?? ''
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const navigate = useNavigate()

  const [detail, setDetail] = useState<AgendaItemDetail | null>(null)
  const [comments, setComments] = useState<AgendaCommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [closeReasonOpen, setCloseReasonOpen] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [pendingStatus, setPendingStatus] = useState('')

  const basePath = isAdmin ? '/admin/agenda' : '/agenda'

  const loadDetail = useCallback(async () => {
    if (!orgId || !id) return
    setLoading(true); setError('')
    try {
      const [detailRes, commentsRes] = await Promise.all([
        api.get<AgendaItemDetail>(`/organizations/${orgId}/agenda-items/${id}`),
        api.get<AgendaCommentsResult>(`/organizations/${orgId}/agenda-items/${id}/comments?pageSize=100`),
      ])
      setDetail(detailRes.data)
      setComments(commentsRes.data.items)
    } catch {
      setError('Gundem maddesi yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, id])

  useEffect(() => { loadDetail() }, [loadDetail])

  async function handleSupport() {
    if (!orgId || !id || !detail) return
    setDetail(prev => prev ? {
      ...prev,
      hasUserSupport: !prev.hasUserSupport,
      supportCount: prev.hasUserSupport ? prev.supportCount - 1 : prev.supportCount + 1,
    } : prev)
    try {
      await api.post(`/organizations/${orgId}/agenda-items/${id}/support`)
    } catch {
      setDetail(prev => prev ? {
        ...prev,
        hasUserSupport: !prev.hasUserSupport,
        supportCount: prev.hasUserSupport ? prev.supportCount - 1 : prev.supportCount + 1,
      } : prev)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (newStatus === 'kapali') {
      setPendingStatus(newStatus)
      setCloseReasonOpen(true)
      return
    }
    if (!orgId || !id) return
    try {
      await api.put(`/organizations/${orgId}/agenda-items/${id}/status`, { status: newStatus })
      loadDetail()
    } catch { setError('Durum guncellenemedi.') }
  }

  async function handleCloseSubmit() {
    if (!orgId || !id) return
    try {
      await api.put(`/organizations/${orgId}/agenda-items/${id}/status`, { status: pendingStatus, closeReason: closeReason.trim() || null })
      setCloseReasonOpen(false)
      setCloseReason('')
      loadDetail()
    } catch { setError('Kapatma isleminde hata olustu.') }
  }

  async function handlePin() {
    if (!orgId || !id) return
    try {
      await api.put(`/organizations/${orgId}/agenda-items/${id}/pin`)
      loadDetail()
    } catch { setError('Sabitleme isleminde hata olustu.') }
  }

  async function handleDelete() {
    if (!orgId || !id) return
    if (!confirm('Bu gundem maddesini silmek istediginize emin misiniz?')) return
    try {
      await api.delete(`/organizations/${orgId}/agenda-items/${id}`)
      navigate(basePath)
    } catch { setError('Silme isleminde hata olustu.') }
  }

  async function handleEdit(data: { title: string; description: string; category: AgendaCategory }) {
    if (!orgId || !id) return
    await api.put(`/organizations/${orgId}/agenda-items/${id}`, data)
    loadDetail()
  }

  async function handleAddComment(content: string) {
    if (!orgId || !id) return
    try {
      await api.post(`/organizations/${orgId}/agenda-items/${id}/comments`, { content })
      const r = await api.get<AgendaCommentsResult>(`/organizations/${orgId}/agenda-items/${id}/comments?pageSize=100`)
      setComments(r.data.items)
    } catch { setError('Yorum gonderilemedi.') }
  }

  async function handleDeleteComment(commentId: string) {
    if (!orgId || !id) return
    if (!confirm('Yorumu silmek istediginize emin misiniz?')) return
    try {
      await api.delete(`/organizations/${orgId}/agenda-items/${id}/comments/${commentId}`)
      const r = await api.get<AgendaCommentsResult>(`/organizations/${orgId}/agenda-items/${id}/comments?pageSize=100`)
      setComments(r.data.items)
    } catch { setError('Yorum silinemedi.') }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto py-8 text-center text-muted-foreground">Yukleniyor...</div>
      </AdminLayout>
    )
  }

  if (!detail) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto py-8 text-center">
          {error && <p className="text-red-600">{error}</p>}
          <button onClick={() => navigate(basePath)} className="text-sm text-primary mt-4">Listeye don</button>
        </div>
      </AdminLayout>
    )
  }

  const st = agendaStatusConfig[detail.status]
  const cat = agendaCategoryConfig[detail.category]
  const nextStatuses = getAgendaNextStatuses(detail.status)
  const isOwner = detail.createdBy === userId
  const canEdit = isOwner && detail.status === 'acik'

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(basePath)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Gundem Listesi
        </button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* Detail card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {detail.isPinned && <Pin className="w-4 h-4 text-amber-500 shrink-0" />}
                <h1 className="text-lg font-semibold text-foreground">{detail.title}</h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {cat && (
                  <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium border', cat.class)}>
                    {cat.label}
                  </span>
                )}
                {st && (
                  <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', st.class)}>
                    {st.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {detail.createdByName} · {formatDate(detail.createdAt)}
              </p>
            </div>

            {/* Support button */}
            <button
              onClick={handleSupport}
              className={cn(
                'flex flex-col items-center px-3 py-2 rounded-lg border transition-colors',
                detail.hasUserSupport
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary hover:text-primary'
              )}
              aria-pressed={detail.hasUserSupport}
            >
              <ChevronUp className="w-5 h-5" />
              <span className="text-sm font-bold">{detail.supportCount}</span>
            </button>
          </div>

          {detail.description && (
            <p className="text-sm text-foreground whitespace-pre-wrap mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {detail.description}
            </p>
          )}

          {detail.closeReason && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Kapatma Gerekce:</p>
              <p className="text-sm text-foreground">{detail.closeReason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* Admin actions */}
            {isAdmin && nextStatuses.length > 0 && (
              <select
                value=""
                onChange={e => { if (e.target.value) handleStatusChange(e.target.value) }}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="">Durumu Degistir</option>
                {nextStatuses.map(s => (
                  <option key={s} value={s}>{agendaStatusConfig[s as keyof typeof agendaStatusConfig]?.label ?? s}</option>
                ))}
              </select>
            )}
            {isAdmin && (
              <button
                onClick={handlePin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                {detail.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                {detail.isPinned ? 'Kaldir' : 'Sabitle'}
              </button>
            )}
            {/* Owner actions */}
            {canEdit && (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Duzenle
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Sil
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentSection
          comments={comments}
          currentUserId={userId}
          isAdmin={isAdmin}
          onAdd={handleAddComment}
          onDelete={handleDeleteComment}
        />
      </div>

      {/* Close reason modal */}
      {closeReasonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Kapatma Gerekce</h3>
            <textarea
              value={closeReason}
              onChange={e => setCloseReason(e.target.value)}
              rows={3}
              placeholder="Neden kapatiliyor? (opsiyonel)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCloseReasonOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Iptal
              </button>
              <button onClick={handleCloseSubmit} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      <AgendaForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        initialData={detail}
      />
    </AdminLayout>
  )
}
