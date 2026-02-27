import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError('İşlem başarısız. Lütfen tekrar deneyin.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="E-posta Gönderildi">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin.
          </p>
          <Link to="/login" className="block text-sm text-blue-600 hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Şifremi Unuttum" subtitle="E-posta adresinize sıfırlama bağlantısı göndereceğiz">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sıfırlama Bağlantısı Gönder
        </Button>
      </form>
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">Giriş sayfasına dön</Link>
      </div>
    </AuthLayout>
  )
}
