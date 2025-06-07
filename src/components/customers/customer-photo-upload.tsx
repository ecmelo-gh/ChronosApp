'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomerPhotoUploadProps {
  customerId: string
  currentPhotoUrl?: string | null
  onPhotoUploaded: (url: string) => void
}

export function CustomerPhotoUpload({
  customerId,
  currentPhotoUrl,
  onPhotoUploaded,
}: CustomerPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Criar FormData com o arquivo
      const formData = new FormData()
      formData.append('file', file)

      // Enviar para a API
      const res = await fetch(`/api/customers/${customerId}/photo`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload photo')
      }

      const data = await res.json()
      onPhotoUploaded(data.url)
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Erro ao fazer upload da foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative h-32 w-32">
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-gray-200">
        {currentPhotoUrl ? (
          <Image
            src={currentPhotoUrl}
            alt="Foto do cliente"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full bg-white p-0"
          disabled={uploading}
          asChild
        >
          <label>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </label>
        </Button>
      </div>
    </div>
  )
}
