import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { meetingStatusConfig } from '@/lib/poll-helpers'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MeetingListItem, MeetingsListResult, MeetingStatus } from '@/types'
import { Calendar, Plus, ListTodo } from 'lucide-react'

export function MeetingListPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()

  const [items, setItems] = useState<MeetingListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Create form
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDate, setFormDate] = useState('')
  const [saving, setSaving] = useState(false)

  const loadList = useCallback(async () => {
    if (!orgId) return
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (filterStatus) params.set('status', filterStatus)
      const r = await api.get<MeetingsListResult>(`/organizations/${orgId}/meetings?${params}`)
      setItems(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Toplantilar yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, page, filterStatus])

  useEffect(() => { loadList() }, [loadList])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId || !formTitle.trim() || !formDate) return
    setSaving(true)
    try {
      const r = await api.post<{ id: string }>(`/organizations/${orgId}/meetings`, {
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        meetingDate: new Date(formDate + 'T10:00:00Z').toISOString(),
      })
      setFormOpen(false)
      setFormTitle(''); setFormDesc(''); setFormDate('')
      navigate(`/admin/meetings/${r.data.id}`)
    } catch { setError('Toplanti olusturulamadi.') }
    finally { setSaving(false) }
  }

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Calendar}
          title="Toplantilar"
          description="Toplantilari planla ve gundem maddelerini derle"
          actions={
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Toplanti
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
            {(Object.entries(meetingStatusConfig) as [MeetingStatus, { label: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <TableCard title="Toplanti Listesi" subtitle={`${totalCount} kayit`}>
          {loading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Henuz toplanti yok"
              description="Ilk toplantiyi olusturmak icin butona tiklayin"
              actionLabel="Yeni Toplanti"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Toplanti</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Gundem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const mst = meetingStatusConfig[item.status]
                      return (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/admin/meetings/${item.id}`)}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{formatDate(item.meetingDate)}</td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', mst.class)}>{mst.label}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <ListTodo className="w-3 h-3" /> {item.agendaItemCount}
                            </span>
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

      {/* Create meeting modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yeni Toplanti</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Baslik *</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Toplanti adi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tarih *</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Aciklama</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" placeholder="Toplanti aciklamasi (opsiyonel)" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Iptal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {saving ? 'Olusturuluyor...' : 'Olustur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
