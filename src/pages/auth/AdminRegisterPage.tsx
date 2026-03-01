import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { AuthShell } from '@/components/layout/AuthShell'

const schema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  kvkk: z.literal(true, { error: 'KVKK onayı zorunludur' }),
})
type FormData = z.infer<typeof schema>

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-colors focus:border-blue-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-0'
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5'

export function AdminRegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
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
    if (authError) {
      const msg = authError.message.includes('disabled')
        ? 'Kayıt şu an aktif değil. Lütfen sistem yöneticisiyle iletişime geçin.'
        : authError.message.includes('already registered')
          ? 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.'
          : authError.message
      setError(msg)
      return
    }
    if (authData.session) {
      navigate('/setup')
    } else {
      setNeedsVerification(true)
    }
  }

  if (needsVerification) {
    return (
      <AuthShell>
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <CheckCircle2 className="w-14 h-14 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">E-postanızı Doğrulayın</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">
              <strong className="text-slate-700 dark:text-zinc-300">Doğrulama linki gönderdik.</strong>
              <br />
              Linke tıkladıktan sonra giriş yaparak kuruluma devam edebilirsiniz.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-blue-500 transition-colors"
          >
            Giriş Sayfasına Git
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Yönetici Kaydı</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-500">Sitenizi veya apartmanınızı sisteme ekleyin</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 backdrop-blur-sm shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" autoComplete="off">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ad</label>
              <input type="text" autoComplete="off" placeholder="Ahmet" className={inputCls} {...register('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Soyad</label>
              <input type="text" autoComplete="off" placeholder="Yılmaz" className={inputCls} {...register('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>E-posta</label>
            <input type="email" autoComplete="email" placeholder="ahmet@ornek.com" className={inputCls} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>Şifre</label>
            <input type="password" autoComplete="new-password" placeholder="En az 8 karakter" className={inputCls} {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
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
            <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Hesap oluşturuluyor…
              </>
            ) : 'Hesap Oluştur — Kuruluma Geç'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-5 space-y-1.5 text-center text-xs text-slate-500 dark:text-zinc-600">
        <p>
          Sakin misiniz?{' '}
          <Link to="/register" className="text-slate-700 dark:text-zinc-300 hover:underline font-medium">Siteye katılmak için başvurun</Link>
        </p>
        <p>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-slate-700 dark:text-zinc-300 hover:underline font-medium">Giriş yapın</Link>
        </p>
      </div>
    </AuthShell>
  )
}
