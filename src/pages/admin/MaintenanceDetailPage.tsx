import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { MaintenanceTimeline } from '@/components/maintenance/MaintenanceTimeline'
import { MaintenanceComments } from '@/components/maintenance/MaintenanceComments'
import { MaintenanceCosts } from '@/components/maintenance/MaintenanceCosts'
import { MaintenanceRating } from '@/components/maintenance/MaintenanceRating'
import {
  statusConfig, priorityConfig, categoryConfig,
  locationTypeLabels, getNextStatuses, parsePhotoUrls,
} from '@/lib/maintenance-helpers'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MaintenanceRequestDetailResult, MaintenanceStatus } from '@/types'
import {
  ArrowLeft, AlertTriangle, RefreshCw, Clock, MapPin, User,
  Calendar, Camera, Loader2, Trash2, X,
} from 'lucide-react'

export function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeMembership, user } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'

  const [data, setData] = useState<MaintenanceRequestDetailResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Status update
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Assignee
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneePhone, setAssigneePhone] = useState('')
  const [assigneeNote, setAssigneeNote] = useState('')
  const [updatingAssignee, setUpdatingAssignee] = useState(false)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Photo lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const basePath = isAdmin ? '/admin/maintenance' : '/maintenance'

  const loadDetail = useCallback(async () => {
    if (!orgId || !id) return
    setLoading(true); setError('')
    try {
      const r = await api.get<MaintenanceRequestDetailResult>(
        `/organizations/${orgId}/maintenance-requests/${id}`)
      setData(r.data)
      // Pre-fill assignee fields
      const d = r.data.detail
      setAssigneeName(d.assigneeName ?? '')
      setAssigneePhone(d.assigneePhone ?? '')
      setAssigneeNote(d.assigneeNote ?? '')
    } catch {
      setError('Ariza bulunamadi.')
    } finally { setLoading(false) }
  }, [orgId, id])

  useEffect(() => { loadDetail() }, [loadDetail])

  async function handleStatusUpdate() {
    if (!orgId || !id || !newStatus) return
    setUpdatingStatus(true)
    try {
      await api.patch(`/organizations/${orgId}/maintenance-requests/${id}/status`, {
        status: newStatus,
        note: statusNote.trim() || null,
      })
      setNewStatus(''); setStatusNote('')
      loadDetail()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Durum guncellenemedi.')
    } finally { setUpdatingStatus(false) }
  }

  async function handleAssigneeUpdate() {
    if (!orgId || !id) return
    setUpdatingAssignee(true)
    try {
      await api.patch(`/organizations/${orgId}/maintenance-requests/${id}/assignee`, {
        name: assigneeName.trim() || null,
        phone: assigneePhone.trim() || null,
        note: assigneeNote.trim() || null,
      })
      loadDetail()
    } catch {
      setError('Atama guncellenemedi.')
    } finally { setUpdatingAssignee(false) }
  }

  async function handleDelete() {
    if (!orgId || !id) return
    setDeleting(true)
    try {
      await api.delete(`/organizations/${orgId}/maintenance-requests/${id}`)
      navigate(basePath)
    } catch {
      setError('Silinemedi.')
    } finally { setDeleting(false) }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4 max-w-3xl">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-8 w-2/3 bg-muted rounded" />
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </AdminLayout>
    )
  }

  if (error && !data) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">{error}</p>
          <button onClick={() => navigate(basePath)} className="mt-3 text-sm text-primary hover:underline">
            Listaye Don
          </button>
        </div>
      </AdminLayout>
    )
  }

  if (!data) return null

  const d = data.detail
  const photos = parsePhotoUrls(d.photoUrls)
  const st = statusConfig[d.status]
  const pr = priorityConfig[d.priority]
  const cat = categoryConfig[d.category]
  const nextStatuses = getNextStatuses(d.status)
  const isReporter = user?.id === d.reportedBy
  const isFinalStatus = d.status === 'closed' || d.status === 'cancelled'
  const canComment = !isFinalStatus && (isAdmin || isReporter)
  const canRate = d.status === 'resolved' && isReporter && !d.satisfactionRating

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(basePath)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ariza Listesine Don
        </button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', pr.class)}>
            {pr.label}
          </span>
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs text-muted-foreground border border-border">
            {cat.label}
          </span>
          <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', st.class)}>
            {st.label}
          </span>
          {d.isRecurring && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              <RefreshCw className="w-3 h-3" /> Tekrarlayan
            </span>
          )}
          {d.slaBreached && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" /> SLA Ihlali
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-4">{d.title}</h1>

        {/* Meta */}
        <div className="space-y-1.5 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{d.reportedByName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(d.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>
              {locationTypeLabels[d.locationType] ?? d.locationType}
              {d.unitLabel && ` — ${d.unitLabel}`}
              {d.locationNote && ` · ${d.locationNote}`}
            </span>
          </div>
          {d.slaDeadlineAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>SLA: {formatDateTime(d.slaDeadlineAt)}</span>
            </div>
          )}
        </div>

        <hr className="border-border mb-6" />

        {/* Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground mb-6">
          {d.description}
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Camera className="w-4 h-4" />
              Fotograflar ({photos.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxIdx(i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rating (resident, resolved status) */}
        {(canRate || d.satisfactionRating) && (
          <div className="mb-6">
            <MaintenanceRating
              orgId={orgId!}
              requestId={d.id}
              existingRating={d.satisfactionRating}
              existingComment={d.satisfactionComment}
              canRate={canRate}
              onRated={loadDetail}
            />
          </div>
        )}

        <hr className="border-border mb-6" />

        {/* Status Update (Admin) */}
        {isAdmin && nextStatuses.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Durum Guncelle</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm flex-1"
              >
                <option value="">Durum secin...</option>
                {nextStatuses.map(s => {
                  const cfg = statusConfig[s as MaintenanceStatus]
                  return <option key={s} value={s}>{cfg?.label ?? s}</option>
                })}
              </select>
              <input
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Not (opsiyonel)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm flex-1"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || !newStatus}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                Guncelle
              </button>
            </div>
          </div>
        )}

        {/* Assignee (Admin) */}
        {isAdmin && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Usta/Firma Atama</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                value={assigneeName}
                onChange={e => setAssigneeName(e.target.value)}
                placeholder="Ad/Unvan"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={assigneePhone}
                onChange={e => setAssigneePhone(e.target.value)}
                placeholder="Telefon"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={assigneeNote}
                onChange={e => setAssigneeNote(e.target.value)}
                placeholder="Not"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAssigneeUpdate}
                disabled={updatingAssignee}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {updatingAssignee && <Loader2 className="w-4 h-4 animate-spin" />}
                {d.assigneeName ? 'Guncelle' : 'Ata'}
              </button>
            </div>
            {d.assigneeName && !isAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Atanan: <strong>{d.assigneeName}</strong>
                {d.assigneePhone && ` · ${d.assigneePhone}`}
              </p>
            )}
          </div>
        )}

        {/* Assignee readonly (Resident) */}
        {!isAdmin && d.assigneeName && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Atanan Usta/Firma</h3>
            <p className="text-sm text-foreground">{d.assigneeName}</p>
            {d.assigneePhone && <p className="text-xs text-muted-foreground">{d.assigneePhone}</p>}
          </div>
        )}

        {/* Costs */}
        {(isAdmin || d.totalCost > 0) && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Maliyet</h3>
            <MaintenanceCosts
              orgId={orgId!}
              requestId={d.id}
              costs={data.costs ?? []}
              totalCost={d.totalCost}
              isAdmin={isAdmin}
              onCostAdded={loadDetail}
            />
          </div>
        )}

        {/* Timeline */}
        {data.timeline.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Durum Gecmisi</h3>
            <MaintenanceTimeline items={data.timeline} currentStatus={d.status} />
          </div>
        )}

        {/* Comments */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Yorumlar</h3>
          <MaintenanceComments
            orgId={orgId!}
            requestId={d.id}
            comments={data.comments}
            canComment={canComment}
            onCommentAdded={loadDetail}
          />
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex items-center gap-2 pt-2 border-t mb-6">
            <button
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {lightboxIdx + 1} / {photos.length}
          </div>
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white text-2xl"
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}
            >
              &lt;
            </button>
          )}
          {lightboxIdx < photos.length - 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white text-2xl"
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}
            >
              &gt;
            </button>
          )}
          <img
            src={photos[lightboxIdx]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(false)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ariza Bildirimini Sil</h3>
            <p className="text-sm text-muted-foreground mb-4">Bu ariza bildirimini silmek istediginize emin misiniz?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
                Iptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
