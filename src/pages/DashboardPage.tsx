import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { SetupBanner } from '@/components/setup/SetupBanner'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StatusSummary } from '@/components/dashboard/StatusSummary'
import { formatCurrency } from '@/lib/format'
import {
  Users, Building2, CalendarDays, CircleDollarSign,
  Clock, Wallet,
} from 'lucide-react'
import type { DuesSummary, PagedResult, Member } from '@/types'

export function DashboardPage() {
  const { profile, activeMembership } = useAuth()
  const navigate = useNavigate()
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const orgId = activeMembership?.organizationId

  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [duesSummary, setDuesSummary] = useState<DuesSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orgId || !isAdmin) {
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      try {
        const [membersRes, duesRes] = await Promise.all([
          api.get<PagedResult<Member>>(`/organizations/${orgId}/members?page=1&pageSize=1`),
          api.get<DuesSummary>(`/organizations/${orgId}/dues-summary`),
        ])
        setMemberCount(membersRes.data.totalCount)
        setDuesSummary(duesRes.data)
      } catch {
        // partial data ok
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orgId, isAdmin])

  // Build status summary lines
  const statusLines: string[] = []
  if (duesSummary) {
    if (duesSummary.totalPendingDues > 0) {
      statusLines.push(`${duesSummary.totalPendingDues} odenmemis tahakkuk bulunuyor.`)
    }
    if (duesSummary.activePeriods > 0) {
      statusLines.push(`${duesSummary.activePeriods} aktif aidat donemi var.`)
    }
    if (duesSummary.totalPendingAmount > 0) {
      statusLines.push(`Toplam ${formatCurrency(duesSummary.totalPendingAmount)} bekleyen borc mevcut.`)
    }
    if (duesSummary.totalPendingDues === 0 && duesSummary.activePeriods === 0) {
      statusLines.push('Su an aktif aidat donemi veya bekleyen borc bulunmuyor.')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <SetupBanner />

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            Merhaba, {profile?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeMembership?.organizationName}
            {activeMembership?.units?.[0]?.unitNumber ? ` · Daire ${activeMembership.units[0].unitNumber}` : ''}
          </p>
        </div>

        {/* Admin Bento Grid */}
        {isAdmin && (
          <>
            {/* KPI Row */}
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                    <div className="h-4 bg-muted rounded mb-3 w-3/4" />
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <KpiCard
                  label="Uyeler"
                  value={memberCount ?? '—'}
                  icon={<Users className="w-5 h-5 text-primary" />}
                />
                <KpiCard
                  label="Aktif Donem"
                  value={duesSummary?.activePeriods ?? '—'}
                  icon={<CalendarDays className="w-5 h-5 text-info" />}
                />
                <KpiCard
                  label="Bekleyen Borc"
                  value={duesSummary ? formatCurrency(duesSummary.totalPendingAmount) : '—'}
                  icon={<Clock className="w-5 h-5 text-warning" />}
                />
                <KpiCard
                  label="Toplam Tahsilat"
                  value={duesSummary ? formatCurrency(duesSummary.totalCollectedAmount) : '—'}
                  icon={<CircleDollarSign className="w-5 h-5 text-success" />}
                />
              </div>
            )}

            {/* Second row: Status Summary + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <StatusSummary lines={statusLines} />

              {/* Quick links */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Hizli Erisim</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Uyeler', icon: Users, to: '/admin/members' },
                    { label: 'Daireler', icon: Building2, to: '/admin/units' },
                    { label: 'Aidat', icon: CircleDollarSign, to: '/admin/dues' },
                    { label: 'Donemler', icon: CalendarDays, to: '/admin/dues/periods' },
                  ].map(link => (
                    <button
                      key={link.to}
                      onClick={() => navigate(link.to)}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-accent text-sm font-medium text-foreground transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-muted-foreground" />
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resident view — simple role card */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiCard
              label="Rolunuz"
              value={activeMembership?.role === 'resident' ? 'Sakin' : activeMembership?.role ?? '—'}
              icon={<Building2 className="w-5 h-5 text-primary" />}
            />
            <button
              onClick={() => navigate('/dues')}
              className="rounded-xl border border-border bg-card p-5 flex items-center gap-4 hover:bg-accent transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Borclarim</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">Aidat borclarimi gor</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
