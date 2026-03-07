import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { decisionStatusConfig } from '@/lib/poll-helpers'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { DecisionListItem, DecisionsListResult, DecisionStatus } from '@/types'
import { Gavel, Plus, ListTodo, Vote } from 'lucide-react'

export function DecisionListPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [items, setItems] = useState<DecisionListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Create decision form
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const fromPoll = searchParams.get('fromPoll')

  useEffect(() => {
    if (fromPoll) setFormOpen(true)
  }, [fromPoll])

  const loadList = useCallback(async () => {
    if (!orgId) return
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (filterStatus) params.set('status', filterStatus)
      const r = await api.get<DecisionsListResult>(`/organizations/${orgId}/decisions?${params}`)
      setItems(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Kararlar yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, page, filterStatus])

  useEffect(() => { loadList() }, [loadList])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId || !formTitle.trim()) return
    setSaving(true)
    try {
      await api.post(`/organizations/${orgId}/decisions`, {
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        agendaItemId: null,
        pollId: fromPoll || null,
      })
      setFormOpen(false)
      setFormTitle(''); setFormDesc('')
      loadList()
    } catch { setError('Karar olusturulamadi.') }
    finally { setSaving(false) }
  }

  async function handleStatusChange(id: string, status: string) {
    if (!orgId) return
    try {
      await api.put(`/organizations/${orgId}/decisions/${id}/status`, { status })
      loadList()
    } catch { setError('Durum guncellenemedi.') }
  }

  const totalPages = Math.ceil(totalCount / 20)

  function getSourceIcon(item: DecisionListItem) {
    if (item.agendaItemTitle) return <ListTodo className="w-3 h-3 text-muted-foreground" />
    if (item.pollTitle) return <Vote className="w-3 h-3 text-muted-foreground" />
    return <Gavel className="w-3 h-3 text-muted-foreground" />
  }

  function getSourceLabel(item: DecisionListItem) {
    if (item.agendaItemTitle) return item.agendaItemTitle
    if (item.pollTitle) return item.pollTitle
    return 'Manuel'
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Gavel}
          title="Karar Arsivi"
          description="Alinan tum kararlari goruntuyle ve takip et"
          actions={
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Karar
            </button>
          }
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tum Durumlar</option>
            {(Object.entries(decisionStatusConfig) as [DecisionStatus, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <TableCard title="Kararlar" subtitle={`${totalCount} kayit`}>
          {loading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Gavel}
              title="Henuz karar yok"
              description="Ilk karari olusturmak icin butona tiklayin"
              actionLabel="Yeni Karar"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Karar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Kaynak</th>
                      <th className="px-4 py-3 w-32"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const dst = decisionStatusConfig[item.status]
                      return (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.decidedByName}</div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', dst.class)}>
                              {dst.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                            {formatDate(item.decidedAt)}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              {getSourceIcon(item)} {getSourceLabel(item)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value=""
                              onChange={e => { if (e.target.value) handleStatusChange(item.id, e.target.value) }}
                              className="rounded border border-border bg-background px-2 py-1 text-xs"
                            >
                              <option value="">Islem</option>
                              {(Object.entries(decisionStatusConfig) as [DecisionStatus, { label: string }][])
                                .filter(([k]) => k !== item.status)
                                .map(([k, v]) => (
                                  <option key={k} value={k}>{v.label}</option>
                                ))
                              }
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors">Onceki</button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors">Sonraki</button>
                </div>
              )}
            </>
          )}
        </TableCard>
      </div>

      {/* Create decision modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yeni Karar</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Karar Basligi *</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Karar basligi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Aciklama</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" placeholder="Karar detayi (opsiyonel)" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setFormOpen(false); navigate('/admin/decisions', { replace: true }) }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Iptal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {saving ? 'Kaydediliyor...' : 'Olustur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
