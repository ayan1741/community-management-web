import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { FileText, AlertTriangle, UserCheck } from 'lucide-react'
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
        <PageHeader
          icon={UserCheck}
          title="Onay Bekleyenler"
          description="Bekleyen başvuruları incele ve yönet"
          actions={pending.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {pending.length} bekliyor
            </span>
          ) : undefined}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <TableCard title="Bekleyen Başvurular">
            {loading && <TableSkeleton />}
            {!loading && pending.length === 0 && (
              <EmptyState icon={FileText} title="Bekleyen başvuru yok" description="Tüm başvurular incelendi." />
            )}
            {pending.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Başvuran</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Daire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(a => (
                    <tr key={a.applicationId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
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
        </TableCard>
      </div>
    </AdminLayout>
  )
}
