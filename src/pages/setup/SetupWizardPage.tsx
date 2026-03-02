import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  Building2, ChevronRight, Plus, Check, Copy, Sun, Moon, ArrowLeft,
  Loader2, Layers, Grid3X3, Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { FadeIn } from '@/hooks/useInView'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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

// ─── Premium Styles ───────────────────────────────────────────────────────────

const inputCls =
  'h-11 w-full rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/50 px-3.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 shadow-sm shadow-slate-100 dark:shadow-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-blue-500/20'
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5'
const selectCls =
  'h-11 w-full rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/50 px-3.5 text-sm text-slate-900 dark:text-zinc-100 shadow-sm shadow-slate-100 dark:shadow-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-blue-500/20'

// ─── Step Transition ──────────────────────────────────────────────────────────

function StepTransition({ stepKey, children }: { stepKey: number; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const prevKey = useRef(stepKey)

  useEffect(() => {
    if (stepKey !== prevKey.current) {
      setShow(false)
      prevKey.current = stepKey
    }
    const t = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(t)
  }, [stepKey])

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
    >
      {children}
    </div>
  )
}

// ─── Step Data ────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Site Bilgileri', icon: Building2 },
  { n: 2, label: 'Bloklar', icon: Layers },
  { n: 3, label: 'Daireler', icon: Grid3X3 },
  { n: 4, label: 'İlk Davet', icon: Mail },
]

const STEP_TITLES = ['', 'Sitenizi Tanıtın', 'Bloklarınızı Ekleyin', 'Daireleri Ekleyin', 'İlk Sakini Davet Edin']
const STEP_SUBTITLES = [
  '',
  'Temel bilgileri girerek başlayın.',
  'Sitenizdeki blokları tanımlayın.',
  'Her blok için daire numaralarını girin.',
  'İsteğe bağlı — daha sonra da yapabilirsiniz.',
]

const STEP_QUOTES = [
  '',
  'Sitenizi tanıtın, topluluğunuz şekillensin.',
  'Blok yapısını belirleyin, düzen sağlansın.',
  'Daireleri ekleyin, sakinler hazır olsun.',
  'İlk davetinizi gönderin, topluluk başlasın!',
]

const STEP_IMAGES = [
  '',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop',
]

const STEP_DESCRIPTIONS: string[][] = [
  [],
  [
    'Site veya apartman adı, tüm bildirimlerde ve panelde görünecektir.',
    'Tür seçimi (site/apartman) blok yapısını otomatik belirler.',
    'Şehir ve ilçe bilgisi isteğe bağlıdır, sonradan eklenebilir.',
  ],
  [
    'Her blok ayrı bir bina veya giriş kapısını temsil eder.',
    'A Blok, B Blok gibi isimlendirme kullanabilirsiniz.',
    'Blok sayısını daha sonra artırabilir veya düzenleyebilirsiniz.',
  ],
  [
    'Virgülle ayırarak toplu daire numarası girebilirsiniz.',
    'Her daire bir haneyi temsil eder, sakinler buraya atanır.',
    'Bu adımı atlayıp daireleri daha sonra da ekleyebilirsiniz.',
  ],
  [
    'Davet kodu 7 gün geçerlidir ve tek kullanımlıktır.',
    'Sakin, kodu kullanarak sisteme kayıt olabilir.',
    'İstediğiniz kadar davet kodu oluşturabilirsiniz.',
  ],
]

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          {/* Dot */}
          <div className="relative">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold border-2 transition-all duration-500 ${
                current > s.n
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25'
                  : current === s.n
                    ? 'bg-white dark:bg-zinc-800 border-blue-600 text-blue-600'
                    : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-600'
              }`}
            >
              {current > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            {/* Pulse ring for active step */}
            {current === s.n && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
            )}
          </div>
          {/* Label */}
          <span
            className={`ml-2 text-xs font-medium hidden sm:block transition-colors duration-300 ${
              current >= s.n ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-400 dark:text-zinc-600'
            }`}
          >
            {s.label}
          </span>
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div className="mx-3 h-px w-8 sm:w-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-700" />
              <div
                className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: current > s.n ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Left Panel Checklist ─────────────────────────────────────────────────────

function SideChecklist({ current }: { current: number }) {
  return (
    <div className="space-y-3">
      {STEPS.map((s, i) => {
        const done = current > s.n
        const active = current === s.n
        return (
          <FadeIn key={s.n} delay={0.1 + i * 0.08}>
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${
                active
                  ? 'bg-white/15 backdrop-blur-sm'
                  : done
                    ? 'opacity-70'
                    : 'opacity-40'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                  done
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : active
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/40'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  done
                    ? 'text-emerald-300 line-through decoration-emerald-400/40'
                    : active
                      ? 'text-white'
                      : 'text-white/40'
                }`}
              >
                {s.label}
              </span>
            </div>
          </FadeIn>
        )
      })}
    </div>
  )
}

// ─── Step 1: Org Info ─────────────────────────────────────────────────────────

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step1Data>({
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
      const res = await api.post<{ organizationId: string; name: string; defaultBlockId?: string }>(
        '/organizations',
        {
          name: data.name,
          orgType: data.orgType,
          addressCity: data.addressCity || null,
          addressDistrict: data.addressDistrict || null,
        }
      )
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
        {errors.name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>}
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
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> İşleniyor…
          </>
        ) : (
          <>
            İleri <ChevronRight className="w-4 h-4" />
          </>
        )}
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
      const res = await api.post<{ id: string; name: string }>(`/organizations/${orgId}/blocks`, {
        name,
        blockType: 'residential',
      })
      setSavedBlocks((prev) => [...prev, { id: res.data.id, name }])
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
          onChange={(e) => setBlockName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addBlock()
            }
          }}
          placeholder="Blok adı — örn. A Blok"
          className={inputCls}
        />
        <Button type="button" onClick={addBlock} loading={loading} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {savedBlocks.length > 0 && (
        <ul className="space-y-2">
          {savedBlocks.map((b, i) => (
            <FadeIn key={b.id} delay={i * 0.05}>
              <li className="flex items-center justify-between rounded-xl border border-blue-200/80 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-500/10 px-4 py-2.5 text-sm shadow-sm">
                <span className="font-medium text-blue-700 dark:text-blue-300">{b.name}</span>
                <Check className="w-4 h-4 text-blue-500" />
              </li>
            </FadeIn>
          ))}
        </ul>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="button"
        disabled={savedBlocks.length === 0}
        onClick={() => onComplete(savedBlocks)}
        className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
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
        const numbers = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
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

      {blocks.map((block) => (
        <div key={block.id}>
          <label className={labelCls}>{block.name} — Daire numaraları</label>
          <input
            type="text"
            placeholder="1, 2, 3, 4, 5..."
            value={unitInputs[block.id] ?? ''}
            onChange={(e) => setUnitInputs((prev) => ({ ...prev, [block.id]: e.target.value }))}
            className={inputCls}
          />
        </div>
      ))}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="flex-1 h-11 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-800/40 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-all duration-200"
        >
          Atla
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> İşleniyor…
            </>
          ) : (
            <>
              İleri <ChevronRight className="w-4 h-4" />
            </>
          )}
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
      .then((res) => setUnits(res.data.items))
      .catch(() => setError('Daireler yüklenemedi.'))
      .finally(() => setFetching(false))
  }, [orgId])

  async function createInvitation() {
    if (!selectedUnitId) return
    setLoading(true)
    setError('')
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const res = await api.post<{ invitationCode: string }>(`/organizations/${orgId}/invitations`, {
        unitId: selectedUnitId,
        expiresAt,
      })
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
    window.location.href = '/home'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        İlk sakininizi sisteme davet edin. Oluşturulan kodu sakinle paylaşın. İsterseniz bu adımı atlayıp daha sonra
        yapabilirsiniz.
      </p>

      {!inviteCode ? (
        <>
          {fetching ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              <p className="text-sm text-slate-400 dark:text-zinc-500">Daireler yükleniyor...</p>
            </div>
          ) : units.length === 0 ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Davet oluşturmak için önce daire eklemeniz gerekiyor.
              </p>
            </div>
          ) : (
            <div>
              <label className={labelCls}>Davet Edilecek Daire</label>
              <select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} className={selectCls}>
                <option value="">Daire seçin...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.blockName ? `${u.blockName} — Daire ${u.unitNumber}` : `Daire ${u.unitNumber}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={finish}
              className="flex-1 h-11 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-800/40 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-all duration-200"
            >
              Atla, Ana Sayfaya Geç
            </button>
            <button
              type="button"
              onClick={createInvitation}
              disabled={loading || !selectedUnitId || units.length === 0}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> İşleniyor…
                </>
              ) : (
                'Davet Kodu Oluştur'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-5">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">Davet Kodu Oluşturuldu</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xl font-mono font-bold text-emerald-800 dark:text-emerald-300 tracking-widest">
                {inviteCode}
              </code>
              <button
                onClick={copyCode}
                className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all duration-200"
                title="Kopyala"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2">
              Bu kodu sakinle paylaşın. 7 gün geçerlidir.
            </p>
          </div>

          <button
            type="button"
            onClick={finish}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 flex items-center justify-center gap-2"
          >
            Kurulum Tamamlandı — Ana Sayfaya Geç
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Ana Wizard ───────────────────────────────────────────────────────────────

export function SetupWizardPage() {
  const [state, setState] = useState<SetupState>(loadSetup)
  const { isDark, toggleTheme } = useTheme()

  function update(patch: Partial<SetupState>) {
    const next = { ...state, ...patch }
    saveSetup(next)
    setState(next)
  }

  const ActiveIcon = STEPS.find((s) => s.n === state.step)?.icon ?? Building2

  const gridStyle = {
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 transition-colors duration-300">
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/[0.06]" />
        <div className="relative mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <Link to="/home" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <Building2 className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">KomşuNet</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              to="/home"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/60 bg-white/60 dark:bg-white/[0.04] px-3 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-800 dark:hover:text-zinc-100 transition-all duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Geri Dön
            </Link>
            <div className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 px-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      n <= state.step ? 'bg-blue-500 dark:bg-blue-400' : 'bg-blue-200 dark:bg-blue-500/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {state.step}/4
              </span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Tema değiştir"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-200"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex min-h-screen pt-16">
        {/* ── LEFT: Info panel (hidden below lg) ── */}
        <div className="hidden lg:flex relative w-[40%] flex-col overflow-hidden">
          {/* Gradient background */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950'
                : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'
            }`}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col p-10">
            {/* Step image with cross-fade */}
            <div className="relative h-48 rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-black/30">
              {STEP_IMAGES.map((src, i) =>
                i === 0 ? null : (
                  <img
                    key={i}
                    src={src}
                    alt={STEP_TITLES[i]}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
                    style={{ opacity: state.step === i ? 1 : 0 }}
                  />
                )
              )}
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Step badge on image */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md"
                  key={state.step}
                  style={{ animation: 'fadeScale 0.5s ease-out' }}
                >
                  <ActiveIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
                  Adım {state.step}
                </span>
              </div>
            </div>

            {/* Step title + quote */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white leading-snug tracking-tight">
                {STEP_TITLES[state.step]}
              </h2>
              <p className="mt-2 text-sm text-white/50">{STEP_QUOTES[state.step]}</p>
            </div>

            {/* Step descriptions — bullet points */}
            <div className="space-y-2.5 mb-8">
              {(STEP_DESCRIPTIONS[state.step] ?? []).map((desc, i) => (
                <FadeIn key={`${state.step}-${i}`} delay={0.1 + i * 0.1}>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300/60" />
                    <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Checklist (compact) */}
            <SideChecklist current={state.step} />

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-white/40">Kurulum tamamlandıktan sonra her şeyi düzenleyebilirsiniz.</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form side ── */}
        <div className="relative flex flex-1 flex-col">
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/8 dark:bg-blue-600/15 blur-[140px]" />
            <div className="absolute inset-0" style={gridStyle} />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-transparent to-slate-50/80 dark:from-zinc-950/0 dark:via-transparent dark:to-zinc-950/80" />
          </div>

          {/* Centered content */}
          <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8">
            <div className="w-full max-w-md">
              {/* Title */}
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25 lg:hidden">
                  <ActiveIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  {STEP_TITLES[state.step]}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-500">{STEP_SUBTITLES[state.step]}</p>
              </div>

              {/* Progress dots */}
              <ProgressDots current={state.step} />

              {/* Form card with gradient border */}
              <div className="rounded-2xl p-px bg-gradient-to-b from-slate-200/80 via-slate-200/40 to-slate-200/80 dark:from-zinc-700/50 dark:via-zinc-800/30 dark:to-zinc-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="rounded-[15px] bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm p-6">
                  <StepTransition stepKey={state.step}>
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
                        onComplete={(blocks) => update({ step: 3, blocks })}
                      />
                    )}
                    {state.step === 3 && state.orgId && state.blocks && (
                      <Step3Units
                        orgId={state.orgId}
                        blocks={state.blocks}
                        onComplete={() => update({ step: 4 })}
                      />
                    )}
                    {state.step === 4 && state.orgId && <Step4Invite orgId={state.orgId} />}
                  </StepTransition>
                </div>
              </div>

              {/* Trust badge */}
              <p className="mt-6 text-center text-xs text-slate-400 dark:text-zinc-600">
                Verileriniz güvenle saklanır. Kurulum sonrası her şeyi değiştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation for step icon fade */}
      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
