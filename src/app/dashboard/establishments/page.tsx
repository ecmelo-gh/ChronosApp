'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EstablishmentList } from '@/components/establishments/EstablishmentList'
import { EstablishmentResponse } from '@/types/establishment'
import { EstablishmentStatus } from '@prisma/client'
import { toast } from 'react-hot-toast'

export default function EstablishmentsPage() {
  const router = useRouter()
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEstablishments()
  }, [])

  const fetchEstablishments = async () => {
    try {
      const response = await fetch('/api/establishment')
      if (!response.ok) {
        throw new Error('Erro ao carregar estabelecimentos')
      }
      const data = await response.json()
      setEstablishments(data)
    } catch (error) {
      toast.error('Erro ao carregar estabelecimentos')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: EstablishmentStatus) => {
    try {
      const response = await fetch(`/api/establishment/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      toast.success('Status atualizado com sucesso')
      fetchEstablishments() // Recarrega a lista
    } catch (error) {
      toast.error('Erro ao atualizar status')
      console.error(error)
    }
  }

  const handleAddEstablishment = () => {
    router.push('/dashboard/establishments/new')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Meus Estabelecimentos
          </h1>
          <button
            onClick={handleAddEstablishment}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Adicionar Estabelecimento
          </button>
        </div>

        {establishments.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum estabelecimento cadastrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando seu primeiro estabelecimento.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddEstablishment}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Adicionar Estabelecimento
              </button>
            </div>
          </div>
        ) : (
          <EstablishmentList
            establishments={establishments}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  )
}
