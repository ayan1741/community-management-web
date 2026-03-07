import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { categoryConfig, priorityConfig } from '@/lib/maintenance-helpers'
import type { UnitDropdownItem, MaintenanceCategory, MaintenancePriority } from '@/types'
import { X, Camera, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const MAX_PHOTOS = 5
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function MaintenanceForm({ open, onClose, onSaved }: Props) {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin' || activeMembership?.role === 'board_member'
  const userUnits = activeMembership?.units ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<MaintenanceCategory>('diger')
  const [priority, setPriority] = useState<MaintenancePriority>('normal')
  const [locationType, setLocationType] = useState<'unit' | 'common_area'>('unit')
  const [unitId, setUnitId] = useState('')
  const [locationNote, setLocationNote] = useState('')

  // Photos (local files before upload)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | undefined>(undefined)

  // All units (admin)
  const [allUnits, setAllUnits] = useState<UnitDropdownItem[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load units for admin
  useEffect(() => {
    if (!open || !orgId || !isAdmin) return
    api.get<UnitDropdownItem[]>(`/organizations/${orgId}/units/dropdown`)
      .then(r => setAllUnits(r.data))
      .catch(() => {})
  }, [open, orgId, isAdmin])

  // Auto-select if resident has single unit
  useEffect(() => {
    if (!isAdmin && userUnits.length === 1) {
      setUnitId(userUnits[0].unitId)
    }
  }, [isAdmin, userUnits])

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setTitle(''); setDescription(''); setCategory('diger'); setPriority('normal')
      setLocationType('unit'); setUnitId(''); setLocationNote('')
      setPhotos([]); setPreviews([]); setError('')
    }
  }, [open])

  // Clean up preview URLs on unmount only (removePhoto already revokes individually)
  useEffect(() => {
    return () => { previews.forEach(URL.revokeObjectURL) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFileSelect(files: FileList | null) {
    if (!files) return
    const newFiles: File[] = []
    for (const f of Array.from(files)) {
      if (photos.length + newFiles.length >= MAX_PHOTOS) break
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`Gecersiz format: ${f.name}. JPEG, PNG veya WebP yukleyin.`)
        continue
      }
      if (f.size > MAX_SIZE) {
        setError(`${f.name} 5MB'dan buyuk.`)
        continue
      }
      newFiles.push(f)
    }
    if (newFiles.length > 0) {
      setPhotos(prev => [...prev, ...newFiles])
      setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
      setError('')
    }
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(previews[idx])
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    if (!title.trim()) { setError('Baslik zorunludur.'); return }
    if (!description.trim() || description.trim().length < 10) { setError('Aciklama en az 10 karakter olmalidir.'); return }
    if (locationType === 'unit' && !unitId) { setError('Daire secimi zorunludur.'); return }

    setSaving(true); setError('')
    try {
      // 1. Create request
      const body = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        locationType,
        unitId: locationType === 'unit' ? unitId : null,
        locationNote: locationNote.trim() || null,
      }
      const res = await api.post<{ id: string }>(
        `/organizations/${orgId}/maintenance-requests`, body)
      const requestId = res.data.id

      // 2. Upload photos
      for (const photo of photos) {
        const fd = new FormData()
        fd.append('file', photo)
        await api.post(
          `/organizations/${orgId}/maintenance-requests/${requestId}/photos`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
      }

      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bildirim olusturulamadi.')
    } finally { setSaving(false) }
  }

  if (!open) return null

  const unitOptions = isAdmin
    ? allUnits
    : userUnits.map(u => ({ id: u.unitId, blockName: u.blockName, unitNumber: u.unitNumber, blockId: '', isOccupied: true }))

  // Group units by block for admin
  const groupedUnits = unitOptions.reduce<Record<string, typeof unitOptions>>((acc, u) => {
    const block = u.blockName ?? 'Diger'
    if (!acc[block]) acc[block] = []
    acc[block].push(u)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8" onClick={onClose}>
      <div
        className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-foreground">Yeni Ariza Bildirimi</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Baslik *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Ariza basligini girin"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Aciklama *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Sorunu detayli olarak aciklayin (en az 10 karakter)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {(Object.entries(categoryConfig) as [MaintenanceCategory, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Oncelik</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as MaintenancePriority)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {(Object.entries(priorityConfig) as [MaintenancePriority, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Konum</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={locationType === 'unit'}
                  onChange={() => setLocationType('unit')}
                  className="accent-primary"
                />
                Daire
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={locationType === 'common_area'}
                  onChange={() => setLocationType('common_area')}
                  className="accent-primary"
                />
                Ortak Alan
              </label>
            </div>
          </div>

          {/* Unit selector */}
          {locationType === 'unit' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Daire *</label>
              <select
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Daire secin...</option>
                {Object.entries(groupedUnits).map(([block, units]) => (
                  <optgroup key={block} label={block}>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.blockName ? `${u.blockName} - ` : ''}{u.unitNumber}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Location note */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Konum Notu</label>
            <input
              value={locationNote}
              onChange={e => setLocationNote(e.target.value)}
              placeholder="orn: 3. kat koridor, A Blok giris kapisi"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Fotograflar ({photos.length}/{MAX_PHOTOS})
            </label>
            <div className="flex flex-wrap gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Ekle</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef as React.RefObject<HTMLInputElement>}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e.target.files)}
            />
            <p className="text-[11px] text-muted-foreground mt-1">JPEG, PNG veya WebP. Maks 5MB.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Olusturuluyor...' : 'Bildirim Olustur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
