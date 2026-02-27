import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, Mail, FileText, Building2 } from 'lucide-react'

export function DashboardPage() {
  const { profile, activeMembership } = useAuth()
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Merhaba, {profile?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {activeMembership?.organizationName}
            {activeMembership?.units?.[0]?.unitNumber ? ` · Daire ${activeMembership.units[0].unitNumber}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rolünüz</p>
                <p className="font-semibold text-gray-900 capitalize">{activeMembership?.role}</p>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <>
              <Card>
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Üye Yönetimi</p>
                    <p className="font-semibold text-gray-900">Üyeleri görüntüle</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Davet Kodları</p>
                    <p className="font-semibold text-gray-900">Yönet</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bekleyen Başvurular</p>
                    <p className="font-semibold text-gray-900">İncele</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Hızlı Bakış</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Sol menüden üye yönetimi, davet kodu oluşturma ve başvuru inceleme işlemlerini yapabilirsiniz.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
