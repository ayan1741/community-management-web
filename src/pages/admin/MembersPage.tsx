import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Users, MoreVertical } from 'lucide-react'
import type { Member, PagedResult, UserRole } from '@/types'

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

type ActionType = 'suspend' | 'activate' | 'remove'

const confirmMessages: Record<ActionType, (name: string) => string> = {
  suspend: name => `"${name}" üyesini askıya almak istediğinize emin misiniz?`,
  activate: name => `"${name}" üyesini yeniden aktifleştirmek istediğinize emin misiniz?`,
  remove: name => `"${name}" üyesini organizasyondan çıkarmak istediğinize emin misiniz? Bu işlem geri alınamaz.`,
}

const confirmLabels: Record<ActionType, string> = {
  suspend: 'Askıya Al',
  activate: 'Aktifleştir',
  remove: 'Çıkar',
}

export function MembersPage() {
  const { activeMembership, user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ member: Member; type: ActionType } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [roleChangeTarget, setRoleChangeTarget] = useState<Member | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('resident')
  const [roleChanging, setRoleChanging] = useState(false)
  const [roleError, setRoleError] = useState('')

  const adminCount = members.filter(m => m.role === 'admin' && m.status === 'active').length

  useEffect(() => {
    if (!activeMembership) return
    loadMembers()
  }, [activeMembership])

  async function loadMembers() {
    if (!activeMembership) return
    try {
      const r = await api.get<PagedResult<Member>>(`/organizations/${activeMembership.organizationId}/members`)
      setMembers(r.data.items)
    } catch {
      setError('Üyeler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!confirmAction || !activeMembership) return
    const { member, type } = confirmAction
    setActionLoading(true)
    try {
      if (type === 'suspend') {
        await api.post(`/organizations/${activeMembership.organizationId}/members/${member.userId}/suspend`)
      } else if (type === 'activate') {
        await api.post(`/organizations/${activeMembership.organizationId}/members/${member.userId}/activate`)
      } else {
        await api.delete(`/organizations/${activeMembership.organizationId}/members/${member.userId}`)
      }
      setConfirmAction(null)
      await loadMembers()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'İşlem başarısız')
      setConfirmAction(null)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRoleChange() {
    if (!roleChangeTarget || !activeMembership) return
    setRoleChanging(true)
    setRoleError('')
    try {
      await api.patch(
        `/organizations/${activeMembership.organizationId}/members/${roleChangeTarget.userId}/role`,
        { role: newRole },
      )
      setRoleChangeTarget(null)
      await loadMembers()
    } catch (err: any) {
      setRoleError(err.response?.data?.error ?? 'Rol değiştirme başarısız')
    } finally {
      setRoleChanging(false)
    }
  }

  function openRoleChange(m: Member) {
    setRoleChangeTarget(m)
    setNewRole(m.role)
    setRoleError('')
    setOpenMenuId(null)
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Üyeler</h1>
            <p className="text-sm text-slate-500 mt-0.5">Tüm üyeleri görüntüle ve yönet</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tüm Üyeler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              </div>
            )}
            {!loading && members.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Henüz üye yok</p>
                <p className="text-xs text-slate-400 mt-1">Davet kodu oluşturarak üye ekleyebilirsiniz.</p>
              </div>
            )}
            {members.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ad Soyad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Daire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const isCurrentUser = m.userId === user?.id
                    const isLastAdmin = m.role === 'admin' && adminCount === 1
                    return (
                      <tr key={m.userId} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                              {m.fullName?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">{m.fullName}</span>
                              {isCurrentUser && <span className="ml-2 text-xs text-slate-400">(sen)</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {m.units[0]?.blockName ? `${m.units[0].blockName} ` : ''}{m.units[0]?.unitNumber ?? '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {roleLabels[m.role] ?? m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            m.status === 'active' ? 'bg-green-50 text-green-700' :
                            m.status === 'suspended' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              m.status === 'active' ? 'bg-green-500' :
                              m.status === 'suspended' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`} />
                            {statusLabels[m.status] ?? m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setOpenMenuId(openMenuId === m.userId ? null : m.userId)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            {openMenuId === m.userId && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                                  <button
                                    disabled={isCurrentUser || isLastAdmin}
                                    onClick={() => openRoleChange(m)}
                                    className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors rounded-t-lg"
                                  >
                                    Rol Değiştir
                                    {isLastAdmin && <span className="block text-xs text-slate-400">Son yönetici</span>}
                                  </button>
                                  {m.status !== 'suspended' ? (
                                    <button
                                      disabled={isCurrentUser}
                                      onClick={() => { setConfirmAction({ member: m, type: 'suspend' }); setOpenMenuId(null) }}
                                      className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                      Askıya Al
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => { setConfirmAction({ member: m, type: 'activate' }); setOpenMenuId(null) }}
                                      className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                      Aktifleştir
                                    </button>
                                  )}
                                  <button
                                    disabled={isCurrentUser}
                                    onClick={() => { setConfirmAction({ member: m, type: 'remove' }); setOpenMenuId(null) }}
                                    className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors rounded-b-lg"
                                  >
                                    Çıkar
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === 'suspend' ? 'Üyeyi Askıya Al' :
          confirmAction?.type === 'activate' ? 'Üyeyi Aktifleştir' :
          'Üyeyi Çıkar'
        }
        message={confirmAction ? confirmMessages[confirmAction.type](confirmAction.member.fullName) : ''}
        confirmLabel={confirmAction ? confirmLabels[confirmAction.type] : ''}
        confirmVariant={confirmAction?.type === 'remove' ? 'danger' : 'primary'}
        loading={actionLoading}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
      />

      {roleChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Rol Değiştir</h2>
            <p className="text-sm text-slate-500 mb-4">{roleChangeTarget.fullName}</p>
            <div className="space-y-2">
              {(['admin', 'board_member', 'resident', 'staff'] as UserRole[]).map(role => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    newRole === role ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={newRole === role}
                    onChange={() => setNewRole(role)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-slate-900">{roleLabels[role]}</span>
                </label>
              ))}
            </div>
            {roleError && <p className="mt-3 text-sm text-red-600">{roleError}</p>}
            <div className="flex gap-3 justify-end mt-5">
              <Button variant="secondary" onClick={() => setRoleChangeTarget(null)} disabled={roleChanging}>İptal</Button>
              <Button
                onClick={handleRoleChange}
                loading={roleChanging}
                disabled={newRole === roleChangeTarget.role}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
