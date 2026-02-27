import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Layers } from 'lucide-react'
import type { Block } from '@/types'

const blockTypeLabels: Record<string, string> = {
  residential: 'Konut',
  commercial: 'Ticari',
  mixed: 'Karma',
}

export function BlocksPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deletingBlock, setDeletingBlock] = useState<Block | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    loadBlocks()
  }, [orgId])

  async function loadBlocks() {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<Block[]>(`/organizations/${orgId}/blocks`)
      setBlocks(r.data)
    } catch {
      setError('Bloklar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingBlock(null)
    setFormName('')
    setFormError('')
    setShowForm(true)
  }

  function openEdit(block: Block) {
    setEditingBlock(block)
    setFormName(block.name)
    setFormError('')
    setShowForm(true)
  }

  async function saveBlock() {
    if (!formName.trim()) {
      setFormError('Blok adı zorunlu')
      return
    }
    if (!orgId) return
    setSaving(true)
    setFormError('')
    try {
      if (editingBlock) {
        await api.put(`/organizations/${orgId}/blocks/${editingBlock.id}`, { name: formName.trim() })
      } else {
        await api.post(`/organizations/${orgId}/blocks`, { name: formName.trim() })
      }
      setShowForm(false)
      await loadBlocks()
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBlock() {
    if (!deletingBlock || !orgId) return
    setDeleteLoading(true)
    try {
      await api.delete(`/organizations/${orgId}/blocks/${deletingBlock.id}`)
      setDeletingBlock(null)
      await loadBlocks()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Silme başarısız')
      setDeletingBlock(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Bloklar</h1>
            <p className="text-sm text-slate-500 mt-0.5">Binadaki blokları yönet</p>
          </div>
          <Button onClick={openAdd}>Blok Ekle</Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Blok Listesi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Henüz blok yok</p>
                <p className="text-xs text-slate-400 mt-1">Yukarıdan yeni blok ekleyebilirsiniz.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Daire Sayısı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{b.name}</span>
                          {b.isDefault && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Varsayılan</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{blockTypeLabels[b.blockType] ?? b.blockType}</td>
                      <td className="px-4 py-3.5">
                        {b.unitCount === 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Boş</span>
                        ) : (
                          <span className="text-slate-700">{b.unitCount} daire</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>Düzenle</Button>
                          {!b.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => { setError(''); setDeletingBlock(b) }}
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
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              {editingBlock ? 'Bloğu Düzenle' : 'Yeni Blok Ekle'}
            </h2>
            <Input
              label="Blok Adı"
              placeholder="örn. A Blok"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              error={formError}
              onKeyDown={e => e.key === 'Enter' && saveBlock()}
              autoFocus
            />
            <div className="flex gap-3 justify-end mt-5">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={saving}>İptal</Button>
              <Button onClick={saveBlock} loading={saving}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deletingBlock}
        title="Bloğu Sil"
        message={`"${deletingBlock?.name}" bloğunu silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        loading={deleteLoading}
        onConfirm={deleteBlock}
        onCancel={() => setDeletingBlock(null)}
      />
    </AppLayout>
  )
}
