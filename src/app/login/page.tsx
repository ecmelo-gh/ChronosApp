'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerSchema } from '@/schemas/auth/register.schema'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginInput = z.infer<typeof loginSchema>
type FormType = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [formType, setFormType] = useState<FormType>('login')
  const [loading, setLoading] = useState(false)

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })

  const onLogin = async (data: LoginInput) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciais inválidas')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('Ocorreu um erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success('Conta criada com sucesso!')
      setFormType('login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conta')
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
            Sistema de Gestão para Salões de Beleza
          </p>
        </div>

        {/* Form Type Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => setFormType('login')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors font-inter',
              formType === 'login'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setFormType('register')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors font-inter',
              formType === 'register'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Cadastro
          </button>
        </div>

        {formType === 'login' ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                {...loginRegister('email')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  loginErrors.email && 'border-red-500'
                )}
              />
              {loginErrors.email && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                {...loginRegister('password')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  loginErrors.password && 'border-red-500'
                )}
              />
              {loginErrors.password && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {loginErrors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-6">
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Nome
              </label>
              <input
                id="register-name"
                type="text"
                {...signupRegister('name')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  signupErrors.name && 'border-red-500'
                )}
              />
              {signupErrors.name && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {signupErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                {...signupRegister('email')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  signupErrors.email && 'border-red-500'
                )}
              />
              {signupErrors.email && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {signupErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-gray-700 font-inter"
              >
                Senha
              </label>
              <input
                id="register-password"
                type="password"
                {...signupRegister('password')}
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-inter',
                  signupErrors.password && 'border-red-500'
                )}
              />
              {signupErrors.password && (
                <p className="mt-1 text-sm text-red-600 font-inter">
                  {signupErrors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}