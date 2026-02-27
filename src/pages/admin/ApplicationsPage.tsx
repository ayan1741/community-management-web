import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Başvurular</h1>
          {pending.length > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {pending.length} bekliyor
            </span>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Başvurular</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <p className="px-6 py-4 text-sm text-gray-500">Yükleniyor...</p>}
            {!loading && pending.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-500">Bekleyen başvuru yok.</p>
            )}
            {pending.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Başvuran</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Daire</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Tarih</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pending.map(a => (
                    <tr key={a.applicationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{a.applicantName}</p>
                        <p className="text-xs text-gray-500">{a.applicantPhone ?? ''}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {a.blockName ? `${a.blockName} · ` : ''}{a.unitNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(a.submittedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleDecision(a.applicationId, 'approve')}>
                            Onayla
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDecision(a.applicationId, 'reject')}>
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
    </AppLayout>
  )
}
