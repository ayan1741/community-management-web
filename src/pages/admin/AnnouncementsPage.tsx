import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { AnnouncementForm } from '@/components/announcements/AnnouncementForm'
import type { AnnouncementsListResult, AnnouncementListItem, AnnouncementDetail } from '@/types'
import { Plus, Megaphone, Search } from 'lucide-react'

export function AdminAnnouncementsPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [items, setItems] = useState<AnnouncementListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<'published' | 'draft'>('published')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<AnnouncementDetail | null>(null)

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Draft count for tab badge
  const [draftCount, setDraftCount] = useState(0)

  const loadAnnouncements = useCallback(async () => {
    if (!orgId) return
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({
        page: String(page), pageSize: '20',
        status: tab,
      })
      if (filterCategory) params.set('category', filterCategory)
      if (filterPriority) params.set('priority', filterPriority)
      const r = await api.get<AnnouncementsListResult>(`/organizations/${orgId}/announcements?${params}`)
      setItems(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Duyurular yüklenirken hata oluştu.')
    } finally { setLoading(false) }
  }, [orgId, page, tab, filterCategory, filterPriority])

  const loadDraftCount = useCallback(async () => {
    if (!orgId) return
    try {
      const r = await api.get<AnnouncementsListResult>(`/organizations/${orgId}/announcements?status=draft&pageSize=1`)
      setDraftCount(r.data.totalCount)
    } catch {}
  }, [orgId])

  useEffect(() => { loadAnnouncements() }, [loadAnnouncements])
  useEffect(() => { loadDraftCount() }, [loadDraftCount])

  async function handlePin(id: string, isPinned: boolean) {
    if (!orgId) return
    try {
      await api.patch(`/organizations/${orgId}/announcements/${id}/pin`, { isPinned })
      loadAnnouncements()
    } catch { setError('Sabitleme işlemi başarısız oldu.') }
  }

  async function handleEdit(id: string) {
    if (!orgId) return
    try {
      const r = await api.get<AnnouncementDetail>(`/organizations/${orgId}/announcements/${id}`)
      setEditData(r.data)
      setFormOpen(true)
    } catch { setError('Duyuru yüklenemedi.') }
  }

  async function handleDelete() {
    if (!orgId || !deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/organizations/${orgId}/announcements/${deleteId}`)
      setDeleteId(null)
      loadAnnouncements()
      loadDraftCount()
    } catch { setError('Duyuru silinemedi.') }
    finally { setDeleting(false) }
  }

  function handleFormSaved() {
    loadAnnouncements()
    loadDraftCount()
    setEditData(null)
  }

  const totalPages = Math.ceil(totalCount / 20)

  // Filter search locally (title match)
  const filtered = search
    ? items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <AdminLayout>
      <PageHeader
        title="Duyurular"
        description="Site duyurularını oluşturun, yönetin ve takip edin"
        actions={
          <button
            onClick={() => { setEditData(null); setFormOpen(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Duyuru
          </button>
        }
      />

      {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-4">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Tüm Kategoriler</option>
          <option value="general">Genel</option>
          <option value="urgent">Acil</option>
          <option value="maintenance">Bakım</option>
          <option value="meeting">Toplantı</option>
          <option value="financial">Mali</option>
          <option value="other">Diğer</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => { setFilterPriority(e.target.value); setPage(1) }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Tüm Öncelikler</option>
          <option value="normal">Normal</option>
          <option value="important">Önemli</option>
          <option value="urgent">Acil</option>
        </select>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara..."
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        <button
          onClick={() => { setTab('published'); setPage(1) }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'published'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Yayınlananlar
        </button>
        <button
          onClick={() => { setTab('draft'); setPage(1) }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'draft'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Taslaklar{draftCount > 0 && ` (${draftCount})`}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {tab === 'draft' ? 'Henüz taslak duyuru yok' : 'Henüz duyuru yok'}
          </p>
          <button
            onClick={() => { setEditData(null); setFormOpen(true) }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            İlk duyurunuzu oluşturun
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <AnnouncementCard
              key={item.id}
              item={item}
              basePath="/admin/announcements"
              isAdmin
              onPin={handlePin}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Önceki
          </button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Form Dialog */}
      <AnnouncementForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null) }}
        onSaved={handleFormSaved}
        editData={editData}
      />

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Duyuruyu Sil</h3>
            <p className="text-sm text-muted-foreground mb-4">Bu duyuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
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
