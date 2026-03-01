import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Building2, ChevronRight, Plus, Check, Copy, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const SETUP_KEY = 'komsunet_setup'

interface SetupState {
  step: number
  orgId?: string
  orgName?: string
  orgType?: 'site' | 'apartment'
  defaultBlockId?: string
  blocks?: { id: string; name: string }[]
}

function loadSetup(): SetupState {
  try {
    const raw = localStorage.getItem(SETUP_KEY)
    if (raw) return JSON.parse(raw) as SetupState
  } catch {}
  return { step: 1 }
}

function saveSetup(s: SetupState) {
  localStorage.setItem(SETUP_KEY, JSON.stringify(s))
}

function clearSetup() {
  localStorage.removeItem(SETUP_KEY)
}

// ─── Shared input/label styles ────────────────────────────────────────────────

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-colors focus:border-blue-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-0'
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5'
const selectCls = 'w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 transition-colors focus:border-blue-400 dark:focus:border-zinc-500 focus:outline-none'

// ─── Progress Steps ───────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Site Bilgileri' },
  { n: 2, label: 'Bloklar' },
  { n: 3, label: 'Daireler' },
  { n: 4, label: 'İlk Davet' },
]

function StepHeader({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border-2 transition-colors ${
              current > s.n
                ? 'bg-blue-600 border-blue-600 text-white'
                : current === s.n
                  ? 'bg-white dark:bg-zinc-800 border-blue-600 text-blue-600'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-600'
            }`}
          >
            {current > s.n ? <Check className="w-4 h-4" /> : s.n}
          </div>
          <span
            className={`ml-2 text-xs font-medium hidden sm:block transition-colors ${
              current >= s.n ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-400 dark:text-zinc-600'
            }`}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-3 h-px w-8 sm:w-14 transition-colors ${
                current > s.n ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Org Info ─────────────────────────────────────────────────────────

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const step1Schema = z.object({
  name: z.string().min(3, 'Site/apartman adı en az 3 karakter olmalı'),
  orgType: z.enum(['site', 'apartment']),
  addressCity: z.string().optional(),
  addressDistrict: z.string().optional(),
})
type Step1Data = z.infer<typeof step1Schema>

function Step1OrgInfo({
  orgId,
  orgName,
  onComplete,
}: {
  orgId?: string
  orgName?: string
  onComplete: (orgId: string, orgName: string, orgType: 'site' | 'apartment', defaultBlockId?: string) => void
}) {
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { orgType: 'site', name: orgName ?? '' },
  })

  async function onSubmit(data: Step1Data) {
    setError('')
    if (orgId) {
      onComplete(orgId, orgName!, data.orgType)
      return
    }
    try {
      const res = await api.post<{ organizationId: string; name: string; defaultBlockId?: string }>('/organizations', {
        name: data.name,
        orgType: data.orgType,
        addressCity: data.addressCity || null,
        addressDistrict: data.addressDistrict || null,
      })
      onComplete(res.data.organizationId, res.data.name, data.orgType, res.data.defaultBlockId)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Kayıt sırasında bir hata oluştu.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelCls}>Site / Apartman Adı</label>
        <input type="text" placeholder="Çınar Sitesi" className={inputCls} {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Tür</label>
        <select {...register('orgType')} className={selectCls}>
          <option value="site">Site (birden fazla blok)</option>
          <option value="apartment">Apartman (tek blok)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Şehir (opsiyonel)</label>
          <input type="text" placeholder="İstanbul" className={inputCls} {...register('addressCity')} />
        </div>
        <div>
          <label className={labelCls}>İlçe (opsiyonel)</label>
          <input type="text" placeholder="Kadıköy" className={inputCls} {...register('addressDistrict')} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        İleri <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  )
}

// ─── Step 2: Blocks ───────────────────────────────────────────────────────────

function Step2Blocks({
  orgId,
  existingBlocks,
  onComplete,
}: {
  orgId: string
  existingBlocks?: { id: string; name: string }[]
  onComplete: (blocks: { id: string; name: string }[]) => void
}) {
  const [blockName, setBlockName] = useState('')
  const [savedBlocks, setSavedBlocks] = useState<{ id: string; name: string }[]>(existingBlocks ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function addBlock() {
    const name = blockName.trim()
    if (!name) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ id: string; name: string }>(
        `/organizations/${orgId}/blocks`,
        { name, blockType: 'residential' }
      )
      setSavedBlocks(prev => [...prev, { id: res.data.id, name }])
      setBlockName('')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Blok eklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Sitenizdeki blokları ekleyin. Tek bloklu apartmanlarda tek blok yeterlidir.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={blockName}
          onChange={e => setBlockName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBlock() } }}
          placeholder="Blok adı — örn. A Blok"
          className={inputCls}
        />
        <Button type="button" onClick={addBlock} loading={loading}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {savedBlocks.length > 0 && (
        <ul className="space-y-1.5">
          {savedBlocks.map(b => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-sm"
            >
              <span className="font-medium text-blue-700 dark:text-blue-300">{b.name}</span>
              <Check className="w-4 h-4 text-blue-500" />
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="button"
        disabled={savedBlocks.length === 0}
        onClick={() => onComplete(savedBlocks)}
        className="h-10 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        İleri <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Step 3: Units ────────────────────────────────────────────────────────────

function Step3Units({
  orgId,
  blocks,
  onComplete,
}: {
  orgId: string
  blocks: { id: string; name: string }[]
  onComplete: () => void
}) {
  const [unitInputs, setUnitInputs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleNext() {
    setLoading(true)
    setError('')
    try {
      for (const block of blocks) {
        const raw = unitInputs[block.id] ?? ''
        const numbers = raw.split(',').map(s => s.trim()).filter(Boolean)
        for (const num of numbers) {
          await api.post(`/organizations/${orgId}/units`, {
            blockId: block.id,
            unitNumber: num,
            unitType: 'residential',
          })
        }
      }
      onComplete()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Daire eklenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Her blok için daire numaralarını virgülle ayırarak girin. Daha sonra da ekleyebilirsiniz.
      </p>

      {blocks.map(block => (
        <div key={block.id}>
          <label className={labelCls}>{block.name} — Daire numaraları</label>
          <input
            type="text"
            placeholder="1, 2, 3, 4, 5..."
            value={unitInputs[block.id] ?? ''}
            onChange={e => setUnitInputs(prev => ({ ...prev, [block.id]: e.target.value }))}
            className={inputCls}
          />
        </div>
      ))}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
        >
          Atla
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex-1 h-10 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          İleri <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Invite ───────────────────────────────────────────────────────────

interface UnitOption {
  id: string
  unitNumber: string
  blockName: string | null
}

function Step4Invite({ orgId }: { orgId: string }) {
  const [units, setUnits] = useState<UnitOption[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<{ items: UnitOption[] }>(`/organizations/${orgId}/units`)
      .then(res => setUnits(res.data.items))
      .catch(() => setError('Daireler yüklenemedi.'))
      .finally(() => setFetching(false))
  }, [orgId])

  async function createInvitation() {
    if (!selectedUnitId) return
    setLoading(true)
    setError('')
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const res = await api.post<{ invitationCode: string }>(
        `/organizations/${orgId}/invitations`,
        { unitId: selectedUnitId, expiresAt }
      )
      setInviteCode(res.data.invitationCode)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Davet oluşturulamadı.')
    } finally {
      setLoading(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function finish() {
    clearSetup()
    window.location.href = '/dashboard'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        İlk sakininizi sisteme davet edin. Oluşturulan kodu sakinle paylaşın.
        İsterseniz bu adımı atlayıp daha sonra yapabilirsiniz.
      </p>

      {!inviteCode ? (
        <>
          {fetching ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500">Daireler yükleniyor...</p>
          ) : units.length === 0 ? (
            <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3 py-2.5">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Davet oluşturmak için önce daire eklemeniz gerekiyor.
              </p>
            </div>
          ) : (
            <div>
              <label className={labelCls}>Davet Edilecek Daire</label>
              <select
                value={selectedUnitId}
                onChange={e => setSelectedUnitId(e.target.value)}
                className={selectCls}
              >
                <option value="">Daire seçin...</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.blockName ? `${u.blockName} — Daire ${u.unitNumber}` : `Daire ${u.unitNumber}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={finish}
              className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Atla, Dashboard'a Geç
            </button>
            <button
              type="button"
              onClick={createInvitation}
              disabled={loading || !selectedUnitId || units.length === 0}
              className="flex-1 h-10 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Davet Kodu Oluştur
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Davet Kodu Oluşturuldu</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xl font-mono font-bold text-green-800 dark:text-green-300 tracking-widest">
                {inviteCode}
              </code>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg border border-green-200 dark:border-green-500/30 bg-white dark:bg-zinc-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-zinc-700 transition-colors"
                title="Kopyala"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2">Bu kodu sakinle paylaşın. 7 gün geçerlidir.</p>
          </div>

          <button
            type="button"
            onClick={finish}
            className="h-10 w-full rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Kurulum Tamamlandı — Dashboard'a Geç
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Ana Wizard ───────────────────────────────────────────────────────────────

const STEP_TITLES = ['', 'Sitenizi Tanıtın', 'Bloklarınızı Ekleyin', 'Daireleri Ekleyin', 'İlk Sakini Davet Edin']
const STEP_SUBTITLES = [
  '',
  'Temel bilgileri girerek başlayın.',
  'Sitenizdeki blokları tanımlayın.',
  'Her blok için daire numaralarını girin.',
  'İsteğe bağlı — daha sonra da yapabilirsiniz.',
]

export function SetupWizardPage() {
  const [state, setState] = useState<SetupState>(loadSetup)
  const { isDark, toggleTheme } = useTheme()

  function update(patch: Partial<SetupState>) {
    const next = { ...state, ...patch }
    saveSetup(next)
    setState(next)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">KomşuNet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-zinc-600">Adım {state.step} / 4</span>
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all duration-200"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{STEP_TITLES[state.step]}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">{STEP_SUBTITLES[state.step]}</p>
        </div>

        <StepHeader current={state.step} />

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm p-6">
          {state.step === 1 && (
            <Step1OrgInfo
              orgId={state.orgId}
              orgName={state.orgName}
              onComplete={(orgId, orgName, orgType, defaultBlockId) => {
                if (orgType === 'apartment') {
                  const autoBlock = { id: defaultBlockId!, name: orgName }
                  update({ step: 3, orgId, orgName, orgType, defaultBlockId, blocks: [autoBlock] })
                } else {
                  update({ step: 2, orgId, orgName, orgType })
                }
              }}
            />
          )}
          {state.step === 2 && state.orgId && state.orgType === 'site' && (
            <Step2Blocks
              orgId={state.orgId}
              existingBlocks={state.blocks}
              onComplete={blocks => update({ step: 3, blocks })}
            />
          )}
          {state.step === 3 && state.orgId && state.blocks && (
            <Step3Units
              orgId={state.orgId}
              blocks={state.blocks}
              onComplete={() => update({ step: 4 })}
            />
          )}
          {state.step === 4 && state.orgId && (
            <Step4Invite orgId={state.orgId} />
          )}
        </div>
      </main>
    </div>
  )
}
