'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BusinessType } from '@/types/config'
import { getTemplatesForBusiness } from '@/config/templates'

interface TemplateSelectorProps {
  businessType: BusinessType
  onSelectTemplate: (themeConfig: any) => void
}

export function TemplateSelector({
  businessType,
  onSelectTemplate
}: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>()
  const templates = getTemplatesForBusiness(businessType)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Templates</h3>
        <span className="text-sm text-gray-500">
          {templates.length} templates disponíveis
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`
              relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all
              ${
                selectedId === template.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => {
              setSelectedId(template.id)
              onSelectTemplate(template.theme)
            }}
          >
            {/* Preview */}
            <div className="relative h-40">
              <Image
                src={template.preview}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-4 bg-white">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{template.description}</p>

              {/* Color Preview */}
              <div className="mt-3 flex space-x-2">
                {Object.entries(template.theme.colors).map(([key, color]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
              </div>

              {/* Font Preview */}
              <div className="mt-2 text-xs text-gray-500">
                {template.theme.fonts.heading} • {template.theme.fonts.body}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedId === template.id && (
              <div className="absolute top-2 right-2 bg-indigo-500 text-white p-1 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
