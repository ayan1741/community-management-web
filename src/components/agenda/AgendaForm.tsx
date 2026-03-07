import { useState, useEffect } from 'react'
import type { AgendaCategory, AgendaItemDetail } from '@/types'
import { agendaCategoryConfig } from '@/lib/agenda-helpers'

interface AgendaFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: { title: string; description: string; category: AgendaCategory }) => Promise<void>
  initialData?: AgendaItemDetail | null
}

export function AgendaForm({ open, onClose, onSave, initialData }: AgendaFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<AgendaCategory>('genel')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? '')
      setDescription(initialData?.description ?? '')
      setCategory(initialData?.category ?? 'genel')
      setError('')
    }
  }, [open, initialData])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Baslik zorunludur.'); return }
    if (title.length > 200) { setError('Baslik en fazla 200 karakter olabilir.'); return }
    if (description.length > 2000) { setError('Aciklama en fazla 2000 karakter olabilir.'); return }
    setSaving(true); setError('')
    try {
      await onSave({ title: title.trim(), description: description.trim(), category })
      onClose()
    } catch {
      setError('Kaydedilirken bir hata olustu.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {initialData ? 'Gundem Maddesini Duzenle' : 'Yeni Gundem Maddesi'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Baslik *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Gundem maddesi basligi"
            />
            <span className="text-xs text-muted-foreground">{title.length}/200</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Aciklama</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              placeholder="Detayli aciklama (opsiyonel)"
            />
            <span className="text-xs text-muted-foreground">{description.length}/2000</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as AgendaCategory)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {(Object.entries(agendaCategoryConfig) as [AgendaCategory, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Iptal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? 'Kaydediliyor...' : (initialData ? 'Guncelle' : 'Olustur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
