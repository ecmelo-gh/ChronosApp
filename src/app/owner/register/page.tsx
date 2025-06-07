'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OwnerForm } from '@/components/forms/OwnerForm'
import { CreateOwnerDTO } from '@/types/owner'
import { toast } from 'react-hot-toast'

export default function RegisterOwnerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateOwnerDTO) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao cadastrar')
      }

      toast.success('Empresa cadastrada com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Cadastre sua empresa
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Comece a gerenciar seus estabelecimentos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <OwnerForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
