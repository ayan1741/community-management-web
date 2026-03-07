import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { pollStatusConfig, pollTypeLabels } from '@/lib/poll-helpers'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PollListItem, PollsListResult, PollStatus } from '@/types'
import { Vote, Plus, CheckCircle } from 'lucide-react'

export function PollListPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const navigate = useNavigate()

  const [items, setItems] = useState<PollListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const basePath = isAdmin ? '/admin/polls' : '/polls'

  const loadList = useCallback(async () => {
    if (!orgId) return
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (filterStatus) params.set('status', filterStatus)
      const r = await api.get<PollsListResult>(`/organizations/${orgId}/polls?${params}`)
      setItems(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Oylamalar yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, page, filterStatus])

  useEffect(() => { loadList() }, [loadList])

  const totalPages = Math.ceil(totalCount / 20)

  function getRemainingText(endsAt: string, status: string): string {
    if (status !== 'aktif') return formatDate(endsAt)
    const diff = new Date(endsAt).getTime() - Date.now()
    if (diff <= 0) return 'Suresi doldu'
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `${days} gun kaldi`
    const hours = Math.floor(diff / 3600000)
    return `${hours} saat kaldi`
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Vote}
          title="Oylamalar"
          description="Topluluk kararlarinda oy kullanin"
          actions={isAdmin ? (
            <button
              onClick={() => navigate(`${basePath}/new`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Oylama
            </button>
          ) : undefined}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Durumlar</option>
            {(Object.entries(pollStatusConfig) as [PollStatus, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <TableCard title="Oylama Listesi" subtitle={`${totalCount} kayit`}>
          {loading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Vote}
              title="Henuz oylama yok"
              description={isAdmin ? 'Ilk oylamayi olusturmak icin butona tiklayin' : 'Henuz aktif oylama bulunmuyor'}
              actionLabel={isAdmin ? 'Yeni Oylama' : undefined}
              onAction={isAdmin ? () => navigate(`${basePath}/new`) : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Baslik</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Tip</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Bitis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const st = pollStatusConfig[item.status]
                      const pct = item.totalMemberCount > 0
                        ? Math.round((item.totalVoteCount / item.totalMemberCount) * 100) : 0
                      return (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`${basePath}/${item.id}`)}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full', item.status === 'aktif' ? 'bg-emerald-500' : 'bg-gray-400')}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {item.totalVoteCount}/{item.totalMemberCount} (%{pct})
                              </span>
                              {item.hasUserVoted && (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                            {pollTypeLabels[item.pollType]}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', st.class)}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                            {getRemainingText(item.endsAt, item.status)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

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
    </AdminLayout>
  )
}
