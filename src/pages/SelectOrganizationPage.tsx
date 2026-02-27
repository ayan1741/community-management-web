import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Building2 } from 'lucide-react'

export function SelectOrganizationPage() {
  const { memberships, setActiveMembership } = useAuth()
  const navigate = useNavigate()

  function select(index: number) {
    setActiveMembership(memberships[index])
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-gray-900 text-center mb-6">Üyelikleriniz</h1>
        <div className="space-y-3">
          {memberships.map((m, i) => (
            <button key={m.organizationId} onClick={() => select(i)} className="w-full text-left">
              <Card className="hover:border-blue-300 hover:shadow-md transition-all">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{m.organizationName}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {m.role} {m.units?.[0]?.unitNumber ? `· Daire ${m.units[0].unitNumber}` : ''}
                      {m.units?.[0]?.blockName ? ` (${m.units[0].blockName})` : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
