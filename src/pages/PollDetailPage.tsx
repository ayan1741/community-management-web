import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { pollStatusConfig, pollTypeLabels } from '@/lib/poll-helpers'
import { formatDate, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PollDetailResult, PollResultDto, PollOptionDto } from '@/types'
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react'

export function PollDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const navigate = useNavigate()

  const [detail, setDetail] = useState<PollDetailResult | null>(null)
  const [result, setResult] = useState<PollResultDto | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [changingVote, setChangingVote] = useState(false)
  const [error, setError] = useState('')

  const basePath = isAdmin ? '/admin/polls' : '/polls'

  const loadDetail = useCallback(async () => {
    if (!orgId || !id) return
    setLoading(true); setError('')
    try {
      const r = await api.get<PollDetailResult>(`/organizations/${orgId}/polls/${id}`)
      setDetail(r.data)
      setSelectedOption(r.data.userVote?.pollOptionId ?? null)

      if (r.data.poll.status !== 'aktif' || r.data.poll.showInterimResults) {
        try {
          const res = await api.get<PollResultDto>(`/organizations/${orgId}/polls/${id}/result`)
          setResult(res.data)
        } catch { /* may not be available yet */ }
      }
    } catch {
      setError('Oylama yuklenirken hata olustu.')
    } finally { setLoading(false) }
  }, [orgId, id])

  useEffect(() => { loadDetail() }, [loadDetail])

  async function handleVote() {
    if (!orgId || !id || !selectedOption) return
    setVoting(true); setError('')
    try {
      await api.post(`/organizations/${orgId}/polls/${id}/vote`, { pollOptionId: selectedOption })
      setChangingVote(false)
      loadDetail()
    } catch {
      setError('Oy kullanilirken hata olustu.')
    } finally { setVoting(false) }
  }

  async function handleEnd() {
    if (!orgId || !id) return
    if (!confirm('Oylamayi erken sonlandirmak istediginize emin misiniz?')) return
    try {
      await api.put(`/organizations/${orgId}/polls/${id}/end`)
      loadDetail()
    } catch { setError('Sonlandirma isleminde hata olustu.') }
  }

  async function handleCancel() {
    if (!orgId || !id) return
    if (!confirm('Oylamayi iptal etmek istediginize emin misiniz?')) return
    try {
      await api.put(`/organizations/${orgId}/polls/${id}/cancel`)
      loadDetail()
    } catch { setError('Iptal isleminde hata olustu.') }
  }

  async function handleExtend() {
    const input = prompt('Yeni bitis tarihini girin (YYYY-MM-DD):')
    if (!input || !orgId || !id) return
    const parsed = new Date(input + 'T23:59:59Z')
    if (isNaN(parsed.getTime())) { setError('Gecersiz tarih formati. YYYY-MM-DD girin.'); return }
    try {
      const newEndsAt = parsed.toISOString()
      await api.put(`/organizations/${orgId}/polls/${id}/extend`, { newEndsAt })
      loadDetail()
    } catch { setError('Sure uzatma isleminde hata olustu.') }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto py-8 text-center text-muted-foreground">Yukleniyor...</div>
      </AdminLayout>
    )
  }

  if (!detail) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto py-8 text-center">
          {error && <p className="text-red-600">{error}</p>}
          <button onClick={() => navigate(basePath)} className="text-sm text-primary mt-4">Listeye don</button>
        </div>
      </AdminLayout>
    )
  }

  const { poll, options, userVote } = detail
  const st = pollStatusConfig[poll.status]
  const isActive = poll.status === 'aktif'
  const hasVoted = !!userVote && !changingVote
  const canVote = isActive
  const showResults = !isActive || poll.showInterimResults
  const pct = poll.totalMemberCount > 0
    ? Math.round(((result?.totalVoteCount ?? 0) / poll.totalMemberCount) * 100) : 0

  // For result display, find max vote count
  const resultOptions = result?.options ?? options
  const maxVotes = Math.max(...resultOptions.map(o => o.voteCount), 1)

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(basePath)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Oylamalar
        </button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{poll.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', st.class)}>
                  {st.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pollTypeLabels[poll.pollType]}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(poll.startsAt)} - {formatDate(poll.endsAt)}
                </span>
              </div>
            </div>
          </div>

          {poll.description && (
            <p className="text-sm text-foreground whitespace-pre-wrap mb-4">{poll.description}</p>
          )}

          {/* Participation bar */}
          {showResults && result && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Katilim</span>
                <span>{result.totalVoteCount}/{poll.totalMemberCount} (%{pct})</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Voting form */}
          {canVote && (
            <div className="space-y-2 mb-4">
              {[...options].sort((a, b) => a.displayOrder - b.displayOrder).map(opt => (
                <label
                  key={opt.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedOption === opt.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <input
                    type="radio"
                    name="vote"
                    value={opt.id}
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}

              {hasVoted ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 mt-2">
                  <span>Oyunuz kaydedildi.</span>
                  <button
                    onClick={() => { setChangingVote(true); setSelectedOption(null) }}
                    className="text-primary underline"
                  >
                    Oyumu Degistir
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleVote}
                  disabled={voting || !selectedOption}
                  className="w-full mt-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {voting ? 'Gonderiliyor...' : 'Oyumu Gonder'}
                </button>
              )}
            </div>
          )}

          {/* Results (closed or interim) */}
          {showResults && resultOptions.length > 0 && (
            <div className="space-y-3 mb-4">
              {[...resultOptions].sort((a: PollOptionDto, b: PollOptionDto) => a.displayOrder - b.displayOrder).map((opt: PollOptionDto) => {
                const total = result?.totalVoteCount ?? 1
                const optPct = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0
                const isWinner = opt.voteCount === maxVotes && !isActive
                const isUserChoice = userVote?.pollOptionId === opt.id
                return (
                  <div key={opt.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={cn('text-foreground', isUserChoice && 'font-medium')}>
                        {opt.label}
                        {isUserChoice && <span className="text-xs text-primary ml-2">Oyunuz</span>}
                      </span>
                      <span className="text-muted-foreground">{opt.voteCount} (%{optPct})</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          isWinner ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'
                        )}
                        style={{ width: `${optPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            Bu oylama karar alma surecine destek amaclidir, KMK kapsaminda hukuki baglayiciligi yoktur.
          </div>

          {/* Admin actions */}
          {isAdmin && isActive && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleEnd}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                Erken Sonlandir
              </button>
              <button
                onClick={handleExtend}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                Sure Uzat
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Iptal Et
              </button>
            </div>
          )}

          {/* Admin: Save as decision (for closed polls) */}
          {isAdmin && poll.status === 'kapandi' && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => navigate(`/admin/decisions?fromPoll=${id}`)}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Karar Olarak Kaydet
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Olusturan: {poll.createdByName} · {formatDateTime(poll.createdAt)}
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
