import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CircleDollarSign, CalendarDays, TrendingDown, Clock } from 'lucide-react'
import type { DuesSummary, DuesPeriodListItem } from '@/types'

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

export function DuesHomePage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()
  const isAdmin = activeMembership?.role === 'admin'

  const [summary, setSummary] = useState<DuesSummary | null>(null)
  const [recentPeriods, setRecentPeriods] = useState<DuesPeriodListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orgId) return
    async function load() {
      setLoading(true)
      try {
        const [sumRes, perRes] = await Promise.all([
          api.get<DuesSummary>(`/organizations/${orgId}/dues-summary`),
          api.get<DuesPeriodListItem[]>(`/organizations/${orgId}/dues-periods`),
        ])
        setSummary(sumRes.data)
        setRecentPeriods(perRes.data.slice(0, 5))
      } catch {
        // Sessizce hata yut — partial data göster
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orgId])

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Aidat Yönetimi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Tahakkuk, ödeme ve borç takibi</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="secondary" onClick={() => navigate('/admin/dues/types')}>
                Aidat Tipleri
              </Button>
            )}
            <Button onClick={() => navigate('/admin/dues/periods')}>
              Dönemler
            </Button>
          </div>
        </div>

        {/* Özet Kartlar */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                <div className="h-4 bg-muted rounded mb-3 w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Aktif Dönem</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{summary.activePeriods}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bekleyen Borç</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {summary.totalPendingAmount.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <CircleDollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Tahsilat</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {summary.totalCollectedAmount.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bekleyen Tahakkuk</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{summary.totalPendingDues}</p>
              </div>
            </div>
          </div>
        )}

        {/* Son Dönemler */}
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Son Dönemler</h2>
            <button
              onClick={() => navigate('/admin/dues/periods')}
              className="text-xs text-primary hover:text-primary font-medium"
            >
              Tümünü Gör →
            </button>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : recentPeriods.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Henüz dönem yok.</p>
                <Button className="mt-3" onClick={() => navigate('/admin/dues/periods')}>Dönem Oluştur</Button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Dönem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Son Ödeme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tahsilat</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentPeriods.map(p => {
                    const s = statusLabels[p.status] ?? { label: p.status, class: 'bg-muted' }
                    const rate = p.totalDues > 0 ? Math.round((p.paidCount / p.totalDues) * 100) : 0
                    return (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(p.dueDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.totalDues > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">%{rate}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => navigate(`/admin/dues/periods/${p.id}`)}
                            className="text-xs text-primary hover:text-primary font-medium"
                          >
                            Detay →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Hızlı Bağlantılar */}
        <div className="mt-4 p-4 bg-muted rounded-xl border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">İpuçları:</span>{' '}
            Önce <button onClick={() => navigate('/admin/dues/types')} className="text-primary underline">Aidat Tiplerini</button> tanımlayın,
            ardından <button onClick={() => navigate('/admin/dues/periods')} className="text-primary underline">Dönem oluşturun</button> ve toplu tahakkuk yapın.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
