'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial'
  ),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

const requestResetSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
type RequestResetInput = z.infer<typeof requestResetSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const {
    register: requestRegister,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
  })

  const onReset = async (data: ResetPasswordInput) => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success('Senha alterada com sucesso!')
      router.push('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const onRequestReset = async (data: RequestResetInput) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success(
        'Se o email existir, você receberá instruções para redefinir sua senha.'
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao solicitar reset de senha'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 font-inter">
            Windsurf
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-inter">
            {token ? 'Defina sua nova senha' : 'Recupere sua senha'}
          </p>
        </div>

        {token ? (
          <form onSubmit={handleResetSubmit(onReset)} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                {...resetRegister('password')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  resetErrors.password && 'border-red-500'
                )}
              />
              {resetErrors.password && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {resetErrors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Confirme a Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...resetRegister('confirmPassword')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  resetErrors.confirmPassword && 'border-red-500'
                )}
              />
              {resetErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {resetErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
            >
              {loading ? 'Alterando senha...' : 'Alterar Senha'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestSubmit(onRequestReset)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...requestRegister('email')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  requestErrors.email && 'border-red-500'
                )}
              />
              {requestErrors.email && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {requestErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
            >
              {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
