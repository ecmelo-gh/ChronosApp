'use client'

import { useEstablishmentConfig } from '@/hooks/useEstablishmentConfig'
import { BusinessType } from '@/types/config'
import Image from 'next/image'

interface PreviewPanelProps {
  establishmentId: string
  businessType: BusinessType
}

export function PreviewPanel({ establishmentId, businessType }: PreviewPanelProps) {
  const { config, getLabel, getThemeColor, isLoading } = useEstablishmentConfig({
    establishmentId,
    businessType
  })

  if (isLoading || !config) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <header
        style={{ backgroundColor: getThemeColor('primary') }}
        className="p-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          {config.theme.logo ? (
            <Image
              src={config.theme.logo.url}
              alt="Logo"
              width={config.theme.logo.width}
              height={config.theme.logo.height}
              className="max-w-[200px] max-h-[100px] object-contain"
            />
          ) : (
            <h1
              style={{
                color: getThemeColor('background'),
                fontFamily: config.theme.fonts.heading
              }}
              className="text-2xl font-bold"
            >
              Nome do Estabelecimento
            </h1>
          )}
        </div>

        <nav className="flex space-x-4">
          {config.features.onlineBooking && (
            <button
              style={{
                backgroundColor: getThemeColor('accent'),
                color: getThemeColor('background'),
                fontFamily: config.theme.fonts.body
              }}
              className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Agendar {getLabel('appointment')}
            </button>
          )}
        </nav>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Services Section */}
        <section className="mb-8">
          <h2
            style={{
              color: getThemeColor('primary'),
              fontFamily: config.theme.fonts.heading
            }}
            className="text-xl font-bold mb-4"
          >
            {getLabel('service')}s Populares
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  borderColor: getThemeColor('secondary'),
                  color: getThemeColor('text'),
                  fontFamily: config.theme.fonts.body
                }}
                className="p-4 border rounded-lg"
              >
                <h3 className="font-medium mb-2">
                  {getLabel('service')} {i}
                </h3>
                <p className="text-sm opacity-75">45 min • R$ 80,00</p>
              </div>
            ))}
          </div>
        </section>

        {/* Professionals Section */}
        <section>
          <h2
            style={{
              color: getThemeColor('primary'),
              fontFamily: config.theme.fonts.heading
            }}
            className="text-xl font-bold mb-4"
          >
            Nossos {getLabel('professional')}s
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  borderColor: getThemeColor('secondary'),
                  color: getThemeColor('text'),
                  fontFamily: config.theme.fonts.body
                }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-2"></div>
                <p className="font-medium">
                  {getLabel('professional')} {i}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
