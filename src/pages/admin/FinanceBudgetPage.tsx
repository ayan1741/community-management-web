import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { CategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import {
  ChevronLeft, ChevronRight, Copy, CheckCircle, AlertTriangle, XCircle, Target,
} from 'lucide-react'
import { ReportBasisToggle, getStoredBasis, storeBasis } from '@/components/shared/report-basis-toggle'
import type { BudgetComparisonItem, BudgetVsActualResult, ReportBasis } from '@/types'

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function FinanceBudgetPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<BudgetVsActualResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportBasis, setReportBasis] = useState<ReportBasis>(() => orgId ? getStoredBasis(orgId) : 'period')

  function handleBasisChange(basis: ReportBasis) {
    setReportBasis(basis)
    if (orgId) storeBasis(orgId, basis)
  }

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)

  // Copy modal
  const [showCopy, setShowCopy] = useState(false)
  const [copyFromYear, setCopyFromYear] = useState(year)
  const [copyFromMonth, setCopyFromMonth] = useState(month > 1 ? month - 1 : 12)
  const [copying, setCopying] = useState(false)
  const [copyResult, setCopyResult] = useState<string | null>(null)

  function goMonth(delta: number) {
    let m = month + delta, y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setYear(y)
    setMonth(m)
  }

  useEffect(() => {
    if (orgId) loadData()
  }, [orgId, year, month, reportBasis])

  async function loadData() {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<BudgetVsActualResult>(`/organizations/${orgId}/finance/reports/budget-comparison?year=${year}&month=${month}&reportBasis=${reportBasis}`)
      setData(r.data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  async function saveBudget(categoryId: string) {
    if (!orgId) return
    const amount = parseFloat(editValue)
    if (isNaN(amount) || amount < 0) { setEditingId(null); return }
    setSavingBudget(true)
    try {
      await api.put(`/organizations/${orgId}/finance/budgets`, {
        categoryId, year, month, amount,
      })
      await loadData()
    } catch { /* silent */ }
    finally {
      setSavingBudget(false)
      setEditingId(null)
    }
  }

  async function copyBudget() {
    if (!orgId) return
    setCopying(true)
    setCopyResult(null)
    try {
      const r = await api.post<{ copiedCount: number }>(`/organizations/${orgId}/finance/budgets/copy`, {
        fromYear: copyFromYear,
        fromMonth: copyFromMonth,
        toYear: year,
        toMonth: month,
      })
      setCopyResult(`${r.data.copiedCount} bütçe kalemi kopyalandı.`)
      await loadData()
    } catch (err: any) {
      setCopyResult(err.response?.data?.error ?? 'Kopyalama başarısız')
    } finally {
      setCopying(false)
    }
  }

  function getStatusInfo(item: BudgetComparisonItem) {
    if (item.budgetAmount === 0) return null
    const pct = item.budgetAmount > 0 ? (item.actualAmount / item.budgetAmount) * 100 : 0
    if (pct >= 100) return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive', label: 'Aşıldı' }
    if (pct >= 80) return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning', label: 'Uyarı' }
    return { icon: CheckCircle, color: 'text-success', bg: 'bg-success', label: 'Normal' }
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={Target}
          title="Bütçe Planlama"
          description="Aylık harcama hedeflerini belirleyin ve takip edin"
          actions={
            <div className="flex items-center gap-3">
              <ReportBasisToggle value={reportBasis} onChange={handleBasisChange} />
              <Button variant="outline" onClick={() => { setShowCopy(true); setCopyResult(null) }}>
                <Copy className="w-4 h-4 mr-1" />
                Önceki Aydan Kopyala
              </Button>
            </div>
          }
        />

        {/* Month Navigator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => goMonth(-1)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {[-1, 0, 1].map(d => {
              let m = month + d, y = year
              if (m < 1) { m = 12; y-- }
              if (m > 12) { m = 1; y++ }
              const isCurrent = d === 0
              return (
                <button
                  key={d}
                  onClick={() => { if (!isCurrent) goMonth(d) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {MONTHS_TR[m - 1]} {y}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => goMonth(1)}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Budget Table */}
        <TableCard title="Bütçe Karşılaştırma" className="mb-4">
            {loading ? (
              <TableSkeleton />
            ) : !data || data.items.length === 0 ? (
              <EmptyState icon={Target} title="Henüz kategori tanımlanmamış" description="Önce kategorileri oluşturun." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Kategori</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-36">Bütçe (₺)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-32">Gerçekleşen</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-28">Fark</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(item => {
                      const status = getStatusInfo(item)
                      const pct = item.budgetAmount > 0 ? Math.min((item.actualAmount / item.budgetAmount) * 100, 100) : 0

                      return (
                        <tr key={item.categoryId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CategoryIcon name={item.categoryIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-foreground font-medium">{item.categoryName}</span>
                            </div>
                            {/* Progress bar */}
                            {item.budgetAmount > 0 && (
                              <div className="mt-1.5 w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full transition-all', status?.bg ?? 'bg-success')}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingId === item.categoryId ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => saveBudget(item.categoryId)}
                                onKeyDown={e => { if (e.key === 'Enter') saveBudget(item.categoryId); if (e.key === 'Escape') setEditingId(null) }}
                                autoFocus
                                disabled={savingBudget}
                                className="w-28 h-8 text-right rounded border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            ) : (
                              <button
                                onClick={() => { setEditingId(item.categoryId); setEditValue(String(item.budgetAmount || '')) }}
                                className="text-foreground font-medium hover:text-primary transition-colors cursor-pointer"
                                title="Tıklayarak düzenle"
                              >
                                {item.budgetAmount > 0 ? formatCurrency(item.budgetAmount) : '—'}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatCurrency(item.actualAmount)}
                          </td>
                          <td className={`px-4 py-3 text-right font-medium ${
                            item.difference >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {item.budgetAmount > 0 ? (
                              <>{item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}</>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {status ? (
                              <div className="flex items-center justify-center gap-1">
                                <status.icon className={cn('w-4 h-4', status.color)} />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}

                    {/* Totals row */}
                    <tr className="bg-muted/50 font-semibold">
                      <td className="px-4 py-3 text-foreground">Toplam</td>
                      <td className="px-4 py-3 text-right text-foreground">{formatCurrency(data.totalBudget)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(data.totalActual)}</td>
                      <td className={`px-4 py-3 text-right ${data.totalDifference >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {data.totalBudget > 0 ? (
                          <>{data.totalDifference >= 0 ? '+' : ''}{formatCurrency(data.totalDifference)}</>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
        </TableCard>

        {/* Info */}
        <div className="p-4 bg-muted rounded-xl border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">İpuçları:</span>{' '}
            Bütçe sütunundaki tutara tıklayarak düzenleyin. Enter ile kaydedin, Escape ile iptal edin.
            Önceki ayın bütçesini kopyalayarak hızlıca başlayabilirsiniz.
          </p>
        </div>
      </div>

      {/* Copy Modal */}
      {showCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCopy(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Bütçe Kopyala</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Kaynak</label>
                <div className="flex gap-2">
                  <select value={copyFromYear} onChange={e => setCopyFromYear(Number(e.target.value))}
                    className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground">
                    {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={copyFromMonth} onChange={e => setCopyFromMonth(Number(e.target.value))}
                    className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground">
                    {MONTHS_TR.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Hedef</label>
                <p className="text-sm text-muted-foreground">{MONTHS_TR[month - 1]} {year}</p>
              </div>

              {copyResult && (
                <p className="text-sm text-primary">{copyResult}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCopy(false)}>Kapat</Button>
              <Button onClick={copyBudget} loading={copying}>Kopyala</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
