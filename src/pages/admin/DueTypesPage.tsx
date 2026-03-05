import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { CircleDollarSign, Info, Tag } from 'lucide-react'
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
          <span key={k} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
            {categoryLabels[k] ?? k}: {v.toLocaleString('tr-TR')} ₺
          </span>
        ))}
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader icon={Tag} title="Aidat Tipleri" description="Aylık aidat, asansör bakım, yakıt gibi kalemleri tanımla" actions={<Button onClick={openAdd}>Tip Ekle</Button>} />

        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <Info className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Aidat tipleri, sakinlere kesilecek fatura kalemlerini temsil eder. Örneğin "Aylık Aidat"
          tüm ortak giderleri (temizlik, güvenlik, asansör bakım vb.) içerir. Özel durumlar için
          (çatı tamiri, boya) ayrı aidat tipi oluşturabilirsiniz.
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
        )}

        <TableCard title="Tanımlı Tipler">
            {loading ? (
              <TableSkeleton />
            ) : dueTypes.length === 0 ? (
              <EmptyState icon={CircleDollarSign} title="Henüz aidat tipi yok" description="İlk tipi ekleyerek başlayın." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Varsayılan Tutar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {dueTypes.map(dt => (
                    <tr key={dt.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground">{dt.name}</p>
                        {dt.description && <p className="text-xs text-muted-foreground mt-0.5">{dt.description}</p>}
                        {renderCategoryAmounts(dt)}
                      </td>
                      <td className="px-4 py-3.5 text-foreground font-medium">
                        {dt.defaultAmount.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-4 py-3.5">
                        {dt.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Aktif</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Pasif</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(dt)}>Düzenle</Button>
                          {dt.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-warning hover:text-warning hover:bg-warning/10"
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
        </TableCard>
      </div>

      {/* Ekle / Düzenle Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-foreground mb-5">
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
                <p className="text-sm font-medium text-foreground mb-2">Kategori Bazlı Tutarlar (opsiyonel)</p>
                <p className="text-xs text-muted-foreground mb-3">Boş bırakılan kategoriler için varsayılan tutar kullanılır.</p>
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

              {formError && <p className="text-sm text-destructive">{formError}</p>}
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
    </AdminLayout>
  )
}
