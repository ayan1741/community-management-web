import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { FadeIn } from '@/hooks/useInView'
import { api } from '@/lib/api'
import { formatUnitLabel } from '@/utils/formatUnitLabel'
import type { Membership } from '@/types'
import {
  Building2, Home, Plus, KeyRound, ChevronRight, LogOut,
  Sun, Moon, X, AlertCircle, Loader2, CheckCircle2,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

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

const inputCls = 'h-11 w-full rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/50 px-3.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 shadow-sm shadow-slate-100 dark:shadow-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-blue-500/20'

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-px bg-gradient-to-b from-slate-200/60 via-slate-200/30 to-slate-200/60 dark:from-zinc-700/40 dark:via-zinc-800/20 dark:to-zinc-700/40">
      <div className="rounded-[15px] bg-white/90 dark:bg-zinc-900/80 p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="flex-1">
            <div className="h-4 w-36 rounded-lg bg-slate-200 dark:bg-zinc-700 mb-2.5" />
            <div className="h-3 w-20 rounded-lg bg-slate-100 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="h-3 w-48 rounded-lg bg-slate-100 dark:bg-zinc-800 mt-4" />
      </div>
    </div>
  )
}

// ─── Org Card ─────────────────────────────────────────────────────────────────

function OrgCard({ membership, onSelect, index }: { membership: Membership; onSelect: () => void; index: number }) {
  const badge = roleBadgeConfig[membership.role] ?? {
    label: membership.role,
    cls: 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700',
  }
  const OrgIcon = membership.orgType === 'apartment' ? Home : Building2

  return (
    <FadeIn delay={0.1 + index * 0.08}>
      <button
        onClick={onSelect}
        className="group w-full text-left rounded-2xl p-px bg-gradient-to-b from-slate-200/80 via-slate-200/40 to-slate-200/80 dark:from-zinc-700/50 dark:via-zinc-800/30 dark:to-zinc-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="rounded-[15px] bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20 shrink-0">
              <OrgIcon className="h-5 w-5 text-white" />
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
            </div>
          </div>

          {/* Units info */}
          {membership.units && membership.units.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-sm text-slate-500 dark:text-zinc-500">
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

          {/* CTA */}
          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all duration-200">
            {membership.role === 'admin' || membership.role === 'board_member' ? 'Yönetime Gir' : 'Görüntüle'}
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    </FadeIn>
  )
}

// ─── JoinOrgModal ─────────────────────────────────────────────────────────────

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
      <div className="relative w-full max-w-md rounded-2xl p-px bg-gradient-to-b from-slate-200/80 via-slate-200/40 to-slate-200/80 dark:from-zinc-700/50 dark:via-zinc-800/30 dark:to-zinc-700/50 shadow-2xl">
        <div className="rounded-[15px] bg-white dark:bg-zinc-900 backdrop-blur-sm p-6">
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20">
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Davet Koduyla Katıl</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Yöneticinizden aldığınız kodu girin</p>
            </div>
          </div>

          {success ? (
            <div className="rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                  className={inputCls + ' font-mono tracking-widest text-center uppercase'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                  Sakin Tipi
                </label>
                <select
                  value={residentType}
                  onChange={e => setResidentType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/50 px-3.5 text-sm text-slate-900 dark:text-zinc-100 shadow-sm shadow-slate-100 dark:shadow-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
                >
                  <option value="owner">Malik (Ev Sahibi)</option>
                  <option value="tenant">Kiracı</option>
                  <option value="resident">Diğer Sakin</option>
                </select>
              </div>

              {needsKvkk && (
                <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={kvkkChecked}
                    onChange={e => setKvkkChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-800"
                  />
                  <span className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                    Kişisel verilerimin işlenmesini kabul ediyorum (KVKK Aydınlatma Metni)
                  </span>
                </label>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={!canSubmit}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Katılınıyor…</>
                ) : 'Katıl'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { profile, memberships, setActiveMembership, refreshProfile, loading, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  function selectOrg(m: Membership) {
    setActiveMembership(m)
    navigate('/dashboard')
  }

  const gridStyle = {
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">

      {/* ── Background effects ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/[0.08] dark:bg-blue-600/[0.18] blur-[140px]" />
        <div className="absolute inset-0" style={gridStyle} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-transparent to-slate-50/80 dark:from-zinc-950/0 dark:via-transparent dark:to-zinc-950/80" />
      </div>

      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 transition-colors duration-300">
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/[0.06]" />
        <div className="relative mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <Building2 className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              KomşuNet
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* User name pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] px-3.5 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                {profile?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
              </div>
              <span className="text-[13px] font-medium text-slate-600 dark:text-zinc-400">
                {profile?.fullName}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Tema değiştir"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-200"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={signOut}
              title="Çıkış Yap"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-16">

        {/* Welcome banner */}
        <FadeIn>
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {getGreeting()}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
                  {profile?.fullName ?? 'Merhaba'}
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-500 ml-16">
              Organizasyonlarınızı yönetin veya yeni bir topluluğa katılın
            </p>
          </div>
        </FadeIn>

        {loading ? (
          /* Skeleton loading */
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="h-4 w-40 rounded-lg bg-slate-200 dark:bg-zinc-700 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </FadeIn>
        ) : memberships.length === 0 ? (
          /* Empty state */
          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm p-8 md:p-12">
              <div className="text-center py-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/25">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
                  Başlayalım
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
                  Henüz bir organizasyonunuz yok. Yeni bir site veya apartman oluşturun,
                  ya da mevcut birine davet koduyla katılın.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/setup')}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Organizasyon Oluştur
                  </button>
                  <button
                    onClick={() => setJoinModalOpen(true)}
                    className="w-full sm:w-auto rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-800/40 px-6 py-3 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    Davet Koduyla Katıl
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        ) : (
          /* Org cards — inside container box */
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm p-6">
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                    Organizasyonlarınız
                  </p>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15 px-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {memberships.length}
                  </span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberships.map((m, i) => (
                  <OrgCard key={m.organizationId} membership={m} onSelect={() => selectOrg(m)} index={i} />
                ))}

                {/* Create org CTA */}
                <FadeIn delay={0.1 + memberships.length * 0.08}>
                  <button
                    onClick={() => navigate('/setup')}
                    className="group w-full h-full text-left rounded-2xl border-2 border-dashed border-slate-300/60 dark:border-zinc-700/40 bg-transparent p-6 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-800/50 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors duration-300">
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
                </FadeIn>

                {/* Join org CTA */}
                <FadeIn delay={0.18 + memberships.length * 0.08}>
                  <button
                    onClick={() => setJoinModalOpen(true)}
                    className="group w-full h-full text-left rounded-2xl border-2 border-dashed border-slate-300/60 dark:border-zinc-700/40 bg-transparent p-6 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-800/50 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors duration-300">
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
                </FadeIn>
              </div>
            </div>
          </FadeIn>
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
