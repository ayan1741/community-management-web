import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Check } from 'lucide-react'
import type { Block, BulkCreateResult } from '@/types'

type NumberFormat = 'sequential' | 'floor-unit' | 'floor-letter'

const formatLabels: Record<NumberFormat, string> = {
  sequential: 'Ardışık (1, 2, 3...)',
  'floor-unit': 'Kat-Daire (101, 102, 201...)',
  'floor-letter': 'Kat-Harf (1A, 1B, 2A...)',
}

function generatePreview(
  startFloor: number,
  endFloor: number,
  unitsPerFloor: number,
  format: NumberFormat,
): string[] {
  const numbers: string[] = []
  let seq = 1
  for (let floor = startFloor; floor <= endFloor; floor++) {
    for (let unit = 1; unit <= unitsPerFloor; unit++) {
      if (format === 'sequential') {
        numbers.push(String(seq))
      } else if (format === 'floor-unit') {
        numbers.push(`${floor}${String(unit).padStart(2, '0')}`)
      } else {
        numbers.push(`${floor}${String.fromCharCode(64 + unit)}`)
      }
      seq++
    }
  }
  return numbers
}

interface BulkUnitWizardProps {
  blocks: Block[]
  orgId: string
  onComplete: (result: BulkCreateResult) => void
  onCancel: () => void
}

export function BulkUnitWizard({ blocks, orgId, onComplete, onCancel }: BulkUnitWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [blockId, setBlockId] = useState(blocks[0]?.id ?? '')
  const [startFloor, setStartFloor] = useState(1)
  const [endFloor, setEndFloor] = useState(5)
  const [unitsPerFloor, setUnitsPerFloor] = useState(4)
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('floor-unit')
  const [preview, setPreview] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<BulkCreateResult | null>(null)
  const [error, setError] = useState('')

  const total = (endFloor - startFloor + 1) * unitsPerFloor
  const step2Invalid = endFloor < startFloor || unitsPerFloor < 1 || total > 100 || !blockId

  function buildPreview() {
    if (step2Invalid) return
    setPreview(generatePreview(startFloor, endFloor, unitsPerFloor, numberFormat))
    setStep(3)
  }

  async function create() {
    setCreating(true)
    setError('')
    try {
      const r = await api.post<BulkCreateResult>(`/organizations/${orgId}/units/bulk`, {
        blockId,
        startFloor,
        endFloor,
        unitsPerFloor,
        numberFormat,
      })
      setResult(r.data)
      setStep(4)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Oluşturma başarısız')
    } finally {
      setCreating(false)
    }
  }

  function goBack() {
    setStep(prev => (prev - 1) as typeof step)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="px-6 pt-5 pb-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Toplu Daire Oluştur</h2>
          <div className="flex gap-2 mt-3">
            {([1, 2, 3, 4] as const).map(s => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5 min-h-[260px]">
          {step === 1 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Blok Seç</p>
              {blocks.length === 0 ? (
                <p className="text-sm text-slate-400">Önce blok oluşturmanız gerekiyor.</p>
              ) : (
                <div className="space-y-2">
                  {blocks.map(b => (
                    <label
                      key={b.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        blockId === b.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="block"
                        value={b.id}
                        checked={blockId === b.id}
                        onChange={() => setBlockId(b.id)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-900">{b.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Parametreler</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Başlangıç Katı"
                  type="number"
                  value={startFloor}
                  onChange={e => setStartFloor(parseInt(e.target.value) || 1)}
                />
                <Input
                  label="Bitiş Katı"
                  type="number"
                  value={endFloor}
                  onChange={e => setEndFloor(parseInt(e.target.value) || 1)}
                />
              </div>
              <Input
                label="Kattaki Daire Sayısı"
                type="number"
                value={unitsPerFloor}
                onChange={e => setUnitsPerFloor(parseInt(e.target.value) || 1)}
              />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Numara Formatı</p>
                <div className="space-y-2">
                  {(Object.entries(formatLabels) as [NumberFormat, string][]).map(([fmt, label]) => (
                    <label
                      key={fmt}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        numberFormat === fmt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        checked={numberFormat === fmt}
                        onChange={() => setNumberFormat(fmt)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-slate-900">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {total > 100 && (
                <p className="text-sm text-red-600">En fazla 100 daire oluşturulabilir (şu an: {total})</p>
              )}
              {endFloor < startFloor && (
                <p className="text-sm text-red-600">Bitiş katı başlangıç katından küçük olamaz</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Önizleme — {preview.length} daire oluşturulacak</p>
              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {preview.map(n => (
                    <span
                      key={n}
                      className="inline-flex px-2.5 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          )}

          {step === 4 && result && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-base font-semibold text-slate-900 mb-1">{result.created} daire oluşturuldu</p>
              {result.skipped > 0 && (
                <p className="text-sm text-amber-600">
                  {result.skipped} daire çakışma nedeniyle atlandı: {result.skippedNumbers.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-between border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={step === 1 ? onCancel : goBack}>
            {step === 1 ? 'İptal' : 'Geri'}
          </Button>
          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!blockId || blocks.length === 0}>İleri</Button>
          )}
          {step === 2 && (
            <Button onClick={buildPreview} disabled={step2Invalid}>İleri</Button>
          )}
          {step === 3 && (
            <Button onClick={create} loading={creating}>Oluştur</Button>
          )}
          {step === 4 && (
            <Button onClick={() => onComplete(result!)}>Kapat</Button>
          )}
        </div>
      </div>
    </div>
  )
}
