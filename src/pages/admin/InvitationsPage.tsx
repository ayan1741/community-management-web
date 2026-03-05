import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UnitSelector } from '@/components/units/UnitSelector'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableCard } from '@/components/shared/TableCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { Mail, Download } from 'lucide-react'
import type { InvitationCode, UnitDropdownItem, PagedResult } from '@/types'
import { formatUnitLabel } from '@/utils/formatUnitLabel'

export function InvitationsPage() {
  const { activeMembership } = useAuth()
  const [invitations, setInvitations] = useState<InvitationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [units, setUnits] = useState<UnitDropdownItem[]>([])
  const [error, setError] = useState('')

  // Toplu davet modal state
  const [showBulk, setShowBulk] = useState(false)
  const [bulkStep, setBulkStep] = useState<1 | 2>(1)
  const [bulkSelectedUnits, setBulkSelectedUnits] = useState<Set<string>>(new Set())
  const [bulkOnlyEmpty, setBulkOnlyEmpty] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResults, setBulkResults] = useState<Array<{ unitNumber: string; blockName: string; invitationCode: string; hadExistingCode: boolean }>>([])

  const orgType = activeMembership?.orgType ?? 'site'

  useEffect(() => {
    if (!activeMembership) return
    loadInvitations()
    loadUnits()
  }, [activeMembership])

  async function loadInvitations() {
    if (!activeMembership) return
    try {
      const r = await api.get<PagedResult<InvitationCode>>(`/organizations/${activeMembership.organizationId}/invitations`)
      setInvitations(r.data.items)
    } catch {
      setError('Davetler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function loadUnits() {
    if (!activeMembership) return
    try {
      const r = await api.get<UnitDropdownItem[]>(`/organizations/${activeMembership.organizationId}/units/dropdown`)
      setUnits(r.data)
    } catch {}
  }

  async function generateCode() {
    if (!unitId) return
    setGenerating(true)
    setError('')
    try {
      await api.post(`/organizations/${activeMembership!.organizationId}/invitations`, {
        unitId,
        expiresInDays: 7,
      })
      setUnitId(null)
      await loadInvitations()
    } catch {
      setError('Davet kodu oluşturulamadı')
    } finally {
      setGenerating(false)
    }
  }

  function openBulk() {
    setShowBulk(true)
    setBulkStep(1)
    setBulkSelectedUnits(new Set())
    setBulkOnlyEmpty(true)
    setBulkResults([])
  }

  function toggleBulkUnit(id: string) {
    setBulkSelectedUnits(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredBulkUnits = bulkOnlyEmpty ? units.filter(u => !u.isOccupied) : units

  function toggleAllBulk() {
    if (bulkSelectedUnits.size === filteredBulkUnits.length) {
      setBulkSelectedUnits(new Set())
    } else {
      setBulkSelectedUnits(new Set(filteredBulkUnits.map(u => u.id)))
    }
  }

  async function handleBulkCreate() {
    if (!activeMembership || bulkSelectedUnits.size === 0) return
    setBulkLoading(true)
    try {
      const r = await api.post<{ items: Array<{ unitNumber: string; blockName: string; invitationCode: string; hadExistingCode: boolean }>; totalCreated: number }>(
        `/organizations/${activeMembership.organizationId}/invitations/bulk`,
        { unitIds: Array.from(bulkSelectedUnits) }
      )
      setBulkResults(r.data.items)
      setBulkStep(2)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Toplu kod oluşturulamadı')
      setShowBulk(false)
    } finally {
      setBulkLoading(false)
    }
  }

  function downloadBulkCsv() {
    const csv = bulkResults.map(i => `${i.blockName},${i.unitNumber},${i.invitationCode}`).join('\n')
    const blob = new Blob([`Blok,Daire,Kod\n${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'davet-kodlari.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusLabel: Record<string, string> = {
    active: 'Aktif',
    used: 'Kullanıldı',
    expired: 'Süresi Doldu',
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader icon={Mail} title="Davet Kodları" description="Davet kodu oluştur ve yönet" />

        <Card>
          <CardHeader>
            <CardTitle>Yeni Davet Kodu Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px] max-w-sm">
                <UnitSelector
                  units={units}
                  value={unitId}
                  onChange={setUnitId}
                  placeholder="Daire seçin..."
                />
              </div>
              <Button onClick={generateCode} loading={generating} disabled={!unitId}>
                Oluştur
              </Button>
              <Button variant="secondary" onClick={openBulk}>
                Toplu Kod Oluştur
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <TableCard title="Mevcut Davetler">
            {loading && <TableSkeleton />}
            {!loading && invitations.length === 0 && (
              <EmptyState icon={Mail} title="Henüz davet kodu yok" description="Yukarıdan yeni bir davet kodu oluşturabilirsiniz." />
            )}
            {invitations.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Kod</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Daire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Son Geçerlilik</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv.invitationId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded tracking-widest border border-border">
                          {inv.invitationCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {formatUnitLabel(inv.blockName, inv.unitNumber, orgType)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {new Date(inv.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          inv.codeStatus === 'active' ? 'bg-success/10 text-success' :
                          inv.codeStatus === 'used' ? 'bg-muted text-muted-foreground' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            inv.codeStatus === 'active' ? 'bg-success' :
                            inv.codeStatus === 'used' ? 'bg-muted-foreground' :
                            'bg-destructive'
                          }`} />
                          {statusLabel[inv.codeStatus] ?? inv.codeStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(inv.invitationCode)}
                        >
                          Kopyala
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </TableCard>
      </div>

      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh] flex flex-col">
            {bulkStep === 1 ? (
              <>
                <h2 className="text-base font-semibold text-foreground mb-1">Toplu Davet Kodu Oluştur</h2>
                <p className="text-sm text-muted-foreground mb-4">Birden fazla daire için aynı anda davet kodu oluşturun.</p>
                <label className="flex items-center gap-2 mb-3 text-sm text-foreground">
                  <input type="checkbox" checked={bulkOnlyEmpty} onChange={e => { setBulkOnlyEmpty(e.target.checked); setBulkSelectedUnits(new Set()) }} />
                  Sadece boş daireler
                </label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{bulkSelectedUnits.size} daire seçili</span>
                  <button onClick={toggleAllBulk} className="text-xs text-primary hover:underline">
                    {bulkSelectedUnits.size === filteredBulkUnits.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto border border-border rounded-lg divide-y divide-border min-h-0">
                  {filteredBulkUnits.map(u => (
                    <label key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulkSelectedUnits.has(u.id)}
                        onChange={() => toggleBulkUnit(u.id)}
                      />
                      <span className="text-sm text-foreground">{formatUnitLabel(u.blockName, u.unitNumber, orgType)}</span>
                      {u.isOccupied && <span className="text-xs text-success">Dolu</span>}
                    </label>
                  ))}
                  {filteredBulkUnits.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">Uygun daire bulunamadı</div>
                  )}
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <Button variant="secondary" onClick={() => setShowBulk(false)}>İptal</Button>
                  <Button onClick={handleBulkCreate} loading={bulkLoading} disabled={bulkSelectedUnits.size === 0}>
                    {bulkSelectedUnits.size} Kod Oluştur
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-base font-semibold text-foreground mb-1">Kodlar Oluşturuldu</h2>
                <p className="text-sm text-muted-foreground mb-4">{bulkResults.length} davet kodu başarıyla oluşturuldu.</p>
                <div className="flex-1 overflow-y-auto border border-border rounded-lg min-h-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Daire</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Kod</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Eski Kod?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkResults.map((item, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="px-3 py-2 text-muted-foreground">{formatUnitLabel(item.blockName, item.unitNumber, orgType)}</td>
                          <td className="px-3 py-2">
                            <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded border border-border tracking-widest">
                              {item.invitationCode}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs">{item.hadExistingCode ? <span className="text-warning">Evet</span> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <Button variant="secondary" onClick={downloadBulkCsv}>
                    <Download className="w-4 h-4 mr-1.5" />CSV İndir
                  </Button>
                  <Button onClick={() => { setShowBulk(false); loadInvitations() }}>Kapat</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
