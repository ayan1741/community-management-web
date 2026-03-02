import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { useTheme } from '@/hooks/useTheme'
import {
  Eye, EyeOff, Loader2, AlertCircle, ArrowRight,
  Building2, Sun, Moon, Users, Star,
  CreditCard, Bell, Wrench,
} from 'lucide-react'

const schema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  kvkk: z.literal(true, { error: 'KVKK onayı zorunludur' }),
  inviteCode: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const inputCls = 'h-11 w-full rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/50 px-3.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 shadow-sm shadow-slate-100 dark:shadow-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-blue-500/20'

const features = [
  { icon: CreditCard, title: 'Aidat Takibi', desc: 'Borçlarınızı görün, ödeme geçmişi' },
  { icon: Bell, title: 'Anlık Duyurular', desc: 'Site duyurularını anında alın' },
  { icon: Wrench, title: 'Arıza Bildirimi', desc: 'Kolay arıza kaydı ve takibi' },
]

/* ═══════════════════════════════════════════════════════════════════════════ */

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const { isDark, toggleTheme } = useTheme()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { inviteCode: searchParams.get('code') ?? '' },
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { first_name: data.firstName, last_name: data.lastName },
      },
    })
    if (authError || !authData.user) {
      setError(authError?.message ?? 'Kayıt başarısız')
      return
    }

    try {
      await api.post('/profile/kvkk-consent')

      if (data.inviteCode) {
        await api.post('/applications', {
          invitationCode: data.inviteCode,
          residentType: 'Unspecified',
        })
        window.location.href = '/'
      }
    } catch {
      setError('Kayıt tamamlanamadı. Lütfen tekrar deneyin.')
    }
  }

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
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <Building2 className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              KomşuNet
            </span>
          </Link>
          <button onClick={toggleTheme} aria-label="Tema değiştir"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-200">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex min-h-screen pt-16">

        {/* ── LEFT: Photo panel (hidden below lg) ── */}
        <div className="hidden lg:block relative w-[45%]">
          {/* Photo */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop"
            alt="Yerleşim alanı"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Gradient overlay */}
          <div className={`absolute inset-0 ${isDark
            ? 'bg-gradient-to-br from-zinc-950/90 via-slate-900/85 to-zinc-950/90'
            : 'bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-indigo-900/80'
          }`} />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <div />

            {/* Main message */}
            <div>
              <blockquote className="text-2xl font-bold text-white leading-snug tracking-tight">
                "Topluluğunuza katılın.<br />
                Komşuluk artık<br />
                dijital ve kolay."
              </blockquote>
              <p className="mt-4 text-sm text-white/60">
                Davet kodunuzla sitenize katılın, her şeyi tek ekrandan takip edin.
              </p>
            </div>

            {/* Features + testimonial */}
            <div className="space-y-5">
              {/* Feature list */}
              <div className="space-y-3">
                {features.map(f => (
                  <div key={f.title} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                      <f.icon className="h-4 w-4 text-white/70" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="text-xs text-white/50">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <Building2 className="h-4 w-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">500+</p>
                    <p className="text-xs text-white/50">Site</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <Users className="h-4 w-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">10K+</p>
                    <p className="text-xs text-white/50">Kullanıcı</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <Star className="h-4 w-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">4.9</p>
                    <p className="text-xs text-white/50">Puan</p>
                  </div>
                </div>
              </div>
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
            <div className="w-full max-w-sm">
              {/* Title */}
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Topluluğunuza Katılın
                </h1>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-500">
                  Davet kodunuzla hesabınızı oluşturun
                </p>
              </div>

              {/* Card */}
              <div className="rounded-2xl p-px bg-gradient-to-b from-slate-200/80 via-slate-200/40 to-slate-200/80 dark:from-zinc-700/50 dark:via-zinc-800/30 dark:to-zinc-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="rounded-[15px] bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Ad</label>
                        <input type="text" autoComplete="off" placeholder="Mehmet" className={inputCls} {...register('firstName')} />
                        {errors.firstName && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Soyad</label>
                        <input type="text" autoComplete="off" placeholder="Ayhan" className={inputCls} {...register('lastName')} />
                        {errors.lastName && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">E-posta</label>
                      <input type="email" autoComplete="email" placeholder="ornek@email.com" className={inputCls} {...register('email')} />
                      {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Şifre</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="En az 8 karakter"
                          className={inputCls + ' pr-11'}
                          {...register('password')}
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
                    </div>

                    {/* Davet Kodu */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Davet Kodu</label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="KM8X2PQR"
                        className={inputCls + ' font-mono tracking-widest uppercase'}
                        {...register('inviteCode')}
                      />
                      {errors.inviteCode && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.inviteCode.message}</p>}
                    </div>

                    {/* KVKK */}
                    <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        {...register('kvkk')}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-800"
                      />
                      <span className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">KVKK Aydınlatma Metni</a>'ni
                        okudum ve kişisel verilerimin işlenmesine onay veriyorum.
                      </span>
                    </label>
                    {errors.kvkk && <p className="text-xs text-red-500 dark:text-red-400">{errors.kvkk.message}</p>}

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={isSubmitting}
                      className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> İşleniyor…</>
                      ) : (
                        <>Kayıt Ol <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200/80 dark:bg-zinc-700/60" />
                    <span className="text-xs text-slate-400 dark:text-zinc-600">veya</span>
                    <div className="h-px flex-1 bg-slate-200/80 dark:bg-zinc-700/60" />
                  </div>

                  {/* Alt linkler */}
                  <div className="space-y-2.5">
                    <Link to="/admin-register"
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/40 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-all duration-200">
                      Yönetici hesabı oluştur
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                    </Link>
                    <Link to="/login"
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/40 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-all duration-200">
                      Zaten hesabınız var mı? Giriş yapın
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <p className="mt-6 text-center text-xs text-slate-400 dark:text-zinc-600">
                256-bit SSL ile şifrelenmiş güvenli bağlantı
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
