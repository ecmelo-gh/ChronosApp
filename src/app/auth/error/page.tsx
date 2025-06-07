'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: { [key: string]: string } = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to access this resource.',
    Verification: 'The verification link is invalid or has expired.',
    Default: 'An error occurred during authentication.'
  }

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-blue-500 hover:text-blue-400 font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
