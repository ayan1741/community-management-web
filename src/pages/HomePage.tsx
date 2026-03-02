import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/lib/api'
import { formatUnitLabel } from '@/utils/formatUnitLabel'
import type { Membership } from '@/types'
import {
  Building2,
  Home,
  Plus,
  KeyRound,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  X,
} from 'lucide-react'

// ─── Role badge config ───────────────────────────────────────────────────────

const roleBadgeConfig: Record<string, { label: string; cls: string }> = {
  admin: {
    label: 'Yönetici',
    cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20',
  },
  board_member: {
    label: 'Yönetim Kurulu',
    cls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20',
  },
  resident: {
    label: 'Sakin',
    cls: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20',
  },
  staff: {
    label: 'Personel',
    cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20',
  },
}

const residentTypeLabel: Record<string, string> = {
  owner: 'Malik',
  tenant: 'Kiracı',
  resident: 'Sakin',
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-700 mb-2" />
          <div className="h-3 w-20 rounded bg-slate-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}

// ─── Org Card ────────────────────────────────────────────────────────────────

function OrgCard({ membership, onSelect }: { membership: Membership; onSelect: () => void }) {
  const badge = roleBadgeConfig[membership.role] ?? {
    label: membership.role,
    cls: 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700',
  }
  const OrgIcon = membership.orgType === 'apartment' ? Home : Building2

  return (
    <button
      onClick={onSelect}
      className="group w-full text-left rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-indigo-500/[0.03] p-6 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 shrink-0">
          <OrgIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
            {membership.organizationName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
              {badge.label}
            </span>
            {membership.status !== 'active' && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-500/20">
                Onay Bekliyor
              </span>
            )}
          </div>
          {membership.units && membership.units.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 text-sm text-slate-500 dark:text-zinc-500">
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {membership.units
                  .map(u => {
                    const label = formatUnitLabel(u.blockName, u.unitNumber, membership.orgType)
                    const type = residentTypeLabel[u.residentType]
                    return type ? `${label} (${type})` : label
                  })
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all duration-200">
        {membership.role === 'admin' || membership.role === 'board_member' ? 'Yönetime Gir' : 'Görüntüle'}
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  )
}

// ─── JoinOrgModal ────────────────────────────────────────────────────────────

interface JoinOrgModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function JoinOrgModal({ open, onClose, onSuccess }: JoinOrgModalProps) {
  const { profile } = useAuth()
  const [code, setCode] = useState('')
  const [residentType, setResidentType] = useState('tenant')
  const [kvkkChecked, setKvkkChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const needsKvkk = !profile?.kvkkConsentAt

  function resetAndClose() {
    setCode('')
    setResidentType('tenant')
    setKvkkChecked(false)
    setError('')
    setSuccess(false)
    onClose()
  }

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      if (needsKvkk && kvkkChecked) {
        await api.post('/profile/kvkk-consent')
      }
      await api.post('/applications', {
        invitationCode: code.trim().toUpperCase(),
        residentType,
      })
      setSuccess(true)
      await onSuccess()
      setTimeout(resetAndClose, 1500)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Bir hata oluştu. Kodu kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const canSubmit = code.trim().length > 0 && (!needsKvkk || kvkkChecked) && !loading && !success

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6">
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
            <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Davet Koduyla Katıl</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-500">Yöneticinizden aldığınız kodu girin</p>
          </div>
        </div>

        {success ? (
          <div className="rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Başarılı! Organizasyona katıldınız.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Davet Kodu
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={10}
                className="h-10 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-colors focus:border-blue-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-0 font-mono tracking-widest text-center uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Sakin Tipi
              </label>
              <select
                value={residentType}
                onChange={e => setResidentType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 transition-colors focus:border-blue-400 dark:focus:border-zinc-500 focus:outline-none"
              >
                <option value="owner">Malik (Ev Sahibi)</option>
                <option value="tenant">Kiracı</option>
                <option value="resident">Diğer Sakin</option>
              </select>
            </div>

            {needsKvkk && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kvkkChecked}
                  onChange={e => setKvkkChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 dark:text-zinc-400">
                  Kişisel verilerimin işlenmesini kabul ediyorum (KVKK Aydınlatma Metni)
                </span>
              </label>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={!canSubmit}
              className="h-10 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Katıl
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HomePage ────────────────────────────────────────────────────────────────

export function HomePage() {
  const { profile, memberships, setActiveMembership, refreshProfile, loading, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  function selectOrg(m: Membership) {
    setActiveMembership(m)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/[0.10] dark:bg-blue-600/[0.22] blur-[140px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-6 flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/30">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight transition-colors duration-300">
              KomşuNet
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500 dark:text-zinc-400">
              {profile?.fullName}
            </span>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={signOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Hoş Geldiniz
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
            {profile?.fullName ?? 'Merhaba'}
          </h1>
          <p className="text-base text-slate-600 dark:text-zinc-400 mt-1">
            Organizasyonlarınız
          </p>
        </div>

        {loading ? (
          /* Skeleton loading */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : memberships.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
              Başlayalım
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-500 max-w-md mx-auto mb-8">
              Henüz bir organizasyonunuz yok. Yeni bir site veya apartman oluşturun, ya da mevcut birine davet koduyla katılın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/setup')}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Organizasyon Oluştur
              </button>
              <button
                onClick={() => setJoinModalOpen(true)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-white/5 px-6 py-3 text-sm font-medium text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Davet Koduyla Katıl
              </button>
            </div>
          </div>
        ) : (
          /* Org cards grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memberships.map(m => (
              <OrgCard key={m.organizationId} membership={m} onSelect={() => selectOrg(m)} />
            ))}

            {/* Create org CTA */}
            <button
              onClick={() => navigate('/setup')}
              className="group w-full text-left rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/20 p-6 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors duration-300">
                  <Plus className="h-5 w-5 text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Yeni Organizasyon Oluştur
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                    Sitenizi veya apartmanınızı yönetmeye başlayın
                  </p>
                </div>
              </div>
            </button>

            {/* Join org CTA */}
            <button
              onClick={() => setJoinModalOpen(true)}
              className="group w-full text-left rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/20 p-6 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors duration-300">
                  <KeyRound className="h-5 w-5 text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Bir Siteye Katıl
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                    Yöneticinizden aldığınız davet koduyla siteye katılın
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Join modal */}
      <JoinOrgModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={async () => { await refreshProfile() }}
      />
    </div>
  )
}
