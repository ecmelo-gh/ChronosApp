'use client'

import { useState } from 'react'
import { useEstablishmentConfig } from '@/hooks/useEstablishmentConfig'
import { EstablishmentConfig, BusinessType } from '@/types/config'
import { SketchPicker } from 'react-color'
import { toast } from 'react-hot-toast'
import { LogoUploader } from './LogoUploader'
import { TemplateSelector } from './TemplateSelector'

interface ConfigurationPanelProps {
  establishmentId: string
  businessType: BusinessType
}

export function ConfigurationPanel({
  establishmentId,
  businessType
}: ConfigurationPanelProps) {
  const { config, updateConfig, isLoading } = useEstablishmentConfig({
    establishmentId,
    businessType
  })

  const [activeTab, setActiveTab] = useState<'templates' | 'theme' | 'labels' | 'operational'>(
    'templates'
  )
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null)

  if (isLoading || !config) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const handleColorChange = (color: string, key: keyof typeof config.theme.colors) => {
    updateConfig({
      theme: {
        ...config.theme,
        colors: {
          ...config.theme.colors,
          [key]: color
        }
      }
    })
  }

  const handleLabelChange = (value: string, key: keyof typeof config.labels) => {
    updateConfig({
      labels: {
        ...config.labels,
        [key]: value
      }
    })
  }

  const handleFeatureToggle = (key: keyof typeof config.features) => {
    updateConfig({
      features: {
        ...config.features,
        [key]: !config.features[key]
      }
    })
  }

  const handleLogoChange = (logo: { url: string; width: number; height: number } | null) => {
    updateConfig({
      theme: {
        ...config.theme,
        logo: logo
      }
    })
  }

  const handleTemplateSelect = (themeConfig: typeof config.theme) => {
    updateConfig({
      theme: {
        ...themeConfig,
        logo: config.theme.logo // Manter o logo atual
      }
    })
    toast.success('Template aplicado com sucesso!')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['templates', 'theme', 'labels', 'operational'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Templates */}
      {activeTab === 'templates' && (
        <TemplateSelector
          businessType={businessType}
          onSelectTemplate={handleTemplateSelect}
        />
      )}

      {/* Theme Settings */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
            <LogoUploader
              currentLogo={config.theme.logo}
              onLogoChange={handleLogoChange}
              className="mb-6"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cores</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.theme.colors).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setColorPickerOpen(colorPickerOpen === key ? null : key)}
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: value }}
                    />
                    {colorPickerOpen === key && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => setColorPickerOpen(null)}
                        />
                        <SketchPicker
                          color={value}
                          onChange={(color) => handleColorChange(color.hex, key as any)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fontes</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.theme.fonts).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <select
                    value={value}
                    onChange={(e) =>
                      updateConfig({
                        theme: {
                          ...config.theme,
                          fonts: {
                            ...config.theme.fonts,
                            [key]: e.target.value
                          }
                        }
                      })
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {['Inter', 'Roboto', 'Montserrat', 'Oswald', 'Playfair Display'].map(
                      (font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Labels Settings */}
      {activeTab === 'labels' && (
        <div className="space-y-6">
          {Object.entries(config.labels).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleLabelChange(e.target.value, key as any)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Operational Settings */}
      {activeTab === 'operational' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
            <div className="space-y-4">
              {Object.entries(config.features).map(([key, enabled]) => (
                <div key={key} className="flex items-center">
                  <switch
                    checked={enabled}
                    onChange={() => handleFeatureToggle(key as any)}
                    className={`${
                      enabled ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </switch>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
