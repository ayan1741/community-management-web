import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { meetingStatusConfig } from '@/lib/poll-helpers'
import { agendaStatusConfig, agendaCategoryConfig } from '@/lib/agenda-helpers'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MeetingDetailResult, AgendaItemListItem, AgendaItemsListResult } from '@/types'
import { ArrowLeft, Calendar, Plus, ChevronUp, Check } from 'lucide-react'

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()

  const [detail, setDetail] = useState<MeetingDetailResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Link agenda modal
  const [linkOpen, setLinkOpen] = useState(false)
  const [availableAgenda, setAvailableAgenda] = useState<AgendaItemListItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [linking, setLinking] = useState(false)

  const loadDetail = useCallback(async () => {
    if (!orgId || !id) return
    setLoading(true); setError('')
    try {
      const r = await api.get<MeetingDetailResult>(`/organizations/${orgId}/meetings/${id}`)
      setDetail(r.data)
    } catch {
      setError('Toplanti yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, id])

  useEffect(() => { loadDetail() }, [loadDetail])

  async function handleStatusChange(newStatus: string) {
    if (!orgId || !id) return
    try {
      await api.put(`/organizations/${orgId}/meetings/${id}/status`, { status: newStatus })
      loadDetail()
    } catch { setError('Durum guncellenemedi.') }
  }

  async function openLinkModal() {
    if (!orgId) return
    try {
      const r = await api.get<AgendaItemsListResult>(`/organizations/${orgId}/agenda-items?status=acik&pageSize=100`)
      // Exclude already linked items
      const linkedIds = new Set(detail?.agendaItems.map(a => a.id) ?? [])
      setAvailableAgenda(r.data.items.filter(a => !linkedIds.has(a.id)))
      setSelectedIds(new Set())
      setLinkOpen(true)
    } catch { setError('Gundem maddeleri yuklenemedi.') }
  }

  async function handleLink() {
    if (!orgId || !id || selectedIds.size === 0) return
    setLinking(true)
    try {
      await api.post(`/organizations/${orgId}/meetings/${id}/agenda-items`, {
        agendaItemIds: Array.from(selectedIds),
      })
      setLinkOpen(false)
      loadDetail()
    } catch { setError('Gundem maddeleri baglanamadi.') }
    finally { setLinking(false) }
  }

  function toggleSelect(agendaId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(agendaId)) next.delete(agendaId)
      else next.add(agendaId)
      return next
    })
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
          <button onClick={() => navigate('/admin/meetings')} className="text-sm text-primary mt-4">Listeye don</button>
        </div>
      </AdminLayout>
    )
  }

  const { meeting, agendaItems } = detail
  const mst = meetingStatusConfig[meeting.status]

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/admin/meetings')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Toplantilar
        </button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* Meeting info card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{meeting.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', mst.class)}>{mst.label}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(meeting.meetingDate)}
                </span>
              </div>
            </div>
          </div>
          {meeting.description && (
            <p className="text-sm text-foreground whitespace-pre-wrap mb-4">{meeting.description}</p>
          )}
          <div className="flex items-center gap-2">
            {meeting.status === 'planlanmis' && (
              <>
                <button onClick={() => handleStatusChange('tamamlandi')} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors">Tamamlandi</button>
                <button onClick={() => handleStatusChange('iptal')} className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Iptal</button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Olusturan: {meeting.createdByName} · {formatDate(meeting.createdAt)}
          </p>
        </div>

        {/* Linked agenda items */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Bagli Gundem Maddeleri</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{agendaItems.length} madde</p>
            </div>
            {meeting.status === 'planlanmis' && (
              <button
                onClick={openLinkModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Gundem Ekle
              </button>
            )}
          </div>

          {agendaItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Henuz bagli gundem maddesi yok.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {agendaItems.map((item, idx) => {
                const ast = agendaStatusConfig[item.status]
                const acat = agendaCategoryConfig[item.category]
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/admin/agenda/${item.id}`)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {acat && <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border', acat.class)}>{acat.label}</span>}
                        {ast && <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium', ast.class)}>{ast.label}</span>}
                      </div>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                      <ChevronUp className="w-3 h-3" /> {item.supportCount}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Link agenda modal */}
      {linkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gundem Maddesi Ekle</h2>
            {availableAgenda.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Eklenebilecek acik gundem maddesi yok.</p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 mb-4">
                {availableAgenda.map(a => (
                  <label
                    key={a.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedIds.has(a.id) ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center shrink-0',
                      selectedIds.has(a.id) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'
                    )}>
                      {selectedIds.has(a.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" className="sr-only" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{a.title}</p>
                      <span className="text-xs text-muted-foreground">{a.supportCount} destek</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setLinkOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Iptal</button>
              <button onClick={handleLink} disabled={linking || selectedIds.size === 0} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {linking ? 'Ekleniyor...' : `${selectedIds.size} Madde Ekle`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
