import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { CategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import { ReportBasisToggle, getStoredBasis, storeBasis } from '@/components/shared/report-basis-toggle'
import type { AnnualReportResult, ReportBasis } from '@/types'

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

type CatTab = 'expense' | 'income'

export function FinanceAnnualReportPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState<AnnualReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [catTab, setCatTab] = useState<CatTab>('expense')
  const [reportBasis, setReportBasis] = useState<ReportBasis>(() => orgId ? getStoredBasis(orgId) : 'period')

  function handleBasisChange(basis: ReportBasis) {
    setReportBasis(basis)
    if (orgId) storeBasis(orgId, basis)
  }

  useEffect(() => {
    if (orgId) loadReport()
  }, [orgId, year, reportBasis])

  async function loadReport() {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<AnnualReportResult>(`/organizations/${orgId}/finance/reports/annual?year=${year}&reportBasis=${reportBasis}`)
      setReport(r.data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const filteredCategoryTotals = (report?.categoryTotals ?? [])
    .filter(c => c.type === catTab)
    .sort((a, b) => b.annualTotal - a.annualTotal)

  const catGrandTotal = filteredCategoryTotals.reduce((s, c) => s + c.annualTotal, 0)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={BarChart3}
          title="Yıllık Gelir-Gider Raporu"
          description="12 aylık finansal özet"
          actions={
            <div className="flex items-center gap-3">
              <ReportBasisToggle value={reportBasis} onChange={handleBasisChange} />
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground font-medium"
              >
                {[now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          }
        />

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4.5 h-4.5 text-success" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Gelir</p>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(report.yearTotalIncome)}</p>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4.5 h-4.5 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Gider</p>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(report.yearTotalExpense)}</p>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    report.yearNetBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {report.yearNetBalance >= 0 ? (
                      <CheckCircle className="w-4.5 h-4.5 text-success" />
                    ) : (
                      <XCircle className="w-4.5 h-4.5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Net Bakiye</p>
                </div>
                <p className={`text-xl font-bold ${report.yearNetBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {report.yearNetBalance >= 0 ? '+' : ''}{formatCurrency(report.yearNetBalance)}
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Aidat Tahsilatı</p>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(report.yearDuesCollected)}</p>
              </div>
            </div>

            {/* Monthly Table */}
            <TableCard title="12 Aylık Detay" className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ay</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Aidat Tah.</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Diğer Gelir</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Toplam Gelir</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Toplam Gider</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MONTHS_TR.map((monthName, i) => {
                        const row = report.monthlyTotals.find(r => r.month === i + 1)
                        const hasData = row && (row.totalIncome > 0 || row.totalExpense > 0)
                        return (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{monthName}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              {hasData ? formatCurrency(row.duesCollected) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              {hasData ? formatCurrency(row.otherIncome) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-foreground">
                              {hasData ? formatCurrency(row.totalIncome) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-foreground">
                              {hasData ? formatCurrency(row.totalExpense) : '—'}
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${
                              !hasData ? 'text-muted-foreground' :
                              row.netBalance >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {hasData ? (
                                <>{row.netBalance >= 0 ? '+' : ''}{formatCurrency(row.netBalance)}</>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })}

                      {/* Totals */}
                      <tr className="bg-muted/50 font-semibold">
                        <td className="px-4 py-3 text-foreground">Yıllık Toplam</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(report.yearDuesCollected)}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(report.yearTotalIncome - report.yearDuesCollected)}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(report.yearTotalIncome)}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(report.yearTotalExpense)}</td>
                        <td className={`px-4 py-3 text-right ${report.yearNetBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {report.yearNetBalance >= 0 ? '+' : ''}{formatCurrency(report.yearNetBalance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </TableCard>

            {/* Category Totals */}
            <TableCard
              title="Kategori Bazlı Yıllık Toplamlar"
              actions={
                <div className="flex items-center gap-1">
                  {([['expense', 'Gider'], ['income', 'Gelir']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setCatTab(key)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                        catTab === key
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
            >
                {filteredCategoryTotals.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">Bu yıl henüz {catTab === 'expense' ? 'gider' : 'gelir'} kaydı yok.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Kategori</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Yıllık Toplam</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategoryTotals.map(cat => {
                        const pct = catGrandTotal > 0 ? (cat.annualTotal / catGrandTotal) * 100 : 0
                        return (
                          <tr key={cat.categoryId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <CategoryIcon name={cat.categoryIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-foreground font-medium">{cat.categoryName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(cat.annualTotal)}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">%{pct.toFixed(1)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
            </TableCard>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
