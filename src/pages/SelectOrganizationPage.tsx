import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Home } from 'lucide-react'
import { formatUnitLabel } from '@/utils/formatUnitLabel'

const roleBadge: Record<string, { label: string; color: string }> = {
  admin: { label: 'Yönetici', color: 'bg-blue-100 text-blue-700' },
  board_member: { label: 'Yönetim Kurulu', color: 'bg-purple-100 text-purple-700' },
  resident: { label: 'Sakin', color: 'bg-green-100 text-green-700' },
  staff: { label: 'Personel', color: 'bg-amber-100 text-amber-700' },
}

export function SelectOrganizationPage() {
  const { memberships, setActiveMembership } = useAuth()
  const navigate = useNavigate()

  function select(index: number) {
    setActiveMembership(memberships[index])
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Üyelikleriniz</h1>
          <p className="text-sm text-slate-500 mt-1">Devam etmek için bir organizasyon seçin</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {memberships.map((m, i) => {
            const badge = roleBadge[m.role] ?? { label: m.role, color: 'bg-slate-100 text-slate-600' }
            return (
              <button key={m.organizationId} onClick={() => select(i)} className="w-full text-left">
                <Card className="hover:border-blue-300 hover:shadow-md transition-all h-full">
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{m.organizationName}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${badge.color}`}>
                        {badge.label}
                      </span>
                      {m.units && m.units.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                          <Home className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {m.units.map(u => formatUnitLabel(u.blockName, u.unitNumber, m.orgType)).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
