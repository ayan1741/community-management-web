import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { NotificationItem, NotificationsListResult } from '@/types'
import { NotificationItemRow } from './NotificationItem'
import { Bell } from 'lucide-react'

export function NotificationBell() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()

  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fetch unread count
  const fetchUnreadCount = useCallback(() => {
    if (!orgId) return
    api.get<{ unreadCount: number }>(`/organizations/${orgId}/notifications/unread-count`)
      .then(r => setUnreadCount(r.data.unreadCount))
      .catch(() => {})
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [orgId, fetchUnreadCount])

  // Fetch recent notifications when popover opens
  useEffect(() => {
    if (!open || !orgId) return
    setLoading(true)
    api.get<NotificationsListResult>(`/organizations/${orgId}/notifications?pageSize=5`)
      .then(r => setItems(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, orgId])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleMarkAllRead() {
    if (!orgId) return
    try {
      await api.post(`/organizations/${orgId}/notifications/mark-read`, { notificationIds: null })
      setUnreadCount(0)
      setItems(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  async function handleMarkRead(id: string) {
    if (!orgId) return
    try {
      await api.post(`/organizations/${orgId}/notifications/mark-read`, { notificationIds: [id] })
      setUnreadCount(prev => Math.max(0, prev - 1))
      setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  if (!orgId) return null

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        aria-label="Bildirimler"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-foreground">Bildirimler</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Tümünü oku
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Yükleniyor...</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Bildiriminiz yok</p>
              </div>
            ) : (
              <div className="p-1">
                {items.map(item => (
                  <NotificationItemRow
                    key={item.id}
                    item={item}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5">
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
