import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import type { AnnouncementReadsResult } from '@/types'
import { User } from 'lucide-react'

interface ReadStatsProps {
  announcementId: string
  targetMemberCount: number | null
}

export function ReadStats({ announcementId, targetMemberCount }: ReadStatsProps) {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [tab, setTab] = useState<'readers' | 'non-readers'>('readers')
  const [data, setData] = useState<AnnouncementReadsResult | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    const params = new URLSearchParams({ tab, page: String(page), pageSize: '10' })
    api.get<AnnouncementReadsResult>(`/organizations/${orgId}/announcements/${announcementId}/reads?${params}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orgId, announcementId, tab, page])

  if (!data) return loading ? <div className="text-sm text-muted-foreground">Yükleniyor...</div> : null

  const readPct = targetMemberCount && targetMemberCount > 0
    ? Math.round((data.readCount / targetMemberCount) * 100)
    : 0

  return (
    <div className="rounded-lg border bg-card p-4 mt-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Okunma Durumu</h3>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-3 flex-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${readPct}%` }}
          />
        </div>
        <span className="text-sm font-medium whitespace-nowrap">
          %{readPct} okundu
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {data.readCount} / {targetMemberCount ?? 0} kişi
      </p>

      {/* Tab buttons */}
      <div className="flex gap-1 mb-3 border-b">
        <button
          onClick={() => { setTab('readers'); setPage(1) }}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'readers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Okuyanlar ({data.readCount})
        </button>
        <button
          onClick={() => { setTab('non-readers'); setPage(1) }}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'non-readers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Okumayanlar ({(targetMemberCount ?? 0) - data.readCount})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-muted-foreground py-4 text-center">Yükleniyor...</div>
      ) : tab === 'readers' && data.readers ? (
        <div className="space-y-1">
          {data.readers.map(r => (
            <div key={r.userId} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm flex-1">{r.fullName}</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(r.readAt)}</span>
            </div>
          ))}
          {data.readersTotal > 10 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50"
              >
                Önceki
              </button>
              <span className="text-xs text-muted-foreground">
                {page} / {Math.ceil(data.readersTotal / 10)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= data.readersTotal}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      ) : tab === 'non-readers' && data.nonReaders ? (
        <div className="space-y-1">
          {data.nonReaders.map(r => (
            <div key={r.userId} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{r.fullName}</span>
            </div>
          ))}
          {data.nonReadersTotal > 10 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50"
              >
                Önceki
              </button>
              <span className="text-xs text-muted-foreground">
                {page} / {Math.ceil(data.nonReadersTotal / 10)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= data.nonReadersTotal}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-4 text-center">Veri bulunamadı</div>
      )}
    </div>
  )
}
