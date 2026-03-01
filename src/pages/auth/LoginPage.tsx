import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { AuthShell } from '@/components/layout/AuthShell'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
})
type FormData = z.infer<typeof schema>

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 px-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-colors focus:border-blue-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-0'
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5'

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setError('E-posta veya şifre hatalı')
      return
    }
    navigate('/dashboard')
  }

  return (
    <AuthShell>
      {/* Logo & Title */}
      <div className="mb-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Tekrar hoş geldiniz</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-500">Hesabınıza giriş yapın</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 backdrop-blur-sm shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className={labelCls}>E-posta</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="ornek@email.com"
              className={inputCls}
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls.replace('mb-1.5', '')}>Şifre</label>
              <Link to="/forgot-password" className="text-xs text-slate-500 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Şifremi unuttum
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls + ' pr-10'}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2">
              <svg className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-10 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Giriş yapılıyor…
              </>
            ) : 'Giriş Yap'}
          </button>
        </form>
      </div>

      {/* Footer links */}
      <div className="mt-5 space-y-2 text-center text-xs text-slate-500 dark:text-zinc-600">
        <p>
          Hesabınız yok mu?{' '}
          <Link to="/admin-register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Ücretsiz başlayın
          </Link>
        </p>
        <p>
          Davet kodunuz mu var?{' '}
          <Link to="/register" className="text-slate-600 dark:text-zinc-400 hover:underline">
            Kayıt olun
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
