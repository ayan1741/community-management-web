import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  inviteCode: z.string().optional(),
  organizationCode: z.string().optional(),
  unitInfo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'invite' | 'apply'>(
    searchParams.get('code') ? 'invite' : 'apply'
  )

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
      if (mode === 'invite' && data.inviteCode) {
        await api.post('/applications', {
          invitationCode: data.inviteCode,
          residentType: 'Unspecified',
        })
        navigate('/dashboard')
      } else {
        await api.post('/applications', {
          organizationCode: data.organizationCode,
          unitInfo: data.unitInfo,
          residentType: 'Unspecified',
        })
        navigate('/apply-success')
      }
    } catch {
      setError('Kayıt tamamlanamadı. Lütfen tekrar deneyin.')
    }
  }

  return (
    <AuthLayout title="Kayıt Ol" subtitle="Sisteme katılmak için bilgilerinizi girin">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode('invite')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'invite' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Davet Kodum Var
        </button>
        <button
          type="button"
          onClick={() => setMode('apply')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'apply' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Başvuru Yap
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input id="firstName" label="Ad" placeholder="Mehmet" error={errors.firstName?.message} {...register('firstName')} />
          <Input id="lastName" label="Soyad" placeholder="Ayhan" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input id="email" label="E-posta" type="email" placeholder="ornek@email.com" error={errors.email?.message} {...register('email')} />
        <Input id="password" label="Şifre" type="password" placeholder="En az 8 karakter" error={errors.password?.message} {...register('password')} />

        {mode === 'invite' ? (
          <Input id="inviteCode" label="Davet Kodu" placeholder="KM8X2PQR" error={errors.inviteCode?.message} {...register('inviteCode')} />
        ) : (
          <>
            <Input id="organizationCode" label="Site/Apartman Kodu (opsiyonel)" placeholder="SIT-12345" {...register('organizationCode')} />
            <Input id="unitInfo" label="Daire Bilgisi" placeholder="A Blok, Daire 12" {...register('unitInfo')} />
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <p className="text-xs text-gray-500">
          Kayıt olarak{' '}
          <a href="#" className="text-blue-600 hover:underline">KVKK Aydınlatma Metni</a>
          'ni okuduğunuzu ve onayladığınızı kabul etmiş olursunuz.
        </p>

        <Button type="submit" loading={isSubmitting} className="w-full">
          {mode === 'invite' ? 'Kayıt Ol' : 'Başvuru Gönder'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
        Zaten hesabınız var mı?{' '}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Giriş yapın
        </Link>
      </div>
    </AuthLayout>
  )
}
