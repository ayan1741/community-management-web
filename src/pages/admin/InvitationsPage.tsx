import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { InvitationCode, PagedResult } from '@/types'

export function InvitationsPage() {
  const { activeMembership } = useAuth()
  const [invitations, setInvitations] = useState<InvitationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [unitId, setUnitId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadInvitations()
  }, [activeMembership])

  async function loadInvitations() {
    if (!activeMembership) return
    try {
      const r = await api.get<PagedResult<InvitationCode>>(`/organizations/${activeMembership.organizationId}/invitations`)
      setInvitations(r.data.items)
    } catch {
      setError('Davetler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function generateCode() {
    if (!unitId.trim()) return
    setGenerating(true)
    setError('')
    try {
      await api.post(`/organizations/${activeMembership!.organizationId}/invitations`, {
        unitId,
        expiresInDays: 7,
      })
      setUnitId('')
      await loadInvitations()
    } catch {
      setError('Davet kodu oluşturulamadı')
    } finally {
      setGenerating(false)
    }
  }

  const statusLabel: Record<string, string> = {
    pending: 'Aktif',
    used: 'Kullanıldı',
    expired: 'Süresi Doldu',
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Davet Kodları</h1>

        <Card>
          <CardHeader>
            <CardTitle>Yeni Davet Kodu Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Daire ID (UUID)"
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={generateCode} loading={generating} disabled={!unitId.trim()}>
                Oluştur
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mevcut Davetler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <p className="px-6 py-4 text-sm text-gray-500">Yükleniyor...</p>}
            {!loading && invitations.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-500">Henüz davet kodu yok.</p>
            )}
            {invitations.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Kod</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Son Geçerlilik</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Durum</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invitations.map(inv => (
                    <tr key={inv.invitationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 tracking-widest">
                        {inv.invitationCode}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(inv.expiresAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          inv.codeStatus === 'pending' ? 'bg-green-50 text-green-700' :
                          inv.codeStatus === 'used' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {statusLabel[inv.codeStatus] ?? inv.codeStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(inv.invitationCode)}
                        >
                          Kopyala
                        </Button>
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
