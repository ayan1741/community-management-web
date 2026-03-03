import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, AlertTriangle } from 'lucide-react'
import type { Application, PagedResult } from '@/types'

export function ApplicationsPage() {
  const { activeMembership } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadApplications()
  }, [activeMembership])

  async function loadApplications() {
    if (!activeMembership) return
    try {
      const r = await api.get<PagedResult<Application>>(`/organizations/${activeMembership.organizationId}/applications`)
      setApplications(r.data.items)
    } catch {
      setError('Başvurular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleDecision(id: string, action: 'approve' | 'reject') {
    try {
      await api.post(`/organizations/${activeMembership!.organizationId}/applications/${id}/${action}`)
      setApplications(prev => prev.filter(a => a.applicationId !== id))
    } catch {
      setError('İşlem başarısız')
    }
  }

  const pending = applications

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Onay Bekleyenler</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Bekleyen başvuruları incele ve yönet</p>
          </div>
          {pending.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {pending.length} bekliyor
            </span>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Başvurular</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              </div>
            )}
            {!loading && pending.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Bekleyen başvuru yok</p>
                <p className="text-xs text-muted-foreground mt-1">Tüm başvurular incelendi.</p>
              </div>
            )}
            {pending.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Başvuran</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Daire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(a => (
                    <tr key={a.applicationId} className="border-b border-border hover:bg-muted/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{a.applicantName}</p>
                          {a.duplicateWarning && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/20"
                              title="Bu daire için birden fazla bekleyen başvuru var"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Çakışma
                            </span>
                          )}
                        </div>
                        {a.applicantPhone && (
                          <p className="text-xs text-muted-foreground mt-0.5">{a.applicantPhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {a.blockName ? `${a.blockName} · ` : ''}{a.unitNumber}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {new Date(a.submittedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="default" onClick={() => handleDecision(a.applicationId, 'approve')}>
                            Onayla
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDecision(a.applicationId, 'reject')}>
                            Reddet
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
