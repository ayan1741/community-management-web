import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import type { AgendaItemListItem, AgendaItemsListResult } from '@/types'
import { Vote, Plus, X } from 'lucide-react'

export function PollFormPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pollType, setPollType] = useState<'evet_hayir' | 'coktan_secmeli'>('evet_hayir')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10))
  const [endsAt, setEndsAt] = useState('')
  const [agendaItemId, setAgendaItemId] = useState('')
  const [showInterimResults, setShowInterimResults] = useState(false)
  const [agendaItems, setAgendaItems] = useState<AgendaItemListItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orgId) return
    api.get<AgendaItemsListResult>(`/organizations/${orgId}/agenda-items?status=acik&pageSize=100`)
      .then(r => setAgendaItems(r.data.items))
      .catch(() => { /* silent */ })
  }, [orgId])

  function addOption() {
    if (options.length >= 10) return
    setOptions([...options, ''])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== idx))
  }

  function updateOption(idx: number, val: string) {
    setOptions(options.map((o, i) => i === idx ? val : o))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    if (!title.trim()) { setError('Baslik zorunludur.'); return }
    if (!endsAt) { setError('Bitis tarihi zorunludur.'); return }
    if (pollType === 'coktan_secmeli') {
      const validOptions = options.filter(o => o.trim())
      if (validOptions.length < 2) { setError('En az 2 secenek girilmelidir.'); return }
    }

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      pollType,
      startsAt: new Date(startsAt + 'T00:00:00Z').toISOString(),
      endsAt: new Date(endsAt + 'T23:59:59Z').toISOString(),
      agendaItemId: agendaItemId || null,
      showInterimResults,
      options: pollType === 'coktan_secmeli'
        ? options.filter(o => o.trim()).map(o => ({ label: o.trim() }))
        : null,
    }

    setSaving(true); setError('')
    try {
      await api.post(`/organizations/${orgId}/polls`, payload)
      navigate('/admin/polls')
    } catch {
      setError('Oylama olusturulurken hata olustu.')
    } finally { setSaving(false) }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          icon={Vote}
          title="Yeni Oylama Olustur"
          description="Topluluk icin oylama baslatma"
        />

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Baslik *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Oylama basligi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Aciklama</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              placeholder="Oylama hakkinda detayli bilgi (opsiyonel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Oylama Tipi *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pollType" value="evet_hayir" checked={pollType === 'evet_hayir'} onChange={() => setPollType('evet_hayir')} className="accent-primary" />
                <span className="text-sm">Evet / Hayir</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pollType" value="coktan_secmeli" checked={pollType === 'coktan_secmeli'} onChange={() => setPollType('coktan_secmeli')} className="accent-primary" />
                <span className="text-sm">Coktan Secmeli</span>
              </label>
            </div>
          </div>

          {pollType === 'coktan_secmeli' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Secenekler *</label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={e => updateOption(idx, e.target.value)}
                      placeholder={`Secenek ${idx + 1}`}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(idx)} className="text-muted-foreground hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button type="button" onClick={addOption} className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Secenek Ekle
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Baslangic *</label>
              <input
                type="date"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Bitis *</label>
              <input
                type="date"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Iliskili Gundem Maddesi</label>
            <select
              value={agendaItemId}
              onChange={e => setAgendaItemId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Secim yapilmadi (opsiyonel)</option>
              {agendaItems.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showInterimResults} onChange={e => setShowInterimResults(e.target.checked)} className="accent-primary" />
            <span className="text-sm text-foreground">Ara sonuclari goster</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/admin/polls')} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Iptal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? 'Olusturuluyor...' : 'Oylamayi Baslat'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
