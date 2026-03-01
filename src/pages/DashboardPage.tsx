import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { SetupBanner } from '@/components/setup/SetupBanner'
import { Users, Mail, FileText, Building2 } from 'lucide-react'

export function DashboardPage() {
  const { profile, activeMembership } = useAuth()
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <SetupBanner />
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Merhaba, {profile?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeMembership?.organizationName}
            {activeMembership?.units?.[0]?.unitNumber ? ` · Daire ${activeMembership.units[0].unitNumber}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Rolünüz</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 capitalize">{activeMembership?.role}</p>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Üye Yönetimi</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">Üyeleri görüntüle</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Davetler</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">Davet kodları</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Başvurular</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">Bekleyenleri incele</p>
                </div>
              </div>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs text-slate-500">Sol menüden üye yönetimi, davet kodu oluşturma ve başvuru inceleme işlemlerini yapabilirsiniz.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
