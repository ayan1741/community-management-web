import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const schema = z.object({
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setError('Şifre güncellenemedi. Lütfen tekrar deneyin.')
      return
    }
    setSuccess(true)
    setTimeout(() => navigate('/home'), 2000)
  }

  if (success) {
    return (
      <AuthLayout title="Şifre Güncellendi">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Şifreniz başarıyla güncellendi. Yönlendiriliyorsunuz...
          </p>
        </div>
      </AuthLayout>
    )
  }

  if (!recoveryReady) {
    return (
      <AuthLayout title="Şifre Sıfırlama" subtitle="E-posta bağlantısından giriş bekleniyor">
        <div className="text-center space-y-4 py-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">
            E-posta adresinize gönderilen bağlantıya tıklayarak bu sayfaya ulaşmalısınız.
          </p>
          <Link to="/forgot-password" className="block text-sm text-blue-600 hover:underline">
            Yeni sıfırlama bağlantısı iste
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Yeni Şifre Belirle" subtitle="Hesabınız için yeni bir şifre oluşturun">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            id="password"
            label="Yeni Şifre"
            type={showPassword ? 'text' : 'password'}
            placeholder="En az 8 karakter"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input
            id="confirmPassword"
            label="Şifre Tekrar"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Şifrenizi tekrar girin"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Şifreyi Güncelle
        </Button>
      </form>
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">Giriş sayfasına dön</Link>
      </div>
    </AuthLayout>
  )
}
