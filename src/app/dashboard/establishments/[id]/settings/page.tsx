'use client'

import { useEffect, useState } from 'react'
import { ConfigurationPanel } from '@/components/settings/ConfigurationPanel'
import { PreviewPanel } from '@/components/settings/PreviewPanel'
import { BusinessType } from '@/types/config'

interface SettingsPageProps {
  params: {
    id: string
  }
} 

export default function SettingsPage({ params }: SettingsPageProps) {
  const [businessType, setBusinessType] = useState<BusinessType>('SALON')

  // Carregar tipo de negócio do estabelecimento
  useEffect(() => {
    const loadEstablishment = async () => {
      try {
        const response = await fetch(`/api/establishment/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setBusinessType(data.businessType)
        }
      } catch (error) {
        console.error('Error loading establishment:', error)
      }
    }

    loadEstablishment()
  }, [params.id])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Configurações do Estabelecimento
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Personalize a aparência e funcionamento do seu estabelecimento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Configuração */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <ConfigurationPanel
                establishmentId={params.id}
                businessType={businessType}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                Preview em Tempo Real
              </h2>
              <PreviewPanel
                establishmentId={params.id}
                businessType={businessType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
