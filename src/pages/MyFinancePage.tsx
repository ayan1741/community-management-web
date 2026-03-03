import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryIcon, CHART_COLORS } from '@/lib/category-icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Building2, Users2, Calculator,
} from 'lucide-react'
import { ReportBasisToggle, getStoredBasis, storeBasis } from '@/components/shared/report-basis-toggle'
import type { ResidentFinanceSummaryResult, ReportBasis } from '@/types'

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function MyFinancePage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<ResidentFinanceSummaryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportBasis, setReportBasis] = useState<ReportBasis>(() => orgId ? getStoredBasis(orgId) : 'period')

  function handleBasisChange(basis: ReportBasis) {
    setReportBasis(basis)
    if (orgId) storeBasis(orgId, basis)
  }

  function goMonth(delta: number) {
    let m = month + delta, y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setYear(y)
    setMonth(m)
  }

  useEffect(() => {
    if (!orgId) return
    async function load() {
      setLoading(true)
      try {
        const r = await api.get<ResidentFinanceSummaryResult>(
          `/organizations/${orgId}/finance/reports/resident-summary?year=${year}&month=${month}&reportBasis=${reportBasis}`
        )
        setData(r.data)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [orgId, year, month, reportBasis])

  // Donut chart data
  const chartData = useMemo(() => {
    if (!data?.expenseBreakdown?.length) return []
    const sorted = [...data.expenseBreakdown].sort((a, b) => b.amount - a.amount)
    const top5 = sorted.slice(0, 5)
    const rest = sorted.slice(5)
    const items = top5.map(c => ({ name: c.categoryName, value: c.amount, icon: c.categoryIcon }))
    if (rest.length > 0) {
      items.push({ name: 'Diğer', value: rest.reduce((s, c) => s + c.amount, 0), icon: null })
    }
    return items
  }, [data])

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Gelir-Gider Özeti</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Sitenizin finansal durumu</p>
          </div>
          <ReportBasisToggle value={reportBasis} onChange={handleBasisChange} />
        </div>

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

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-3 w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Hero Summary Card — premium gradient border */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-4">
                {MONTHS_TR[month - 1]} {year} — Finansal Özet
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(data.totalIncome)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aidat: {formatCurrency(data.duesCollected)} | Diğer: {formatCurrency(data.otherIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Toplam Gider</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(data.totalExpense)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net Bakiye</p>
                  <p className={`text-2xl font-bold ${data.netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {data.netBalance >= 0 ? '+' : ''}{formatCurrency(data.netBalance)}
                  </p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    data.netBalance >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {data.netBalance >= 0 ? 'Bütçe dengeli' : 'Bütçe açığı'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dues vs Expenses Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:text-left">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Toplanan Aidat</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(data.duesCollected)}</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                    vs
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Toplam Gider</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(data.totalExpense)}</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  data.duesCollected >= data.totalExpense
                    ? 'bg-success/10 text-success'
                    : data.totalIncome >= data.totalExpense
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                }`}>
                  {data.duesCollected >= data.totalExpense
                    ? 'Aidat geliri giderleri karşılıyor'
                    : data.totalIncome >= data.totalExpense
                      ? 'Fark diğer gelirlerle karşılanıyor'
                      : 'Bütçe açığı var'}
                </span>
              </div>
            </div>

            {/* Expense Breakdown — Donut + Legend */}
            {chartData.length > 0 && (
              <Card>
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Gider Dağılımı</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Sitenizin harcama kalemleri</p>
                </div>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-52 h-52 shrink-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                          >
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val) => formatCurrency(Number(val))}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-xs text-muted-foreground">Toplam</p>
                        <p className="text-sm font-bold text-foreground">{formatCurrency(data.totalExpense)}</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      {chartData.map((item, i) => {
                        const pct = data.totalExpense > 0 ? ((item.value / data.totalExpense) * 100).toFixed(1) : '0'
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <div className="flex items-center gap-1.5">
                                <CategoryIcon name={item.icon} className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm text-foreground">{item.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">%{pct}</span>
                              <span className="text-sm font-medium text-foreground min-w-[80px] text-right">{formatCurrency(item.value)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Per-Unit Share Card — special design */}
            {data.activeUnitCount > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">Toplam Gider</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(data.totalExpense)}</p>
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">Aktif Daire</p>
                    <p className="text-lg font-bold text-foreground">{data.activeUnitCount}</p>
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-2">
                      <Users2 className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">Daire Başına Pay</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(data.perUnitShare)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[11px] text-muted-foreground italic text-center">
                    Bu ortalama bir hesaptır. Gerçek katkı payınız aidat tutarınıza ve yönetim planındaki
                    arsa payına göre farklılık gösterebilir.
                  </p>
                </div>
              </div>
            )}

            {/* Expense Trend — Last 6 Months */}
            {data.expenseTrend && data.expenseTrend.length >= 3 && (
              <Card>
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Gider Trendi</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Son ayların gider karşılaştırması</p>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {data.expenseTrend.map((item, i) => {
                      const prev = i > 0 ? data.expenseTrend[i - 1] : null
                      const diff = prev ? item.amount - prev.amount : null
                      const maxAmount = Math.max(...data.expenseTrend.map(t => t.amount))
                      const barPct = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0

                      return (
                        <div key={`${item.year}-${item.month}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground font-medium">
                              {MONTHS_TR[item.month - 1]} {item.year}
                            </span>
                            <div className="flex items-center gap-2">
                              {diff !== null && diff !== 0 && (
                                <div className="flex items-center gap-0.5">
                                  {diff > 0 ? (
                                    <ArrowUp className="w-3 h-3 text-destructive" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3 text-success" />
                                  )}
                                  <span className={`text-xs ${diff > 0 ? 'text-destructive' : 'text-success'}`}>
                                    {formatCurrency(Math.abs(diff))}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm font-medium text-foreground min-w-[80px] text-right">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/60 rounded-full transition-all"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.expenseTrend && data.expenseTrend.length < 3 && (
              <div className="p-4 bg-muted rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground">
                  Yeterli veri toplandıktan sonra gider trendi gösterilecektir.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
