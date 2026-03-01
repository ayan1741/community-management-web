import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import type {
  DuesPeriodDetailResult, UnitDueListItem, DueType, AccrualPreview,
} from '@/types'

const statusConfig: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
  pending:   { label: 'Ödenmedi', icon: <Clock className="w-3.5 h-3.5" />,        class: 'bg-amber-50 text-amber-700' },
  partial:   { label: 'Kısmi',    icon: <AlertCircle className="w-3.5 h-3.5" />,  class: 'bg-blue-50 text-blue-700' },
  paid:      { label: 'Ödendi',   icon: <CheckCircle className="w-3.5 h-3.5" />,  class: 'bg-green-50 text-green-700' },
  cancelled: { label: 'İptal',    icon: <XCircle className="w-3.5 h-3.5" />,      class: 'bg-slate-100 text-slate-500' },
}

const periodStatusLabels: Record<string, { label: string; class: string }> = {
  draft:      { label: 'Taslak',    class: 'bg-slate-100 text-slate-600' },
  processing: { label: 'İşleniyor', class: 'bg-blue-50 text-blue-700 animate-pulse' },
  active:     { label: 'Aktif',     class: 'bg-green-50 text-green-700' },
  failed:     { label: 'Başarısız', class: 'bg-red-50 text-red-700' },
  closed:     { label: 'Kapalı',    class: 'bg-slate-100 text-slate-500' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function DuesPeriodDetailPage() {
  const { periodId } = useParams<{ periodId: string }>()
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()

  const [detail, setDetail] = useState<DuesPeriodDetailResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const isAdmin = activeMembership?.role === 'admin'
  const isAdminOrBoard = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'

  // ── Toplu Tahakkuk ─────────────────────────────────────────────────────────
  const [showAccrualModal, setShowAccrualModal] = useState(false)
  const [dueTypes, setDueTypes] = useState<DueType[]>([])
  const [selectedDueTypeIds, setSelectedDueTypeIds] = useState<string[]>([])
  const [includeEmpty, setIncludeEmpty] = useState(false)
  const [accrualPreview, setAccrualPreview] = useState<AccrualPreview | null>(null)
  const [accrualStep, setAccrualStep] = useState<'select' | 'preview' | 'confirmed'>('select')
  const [accrualLoading, setAccrualLoading] = useState(false)
  const [accrualError, setAccrualError] = useState('')

  // ── Ödeme Kaydet ───────────────────────────────────────────────────────────
  const [payingDue, setPayingDue] = useState<UnitDueListItem | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState('cash')
  const [payNote, setPayNote] = useState('')
  const [payConfirmed, setPayConfirmed] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [payWarning, setPayWarning] = useState('')


  // ── Tahakkuk İptal ─────────────────────────────────────────────────────────
  const [cancellingDue, setCancellingDue] = useState<UnitDueListItem | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  // ── Dönem Kapat ────────────────────────────────────────────────────────────
  const [closingPeriod, setClosingPeriod] = useState(false)
  const [closeLoading, setCloseLoading] = useState(false)

  const loadDetail = useCallback(async () => {
    if (!orgId || !periodId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (statusFilter) params.set('status', statusFilter)
      const r = await api.get<DuesPeriodDetailResult>(
        `/organizations/${orgId}/dues-periods/${periodId}?${params}`)
      setDetail(r.data)
    } catch {
      setError('Dönem detayı yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [orgId, periodId, page, statusFilter])

  useEffect(() => { loadDetail() }, [loadDetail])

  // Processing dönemde polling
  useEffect(() => {
    if (detail?.period.status !== 'processing') return
    const t = setInterval(loadDetail, 3000)
    return () => clearInterval(t)
  }, [detail?.period.status, loadDetail])

  async function loadDueTypes() {
    if (!orgId) return
    const r = await api.get<DueType[]>(`/organizations/${orgId}/due-types?isActive=true`)
    setDueTypes(r.data)
    setSelectedDueTypeIds(r.data.map(d => d.id))
  }

  function openAccrualModal() {
    setAccrualStep('select')
    setAccrualPreview(null)
    setAccrualError('')
    setIncludeEmpty(false)
    setShowAccrualModal(true)
    loadDueTypes()
  }

  async function previewAccrual() {
    if (selectedDueTypeIds.length === 0) { setAccrualError('En az bir tip seçin'); return }
    if (!orgId || !periodId) return
    setAccrualLoading(true)
    setAccrualError('')
    try {
      const r = await api.post<AccrualPreview>(
        `/organizations/${orgId}/dues-periods/${periodId}/accrue`,
        { dueTypeIds: selectedDueTypeIds, includeEmptyUnits: includeEmpty, confirmed: false }
      )
      setAccrualPreview(r.data)
      setAccrualStep('preview')
    } catch (err: any) {
      setAccrualError(err.response?.data?.error ?? 'Önizleme alınamadı')
    } finally {
      setAccrualLoading(false)
    }
  }

  async function confirmAccrual() {
    if (!orgId || !periodId) return
    setAccrualLoading(true)
    setAccrualError('')
    try {
      await api.post(
        `/organizations/${orgId}/dues-periods/${periodId}/accrue`,
        { dueTypeIds: selectedDueTypeIds, includeEmptyUnits: includeEmpty, confirmed: true }
      )
      setAccrualStep('confirmed')
      setShowAccrualModal(false)
      await loadDetail()
    } catch (err: any) {
      setAccrualError(err.response?.data?.error ?? 'Tahakkuk oluşturulamadı')
    } finally {
      setAccrualLoading(false)
    }
  }

  function openPayment(due: UnitDueListItem) {
    setPayingDue(due)
    setPayAmount(String(due.remainingAmount))
    setPayDate(new Date().toISOString().slice(0, 10))
    setPayMethod('cash')
    setPayNote('')
    setPayConfirmed(false)
    setPayError('')
    setPayWarning('')
  }

  async function submitPayment() {
    if (!payingDue || !orgId) return
    const amt = parseFloat(payAmount)
    if (isNaN(amt) || amt <= 0) { setPayError('Geçerli bir tutar girin'); return }

    if (!payConfirmed && amt > payingDue.remainingAmount) {
      setPayWarning(`Girilen tutar kalan tutarı (${payingDue.remainingAmount.toLocaleString('tr-TR')} ₺) aşıyor. Devam etmek istiyor musunuz?`)
      setPayConfirmed(true)
      return
    }

    setPayLoading(true)
    setPayError('')
    try {
      await api.post(`/organizations/${orgId}/unit-dues/${payingDue.id}/payments`, {
        amount: amt,
        paidAt: new Date(payDate).toISOString(),
        paymentMethod: payMethod,
        note: payNote.trim() || null,
        confirmed: payConfirmed,
      })
      setPayingDue(null)
      await loadDetail()
    } catch (err: any) {
      setPayError(err.response?.data?.error ?? 'Ödeme kaydedilemedi')
      setPayConfirmed(false)
      setPayWarning('')
    } finally {
      setPayLoading(false)
    }
  }

  async function cancelDue() {
    if (!cancellingDue || !orgId || !periodId) return
    setCancelLoading(true)
    try {
      const params = cancelConfirm ? '?confirm=true' : ''
      await api.delete(
        `/organizations/${orgId}/dues-periods/${periodId}/unit-dues/${cancellingDue.id}${params}`)
      setCancellingDue(null)
      setCancelConfirm(false)
      await loadDetail()
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'İptal başarısız'
      if (err.response?.status === 409) {
        setCancelConfirm(true)
        // 409 → partial payment var, force confirm gerekli
      } else {
        setError(msg)
        setCancellingDue(null)
        setCancelConfirm(false)
      }
    } finally {
      setCancelLoading(false)
    }
  }

  async function closePeriod() {
    if (!orgId || !periodId) return
    setCloseLoading(true)
    try {
      await api.post(`/organizations/${orgId}/dues-periods/${periodId}/close`)
      setClosingPeriod(false)
      await loadDetail()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Kapatma başarısız')
      setClosingPeriod(false)
    } finally {
      setCloseLoading(false)
    }
  }

  const period = detail?.period
  const items = detail?.items ?? []
  const totalCount = detail?.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const pstatus = period ? (periodStatusLabels[period.status] ?? { label: period.status, class: 'bg-slate-100 text-slate-600' }) : null

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Geri */}
        <button
          onClick={() => navigate('/admin/dues/periods')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dönemlere Dön
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        {loading && !detail ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Yükleniyor...</p>
          </div>
        ) : period ? (
          <>
            {/* Dönem Başlığı */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold text-slate-900">{period.name}</h1>
                  {pstatus && (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${pstatus.class}`}>
                      {pstatus.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  Başlangıç: {formatDate(period.startDate)} · Son Ödeme: {formatDate(period.dueDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (period.status === 'draft' || period.status === 'failed') && (
                  <Button onClick={openAccrualModal}>Tahakkuk Oluştur</Button>
                )}
                {isAdmin && period.status === 'active' && (
                  <Button variant="secondary" onClick={() => setClosingPeriod(true)}>Dönemi Kapat</Button>
                )}
              </div>
            </div>

            {/* Processing uyarısı */}
            {period.status === 'processing' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                Tahakkuklar oluşturuluyor, lütfen bekleyin... Sayfa otomatik yenilenecek.
              </div>
            )}

            {/* Tahakkuk Tablosu */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Tahakkuk Listesi {totalCount > 0 && <span className="ml-1 text-slate-400 font-normal text-sm">({totalCount} kayıt)</span>}</CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tümü</option>
                    <option value="pending">Ödenmedi</option>
                    <option value="partial">Kısmi</option>
                    <option value="paid">Ödendi</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {items.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      {period.status === 'draft' ? 'Henüz tahakkuk oluşturulmadı.' : 'Kayıt bulunamadı.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Daire</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Sakin</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Aidat Tipi</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Tutar</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Ödenen</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Kalan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => {
                            const sc = statusConfig[item.status]
                            const canPay = isAdminOrBoard && (item.status === 'pending' || item.status === 'partial')
                            const canCancel = isAdmin && item.status !== 'paid' && item.status !== 'cancelled'
                            return (
                              <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${item.isOverdue ? 'bg-red-50/20' : ''}`}>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-slate-900">
                                    {item.blockName !== 'Varsayılan' ? `${item.blockName} / ` : ''}{item.unitNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.residentName ?? <span className="text-slate-400 italic">Boş Daire</span>}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{item.dueTypeName}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                  {item.amount.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="px-4 py-3 text-right text-green-700">
                                  {item.paidAmount > 0 ? `${item.paidAmount.toLocaleString('tr-TR')} ₺` : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={item.isOverdue ? 'text-red-700 font-medium' : 'text-slate-700'}>
                                    {item.remainingAmount > 0 ? `${item.remainingAmount.toLocaleString('tr-TR')} ₺` : '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {sc && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.class}`}>
                                      {sc.icon}{sc.label}
                                      {item.isOverdue && item.status !== 'paid' && item.status !== 'cancelled' && (
                                        <span className="ml-1 text-red-600">·gecikmiş</span>
                                      )}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {canPay && (
                                      <Button variant="ghost" size="sm" onClick={() => openPayment(item)}>
                                        Ödeme Kaydet
                                      </Button>
                                    )}
                                    {canCancel && (
                                      <Button
                                        variant="ghost" size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => { setError(''); setCancelConfirm(false); setCancellingDue(item) }}
                                      >
                                        İptal
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Sayfalama */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">{totalCount} kayıt · Sayfa {page}/{totalPages}</p>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            Önceki
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Sonraki
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* ── Toplu Tahakkuk Modal ─────────────────────────────────────────────── */}
      {showAccrualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            {accrualStep === 'select' && (
              <>
                <h2 className="text-base font-semibold text-slate-900 mb-1">Toplu Tahakkuk Oluştur</h2>
                <p className="text-sm text-slate-500 mb-5">Hangi aidat tiplerini dahil etmek istiyorsunuz?</p>

                <div className="space-y-2 mb-5">
                  {dueTypes.map(dt => (
                    <label key={dt.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedDueTypeIds.includes(dt.id)}
                        onChange={e => setSelectedDueTypeIds(prev =>
                          e.target.checked ? [...prev, dt.id] : prev.filter(id => id !== dt.id)
                        )}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{dt.name}</p>
                        <p className="text-xs text-slate-500">{dt.defaultAmount.toLocaleString('tr-TR')} ₺ varsayılan</p>
                      </div>
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer mb-5">
                  <input
                    type="checkbox"
                    checked={includeEmpty}
                    onChange={e => setIncludeEmpty(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Boş dairelere de tahakkuk oluştur</p>
                    <p className="text-xs text-slate-500">Aktif sakini olmayan daireler dahil edilir</p>
                  </div>
                </label>

                {accrualError && <p className="text-sm text-red-600 mb-3">{accrualError}</p>}

                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => setShowAccrualModal(false)}>İptal</Button>
                  <Button onClick={previewAccrual} loading={accrualLoading}>Önizle</Button>
                </div>
              </>
            )}

            {accrualStep === 'preview' && accrualPreview && (
              <>
                <h2 className="text-base font-semibold text-slate-900 mb-1">Tahakkuk Önizlemesi</h2>
                <p className="text-sm text-slate-500 mb-5">Aşağıdaki tahakkuklar oluşturulacak. Onaylıyor musunuz?</p>

                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Toplam Daire</span>
                    <span className="font-medium">{accrualPreview.totalUnits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dahil Edilecek</span>
                    <span className="font-medium text-blue-700">{accrualPreview.includedUnits} daire</span>
                  </div>
                  {accrualPreview.unitsWithoutCategory > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600">⚠️ Kategorisiz daire</span>
                      <span className="font-medium text-amber-700">{accrualPreview.unitsWithoutCategory} (varsayılan tutar)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {accrualPreview.dueTypeBreakdowns.map(line => (
                    <div key={line.dueTypeId} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">{line.dueTypeName}</span>
                        <span className="text-sm font-semibold text-slate-900">{line.subtotal.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      {line.categoryLines.map((cl, i) => (
                        <div key={i} className="flex justify-between text-xs text-slate-500 pl-2">
                          <span>{cl.category ? (cl.category) : 'Kategorisiz'}: {cl.unitCount} daire × {cl.amount.toLocaleString('tr-TR')} ₺</span>
                          <span>{cl.subtotal.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-5">
                  <span className="text-sm font-semibold text-blue-900">Toplam Tahakkuk</span>
                  <span className="text-lg font-bold text-blue-900">{accrualPreview.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>

                {accrualError && <p className="text-sm text-red-600 mb-3">{accrualError}</p>}

                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => setAccrualStep('select')}>Geri</Button>
                  <Button onClick={confirmAccrual} loading={accrualLoading}>Onayla ve Oluştur</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Ödeme Kaydet Modal ───────────────────────────────────────────────── */}
      {payingDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Ödeme Kaydet</h2>
            <p className="text-sm text-slate-500 mb-4">
              {payingDue.blockName !== 'Varsayılan' ? `${payingDue.blockName} / ` : ''}{payingDue.unitNumber}
              {payingDue.residentName ? ` · ${payingDue.residentName}` : ''} — {payingDue.dueTypeName}
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Kalan borç: <span className="font-semibold text-slate-700">{payingDue.remainingAmount.toLocaleString('tr-TR')} ₺</span>
            </p>

            <div className="space-y-4">
              <Input label="Tutar (₺) *" type="number" value={payAmount}
                onChange={e => { setPayAmount(e.target.value); setPayWarning(''); setPayConfirmed(false) }} />

              <Input label="Ödeme Tarihi *" type="date" value={payDate}
                onChange={e => setPayDate(e.target.value)} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Yöntemi</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Nakit</option>
                  <option value="bank_transfer">Banka Havalesi</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <Input label="Not (opsiyonel)" placeholder="" value={payNote}
                onChange={e => setPayNote(e.target.value)} />

              {payWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  {payWarning} Onaylamak için tekrar "Kaydet"e tıklayın.
                </div>
              )}
              {payError && <p className="text-sm text-red-600">{payError}</p>}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setPayingDue(null)} disabled={payLoading}>İptal</Button>
              <Button onClick={submitPayment} loading={payLoading}>
                {payConfirmed ? 'Onayla ve Kaydet' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tahakkuk İptal Modal ─────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!cancellingDue}
        title="Tahakkuku İptal Et"
        message={
          cancelConfirm
            ? `Bu tahakkuka ödeme yapılmış. Devam ederseniz ödeme de iptal sayılacak. Emin misiniz?`
            : `"${cancellingDue?.dueTypeName}" tahakkukunu iptal etmek istiyor musunuz?`
        }
        confirmLabel={cancelConfirm ? 'Onayla ve İptal Et' : 'İptal Et'}
        loading={cancelLoading}
        onConfirm={cancelDue}
        onCancel={() => { setCancellingDue(null); setCancelConfirm(false) }}
      />

      {/* ── Dönem Kapat Modal ────────────────────────────────────────────────── */}
      <ConfirmModal
        open={closingPeriod}
        title="Dönemi Kapat"
        message="Dönemi kapatmak istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Dönemi Kapat"
        loading={closeLoading}
        onConfirm={closePeriod}
        onCancel={() => setClosingPeriod(false)}
      />
    </AppLayout>
  )
}
