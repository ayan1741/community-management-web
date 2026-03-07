import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { AgendaCard } from '@/components/agenda/AgendaCard'
import { AgendaForm } from '@/components/agenda/AgendaForm'
import { agendaStatusConfig, agendaCategoryConfig } from '@/lib/agenda-helpers'
import type {
  AgendaItemListItem, AgendaItemsListResult, AgendaStats,
  AgendaStatus, AgendaCategory,
} from '@/types'
import {
  ListTodo, Plus, Search, FileText, Eye, CheckCircle, XCircle,
} from 'lucide-react'

export function AgendaListPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const navigate = useNavigate()

  const [items, setItems] = useState<AgendaItemListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [stats, setStats] = useState<AgendaStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('support')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)

  const basePath = isAdmin ? '/admin/agenda' : '/agenda'

  const loadList = useCallback(async () => {
    if (!orgId) return
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20', sortBy, sortDir: 'desc' })
      if (filterStatus) params.set('status', filterStatus)
      if (filterCategory) params.set('category', filterCategory)
      const r = await api.get<AgendaItemsListResult>(
        `/organizations/${orgId}/agenda-items?${params}`)
      setItems(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Gundem maddeleri yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, page, filterStatus, filterCategory, sortBy])

  const loadStats = useCallback(async () => {
    if (!orgId || !isAdmin) { setStatsLoading(false); return }
    setStatsLoading(true)
    try {
      const r = await api.get<AgendaStats>(`/organizations/${orgId}/agenda-items/stats`)
      setStats(r.data)
    } catch { /* silent */ }
    finally { setStatsLoading(false) }
  }, [orgId, isAdmin])

  useEffect(() => { loadList() }, [loadList])
  useEffect(() => { loadStats() }, [loadStats])

  async function handleSupport(id: string) {
    if (!orgId) return
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            hasUserSupport: !item.hasUserSupport,
            supportCount: item.hasUserSupport ? item.supportCount - 1 : item.supportCount + 1,
          }
        : item
    ))
    try {
      await api.post(`/organizations/${orgId}/agenda-items/${id}/support`)
    } catch {
      // Revert on error
      setItems(prev => prev.map(item =>
        item.id === id
          ? {
              ...item,
              hasUserSupport: !item.hasUserSupport,
              supportCount: item.hasUserSupport ? item.supportCount - 1 : item.supportCount + 1,
            }
          : item
      ))
    }
  }

  async function handleFormSave(data: { title: string; description: string; category: AgendaCategory }) {
    if (!orgId) return
    await api.post(`/organizations/${orgId}/agenda-items`, data)
    loadList()
    loadStats()
  }

  const totalPages = Math.ceil(totalCount / 20)
  // Client-side filter on current page only (backend search not yet supported)
  const filtered = search
    ? items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={ListTodo}
          title="Gundem Havuzu"
          description="Topluluk onerilerini goruntuyle ve destekle"
          actions={
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Oneri
            </button>
          }
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* KPI Strip — Admin only */}
        {isAdmin && (
          statsLoading ? (
            <StatCardSkeleton />
          ) : stats && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="Acik" value={stats.totalOpen} />
              <StatCard icon={Eye} label="Degerlendiriliyor" value={stats.totalUnderReview} />
              <StatCard icon={CheckCircle} label="Kararlasti" value={stats.totalDecided} />
              <StatCard icon={XCircle} label="Kapali" value={stats.totalClosed} />
            </div>
          )
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Durumlar</option>
            {(Object.entries(agendaStatusConfig) as [AgendaStatus, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Kategoriler</option>
            {(Object.entries(agendaCategoryConfig) as [AgendaCategory, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="support">En Cok Destek</option>
            <option value="date">En Yeni</option>
            <option value="comments">En Cok Yorum</option>
          </select>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ara..."
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Card list */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Gundem Maddeleri</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{totalCount} kayit</p>
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="Henuz gundem maddesi yok"
              description="Topluluk icin ilk gundem onerisi olusturun"
              actionLabel="Yeni Oneri"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <>
              {filtered.map(item => (
                <AgendaCard
                  key={item.id}
                  item={item}
                  onSupport={handleSupport}
                  onClick={(id) => navigate(`${basePath}/${id}`)}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Onceki
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
            </>
          )}
        </div>
      </div>

      <AgendaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
      />
    </AdminLayout>
  )
}
