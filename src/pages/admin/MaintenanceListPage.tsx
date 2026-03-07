import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { statusConfig, priorityConfig, categoryConfig } from '@/lib/maintenance-helpers'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type {
  MaintenanceRequestListItem,
  MaintenanceRequestListResult,
  MaintenanceRequestStats,
  MaintenanceStatus,
  MaintenanceCategory,
  MaintenancePriority,
} from '@/types'
import {
  Wrench, Plus, Search, AlertTriangle, RefreshCw,
  Camera, Clock, AlertCircle, CheckCircle,
} from 'lucide-react'

export function MaintenanceListPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const navigate = useNavigate()

  const [items, setItems] = useState<MaintenanceRequestListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Stats
  const [stats, setStats] = useState<MaintenanceRequestStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterLocationType, setFilterLocationType] = useState('')
  const [search, setSearch] = useState('')

  // Form
  const [formOpen, setFormOpen] = useState(false)

  const basePath = isAdmin ? '/admin/maintenance' : '/maintenance'

  const loadList = useCallback(async () => {
    if (!orgId) return
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (filterStatus) params.set('status', filterStatus)
      if (filterCategory) params.set('category', filterCategory)
      if (filterPriority) params.set('priority', filterPriority)
      if (filterLocationType) params.set('locationType', filterLocationType)
      const r = await api.get<MaintenanceRequestListResult>(
        `/organizations/${orgId}/maintenance-requests?${params}`)
      setItems(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Arizalar yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, page, filterStatus, filterCategory, filterPriority, filterLocationType])

  const loadStats = useCallback(async () => {
    if (!orgId || !isAdmin) { setStatsLoading(false); return }
    setStatsLoading(true)
    try {
      const r = await api.get<MaintenanceRequestStats>(
        `/organizations/${orgId}/maintenance-requests/stats`)
      setStats(r.data)
    } catch { /* silent */ }
    finally { setStatsLoading(false) }
  }, [orgId, isAdmin])

  useEffect(() => { loadList() }, [loadList])
  useEffect(() => { loadStats() }, [loadStats])

  function handleFormSaved() {
    loadList()
    loadStats()
  }

  const totalPages = Math.ceil(totalCount / 20)

  const filtered = search
    ? items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Wrench}
          title="Ariza Yonetimi"
          description="Ariza bildirimlerini takip edin ve yonetin"
          actions={
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Bildirim
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
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={Wrench}
                label="Toplam Ariza"
                value={stats.totalOpen + stats.totalResolved + stats.totalClosed}
              />
              <StatCard
                icon={AlertCircle}
                label="Acik Ariza"
                value={stats.totalOpen}
              />
              <StatCard
                icon={Clock}
                label="SLA Ihlali"
                value={stats.slaBreachedCount}
              />
              <StatCard
                icon={CheckCircle}
                label="Cozulen"
                value={stats.totalResolved + stats.totalClosed}
              />
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
            {(Object.entries(statusConfig) as [MaintenanceStatus, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Kategoriler</option>
            {(Object.entries(categoryConfig) as [MaintenanceCategory, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => { setFilterPriority(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Oncelikler</option>
            {(Object.entries(priorityConfig) as [MaintenancePriority, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterLocationType}
            onChange={e => { setFilterLocationType(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Konumlar</option>
            <option value="unit">Daire</option>
            <option value="common_area">Ortak Alan</option>
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

        {/* Table */}
        <TableCard title="Ariza Listesi" subtitle={`${totalCount} kayit`}>
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Henuz ariza bildirimi yok"
              description="Ilk bildirimi olusturmak icin butona tiklayin"
              actionLabel="Yeni Bildirim"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Baslik</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Oncelik</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Tarih</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const st = statusConfig[item.status]
                      const pr = priorityConfig[item.priority]
                      const cat = categoryConfig[item.category]
                      return (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`${basePath}/${item.id}`)}
                          className={cn(
                            'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer',
                            item.priority === 'acil' && 'border-l-2 border-l-red-400'
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {item.reportedByName}
                              {item.locationNote && ` · ${item.locationNote}`}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {item.slaBreached && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                  <AlertTriangle className="w-3 h-3" /> SLA
                                </span>
                              )}
                              {item.isRecurring && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                                  <RefreshCw className="w-3 h-3" /> Tekrar
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{cat.label}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', pr.class)}>
                              {pr.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', st.class)}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                            {formatRelativeTime(item.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            {item.photoCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                                <Camera className="w-3.5 h-3.5" />
                                {item.photoCount}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
        </TableCard>
      </div>

      {/* Create Form */}
      <MaintenanceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleFormSaved}
      />
    </AdminLayout>
  )
}
