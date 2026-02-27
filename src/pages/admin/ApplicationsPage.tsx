import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Application } from '@/types'

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
      const r = await api.get<Application[]>(`/organizations/${activeMembership.organizationId}/applications`)
      setApplications(r.data)
    } catch {
      setError('Başvurular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleDecision(id: string, action: 'approve' | 'reject') {
    try {
      await api.post(`/organizations/${activeMembership!.organizationId}/applications/${id}/${action}`)
      setApplications(prev => prev.map(a =>
        a.id === id
          ? { ...a, applicationStatus: action === 'approve' ? 'approved' : 'rejected' }
          : a
      ))
    } catch {
      setError('İşlem başarısız')
    }
  }

  const pending = applications.filter(a => a.applicationStatus === 'pending')
  const processed = applications.filter(a => a.applicationStatus !== 'pending')

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
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{a.applicantName}</p>
                        <p className="text-xs text-gray-500">{a.applicantEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {a.blockName ? `${a.blockName} · ` : ''}{a.unitNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleDecision(a.id, 'approve')}>
                            Onayla
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDecision(a.id, 'reject')}>
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

        {processed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Geçmiş Başvurular</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Başvuran</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Daire</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Sonuç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {processed.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{a.applicantName}</td>
                      <td className="px-6 py-4 text-gray-600">{a.unitNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          a.applicationStatus === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {a.applicationStatus === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
