import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CircleDollarSign } from 'lucide-react'
import type { DueType } from '@/types'

const categoryLabels: Record<string, string> = {
  small: 'Küçük',
  large: 'Büyük',
  commercial: 'Ticari',
  other: 'Diğer',
}

export function DueTypesPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const [dueTypes, setDueTypes] = useState<DueType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DueType | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDefaultAmount, setFormDefaultAmount] = useState('')
  const [formCategoryAmounts, setFormCategoryAmounts] = useState<Record<string, string>>({
    small: '', large: '', commercial: '', other: '',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deactivating, setDeactivating] = useState<DueType | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  useEffect(() => { if (orgId) loadDueTypes() }, [orgId])

  async function loadDueTypes() {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<DueType[]>(`/organizations/${orgId}/due-types`)
      setDueTypes(r.data)
    } catch {
      setError('Aidat tipleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setFormName('')
    setFormDesc('')
    setFormDefaultAmount('')
    setFormCategoryAmounts({ small: '', large: '', commercial: '', other: '' })
    setFormError('')
    setShowForm(true)
  }

  function openEdit(dt: DueType) {
    setEditing(dt)
    setFormName(dt.name)
    setFormDesc(dt.description ?? '')
    setFormDefaultAmount(String(dt.defaultAmount))
    const parsed = dt.categoryAmounts ? JSON.parse(dt.categoryAmounts) as Record<string, number> : {}
    setFormCategoryAmounts({
      small: parsed.small != null ? String(parsed.small) : '',
      large: parsed.large != null ? String(parsed.large) : '',
      commercial: parsed.commercial != null ? String(parsed.commercial) : '',
      other: parsed.other != null ? String(parsed.other) : '',
    })
    setFormError('')
    setShowForm(true)
  }

  function buildCategoryAmounts(): string | null {
    const result: Record<string, number> = {}
    for (const [k, v] of Object.entries(formCategoryAmounts)) {
      if (v.trim() !== '') {
        const n = parseFloat(v)
        if (!isNaN(n)) result[k] = n
      }
    }
    return Object.keys(result).length > 0 ? JSON.stringify(result) : null
  }

  async function saveDueType() {
    if (!formName.trim()) { setFormError('Ad zorunlu'); return }
    const defaultAmt = parseFloat(formDefaultAmount)
    if (isNaN(defaultAmt) || defaultAmt < 0) { setFormError('Varsayılan tutar geçersiz'); return }
    if (!orgId) return
    setSaving(true)
    setFormError('')
    const body = {
      name: formName.trim(),
      description: formDesc.trim() || null,
      defaultAmount: defaultAmt,
      categoryAmounts: buildCategoryAmounts(),
    }
    try {
      if (editing) {
        await api.put(`/organizations/${orgId}/due-types/${editing.id}`, body)
      } else {
        await api.post(`/organizations/${orgId}/due-types`, body)
      }
      setShowForm(false)
      await loadDueTypes()
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function deactivateDueType() {
    if (!deactivating || !orgId) return
    setDeactivateLoading(true)
    try {
      await api.patch(`/organizations/${orgId}/due-types/${deactivating.id}/deactivate`)
      setDeactivating(null)
      await loadDueTypes()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Pasife alma başarısız')
      setDeactivating(null)
    } finally {
      setDeactivateLoading(false)
    }
  }

  function renderCategoryAmounts(dt: DueType) {
    if (!dt.categoryAmounts) return null
    const parsed = JSON.parse(dt.categoryAmounts) as Record<string, number>
    return (
      <div className="flex flex-wrap gap-1 mt-0.5">
        {Object.entries(parsed).map(([k, v]) => (
          <span key={k} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
            {categoryLabels[k] ?? k}: {v.toLocaleString('tr-TR')} ₺
          </span>
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Aidat Tipleri</h1>
            <p className="text-sm text-slate-500 mt-0.5">Aylık aidat, asansör bakım, yakıt gibi kalemleri tanımla</p>
          </div>
          <Button onClick={openAdd}>Tip Ekle</Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tanımlı Tipler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              </div>
            ) : dueTypes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CircleDollarSign className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Henüz aidat tipi yok</p>
                <p className="text-xs text-slate-400 mt-1">İlk tipi ekleyerek başlayın.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Varsayılan Tutar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {dueTypes.map(dt => (
                    <tr key={dt.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900">{dt.name}</p>
                        {dt.description && <p className="text-xs text-slate-500 mt-0.5">{dt.description}</p>}
                        {renderCategoryAmounts(dt)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {dt.defaultAmount.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-4 py-3.5">
                        {dt.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Aktif</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Pasif</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(dt)}>Düzenle</Button>
                          {dt.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                              onClick={() => { setError(''); setDeactivating(dt) }}
                            >
                              Pasife Al
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ekle / Düzenle Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              {editing ? 'Aidat Tipini Düzenle' : 'Yeni Aidat Tipi'}
            </h2>

            <div className="space-y-4">
              <Input label="Ad *" placeholder="örn. Aylık Aidat" value={formName}
                onChange={e => setFormName(e.target.value)} autoFocus />

              <Input label="Açıklama" placeholder="opsiyonel" value={formDesc}
                onChange={e => setFormDesc(e.target.value)} />

              <Input label="Varsayılan Tutar (₺) *" type="number" placeholder="500"
                value={formDefaultAmount} onChange={e => setFormDefaultAmount(e.target.value)} />

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Kategori Bazlı Tutarlar (opsiyonel)</p>
                <p className="text-xs text-slate-500 mb-3">Boş bırakılan kategoriler için varsayılan tutar kullanılır.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['small', 'large', 'commercial', 'other'] as const).map(cat => (
                    <Input key={cat}
                      label={categoryLabels[cat]}
                      type="number"
                      placeholder={formDefaultAmount || '0'}
                      value={formCategoryAmounts[cat]}
                      onChange={e => setFormCategoryAmounts(prev => ({ ...prev, [cat]: e.target.value }))}
                    />
                  ))}
                </div>
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={saving}>İptal</Button>
              <Button onClick={saveDueType} loading={saving}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deactivating}
        title="Tipi Pasife Al"
        message={`"${deactivating?.name}" tipini pasife almak istediğinize emin misiniz? Mevcut tahakkuklar etkilenmez.`}
        confirmLabel="Pasife Al"
        loading={deactivateLoading}
        onConfirm={deactivateDueType}
        onCancel={() => setDeactivating(null)}
      />
    </AppLayout>
  )
}
