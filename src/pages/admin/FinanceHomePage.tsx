import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryIcon, CHART_COLORS } from '@/lib/category-icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Plus, AlertTriangle, Paperclip, CheckCircle, XCircle,
} from 'lucide-react'
import type { MonthlyReportResult } from '@/types'

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

interface OpeningBalanceData {
  exists: boolean
  data?: { id: string; amount: number; recordDate: string; description: string }
}

export function FinanceHomePage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()
  const isAdmin = activeMembership?.role === 'admin'

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [report, setReport] = useState<MonthlyReportResult | null>(null)
  const [openingBalance, setOpeningBalance] = useState<OpeningBalanceData | null>(null)
  const [loading, setLoading] = useState(true)

  // Opening balance modal
  const [showObModal, setShowObModal] = useState(false)
  const [obAmount, setObAmount] = useState('')
  const [obDate, setObDate] = useState('')
  const [obDesc, setObDesc] = useState('')
  const [obSaving, setObSaving] = useState(false)

  function goMonth(delta: number) {
    let m = month + delta
    let y = year
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
        const [repRes, obRes] = await Promise.all([
          api.get<MonthlyReportResult>(`/organizations/${orgId}/finance/reports/monthly?year=${year}&month=${month}`),
          api.get<OpeningBalanceData>(`/organizations/${orgId}/finance/opening-balance`),
        ])
        setReport(repRes.data)
        setOpeningBalance(obRes.data)
      } catch { /* silently handle */ }
      finally { setLoading(false) }
    }
    load()
  }, [orgId, year, month])

  // Donut chart data
  const chartData = useMemo(() => {
    if (!report?.expenseBreakdown?.length) return []
    const sorted = [...report.expenseBreakdown].sort((a, b) => b.amount - a.amount)
    const top5 = sorted.slice(0, 5)
    const rest = sorted.slice(5)
    const items = top5.map(c => ({ name: c.categoryName, value: c.amount, icon: c.categoryIcon }))
    if (rest.length > 0) {
      items.push({ name: 'Diğer', value: rest.reduce((s, c) => s + c.amount, 0), icon: null })
    }
    return items
  }, [report])

  const incomeData = useMemo(() => {
    if (!report?.incomeBreakdown?.length) return []
    return [...report.incomeBreakdown].sort((a, b) => b.amount - a.amount)
  }, [report])

  async function saveOpeningBalance() {
    if (!orgId || !obAmount || !obDate) return
    setObSaving(true)
    try {
      const isUpdate = openingBalance?.exists
      const method = isUpdate ? 'put' : 'post'
      await api[method](`/organizations/${orgId}/finance/opening-balance`, {
        amount: parseFloat(obAmount),
        recordDate: obDate,
        description: obDesc || null,
      })
      const obRes = await api.get<OpeningBalanceData>(`/organizations/${orgId}/finance/opening-balance`)
      setOpeningBalance(obRes.data)
      setShowObModal(false)
      // Reload report to reflect change
      const repRes = await api.get<MonthlyReportResult>(`/organizations/${orgId}/finance/reports/monthly?year=${year}&month=${month}`)
      setReport(repRes.data)
    } catch { /* handle */ }
    finally { setObSaving(false) }
  }

  function openObModal() {
    if (openingBalance?.data) {
      setObAmount(String(openingBalance.data.amount))
      setObDate(openingBalance.data.recordDate)
      setObDesc(openingBalance.data.description ?? '')
    } else {
      setObAmount('')
      setObDate(new Date().toISOString().slice(0, 10))
      setObDesc('')
    }
    setShowObModal(true)
  }

  const changePercent = report?.changePercent
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Gelir-Gider Yönetimi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Aylık gelir, gider ve bütçe takibi</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/finance/records', { state: { type: 'income' } })}>
              <Plus className="w-4 h-4 mr-1" />
              Gelir Ekle
            </Button>
            <Button onClick={() => navigate('/admin/finance/records', { state: { type: 'expense' } })}>
              <Plus className="w-4 h-4 mr-1" />
              Gider Ekle
            </Button>
          </div>
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
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

        {/* Opening Balance Banner */}
        {!loading && openingBalance && !openingBalance.exists && isAdmin && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-warning/30 bg-warning/5">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Devir bakiyesi tanımlanmamış</p>
              <p className="text-xs text-muted-foreground">Doğru raporlama için önceki dönemden kalan bakiyeyi girin.</p>
            </div>
            <Button size="sm" variant="outline" onClick={openObModal}>Şimdi Gir</Button>
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                <div className="h-4 bg-muted rounded mb-3 w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : report && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Toplam Gelir */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4.5 h-4.5 text-success" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Gelir</p>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(report.totalIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Aidat: {formatCurrency(report.duesCollected)} | Diğer: {formatCurrency(report.otherIncome)}
              </p>
            </div>

            {/* Toplam Gider */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4.5 h-4.5 text-destructive" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Gider</p>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(report.totalExpense)}</p>
              {changePercent !== null && changePercent !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {changePercent >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-destructive" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-success" />
                  )}
                  <span className={`text-xs font-medium ${changePercent >= 0 ? 'text-destructive' : 'text-success'}`}>
                    %{Math.abs(changePercent).toFixed(0)} önceki aya göre
                  </span>
                </div>
              )}
            </div>

            {/* Net Bakiye */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  report.netBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {report.netBalance >= 0 ? (
                    <CheckCircle className="w-4.5 h-4.5 text-success" />
                  ) : (
                    <XCircle className="w-4.5 h-4.5 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Net Bakiye</p>
              </div>
              <p className={`text-xl font-bold ${report.netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {report.netBalance >= 0 ? '+' : ''}{formatCurrency(report.netBalance)}
              </p>
              <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                report.netBalance >= 0
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {report.netBalance >= 0 ? 'Bütçe dengeli' : 'Bütçe açığı'}
              </span>
            </div>

            {/* Devir Bakiyesi */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4.5 h-4.5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Devir Bakiyesi</p>
              </div>
              {openingBalance?.exists ? (
                <>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(openingBalance.data!.amount)}</p>
                  {isAdmin && (
                    <button onClick={openObModal} className="text-xs text-primary hover:underline mt-1">Düzenle</button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Tanımlanmamış</p>
                  {isAdmin && (
                    <button onClick={openObModal} className="text-xs text-primary hover:underline mt-1">Tanımla</button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Two Column: Donut + Income */}
        {!loading && report && (
          <div className="grid lg:grid-cols-5 gap-6 mb-6">
            {/* Expense Breakdown — Donut */}
            <Card className="lg:col-span-3">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Gider Dağılımı</h2>
              </div>
              <CardContent className="p-5">
                {chartData.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-48 h-48 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
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
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      {chartData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-xs">
                              %{report.totalExpense > 0 ? ((item.value / report.totalExpense) * 100).toFixed(0) : 0}
                            </span>
                            <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">Bu ay henüz gider kaydı yok.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Sources */}
            <Card className="lg:col-span-2">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Gelir Kaynakları</h2>
              </div>
              <CardContent className="p-5">
                {incomeData.length > 0 ? (
                  <div className="space-y-3">
                    {incomeData.map((item) => {
                      const pct = report.totalIncome > 0 ? (item.amount / report.totalIncome) * 100 : 0
                      return (
                        <div key={item.categoryId}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <CategoryIcon name={item.categoryIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm text-foreground">{item.categoryName}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{formatCurrency(item.amount)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">Bu ay henüz gelir kaydı yok.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Transactions */}
        {!loading && report && (
          <Card className="mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Son İşlemler</h2>
              <button
                onClick={() => navigate('/admin/finance/records')}
                className="text-xs text-primary hover:text-primary font-medium"
              >
                Tümünü Gör →
              </button>
            </div>
            <CardContent className="p-0">
              {report.recentRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarih</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tür</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Kategori</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Açıklama</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Tutar</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentRecords.map((rec) => (
                        <tr key={rec.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(rec.recordDate)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              rec.type === 'income'
                                ? 'bg-success/10 text-success'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {rec.type === 'income' ? 'Gelir' : 'Gider'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <CategoryIcon name={rec.categoryIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-foreground">{rec.categoryName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{rec.description}</td>
                          <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                            rec.type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {rec.documentUrl && (
                              <a href={rec.documentUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                <Paperclip className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">Bu ay henüz işlem kaydı yok.</p>
                  <Button className="mt-3" onClick={() => navigate('/admin/finance/records')}>İlk Kaydı Ekle</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <div className="p-4 bg-muted rounded-xl border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">İpuçları:</span>{' '}
            Önce <button onClick={() => navigate('/admin/finance/categories')} className="text-primary underline">Kategorileri</button> oluşturun,
            ardından <button onClick={() => navigate('/admin/finance/records')} className="text-primary underline">gelir ve gider kayıtları</button> ekleyin.
            {isAdmin && (
              <>{' '}Aylık <button onClick={() => navigate('/admin/finance/budgets')} className="text-primary underline">bütçe hedefleri</button> belirleyerek harcamalarınızı takip edebilirsiniz.</>
            )}
          </p>
        </div>
      </div>

      {/* Opening Balance Modal */}
      {showObModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowObModal(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {openingBalance?.exists ? 'Devir Bakiyesini Düzenle' : 'Devir Bakiyesi Tanımla'}
            </h3>
            <div className="space-y-4">
              <Input
                label="Tutar (₺)"
                type="number"
                step="0.01"
                value={obAmount}
                onChange={e => setObAmount(e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Tarih"
                type="date"
                value={obDate}
                onChange={e => setObDate(e.target.value)}
              />
              <Input
                label="Açıklama (opsiyonel)"
                value={obDesc}
                onChange={e => setObDesc(e.target.value)}
                placeholder="Önceki dönemden devir"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowObModal(false)}>İptal</Button>
              <Button onClick={saveOpeningBalance} loading={obSaving} disabled={!obAmount || !obDate}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
