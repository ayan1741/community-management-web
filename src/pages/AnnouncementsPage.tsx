import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import type { AnnouncementsListResult, AnnouncementListItem } from '@/types'
import { Megaphone, Search } from 'lucide-react'

export function AnnouncementsPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [items, setItems] = useState<AnnouncementListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page), pageSize: '20',
      status: 'published',
    })
    if (filterCategory) params.set('category', filterCategory)
    api.get<AnnouncementsListResult>(`/organizations/${orgId}/announcements?${params}`)
      .then(r => {
        setItems(r.data.items)
        setTotalCount(r.data.totalCount)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orgId, page, filterCategory])

  const totalPages = Math.ceil(totalCount / 20)
  const filtered = search
    ? items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <AdminLayout>
      <PageHeader
        title="Duyurular"
        description="Sitenizle ilgili önemli bilgilendirmeler"
      />

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

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Henüz duyuru yok</p>
          <p className="text-sm text-muted-foreground mt-1">Yeni duyurular burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <AnnouncementCard
              key={item.id}
              item={item}
              basePath="/announcements"
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
    </AdminLayout>
  )
}
