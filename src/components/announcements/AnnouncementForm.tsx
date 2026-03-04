import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Block, AnnouncementDetail, AttachmentInfo } from '@/types'
import { formatFileSize, safeParse } from '@/lib/format'
import { X, Upload, FileText } from 'lucide-react'

const categories = [
  { value: 'general', label: 'Genel' },
  { value: 'urgent', label: 'Acil' },
  { value: 'maintenance', label: 'Bakım' },
  { value: 'meeting', label: 'Toplantı' },
  { value: 'financial', label: 'Mali' },
  { value: 'other', label: 'Diğer' },
]

const priorities = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Önemli' },
  { value: 'urgent', label: 'Acil' },
]

interface AnnouncementFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editData?: AnnouncementDetail | null
}

export function AnnouncementForm({ open, onClose, onSaved, editData }: AnnouncementFormProps) {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('normal')
  const [targetType, setTargetType] = useState('all')
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState('')
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!editData

  useEffect(() => {
    if (!open) return
    if (editData) {
      setTitle(editData.title)
      setBody(editData.body)
      setCategory(editData.category)
      setPriority(editData.priority)
      setTargetType(editData.targetType)
      if (editData.targetIds) {
        const ids = safeParse<string[]>(editData.targetIds, [])
        if (editData.targetType === 'block') setSelectedBlockIds(ids)
        if (editData.targetType === 'role') setSelectedRoles(ids)
      }
      if (editData.expiresAt) setExpiresAt(editData.expiresAt.split('T')[0])
      if (editData.attachmentUrls) setAttachments(safeParse<AttachmentInfo[]>(editData.attachmentUrls, []))
    } else {
      setTitle(''); setBody(''); setCategory('general'); setPriority('normal')
      setTargetType('all'); setSelectedBlockIds([]); setSelectedRoles([])
      setExpiresAt(''); setAttachments([])
    }
    setError('')
  }, [open, editData])

  useEffect(() => {
    if (!orgId) return
    api.get<Block[]>(`/organizations/${orgId}/blocks`).then(r => setBlocks(r.data)).catch(() => {})
  }, [orgId])

  function getTargetIds(): string[] | undefined {
    if (targetType === 'block') return selectedBlockIds
    if (targetType === 'role') return selectedRoles
    return undefined
  }

  async function handleSaveDraft() {
    if (!orgId) return
    setSaving(true); setError('')
    try {
      const payload = {
        title, body, category, priority, targetType,
        targetIds: getTargetIds(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }
      if (isEdit) {
        await api.put(`/organizations/${orgId}/announcements/${editData!.id}`, payload)
      } else {
        await api.post(`/organizations/${orgId}/announcements`, payload)
      }
      onSaved(); onClose()
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.Message || 'Bir hata oluştu.')
    } finally { setSaving(false) }
  }

  async function handlePublish() {
    if (!orgId) return
    setPublishing(true); setError('')
    try {
      let announcementId = editData?.id
      const payload = {
        title, body, category, priority, targetType,
        targetIds: getTargetIds(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }
      if (isEdit) {
        await api.put(`/organizations/${orgId}/announcements/${editData!.id}`, payload)
      } else {
        const r = await api.post(`/organizations/${orgId}/announcements`, payload)
        announcementId = r.data.id
      }
      await api.post(`/organizations/${orgId}/announcements/${announcementId}/publish`)
      onSaved(); onClose()
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.Message || 'Bir hata oluştu.')
    } finally { setPublishing(false) }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !orgId) return
    if (attachments.length >= 5) { setError('En fazla 5 dosya eklenebilir.'); return }
    if (file.size > 10485760) { setError('Dosya boyutu 10MB\'ı aşamaz.'); return }

    // File upload requires an existing announcement — save draft first if new
    let announcementId = editData?.id
    if (!announcementId) {
      setError('Dosya eklemek için önce taslağı kaydedin.'); return
    }

    setUploading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const r = await api.post(`/organizations/${orgId}/announcements/${announcementId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAttachments(prev => [...prev, r.data])
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.Message || 'Dosya yüklenemedi.')
    } finally { setUploading(false) }
    e.target.value = ''
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative bg-card border rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-card rounded-t-xl">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Oluştur'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}

          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Başlık *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Duyuru başlığını girin"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              maxLength={200}
            />
          </div>

          {/* İçerik */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">İçerik *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Duyuru içeriğini yazın..."
              rows={6}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Kategori + Öncelik */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Öncelik</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Hedef Kitle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hedef Kitle</label>
            <div className="flex gap-4">
              {[
                { value: 'all', label: 'Tüm site' },
                { value: 'block', label: 'Belirli bloklar' },
                { value: 'role', label: 'Belirli roller' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio" name="targetType" value={opt.value}
                    checked={targetType === opt.value}
                    onChange={() => setTargetType(opt.value)}
                    className="accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Blok Seçimi */}
          {targetType === 'block' && blocks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Blok Seçimi</label>
              <div className="flex flex-wrap gap-2">
                {blocks.map(b => (
                  <label key={b.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBlockIds.includes(b.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBlockIds(prev => [...prev, b.id])
                        else setSelectedBlockIds(prev => prev.filter(id => id !== b.id))
                      }}
                      className="accent-primary"
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Rol Seçimi */}
          {targetType === 'role' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Rol Seçimi</label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'admin', label: 'Admin' },
                  { value: 'board_member', label: 'Yönetim Kurulu' },
                  { value: 'resident', label: 'Sakin' },
                ].map(r => (
                  <label key={r.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(r.value)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRoles(prev => [...prev, r.value])
                        else setSelectedRoles(prev => prev.filter(v => v !== r.value))
                      }}
                      className="accent-primary"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Son Geçerlilik */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Son Geçerlilik Tarihi (opsiyonel)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Dosya Ekleri */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Dosya Ekleri (maks. 5 dosya, 10MB/dosya)
              </label>
              {attachments.length > 0 && (
                <div className="space-y-1 mb-2">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-1.5">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{a.name}</span>
                      <span className="text-muted-foreground text-xs">{formatFileSize(a.size)}</span>
                    </div>
                  ))}
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? 'Yükleniyor...' : 'Dosya Ekle'}
                <input
                  type="file" className="hidden"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card rounded-b-xl">
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing || !title.trim() || !body.trim()}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing || !title.trim() || !body.trim()}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {publishing ? 'Yayınlanıyor...' : 'Yayınla'}
          </button>
        </div>
      </div>
    </div>
  )
}
