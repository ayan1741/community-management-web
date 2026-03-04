import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { NotificationItemRow } from '@/components/notifications/NotificationItem'
import type { NotificationsListResult, NotificationItem } from '@/types'
import { Bell, CheckCheck, AlertCircle } from 'lucide-react'

function getDateGroup(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 604800000)

  if (d >= today) return 'Bugün'
  if (d >= yesterday) return 'Dün'
  if (d >= weekAgo) return 'Bu Hafta'
  return 'Daha Eski'
}

export function NotificationsPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [items, setItems] = useState<NotificationItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcement' | 'due_reminder' | 'payment' | 'application'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (filter === 'unread') params.set('isRead', 'false')
    else if (filter !== 'all') params.set('type', filter)
    api.get<NotificationsListResult>(`/organizations/${orgId}/notifications?${params}`)
      .then(r => {
        setItems(r.data.items)
        setTotalCount(r.data.totalCount)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orgId, page, filter])

  async function handleMarkAllRead() {
    if (!orgId) return
    try {
      await api.post(`/organizations/${orgId}/notifications/mark-read`, { notificationIds: null })
      setItems(prev => prev.map(n => ({ ...n, isRead: true })))
      setError('')
    } catch { setError('İşlem başarısız oldu.') }
  }

  async function handleMarkRead(id: string) {
    if (!orgId) return
    try {
      await api.post(`/organizations/${orgId}/notifications/mark-read`, { notificationIds: [id] })
      setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch { setError('İşlem başarısız oldu.') }
  }

  const unreadCount = items.filter(n => !n.isRead).length
  const totalPages = Math.ceil(totalCount / 20)

  // Group by date
  const grouped = items.reduce<Record<string, NotificationItem[]>>((acc, item) => {
    const group = getDateGroup(item.createdAt)
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  const groupOrder = ['Bugün', 'Dün', 'Bu Hafta', 'Daha Eski']

  return (
    <AdminLayout>
      <PageHeader
        title="Bildirimler"
        description="Tüm bildirimlerinizi buradan takip edin"
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tümünü Oku
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 mb-4 border-b">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'unread', label: `Okunmamış` },
          { key: 'announcement', label: 'Duyuru' },
          { key: 'due_reminder', label: 'Aidat' },
          { key: 'application', label: 'Başvuru' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setFilter(t.key as any); setPage(1) }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Bildiriminiz yok</p>
          <p className="text-sm text-muted-foreground mt-1">Yeni bildirimler burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupOrder.map(group => {
            const groupItems = grouped[group]
            if (!groupItems || groupItems.length === 0) return null
            return (
              <div key={group}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {group}
                </h3>
                <div className="space-y-0.5">
                  {groupItems.map(item => (
                    <NotificationItemRow
                      key={item.id}
                      item={item}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Önceki
          </button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
