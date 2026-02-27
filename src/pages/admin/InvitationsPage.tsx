import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UnitSelector } from '@/components/units/UnitSelector'
import { Mail } from 'lucide-react'
import type { InvitationCode, UnitDropdownItem, PagedResult } from '@/types'

export function InvitationsPage() {
  const { activeMembership } = useAuth()
  const [invitations, setInvitations] = useState<InvitationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [units, setUnits] = useState<UnitDropdownItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeMembership) return
    loadInvitations()
    loadUnits()
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

  async function loadUnits() {
    if (!activeMembership) return
    try {
      const r = await api.get<UnitDropdownItem[]>(`/organizations/${activeMembership.organizationId}/units/dropdown`)
      setUnits(r.data)
    } catch {}
  }

  async function generateCode() {
    if (!unitId) return
    setGenerating(true)
    setError('')
    try {
      await api.post(`/organizations/${activeMembership!.organizationId}/invitations`, {
        unitId,
        expiresInDays: 7,
      })
      setUnitId(null)
      await loadInvitations()
    } catch {
      setError('Davet kodu oluşturulamadı')
    } finally {
      setGenerating(false)
    }
  }

  const statusLabel: Record<string, string> = {
    active: 'Aktif',
    used: 'Kullanıldı',
    expired: 'Süresi Doldu',
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Davet Kodları</h1>
            <p className="text-sm text-slate-500 mt-0.5">Davet kodu oluştur ve yönet</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Yeni Davet Kodu Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px] max-w-sm">
                <UnitSelector
                  units={units}
                  value={unitId}
                  onChange={setUnitId}
                  placeholder="Daire seçin..."
                />
              </div>
              <Button onClick={generateCode} loading={generating} disabled={!unitId}>
                Oluştur
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mevcut Davetler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              </div>
            )}
            {!loading && invitations.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Henüz davet kodu yok</p>
                <p className="text-xs text-slate-400 mt-1">Yukarıdan yeni bir davet kodu oluşturabilirsiniz.</p>
              </div>
            )}
            {invitations.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Kod</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Son Geçerlilik</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv.invitationId} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded tracking-widest border border-slate-200">
                          {inv.invitationCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {new Date(inv.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          inv.codeStatus === 'active' ? 'bg-green-50 text-green-700' :
                          inv.codeStatus === 'used' ? 'bg-slate-100 text-slate-600' :
                          'bg-red-50 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            inv.codeStatus === 'active' ? 'bg-green-500' :
                            inv.codeStatus === 'used' ? 'bg-slate-400' :
                            'bg-red-500'
                          }`} />
                          {statusLabel[inv.codeStatus] ?? inv.codeStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
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
