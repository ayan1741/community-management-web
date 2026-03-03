import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, AlertCircle, XCircle, Receipt } from 'lucide-react'
import type { UnitDueResidentItem, PaymentHistoryItem } from '@/types'

const statusConfig: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
  pending:   { label: 'Ödenmedi', icon: <Clock className="w-4 h-4" />,         class: 'bg-warning/10 text-warning border-warning/30' },
  partial:   { label: 'Kısmi',    icon: <AlertCircle className="w-4 h-4" />,   class: 'bg-primary/10 text-primary border-primary/30' },
  paid:      { label: 'Ödendi',   icon: <CheckCircle className="w-4 h-4" />,   class: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'İptal',    icon: <XCircle className="w-4 h-4" />,       class: 'bg-muted text-muted-foreground border-border' },
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Nakit', bank_transfer: 'Havale', other: 'Diğer',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function MyDuesPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [dues, setDues] = useState<UnitDueResidentItem[]>([])
  const [duesLoading, setDuesLoading] = useState(true)

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [receiptPayment, setReceiptPayment] = useState<PaymentHistoryItem | null>(null)
  const [activeTab, setActiveTab] = useState<'dues' | 'history'>('dues')

  useEffect(() => {
    if (!orgId) return
    loadDues()
    loadPayments()
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    loadPayments()
  }, [page, orgId])

  async function loadDues() {
    if (!orgId) return
    setDuesLoading(true)
    try {
      const r = await api.get<UnitDueResidentItem[]>(`/organizations/${orgId}/my-dues`)
      setDues(r.data)
    } catch {
      // hata
    } finally {
      setDuesLoading(false)
    }
  }

  async function loadPayments() {
    if (!orgId) return
    setPaymentsLoading(true)
    try {
      const r = await api.get<{ items: PaymentHistoryItem[]; totalCount: number }>(
        `/organizations/${orgId}/my-payments?page=${page}&pageSize=${pageSize}`)
      setPayments(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      // hata
    } finally {
      setPaymentsLoading(false)
    }
  }

  const pendingDues = dues.filter(d => d.status === 'pending' || d.status === 'partial')
  const hasPendingOverdue = pendingDues.some(d => d.isOverdue)
  const totalRemaining = pendingDues.reduce((acc, d) => acc + (d.amount - d.paidAmount), 0)
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Aidat & Borç Takibi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Mevcut borçlarınız ve ödeme geçmişiniz</p>
        </div>

        {/* Borç Özet Kartı */}
        {!duesLoading && (
          <div className={`rounded-xl border p-5 mb-6 ${
            hasPendingOverdue
              ? 'bg-destructive/10 border-destructive/30'
              : pendingDues.length > 0
                ? 'bg-warning/10 border-warning/30'
                : 'bg-success/10 border-success/30'
          }`}>
            {pendingDues.length === 0 ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <p className="font-semibold text-success">Aidatınız güncel</p>
                  <p className="text-sm text-success">Bekleyen borcunuz bulunmuyor.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                {hasPendingOverdue ? (
                  <AlertCircle className="w-8 h-8 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-8 h-8 text-warning shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${hasPendingOverdue ? 'text-destructive' : 'text-warning'}`}>
                    {hasPendingOverdue ? 'Gecikmiş borcunuz var' : 'Bekleyen borcunuz var'}
                  </p>
                  <p className={`text-sm ${hasPendingOverdue ? 'text-destructive' : 'text-warning'}`}>
                    Toplam {totalRemaining.toLocaleString('tr-TR')} ₺ ödeme bekliyor
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Seçimi */}
        <div className="flex gap-1 mb-5 border-b border-border">
          {(['dues', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'dues' ? 'Mevcut Borçlar' : 'Ödeme Geçmişi'}
            </button>
          ))}
        </div>

        {/* Mevcut Borçlar */}
        {activeTab === 'dues' && (
          <div>
            {duesLoading ? (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : dues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Gösterilecek tahakkuk kaydı yok.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dues.map(due => {
                  const sc = statusConfig[due.status]
                  const remaining = due.amount - due.paidAmount
                  return (
                    <div key={due.id} className={`bg-card rounded-xl border p-4 ${due.isOverdue && due.status !== 'paid' ? 'border-destructive/30' : 'border-border'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">{due.dueTypeName}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sc?.class}`}>
                              {sc?.icon}{sc?.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{due.periodName} · Son Ödeme: {formatDate(due.dueDate)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-foreground">{due.amount.toLocaleString('tr-TR')} ₺</p>
                          {due.paidAmount > 0 && (
                            <p className="text-xs text-success">{due.paidAmount.toLocaleString('tr-TR')} ₺ ödendi</p>
                          )}
                        </div>
                      </div>

                      {/* Gecikme zammı bilgisi */}
                      {due.isOverdue && due.status !== 'paid' && due.status !== 'cancelled' && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-destructive">
                            ⚠️ Ödeme süresi geçti.
                            {due.calculatedLateFee != null && due.calculatedLateFee > 0 && (
                              <> Tahmini gecikme zammı: <span className="font-semibold">{due.calculatedLateFee.toLocaleString('tr-TR')} ₺</span></>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Kısmi ödeme progress */}
                      {due.status === 'partial' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Kalan: {remaining.toLocaleString('tr-TR')} ₺</span>
                            <span>%{Math.round((due.paidAmount / due.amount) * 100)} tamamlandı</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(due.paidAmount / due.amount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Ödeme Geçmişi */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Geçmişi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="py-10 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : payments.length === 0 ? (
                <div className="py-10 text-center">
                  <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Henüz ödeme kaydı yok.</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarih</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Dönem / Tip</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Yöntem</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Tutar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Makbuz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/70 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">{formatDateTime(p.paidAt)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{p.periodName}</p>
                            <p className="text-xs text-muted-foreground">{p.dueTypeName} · {p.blockName} / {p.unitNumber}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{paymentMethodLabels[p.paymentMethod] ?? p.paymentMethod}</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            {p.amount.toLocaleString('tr-TR')} ₺
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setReceiptPayment(p)}
                              className="text-xs text-primary hover:text-primary font-medium"
                            >
                              Makbuz
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{totalCount} kayıt · Sayfa {page}/{totalPages}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-2.5 py-1 text-xs text-muted-foreground border border-border rounded hover:bg-muted disabled:opacity-40"
                        >
                          Önceki
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-2.5 py-1 text-xs text-muted-foreground border border-border rounded hover:bg-muted disabled:opacity-40"
                        >
                          Sonraki
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Makbuz Modal */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Ödeme Makbuzu</h2>
              <p className="text-xs text-muted-foreground">#{receiptPayment.receiptNumber}</p>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daire</span>
                <span className="font-medium text-foreground">{receiptPayment.blockName} / {receiptPayment.unitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dönem</span>
                <span className="font-medium text-foreground">{receiptPayment.periodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aidat Tipi</span>
                <span className="font-medium text-foreground">{receiptPayment.dueTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödeme Tarihi</span>
                <span className="font-medium text-foreground">{formatDateTime(receiptPayment.paidAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yöntem</span>
                <span className="font-medium text-foreground">{paymentMethodLabels[receiptPayment.paymentMethod] ?? receiptPayment.paymentMethod}</span>
              </div>
              {receiptPayment.collectedByName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kaydeden</span>
                  <span className="font-medium text-foreground">{receiptPayment.collectedByName}</span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="text-foreground font-medium">Tutar</span>
                <span className="text-xl font-bold text-foreground">{receiptPayment.amount.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <button
              onClick={() => setReceiptPayment(null)}
              className="w-full mt-5 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
