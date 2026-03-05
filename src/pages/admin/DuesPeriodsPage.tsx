import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { CalendarDays } from 'lucide-react'
import type { DuesPeriodListItem } from '@/types'

const statusLabels: Record<string, { label: string; class: string }> = {
  draft:      { label: 'Taslak',    class: 'bg-muted text-muted-foreground' },
  processing: { label: 'İşleniyor', class: 'bg-primary/10 text-primary' },
  active:     { label: 'Aktif',     class: 'bg-success/10 text-success' },
  failed:     { label: 'Başarısız', class: 'bg-destructive/10 text-destructive' },
  closed:     { label: 'Kapalı',    class: 'bg-muted text-muted-foreground' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function DuesPeriodsPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()
  const [periods, setPeriods] = useState<DuesPeriodListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deletingPeriod, setDeletingPeriod] = useState<DuesPeriodListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => { if (orgId) loadPeriods() }, [orgId])

  async function loadPeriods() {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<DuesPeriodListItem[]>(`/organizations/${orgId}/dues-periods`)
      setPeriods(r.data)
    } catch {
      setError('Dönemler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const monthName = today.toLocaleString('tr-TR', { month: 'long' })
    setFormName(`${monthName} ${year}`)
    setFormStartDate(`${year}-${month}-01`)
    const lastDay = new Date(year, today.getMonth() + 1, 0).getDate()
    setFormDueDate(`${year}-${month}-${lastDay}`)
    setFormError('')
    setShowForm(true)
  }

  async function savePeriod() {
    if (!formName.trim()) { setFormError('Dönem adı zorunlu'); return }
    if (!formStartDate) { setFormError('Başlangıç tarihi zorunlu'); return }
    if (!formDueDate) { setFormError('Son ödeme tarihi zorunlu'); return }
    if (formDueDate < formStartDate) { setFormError('Son ödeme tarihi başlangıç tarihinden önce olamaz'); return }
    if (!orgId) return
    setSaving(true)
    setFormError('')
    try {
      await api.post(`/organizations/${orgId}/dues-periods`, {
        name: formName.trim(),
        startDate: formStartDate,
        dueDate: formDueDate,
      })
      setShowForm(false)
      await loadPeriods()
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function deletePeriod() {
    if (!deletingPeriod || !orgId) return
    setDeleteLoading(true)
    try {
      await api.delete(`/organizations/${orgId}/dues-periods/${deletingPeriod.id}`)
      setDeletingPeriod(null)
      await loadPeriods()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Silme başarısız')
      setDeletingPeriod(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  function paymentRate(p: DuesPeriodListItem) {
    if (p.totalDues === 0) return 0
    return Math.round((p.paidCount / p.totalDues) * 100)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader icon={CalendarDays} title="Aidat Dönemleri" description="Aylık tahakkuk dönemlerini yönet" actions={<Button onClick={openAdd}>Yeni Dönem</Button>} />

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
        )}

        <TableCard title="Dönem Listesi">
            {loading ? (
              <TableSkeleton />
            ) : periods.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Henüz dönem yok" description="İlk dönemi oluşturun." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Dönem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Son Ödeme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tahsilat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map(p => {
                    const s = statusLabels[p.status] ?? { label: p.status, class: 'bg-muted text-muted-foreground' }
                    const rate = paymentRate(p)
                    return (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(p.startDate)}</p>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{formatDate(p.dueDate)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {p.totalDues > 0 ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-24">
                                  <div className="h-full bg-success rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs font-medium text-foreground">%{rate}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {p.collectedAmount.toLocaleString('tr-TR')} / {p.totalAmount.toLocaleString('tr-TR')} ₺
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Tahakkuk yok</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/dues/periods/${p.id}`)}>
                              Detay
                            </Button>
                            {p.status === 'draft' && p.totalDues === 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => { setError(''); setDeletingPeriod(p) }}
                              >
                                Sil
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
        </TableCard>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-base font-semibold text-foreground mb-5">Yeni Aidat Dönemi</h2>
            <div className="space-y-4">
              <Input label="Dönem Adı *" placeholder="örn. Mart 2026" value={formName}
                onChange={e => setFormName(e.target.value)} autoFocus />
              <Input label="Başlangıç Tarihi *" type="date" value={formStartDate}
                onChange={e => setFormStartDate(e.target.value)} />
              <Input label="Son Ödeme Tarihi *" type="date" value={formDueDate}
                onChange={e => setFormDueDate(e.target.value)} />
              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={saving}>İptal</Button>
              <Button onClick={savePeriod} loading={saving}>Oluştur</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deletingPeriod}
        title="Dönemi Sil"
        message={`"${deletingPeriod?.name}" dönemini silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        loading={deleteLoading}
        onConfirm={deletePeriod}
        onCancel={() => setDeletingPeriod(null)}
      />
    </AdminLayout>
  )
}
