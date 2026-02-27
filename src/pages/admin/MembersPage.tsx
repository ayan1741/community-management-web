import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Member } from '@/types'

const roleLabels: Record<string, string> = {
  admin: 'Yönetici',
  board_member: 'Yönetim Kurulu',
  resident: 'Sakin',
  staff: 'Personel',
}

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  suspended: 'Askıda',
  removed: 'Çıkarıldı',
}

export function MembersPage() {
  const { activeMembership } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeMembership) return
    api.get<Member[]>(`/organizations/${activeMembership.organizationId}/members`)
      .then(r => setMembers(r.data))
      .catch(() => setError('Üyeler yüklenemedi'))
      .finally(() => setLoading(false))
  }, [activeMembership])

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Üyeler</h1>

        <Card>
          <CardHeader>
            <CardTitle>Tüm Üyeler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <p className="px-6 py-4 text-sm text-gray-500">Yükleniyor...</p>}
            {error && <p className="px-6 py-4 text-sm text-red-600">{error}</p>}
            {!loading && !error && members.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-500">Henüz üye yok.</p>
            )}
            {members.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Ad Soyad</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Daire</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Rol</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Durum</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => (
                    <tr key={m.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {m.fullName}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {m.blockName ? `${m.blockName} ` : ''}{m.unitNumber ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                          {roleLabels[m.role] ?? m.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          m.status === 'active' ? 'bg-green-50 text-green-700' :
                          m.status === 'suspended' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {statusLabels[m.status] ?? m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">Düzenle</Button>
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
