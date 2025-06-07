'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const registered = searchParams.get('registered') === 'true'
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(registered ? 'Registration successful! Please sign in.' : null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  // Clear form fields on page load
  useEffect(() => {
    const form = document.querySelector('form') as HTMLFormElement
    if (form) form.reset()
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
        form.reset()
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError('An error occurred while trying to sign in')
      form.reset()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="ChronosApp"
              width={48}
              height={48}
              className="text-blue-500"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">ChronosApp</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Professional Appointment Management System</p>
        </div>

        <div className="flex space-x-4 text-sm mb-6">
          <button
            onClick={() => {
              setActiveTab('login')
              setError(null)
            }}
            className={`flex-1 py-2 ${activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} font-medium`}
          >
            Login
          </button>
          <button
            onClick={() => {
              router.push('/auth/register')
              setError(null)
            }}
            className={`flex-1 py-2 ${activeTab === 'register' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4 text-sm text-green-500 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400'} text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
