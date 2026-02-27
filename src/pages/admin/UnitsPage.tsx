import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { BulkUnitWizard } from '@/components/units/BulkUnitWizard'
import { DoorOpen } from 'lucide-react'
import type { Block, Unit, PagedResult } from '@/types'

const unitTypeLabels: Record<string, string> = {
  residential: 'Konut',
  shop: 'Dükkan',
  storage: 'Depo',
  parking: 'Otopark',
  other: 'Diğer',
}

const unitTypeOptions = ['residential', 'shop', 'storage', 'parking', 'other']

const selectClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10'

export function UnitsPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [units, setUnits] = useState<Unit[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])

  const pageSize = 20
  const [page, setPage] = useState(1)
  const [filterBlockId, setFilterBlockId] = useState('')
  const [filterUnitType, setFilterUnitType] = useState('')
  const [filterIsOccupied, setFilterIsOccupied] = useState<'' | 'true' | 'false'>('')
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [form, setForm] = useState({
    blockId: '',
    unitNumber: '',
    unitType: 'residential',
    floor: '',
    areaSqm: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showBulkWizard, setShowBulkWizard] = useState(false)

  useEffect(() => {
    if (!orgId) return
    api.get<Block[]>(`/organizations/${orgId}/blocks`).then(r => setBlocks(r.data)).catch(() => {})
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    loadUnits()
  }, [orgId, page, filterBlockId, filterUnitType, filterIsOccupied, appliedSearch])

  async function loadUnits() {
    if (!orgId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (filterBlockId) params.set('blockId', filterBlockId)
      if (filterUnitType) params.set('unitType', filterUnitType)
      if (filterIsOccupied) params.set('isOccupied', filterIsOccupied)
      if (appliedSearch) params.set('search', appliedSearch)
      const r = await api.get<PagedResult<Unit>>(`/organizations/${orgId}/units?${params}`)
      setUnits(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch {
      setError('Daireler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setAppliedSearch(searchInput)
  }

  function openAdd() {
    setEditingUnit(null)
    setForm({ blockId: blocks[0]?.id ?? '', unitNumber: '', unitType: 'residential', floor: '', areaSqm: '', notes: '' })
    setFormError('')
    setShowForm(true)
  }

  function openEdit(unit: Unit) {
    setEditingUnit(unit)
    setForm({
      blockId: unit.blockId,
      unitNumber: unit.unitNumber,
      unitType: unit.unitType,
      floor: unit.floor != null ? String(unit.floor) : '',
      areaSqm: unit.areaSqm != null ? String(unit.areaSqm) : '',
      notes: unit.notes ?? '',
    })
    setFormError('')
    setShowForm(true)
  }

  async function saveUnit() {
    if (!form.unitNumber.trim()) { setFormError('Daire numarası zorunlu'); return }
    if (!form.blockId) { setFormError('Blok seçimi zorunlu'); return }
    if (!orgId) return
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        blockId: form.blockId,
        unitNumber: form.unitNumber.trim(),
        unitType: form.unitType,
        floor: form.floor ? parseInt(form.floor) : null,
        areaSqm: form.areaSqm ? parseFloat(form.areaSqm) : null,
        notes: form.notes.trim() || null,
      }
      if (editingUnit) {
        await api.put(`/organizations/${orgId}/units/${editingUnit.id}`, payload)
      } else {
        await api.post(`/organizations/${orgId}/units`, payload)
      }
      setShowForm(false)
      await loadUnits()
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function deleteUnit() {
    if (!deletingUnit || !orgId) return
    setDeleteLoading(true)
    try {
      await api.delete(`/organizations/${orgId}/units/${deletingUnit.id}`)
      setDeletingUnit(null)
      await loadUnits()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Silme başarısız')
      setDeletingUnit(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Daireler</h1>
            <p className="text-sm text-slate-500 mt-0.5">{totalCount} daire</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowBulkWizard(true)}>Toplu Ekle</Button>
            <Button onClick={openAdd}>Daire Ekle</Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        {/* Filter row */}
        <Card className="mb-4">
          <div className="px-4 py-3">
            <form className="flex flex-wrap gap-3 items-end" onSubmit={handleSearch}>
              <div className="min-w-[150px]">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Blok</label>
                <select
                  value={filterBlockId}
                  onChange={e => { setFilterBlockId(e.target.value); setPage(1) }}
                  className={selectClass}
                >
                  <option value="">Tüm Bloklar</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Tip</label>
                <select
                  value={filterUnitType}
                  onChange={e => { setFilterUnitType(e.target.value); setPage(1) }}
                  className={selectClass}
                >
                  <option value="">Tüm Tipler</option>
                  {unitTypeOptions.map(t => <option key={t} value={t}>{unitTypeLabels[t]}</option>)}
                </select>
              </div>
              <div className="min-w-[130px]">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Doluluk</label>
                <select
                  value={filterIsOccupied}
                  onChange={e => { setFilterIsOccupied(e.target.value as '' | 'true' | 'false'); setPage(1) }}
                  className={selectClass}
                >
                  <option value="">Tümü</option>
                  <option value="true">Dolu</option>
                  <option value="false">Boş</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px] flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Ara</label>
                  <Input
                    placeholder="Daire no..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary">Ara</Button>
              </div>
            </form>
          </div>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              </div>
            ) : units.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <DoorOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Daire bulunamadı</p>
                <p className="text-xs text-slate-400 mt-1">Filtre kriterlerini değiştirin veya yeni daire ekleyin.</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Blok</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Tip</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Kat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-slate-600">{u.blockName}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-900">{u.unitNumber}</td>
                        <td className="px-4 py-3.5 text-slate-600">{unitTypeLabels[u.unitType] ?? u.unitType}</td>
                        <td className="px-4 py-3.5 text-slate-600">{u.floor ?? '-'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.isOccupied ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isOccupied ? 'bg-green-500' : 'bg-slate-400'}`} />
                            {u.isOccupied ? 'Dolu' : 'Boş'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>Düzenle</Button>
                            {!u.isOccupied && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => { setError(''); setDeletingUnit(u) }}
                              >
                                Sil
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      {totalCount} sonuçtan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        ← Önceki
                      </Button>
                      <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                        Sonraki →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              {editingUnit ? 'Daireyi Düzenle' : 'Yeni Daire Ekle'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Blok</label>
                <select
                  value={form.blockId}
                  onChange={e => setForm(f => ({ ...f, blockId: e.target.value }))}
                  className={selectClass}
                >
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <Input
                label="Daire Numarası"
                placeholder="örn. 101"
                value={form.unitNumber}
                onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))}
              />
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Tip</label>
                <select
                  value={form.unitType}
                  onChange={e => setForm(f => ({ ...f, unitType: e.target.value }))}
                  className={selectClass}
                >
                  {unitTypeOptions.map(t => <option key={t} value={t}>{unitTypeLabels[t]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Kat (opsiyonel)"
                  type="number"
                  placeholder="3"
                  value={form.floor}
                  onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                />
                <Input
                  label="Alan m² (opsiyonel)"
                  type="number"
                  placeholder="85"
                  value={form.areaSqm}
                  onChange={e => setForm(f => ({ ...f, areaSqm: e.target.value }))}
                />
              </div>
              <Input
                label="Notlar (opsiyonel)"
                placeholder="Ek bilgi..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={saving}>İptal</Button>
              <Button onClick={saveUnit} loading={saving}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deletingUnit}
        title="Daireyi Sil"
        message={`"${deletingUnit?.blockName} - ${deletingUnit?.unitNumber}" dairesini silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        loading={deleteLoading}
        onConfirm={deleteUnit}
        onCancel={() => setDeletingUnit(null)}
      />

      {showBulkWizard && (
        <BulkUnitWizard
          blocks={blocks}
          orgId={orgId!}
          onComplete={() => { setShowBulkWizard(false); loadUnits() }}
          onCancel={() => setShowBulkWizard(false)}
        />
      )}
    </AppLayout>
  )
}
