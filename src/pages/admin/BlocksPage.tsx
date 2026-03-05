import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Layers } from 'lucide-react'
import type { Block } from '@/types'

const blockTypeLabels: Record<string, string> = {
  residential: 'Konut',
  commercial: 'Ticari',
  mixed: 'Karma',
}

export function BlocksPage() {
  const { activeMembership } = useAuth()
  const navigate = useNavigate()
  const orgId = activeMembership?.organizationId
  const orgType = activeMembership?.orgType ?? 'site'
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
    if (orgType === 'apartment') { navigate('/admin/units', { replace: true }); return }
    if (!orgId) return
    loadBlocks()
  }, [orgId, orgType])

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
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader icon={Layers} title="Bloklar" description="Binadaki blokları yönet" actions={<Button onClick={openAdd}>Blok Ekle</Button>} />

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
        )}

        <TableCard title="Blok Listesi">
            {loading ? (
              <TableSkeleton />
            ) : blocks.length === 0 ? (
              <EmptyState icon={Layers} title="Henüz blok yok" description="Yukarıdan yeni blok ekleyebilirsiniz." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Daire Sayısı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map(b => (
                    <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{b.name}</span>
                          {b.isDefault && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Varsayılan</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{blockTypeLabels[b.blockType] ?? b.blockType}</td>
                      <td className="px-4 py-3.5">
                        {b.unitCount === 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Boş</span>
                        ) : (
                          <span className="text-foreground">{b.unitCount} daire</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>Düzenle</Button>
                          {!b.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
        </TableCard>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
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
    </AdminLayout>
  )
}
