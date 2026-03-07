import { useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { MaintenanceRequestCostItem } from '@/types'
import { CircleDollarSign, Plus, Loader2, Check, ArrowRight } from 'lucide-react'

interface Props {
  orgId: string
  requestId: string
  costs: MaintenanceRequestCostItem[]
  totalCost: number
  isAdmin: boolean
  onCostAdded: () => void
}

export function MaintenanceCosts({ orgId, requestId, costs, totalCost, isAdmin, onCostAdded }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [transferring, setTransferring] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleAdd() {
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('Gecerli bir tutar girin.'); return }
    setSaving(true); setError('')
    try {
      await api.post(`/organizations/${orgId}/maintenance-requests/${requestId}/costs`, {
        amount: num,
        description: description.trim() || null,
      })
      setAmount(''); setDescription(''); setShowForm(false)
      onCostAdded()
    } catch {
      setError('Maliyet eklenemedi.')
    } finally { setSaving(false) }
  }

  async function handleTransfer(costId: string) {
    setTransferring(costId)
    try {
      await api.post(`/organizations/${orgId}/maintenance-requests/${requestId}/costs/${costId}/transfer`)
      onCostAdded()
    } catch {
      setError('Aktarim basarisiz oldu.')
    } finally { setTransferring(null) }
  }

  // Resident view: only total
  if (!isAdmin) {
    if (totalCost <= 0) return null
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleDollarSign className="w-4 h-4" />
        <span>Toplam Maliyet: <strong className="text-foreground">{formatCurrency(totalCost)}</strong></span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Toplam:</span>
          <span className="text-sm font-bold text-foreground">{formatCurrency(totalCost)}</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Maliyet Ekle
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {/* Add form */}
      {showForm && (
        <div className="flex items-end gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground mb-1">Tutar (TL) *</label>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground mb-1">Aciklama</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="orn: Parca degisimi"
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ekle'}
          </button>
        </div>
      )}

      {/* Cost list */}
      {costs.length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {costs.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-foreground">{c.description || 'Maliyet'}</span>
                <span className="text-xs text-muted-foreground ml-2">{formatDateTime(c.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{formatCurrency(c.amount)}</span>
                {c.financeRecordId ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" /> Aktarildi
                  </span>
                ) : (
                  <button
                    onClick={() => handleTransfer(c.id)}
                    disabled={transferring === c.id}
                    className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                    title="Gelir-gidere aktar"
                  >
                    {transferring === c.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <ArrowRight className="w-3 h-3" /> Aktar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
